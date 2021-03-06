import * as React from 'react'
import * as echarts from 'echarts'
import { Observable, } from '@reactivex/rxjs'
import { Card, CardContent, } from '@material-ui/core'
import { withObservables, } from '../../contexts/observables'
import { withConfig, } from '../../contexts/config'
import Banner from '../../components/Banner'
import ErrorNotification from '../../components/ErrorNotification'
import { BarOption, PieOption, } from '../../config/graph'
import { fetchTransactions, fetchStatistics, } from '../../utils/fetcher'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError, } from '../../utils/handleError'
import { GraphsDefault, IBlock, GraphsProps, GraphState, BlockGraphData, TxGraphData, ProposalData, } from './init'

const layout = require('../../styles/layout.scss')
const styles = require('./graph.scss')

const getBlockSource = ({ blocks, }) => {
  if (blocks.length <= 1) return []
  const source: BlockGraphData[] = []
  // form the source , x = height, y = interval, tx count, quota used
  blocks.sort((b1, b2) => b1.header.number - b2.header.number).reduce((prev, curr) => {
    source.push([
      `${+(curr as IBlock).header.number}`, // height
      +(curr as IBlock).header.timestamp - +(prev as IBlock).header.timestamp, // interval
      (curr as IBlock).body.transactions.length, // tx count
      `${+(curr as IBlock).header.quotaUsed / GraphsDefault.PRICE}`,
    ])
    return curr
  })
  const graphSource = [['Blocks', 'Block Interval', 'Transactions', 'Quota Used', ], ...source, ]
  return graphSource
}

const getTxSource = ({ txs = this.state.transactions, }) => {
  const source: TxGraphData[] = txs.length ? txs.map(tx => [tx.hash, tx.quotaUsed, ]) : []
  const graphSource = [['Transactions', 'Quota Used', ], ...source, ]
  return graphSource
}

const getProposalSource = ({ proposals = this.state.proposals, }) => {
  const source: ProposalData[] = proposals.length ? proposals.map(p => [`${p.validator.slice(0, 5)}...`, p.count, ]) : []
  const graphSource = [['Validators', 'Count', ], ...source, ]
  return graphSource
}

class Graphs extends React.Component<GraphsProps, GraphState> {
  readonly state = GraphsDefault.initState

  public componentWillMount () {
    this.setMaxCount()
    this.startListening()
    const source = Observable.fromEvent(window, 'resize')
    source.debounceTime(500).subscribe(() => {
      this.graphList.forEach(graphName => {
        if (this[graphName]) {
          this[graphName].resize()
        }
      })
    })
  }

  public componentDidMount () {
    hideLoader()
    this.initGraphs()
  }

  public componentDidCatch (err) {
    this.handleError(err)
  }

  private setMaxCount = () => {
    const { graphMaxCount: maxCount, } = this.props.config.panelConfigs
    this.setState({ maxCount, })
  }

  // declare chart variables
  private blockGraph: any
  private txCountGraph: any
  private quotaUsedGraph: any
  private txQuotaUsedGraph: any
  private proposalsGraph: any
  private blockGraphDOM: HTMLDivElement | null
  private txCountGraphDOM: HTMLDivElement | null
  private quotaUsedGraphDOM: HTMLDivElement | null
  private txQuotaUsedGraphDOM: HTMLDivElement | null
  private proposalsGraphDOM: HTMLDivElement | null
  private graphList = ['blockGraph', 'txCountGraph', 'quotaUsedGraph', 'txQuotaUsedGraph', 'proposalsGraph', ]

  private initGraphs = () => {
    // init chart dom
    const { panelConfigs, } = this.props.config
    if (panelConfigs.graphIPB) {
      this.blockGraph = this.initGraph(this.blockGraphDOM as HTMLDivElement)
    }
    if (panelConfigs.graphTPB) {
      this.txCountGraph = this.initGraph(this.txCountGraphDOM as HTMLDivElement)
    }
    if (panelConfigs.graphQuotaUsedBlock) {
      this.quotaUsedGraph = this.initGraph(this.quotaUsedGraphDOM as HTMLDivElement)
    }
    if (panelConfigs.graphQuotaUsedTx) {
      this.txQuotaUsedGraph = this.initGraph(this.txQuotaUsedGraphDOM as HTMLDivElement)
    }
    if (panelConfigs.graphProposals) {
      this.proposalsGraph = this.initGraph(this.proposalsGraphDOM as HTMLDivElement)
    }
  }

  private initGraph = (dom: HTMLDivElement) => {
    const graph = echarts.init(dom)
    graph.showLoading()
    return graph
  }

  private startListening = () => {
    const { newBlockSubjectAdd, } = this.props.CITAObservables
    newBlockSubjectAdd(
      'graphs',
      block => {
        if (block.hash) {
          this.handleNewBlock(block)
          this.updateTransactions()
          this.updateProposals()
        } else {
          throw new Error(block)
        }
      },
      this.handleError
    )
    // this.props.CITAObservables.newBlockByNumberSubject.connect()
  }

  private updateProposals = () => {
    fetchStatistics({ type: 'proposals', })
      .then(({ result = [], }) => {
        this.setState(state => ({ ...state, proposals: result, }))
        const source = getProposalSource({ proposals: result, })
        const proposalOption = {
          ...PieOption,
          title: {
            text: 'Proposal Distribution',
            textStyle: {
              fontSize: 16,
            },
          },
          color: ['#415dfc', '#ab62f1', '#fca441', '#4db7f8', ],
          radius: ['50%', '70%', ],
          dataset: { source, },
        }
        this.updateGraph({
          graph: this.proposalsGraph,
          option: proposalOption,
        })
      })
      .catch(this.handleError)
  }

  private updateTransactions = () => {
    fetchTransactions({ limit: this.state.maxCount, })
      .then(({ result: { transactions: txs, }, }) => {
        txs.reverse()
        this.setState(state => ({
          ...state,
          transactions: txs,
        }))
        const source = getTxSource({ txs, })
        const txQuotaUsedOption = {
          ...BarOption,
          title: {
            text: `Quota Used in the Latest ${this.state.maxCount} Transactions`,
          },
          color: ['#ab62f1', ],
          xAxis: {
            ...BarOption.xAxis,
            axisLabel: {
              show: false,
            },
          },
          formatter: (param: { seriesName: string; value: any[] }) => {
            const label = `<span>${param.seriesName}</span><br/><span>${param.value[0].slice(
              0,
              6
            )}...${param.value[0].slice(-4)} : ${param.value[1]}</span>`
            return label
          },
          yAxis: {
            type: 'value',
            scale: true,
            axisLabel: {
              formatter: (value: number) => value > 1000000 ? `${value / 100000}(m)` : `${value / 1000}(k)`,
            },
          },
          dataset: {
            source: source.map((item, idx) => (idx > 0 ? [item[0], +item[1], ] : [item[0], item[1], ])),
          },
        }
        if (this.props.config.panelConfigs.graphQuotaUsedTx) {
          this.updateGraph({
            graph: this.txQuotaUsedGraph,
            option: txQuotaUsedOption,
          })
          this.txQuotaUsedGraph.on('click', (param: any) => {
            this.props.history.push(`/transaction/${param.value[0]}`)
          })
        }
      })
      .catch(this.handleError)
  }

  private updateGraphBlock = source => {
    const { panelConfigs, } = this.props.config
    if (this.blockGraph && panelConfigs.graphIPB) {
      const timeCostOption = {
        title: {
          text: `Interval (in ms) for the Latest ${this.state.maxCount} Blocks`,
          textStyle: {
            fontSize: 16,
          },
        },
        color: ['#415dfc', ],
        ...BarOption,
        dataset: { source: source.map(item => [item[0], item[1], ]), },
      }
      this.updateGraph({ graph: this.blockGraph, option: timeCostOption, })
    }
  }

  private updateGraphTxCount = source => {
    const { panelConfigs, } = this.props.config
    if (this.txCountGraph && panelConfigs.graphTPB) {
      const txCountOption = {
        title: {
          text: `Transaction Count in the Latest ${this.state.maxCount} Blocks`,
          textStyle: {
            fontSize: 16,
          },
        },
        color: ['#fca441', ],
        ...BarOption,
        dataset: { source: source.map(item => [item[0], item[2], ]), },
      }
      this.updateGraph({ graph: this.txCountGraph, option: txCountOption, })
    }
  }

  private updateQuotaUsed = source => {
    const { panelConfigs, } = this.props.config
    if (this.quotaUsedGraph && panelConfigs.graphQuotaUsedBlock) {
      const quotaUsedOption = {
        title: {
          text: `Quota Used in Latest ${this.state.maxCount} Blocks`,
          textStyle: {
            fontSize: 16,
          },
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: `{value/1000}(k)`,
          },
        },
        color: ['#4db7f8', ],
        ...BarOption,
        dataset: { source: source.map(item => [item[0], item[3], ]), },
      }
      this.updateGraph({ graph: this.quotaUsedGraph, option: quotaUsedOption, })
    }
  }

  private handleNewBlock = block => {
    this.setState(state => {
      const blocks = [...state.blocks, block, ].slice(-(this.state.maxCount + 1))
      if (blocks.length > 1) {
        const source = getBlockSource({ blocks, })
        this.updateGraphBlock(source)
        this.updateGraphTxCount(source)
        this.updateQuotaUsed(source)
      }
      return { blocks, }
    })
  }

  private updateGraph = ({ graph, option, }) => {
    graph.setOption(option)
    graph.hideLoading()
  }

  private handleError = handleError(this)
  private dismissError = dismissError(this)

  private renderGraphCell = graphName => (
    <Card>
      <CardContent>
        <div ref={el => (this[`${graphName}DOM`] = el)} className={styles.graphContainer} />
      </CardContent>
    </Card>
  )

  private renderGraphList = () => this.graphList.map(graphName => this.renderGraphCell(graphName))

  public render () {
    return (
      <React.Fragment>
        <Banner>Statistics</Banner>
        <div className={layout.center}>
          <div className={styles.graphs}>{this.renderGraphList()}</div>
        </div>
        <ErrorNotification error={this.state.error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}

export default withConfig(withObservables(Graphs))
