import * as React from 'react'
import { Grid, } from '@material-ui/core'
import { translate, } from 'react-i18next'
import { Chain, } from '@nervos/plugin'

import { LinearProgress, } from '../../components'
import { TransactionFromServer, } from '../../typings'
import { withConfig, } from '../../contexts/config'
import { withObservables, } from '../../contexts/observables'
import { fetch10Transactions, } from '../../utils/fetcher'
import StaticCard from '../../components/StaticCard'
import BlockList from '../../components/HomepageLists/BlockList'
import TransactionList from '../../components/HomepageLists/TransactionList'
import ErrorNotification from '../../components/ErrorNotification'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError, } from '../../utils/handleError'
import { HomepageProps, HomepageState, } from './type'
import { initHomePageState as initState, } from '../../initValues'

const layout = require('../../styles/layout.scss')
const styles = require('./homepage.scss')

const HomePageList = ({ icon, title, list: List, page, }) => (
  <Grid item md={6} sm={12} xs={12}>
    <StaticCard icon={icon} title={title} className={styles.card} page={page}>
      <List />
    </StaticCard>
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
      by: height,
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
        this.setState(state => ({
          loading: state.loading - 1,
          transactions,
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

  private handleError = handleError(this)

  private dismissError = dismissError(this)

  public render () {
    const { blocks, transactions, loading, } = this.state
    return (
      <React.Fragment>
        <LinearProgress loading={loading} />
        <div className={layout.main}>
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
