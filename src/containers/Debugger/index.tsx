import * as React from 'react'
import { Grid } from '@material-ui/core'
import { Chain } from '@nervos/plugin'
import { unsigner } from '@nervos/signer'

import StaticCard from '../../components/StaticCard'
import BlockList from '../../components/HomepageLists/BlockList'
import TransactionList from '../../components/HomepageLists/TransactionList'
import ErrorNotification from '../../components/ErrorNotification'

import { withObservables } from '../../contexts/observables'

import hideLoader from '../../utils/hideLoader'
import { IContainerProps, TransactionFromServer } from '../../typings'
import { handleError, dismissError } from '../../utils/handleError'

const layout = require('../../styles/layout.scss')
const styles = require('./debugger.scss')

const initState = {
  blocks: [] as Chain.Block<Chain.TransactionInBlock>[],
  transactions: [] as TransactionFromServer[],
  error: {
    code: '',
    message: ''
  }
}

interface DebuggerProps extends IContainerProps {}

type DebuggerState = typeof initState

class Debugger extends React.Component<DebuggerProps, DebuggerState> {
  state = initState
  public componentDidMount () {
    hideLoader()
    this.props.CITAObservables.newBlockByNumberSubject.subscribe((block: Chain.Block<Chain.TransactionInBlock>) => {
      if (block.body.transactions.length) {
        this.setState((state: DebuggerState) => {
          const blocks = [...state.blocks, block]
          const newTransactions = block.body.transactions.map(tx => {
            const unsignedTx = unsigner(tx.content)
            return {
              blockNumber: block.number,
              content: tx.content,
              from: unsignedTx.sender.address,
              gasUsed: '',
              hash: tx.hash,
              timestamp: block.header.timestamp,
              to: unsignedTx.transaction.to,
              value: +unsignedTx.transaction.value.join('')
            }
          })
          const transactions = [...state.transactions, ...newTransactions]

          return {
            blocks,
            transactions
          }
        })
      }
    })
  }
  private handleError = handleError(this)
  private dismissError = dismissError(this)
  public render () {
    return (
      <React.Fragment>
        <div className={layout.main}>
          <Grid container spacing={window.innerWidth > 800 ? 24 : 0}>
            <Grid item md={6} sm={12} xs={12}>
              <StaticCard icon="/microscopeIcons/blocks.png" title="Blocks" page="blocks" className={styles.card}>
                <BlockList blocks={[...this.state.blocks].reverse()} />
              </StaticCard>
            </Grid>
            <Grid item md={6} sm={12} xs={12}>
              <StaticCard
                icon="/microscopeIcons/transactions.png"
                title="Transactions"
                page="transactions"
                className={styles.card}
              >
                <TransactionList transactions={[...this.state.transactions].reverse()} />
              </StaticCard>
            </Grid>
          </Grid>
        </div>
        <ErrorNotification error={this.state.error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}
export default withObservables(Debugger)
