import * as React from 'react'
import { Grid, } from '@material-ui/core'
import { translate, } from 'react-i18next'
import { Chain, } from '@nervos/plugin'
import { unsigner, } from '@appchain/signer'

import { LinearProgress, } from '../../components'
import { TransactionFromServer, } from '../../typings'
import { withConfig, } from '../../contexts/config'
import { withObservables, } from '../../contexts/observables'
import { fetch10Transactions, } from '../../utils/fetcher'
import { StaticCardTitle, } from '../../components/StaticCard'
import BlockList from '../../components/HomepageLists/BlockList'
import TransactionList from '../../components/HomepageLists/TransactionList'
import ErrorNotification from '../../components/ErrorNotification'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError, } from '../../utils/handleError'
import { HomepageProps, HomepageState, } from './init'
import { initHomePageState as initState, } from '../../initValues'
import { TX_TYPE, } from '../../containers/Transaction'

const layout = require('../../styles/layout.scss')
const styles = require('./homepage.scss')

const MainInfoCell = ({ icon, content, name, }) => (
  <div className={styles.mainInfoCell}>
    <div className={styles.mainInfoIcon}>
      <img alt="" src={icon} />
    </div>
    <div className={styles.mainInfo}>
      <div className={styles.mainInfoContent}>{content}</div>
      <div className={styles.mainInfoName}>{name}</div>
    </div>
  </div>
)

const MainInfoBlock = ({ proplist, }) => (
  <div className={styles.mainInfoBlock}>
    {proplist.map(prop => (
      <MainInfoCell {...prop} />
    ))}
  </div>
)

const SubInfoCell = ({ icon, content, name, }) => (
  <div className={styles.subInfoCell}>
    <div className={styles.subInfoIcon}>
      <img alt="" src={icon} />
    </div>
    <div className={styles.subInfo}>
      <div className={styles.subInfoContent}>{content}</div>
      <div className={styles.subInfoName}>{name}</div>
    </div>
  </div>
)

const SubInfoBlock = ({ proplist, }) => (
  <div className={styles.subInfoBlock}>
    {proplist.map(prop => (
      <SubInfoCell {...prop} />
    ))}
  </div>
)

const MetadataTable = ({ metadata, lastestBlock, overtime, }) => {
  const mainProplist = [
    {
      name: 'Block Height',
      icon: '',
      content: lastestBlock ? Number(lastestBlock.header.number) : 0,
    },
    {
      name: 'Block Interval',
      icon: '',
      content: `${Math.floor(overtime / 100) / 10}s/${Math.floor(metadata.blockInterval / 1000)}s`,
    },
    {
      name: 'Validators',
      icon: '',
      content: metadata.validators.length || 0,
    },
  ]

  const subProplist = [
    {
      name: 'Chain Name',
      icon: '',
      content: metadata.chainName,
    },
    {
      name: 'Operator',
      icon: '',
      content: metadata.operator,
    },
    {
      name: 'Economical Model',
      icon: '',
      content: metadata.economicalModel === 0 ? 'free' : 'charge',
    },
    {
      name: 'Token Symbol',
      icon: '',
      content: `${metadata.tokenSymbol} (${metadata.tokenName})`,
    },
    {
      name: 'Chain ID',
      icon: '',
      content: metadata.chainId,
    },
    {
      name: 'Version',
      icon: '',
      content: metadata.version,
    },
  ]
  return (
    <div className={styles.metadataTable}>
      <MainInfoBlock proplist={mainProplist} />
      <SubInfoBlock proplist={subProplist} />
    </div>
  )
}

const HomePageList = ({ icon, title, list: List, page, }) => (
  <Grid item md={6} sm={12} xs={12}>
    <StaticCardTitle {...{ title, page, }} />
    <List />
    {/* <StaticCard icon={icon} title={title} className={styles.card} page={page}>
    </StaticCard> */}
  </Grid>
)

const HomeBlockList = ({ blocks, }) => (
  <HomePageList
    icon="/microscopeIcons/blocks.png"
    title="Latest 10 Blocks"
    page="blocks"
    list={() => <BlockList blocks={blocks} />}
  />
)

const HomeTransactionList = ({ transactions, symbol, }) => (
  <HomePageList
    icon="/microscopeIcons/transactions.png"
    title="Latest 10 Transactions"
    page="transactions"
    list={() => <TransactionList transactions={transactions} symbol={symbol} />}
  />
)

class Homepage extends React.Component<HomepageProps, HomepageState> {
  state = initState

  public componentWillMount () {
    this.fetchBlockNumber()
    this.transactionHistory()
  }

  public componentDidMount () {
    hideLoader()
    this.subjectNewBlock()
    this.fetchMetaData()
    this.checkFetchBlockOvertime()
  }

  public componentDidCatch (err) {
    this.handleError(err)
  }

  private fetchBlockNumber = () => {
    // NOTICE: async
    this.setState(state => ({ loading: state.loading + 1, })) // for get block number
    this.props.CITAObservables.newBlockNumber(0, false).subscribe(
      blockNumber => {
        this.setState(state => ({ loading: state.loading - 1, }))
        this.blockHistory({ height: blockNumber, count: 10, })
      },
      this.handleError // for get block number
    )
  }

  private blockHistory = ({ height, count, }) => {
    // NOTICE: async
    this.setState(state => ({ loading: state.loading + 1, })) // for block history
    this.props.CITAObservables.blockHistory({
      by: `${height - 1}`,
      count,
    }).subscribe((blocks: Chain.Block<Chain.TransactionInBlock>[]) => {
      this.setState(state => ({
        loading: state.loading - 1,
        blocks,
      }))
    }, this.handleError) // for block history
  }

  private transactionHistory = () => {
    // NOTICE: async
    this.setState(state => ({ loading: state.loading + 1, })) // for transaction history
    fetch10Transactions()
      .then(({ result: { transactions, }, }: { result: { transactions: TransactionFromServer[] } }) => {
        const txlist = transactions.map((tx: any) => {
          const content = unsigner(tx.content)
          const { data, value, } = content.transaction
          const error = tx.errorMessage !== null
          let type = TX_TYPE.CONTRACT_CALL
          if (tx.to === '0x') {
            type = TX_TYPE.CONTRACT_CREATION
          } else if (data === '0x' && value !== 0) {
            type = TX_TYPE.EXCHANGE
          }
          return {
            ...tx,
            type,
            error,
          }
        })
        this.setState(state => ({
          loading: state.loading - 1,
          transactions: txlist,
        }))
      })
      .catch(this.handleError)
  }

  private subjectNewBlock = () => {
    const { newBlockSubjectAdd, } = this.props.CITAObservables
    newBlockSubjectAdd(
      'homepage',
      block => {
        this.setState(state => {
          const blocks = [...state.blocks, block, ].sort((b1, b2) => b2.header.number - b1.header.number).slice(0, 10)
          if (block.body.transactions.length > 0) {
            this.transactionHistory()
          }
          return {
            blocks,
          }
        })
      },
      this.handleError
    )
  }

  private fetchMetaData = () => {
    // fetch metadata
    this.props.CITAObservables.metaData({
      blockNumber: 'latest',
    }).subscribe((metadata: Chain.MetaData) => {
      this.setState({
        metadata: {
          ...metadata,
          genesisTimestamp: new Date(metadata.genesisTimestamp).toLocaleString(),
        },
      })
    }, this.handleError)
  }

  private intervalCheckOvertime = -1 as any

  private checkFetchBlockOvertime = () => {
    clearInterval(this.intervalCheckOvertime)
    let prevBlockTime = 0
    let prevFetchTime = 0
    const ms = 100
    this.intervalCheckOvertime = setInterval(() => {
      if (!this.state.blocks[0]) return
      const { timestamp, } = this.state.blocks[0].header
      if (prevBlockTime === +timestamp) {
        this.setState(state => ({
          ...state,
          overtime: Date.now() - prevFetchTime,
        }))
      } else {
        prevBlockTime = +timestamp
        prevFetchTime = Date.now()
        this.setState(state => ({
          ...state,
          overtime: 0,
        }))
      }
    }, ms)
  }

  private handleError = handleError(this)

  private dismissError = dismissError(this)

  public render () {
    const { blocks, transactions, loading, } = this.state
    return (
      <React.Fragment>
        <LinearProgress loading={loading} />
        <div className={layout.main}>
          <MetadataTable
            metadata={this.state.metadata}
            lastestBlock={this.state.blocks[0]}
            overtime={this.state.overtime}
          />
          <Grid container spacing={window.innerWidth > 800 ? 24 : 0}>
            <HomeBlockList blocks={blocks} />
            <HomeTransactionList transactions={transactions} symbol={this.props.config.symbol} />
          </Grid>
        </div>
        <ErrorNotification error={this.state.error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}

export default translate('microscope')(withConfig(withObservables(Homepage)))
