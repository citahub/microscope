import * as React from 'react'
import { Link, } from 'react-router-dom'
import { translate, } from 'react-i18next'
import { Search as SearchIcon, } from '@material-ui/icons'
import { unsigner, } from '@appchain/signer'
import { withConfig, } from '../../contexts/config'
import { withObservables, } from '../../contexts/observables'
import { IContainerProps, IBlock, UnsignedTransaction, } from '../../typings'
import { initBlock, initUnsignedTransaction, } from '../../initValues'
import { fetchTransactions, } from '../../utils/fetcher'
import toText from '../../utils/toText'
import valueFormatter from '../../utils/valueFormatter'
import check from '../../utils/check'

const styles = require('./styles.scss')

const NOT_FOUND_IMG = `${process.env.PUBLIC}/images/search_not_found.png`
enum SearchType {
  BLOCK,
  TRANSACTION,
  ACCOUNT,
  HEIGHT,
  ERROR,
}

const searchGen = keyword => {
  let word = check.format0x(keyword)
  word = word.toLocaleLowerCase()
  if (check.address(word)) {
    return { type: SearchType.ACCOUNT, value: word, }
  } else if (check.transaction(word)) {
    return { type: SearchType.TRANSACTION, value: word, }
  } else if (check.height(word)) {
    return { type: SearchType.HEIGHT, value: word, }
  }
  return { type: SearchType.ERROR, value: word, }
}

const NotFound = () => (
  <div className={styles.notFound}>
    <img src={NOT_FOUND_IMG} title="not found" alt="not found" />
    <span>Not Found</span>
  </div>
)

const BlockDisplay = translate('microscope')(({ block, t, }: { block: IBlock; t: (key: string) => string }) => (
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
          <td>{block.header.proposer}</td>
        </tr>
        <tr>
          <td>{t('time')}</td>
          <td>{new Date(block.header.timestamp).toLocaleDateString()}</td>
        </tr>
        <tr>
          <td>{t('quota used')}</td>
          <td>{block.header.gasUsed}</td>
        </tr>
      </tbody>
    </table>
    <Link to={`/block/${block.hash}`} href={`/block/${block.hash}`} className={styles.more}>
      {t('detail')}
    </Link>
  </div>
))

const TransactionDisplay = translate('microscope')(
  ({ tx, symbol, t, }: { tx: UnsignedTransaction & { hash: string }; symbol: string; t: (key: string) => string }) => (
    <div className={styles.display}>
      <div className={styles.title}>Transaction</div>
      <table className={styles.items}>
        <tbody>
          <tr>
            <td>{t('from')}</td>
            <td>{tx.sender.address}</td>
          </tr>
          <tr>
            <td>{t('to')}</td>
            <td>{toText(tx.transaction.to)}</td>
          </tr>
          <tr>
            <td>{t('value')}</td>
            <td>{valueFormatter(tx.transaction.value, symbol)}</td>
          </tr>
        </tbody>
      </table>
      <Link to={`/transaction/${tx.hash}`} href={`/transaction/${tx.hash}`} className={styles.more}>
        {t('detail')}
      </Link>
    </div>
  )
)

const AccountDisplay = translate('microscope')(
  ({ balance, txCount, addr, t, }: { balance: string; txCount: number; addr: string; t: (key: string) => string }) => (
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
      <Link to={`/account/${addr}`} href={`/account/${addr}`} className={styles.more}>
        {t('detail')}
      </Link>
    </div>
  )
)

const initState = {
  keyword: '',
  block: initBlock,
  transaction: { ...initUnsignedTransaction, hash: '', },
  txCount: '',
  balance: '',
  searchValueError: false,
  searched: false,
}

type SearchPanelState = typeof initState
interface SearchPanelProps extends IContainerProps {}
class SearchPanel extends React.Component<SearchPanelProps, SearchPanelState> {
  state = initState

  private handleInput = (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value, } = e.currentTarget
    this.setState({
      keyword: value,
      searched: false,
    })
  }
  private handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      this.handleSearch()
    }
  }
  private fetchHeight = value =>
    this.props.CITAObservables.blockByNumber(value).subscribe(block =>
      this.setState(state => Object.assign({}, state, { block, }))
    )
  private fetchTxOrBlock = value => {
    this.props.CITAObservables.blockByHash(value).subscribe(block =>
      this.setState(state => Object.assign({}, state, { block, }))
    )
    this.props.CITAObservables.getTransaction(value).subscribe(transaction => {
      const unsignedTransaction = unsigner(transaction.content)
      unsignedTransaction.hash = transaction.hash
      this.setState(state => Object.assign({}, state, { transaction: unsignedTransaction, }))
    })
  }
  private fetchAccount = value => {
    fetchTransactions({ account: value, })
      .then(({ result, }) => this.setState(state => Object.assign({}, state, { txCount: result.count, })))
      .catch(() => {
        this.props.CITAObservables.getTransactionCount({
          addr: value,
          blockNumber: 'latest',
        }).subscribe(txCount => {
          this.setState(state => Object.assign({}, state, { txCount, }))
        })
      })
    return this.props.CITAObservables.getBalance({
      addr: value,
      blockNumber: 'latest',
    }).subscribe(balance => {
      this.setState(state => Object.assign({}, state, { balance: valueFormatter(balance, this.props.config.symbol), }))
    })
  }
  private inputSearchError = () =>
    this.setState({
      searchValueError: true,
    })
  private handleSearch = () => {
    const { keyword, } = this.state
    const { fetchHeight, fetchTxOrBlock, fetchAccount, inputSearchError, } = this
    if (keyword === '') return
    // clear history
    this.setState({ ...initState, keyword, searched: true, })
    const typeTable = {
      [SearchType.HEIGHT]: fetchHeight,
      [SearchType.TRANSACTION]: fetchTxOrBlock,
      [SearchType.ACCOUNT]: fetchAccount,
      [SearchType.ERROR]: inputSearchError,
    }
    const search = searchGen(keyword)
    typeTable[search.type](search.value)
  }
  render () {
    const { keyword, block, transaction, balance, txCount, searchValueError, searched, } = this.state
    return (
      <div>
        <div className={`${styles.fields} ${searchValueError ? styles.error : ''}`}>
          <div className={styles.search}>
            <input
              type="text"
              value={keyword}
              onChange={this.handleInput}
              onKeyUp={this.handleKeyUp}
              placeholder="Account Address, Tx Hash, Block Hash or Height"
            />
            <button onClick={this.handleSearch}>
              <SearchIcon />
            </button>
          </div>
          {searchValueError ? (
            <div className={styles.errormessage}>
              Please enter Address or Transaction Hash or Block Hash or Block Height
            </div>
          ) : null}
        </div>

        {block.hash ? <BlockDisplay block={block} /> : null}
        {transaction.hash ? <TransactionDisplay tx={transaction} symbol={this.props.config.symbol} /> : null}
        {balance !== '' ? <AccountDisplay balance={balance} txCount={+txCount} addr={keyword} /> : null}
        {searched && !searchValueError && !block.hash && !transaction.hash && !balance ? <NotFound /> : null}
      </div>
    )
  }
}
export default withConfig(withObservables(SearchPanel))
