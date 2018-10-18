import * as React from 'react'
import { Grid } from '@material-ui/core'
import { Chain } from '@nervos/plugin'
import { unsigner } from '@nervos/signer'
import * as EthAccount from 'web3-eth-accounts'

import StaticCard from '../../components/StaticCard'
import BlockList from '../../components/HomepageLists/BlockList'
import TransactionList from '../../components/HomepageLists/TransactionList'
import DebugAccounts, { DebugAccount } from '../../components/DebugAccounts'
import ErrorNotification from '../../components/ErrorNotification'

import { withObservables } from '../../contexts/observables'

import hideLoader from '../../utils/hideLoader'
import { IContainerProps, TransactionFromServer } from '../../typings'
import { handleError, dismissError } from '../../utils/handleError'
import { getLocalDebugAccounts, setLocalDebugAccounts } from '../../utils/accessLocalstorage'

const layout = require('../../styles/layout.scss')
const styles = require('./debugger.scss')

const ethAccounts = new EthAccount()

const privateKeysToAccounts = (privateKeys: string[]) =>
  privateKeys.map(privateKey => {
    const { address } = ethAccounts.privateKeyToAccount(privateKey)
    return {
      privateKey,
      address,
      balance: 'unloaded'
    }
  })

const initState = {
  accounts: [] as DebugAccount[],
  privateKeysField: '',
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
  public readonly state = initState
  public componentDidMount () {
    hideLoader()
    this.loadDebugAccounts()
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
    this.props.CITAObservables.newBlockByNumberSubject.subscribe(block => {
      // new block comes
      this.fetchAndUpdateAccounts(this.state.accounts)
    })
  }
  public loadDebugAccounts = () => {
    let privateKeys = getLocalDebugAccounts()
    if (!privateKeys.length) {
      privateKeys = process.env.DEBUG_ACCOUNTS ? process.env.DEBUG_ACCOUNTS.split(',') : []
    }
    const accounts = privateKeysToAccounts(privateKeys)
    this.setState({ accounts, privateKeysField: privateKeys.join(',') })
    this.fetchAndUpdateAccounts(accounts)
  }
  public updateDebugAccounts = () => {
    const { privateKeysField } = this.state
    try {
      const privateKeys = Array.from(new Set(privateKeysField.replace(/(\s|\n|\r)+/gi, '').split(',')))
      const accounts = privateKeysToAccounts(privateKeys)
      setLocalDebugAccounts(privateKeys)
      this.fetchAndUpdateAccounts(accounts)
    } catch (err) {
      window.alert(err)
    }
  }
  public fetchAndUpdateAccounts = (accounts: DebugAccount[]) => {
    accounts.forEach((account, idx) => {
      this.props.CITAObservables.getBalance({ addr: account.address, blockNumber: 'latest' }).subscribe(balance => {
        this.setState(state => {
          const _accounts = [...accounts]
          _accounts[idx].balance = `${+balance}`
          return { ...state, accounts: _accounts }
        })
      })
    })
  }
  private handleInput = key => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    this.setState(state => ({
      ...state,
      [key]: value
    }))
  }
  private handleError = handleError(this)
  private dismissError = dismissError(this)
  public render () {
    return (
      <React.Fragment>
        <div className={layout.main}>
          <DebugAccounts
            privateKeysField={this.state.privateKeysField}
            accounts={this.state.accounts}
            updateDebugAccounts={this.updateDebugAccounts}
            handleAccountsInput={this.handleInput('privateKeysField')}
          />
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
