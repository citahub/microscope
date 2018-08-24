import * as React from 'react'
import { Link } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Search as SearchIcon } from '@material-ui/icons'
import { withObservables } from '../../contexts/observables'
import { IContainerProps, IBlock, Transaction } from '../../typings'
import { initBlock, initTransaction } from '../../initValues'

const styles = require('./styles.scss')

enum SearchType {
  BLOCK,
  TRANSACTION,
  ACCOUNT,
  HEIGHT,
}

const searchGen = keyword => {
  switch (keyword.length) {
    case 64:
    case 66: {
      return [
        { type: SearchType.BLOCK, url: `/block/${keyword}` },
        { type: SearchType.TRANSACTION, url: `/transactions/${keyword}` },
      ]
    }
    case 40:
    case 42: {
      return [{ type: SearchType.ACCOUNT, url: `/account/${keyword}` }]
    }
    default: {
      return [{ type: SearchType.HEIGHT, url: `/height/${keyword}` }]
    }
  }
}

const BlockDisplay = translate('microscope')(
  ({ block, t }: { block: IBlock; t: (key: string) => string }) => (
    <div className={styles.display}>
      <div className={styles.title}>Block</div>
      <table className={styles.items}>
        <tbody>
          <tr>
            <td>{t('hash')}</td>
            <td>{block.hash}</td>
          </tr>
          <tr>
            <td>{t('height')}</td>
            <td>{+block.header.number}</td>
          </tr>
          <tr>
            <td>{t('prev hash')}</td>
            <td>{block.header.prevHash}</td>
          </tr>
          <tr>
            <td>{t('validator')}</td>
            <td>{block.header.proof.Bft.proposal}</td>
          </tr>
          <tr>
            <td>{t('time')}</td>
            <td>{new Date(block.header.timestamp).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td>{t('gas used')}</td>
            <td>{block.header.gasUsed}</td>
          </tr>
        </tbody>
      </table>
      <Link
        to={`/block/${block.hash}`}
        href={`/block/${block.hash}`}
        className={styles.more}
      >
        {t('detail')}
      </Link>
    </div>
  ),
)

const TransactionDisplay = translate('microscope')(
  ({ tx, t }: { tx: Transaction; t: (key: string) => string }) =>
    tx.basicInfo ? (
      <div className={styles.display}>
        <div className={styles.title}>Transaction</div>
        <table className={styles.items}>
          <tbody>
            <tr>
              <td>{t('from')}</td>
              <td>{tx.basicInfo.from}</td>
            </tr>
            <tr>
              <td>{t('to')}</td>
              <td>{tx.basicInfo.to}</td>
            </tr>
            <tr>
              <td>{t('value')}</td>
              <td>{tx.basicInfo.value}</td>
            </tr>
          </tbody>
        </table>
        <Link
          to={`/transaction/${tx.hash}`}
          href={`/transaction/${tx.hash}`}
          className={styles.more}
        >
          {t('detail')}
        </Link>
      </div>
    ) : (
      <div className={styles.display}>
        <div className={styles.title}>Transaction</div>
        <table className={styles.items}>
          <tbody>
            <tr>
              <td>{t('content')}</td>
              <td>{tx.content}</td>
            </tr>
          </tbody>
        </table>
        <Link
          to={`/transaction/${tx.hash}`}
          href={`/transaction/${tx.hash}`}
          className={styles.more}
        >
          {t('detail')}
        </Link>
      </div>
    ),
)

const AccountDisplay = translate('microscope')(
  ({
    balance,
    txCount,
    addr,
    t,
  }: {
  balance: string
  txCount: number
  addr: string
  t: (key: string) => string
  }) => (
    <div className={styles.display}>
      <div className={styles.title}>{t('account')}</div>
      <table className={styles.items}>
        <tbody>
          <tr>
            <td>{t('balance')}</td>
            <td>{balance}</td>
          </tr>
          <tr>
            <td>{t('transactions')}</td>
            <td>{txCount}</td>
          </tr>
        </tbody>
      </table>
      <Link
        to={`/account/${addr}`}
        href={`/account/${addr}`}
        className={styles.more}
      >
        {t('detail')}
      </Link>
    </div>
  ),
)

const initState = {
  keyword: '',
  block: initBlock,
  transaction: initTransaction,
  txCount: '',
  balance: '',
}

type SearchPanelState = typeof initState
interface SearchPanelProps extends IContainerProps {}
class SearchPanel extends React.Component<SearchPanelProps, SearchPanelState> {
  state = initState

  private handleInput = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    this.setState(state => ({
      keyword: value,
    }))
  }
  private handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      this.handleSearch()
    }
  }
  private handleSearch = () => {
    const { keyword } = this.state
    if (keyword === '') return
    // clear history
    this.setState(state => ({ ...initState, keyword }))

    const { CITAObservables } = this.props
    const searches = searchGen(keyword)
    searches.forEach(search => {
      switch (search.type) {
        case SearchType.BLOCK: {
          return CITAObservables.blockByHash(keyword).subscribe(block =>
            this.setState(state => Object.assign({}, state, { block })),
          )
        }
        case SearchType.HEIGHT: {
          return CITAObservables.blockByNumber(keyword).subscribe(block =>
            this.setState(state => Object.assign({}, state, { block })),
          )
        }
        case SearchType.TRANSACTION: {
          return CITAObservables.getTransaction(keyword).subscribe(
            transaction => {
              this.setState(state => Object.assign({}, state, { transaction }))
            },
          )
        }
        case SearchType.ACCOUNT: {
          // CITAObservables.getBalance({ addr: keyword, blockNumber: "latest" }).subscribe(balance => {
          //   this.setState(state => Object.assign({}, state, {balance}))
          // })
          CITAObservables.getTransactionCount({
            addr: keyword,
            blockNumber: 'latest',
          }).subscribe(txCount => {
            this.setState(state => Object.assign({}, state, { txCount }))
          })
          return CITAObservables.getBalance({
            addr: keyword,
            blockNumber: 'latest',
          }).subscribe(balance => {
            this.setState(state => Object.assign({}, state, { balance }))
          })
        }
        default: {
          return false
        }
      }
    })
  }
  render () {
    const { keyword, block, transaction, balance, txCount } = this.state
    return (
      <div>
        <div className={styles.fields}>
          <input
            type="text"
            value={keyword}
            onChange={this.handleInput}
            onKeyUp={this.handleKeyUp}
          />
          <button onClick={this.handleSearch}>
            <SearchIcon />
          </button>
        </div>
        {block.hash ? <BlockDisplay block={block} /> : null}
        {transaction.hash ? <TransactionDisplay tx={transaction} /> : null}
        {balance !== '' ? (
          <AccountDisplay balance={balance} txCount={+txCount} addr={keyword} />
        ) : null}
      </div>
    )
  }
}
export default withObservables(SearchPanel)
