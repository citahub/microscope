import * as React from 'react'
import { LinearProgress, Grid } from '@material-ui/core'
import { translate } from 'react-i18next'

import { Chain } from '@nervos/plugin'
import { IContainerProps, TransactionFromServer } from '../../typings'
import { withObservables } from '../../contexts/observables'
import { fetch10Transactions } from '../../utils/fetcher'
import StaticCard from '../../components/StaticCard'
import BlockList from '../../components/HomepageLists/BlockList'
import TransactionList from '../../components/HomepageLists/TransactionList'
import ErrorNotification from '../../components/ErrorNotification'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError } from '../../utils/handleError'

const layout = require('../../styles/layout.scss')
const styles = require('./homepage.scss')

interface HomepageProps extends IContainerProps {}

const initState = {
  loading: 0,
  blocks: [] as Chain.Block<Chain.TransactionInBlock>[],
  transactions: [] as TransactionFromServer[],
  healthy: {
    count: ''
  },
  error: {
    code: '',
    message: ''
  }
}
type HomepageState = typeof initState
class Homepage extends React.Component<HomepageProps, HomepageState> {
  state = initState
  componentWillMount () {
    // NOTICE: async
    this.setState(state => ({ loading: state.loading + 1 })) // for get block number
    this.props.CITAObservables.newBlockNumber(0, false).subscribe(
      blockNumber => {
        this.setState(state => ({ loading: state.loading - 1 }))
        this.blockHistory({ height: blockNumber, count: 10 })
      },
      this.handleError // for get block number
    )
    this.transactionHistory()
  }
  componentDidMount () {
    hideLoader()
  }
  componentDidCatch (err) {
    this.handleError(err)
  }

  private blockHistory = ({ height, count }) => {
    // NOTICE: async
    this.setState(state => ({ loading: state.loading + 1 })) // for block history
    this.props.CITAObservables.blockHistory({
      by: height,
      count
    }).subscribe((blocks: Chain.Block<Chain.TransactionInBlock>[]) => {
      this.setState(state => ({
        loading: state.loading - 1,
        blocks
      }))
    }, this.handleError) // for block history
  }
  private transactionHistory = () => {
    // NOTICE: async
    this.setState(state => ({ loading: state.loading + 1 })) // for transaction history
    fetch10Transactions()
      .then(({ result: { transactions } }: { result: { transactions: TransactionFromServer[] } }) => {
        this.setState(state => ({
          loading: state.loading - 1,
          transactions
        }))
      })
      .catch(this.handleError)
  }
  private handleError = handleError(this)
  private dismissError = dismissError(this)

  render () {
    const { t } = this.props
    return (
      <React.Fragment>
        {this.state.loading ? <LinearProgress classes={{ root: 'linearProgressRoot' }} /> : null}
        <div className={layout.main}>
          <Grid container spacing={window.innerWidth > 800 ? 24 : 0}>
            <Grid item md={6} sm={12} xs={12}>
              <StaticCard
                icon="/microscopeIcons/blocks.png"
                title={t('Latest 10 Blocks')}
                page="blocks"
                className={styles.card}
              >
                <BlockList blocks={this.state.blocks} />
              </StaticCard>
            </Grid>
            <Grid item md={6} sm={12} xs={12}>
              <StaticCard
                icon="/microscopeIcons/transactions.png"
                title={t('Latest 10 Transactions')}
                page="transactions"
                className={styles.card}
              >
                <TransactionList transactions={this.state.transactions} />
              </StaticCard>
            </Grid>
          </Grid>
        </div>
        <ErrorNotification error={this.state.error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}

export default translate('microscope')(withObservables(Homepage))
