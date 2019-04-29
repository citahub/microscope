/*
 * @Author: Keith-CY
 * @Date: 2018-08-02 11:37:01
 * @Last Modified by: Keith-CY
 * @Last Modified time: 2018-11-12 21:03:41
 */

import * as React from 'react'
import { Link, } from 'react-router-dom'
import { List, ListItem, } from '@material-ui/core'

import { unsigner, } from '@appchain/signer'
import { Chain, } from '@appchain/plugin/lib/typings/index.d'
import { IContainerProps, } from '../../typings'

import { initBlockState, } from '../../initValues'

import Dialog from '../Dialog/'
import { LinearProgress, } from '../../components'
import Banner from '../../components/Banner'
import TransactionList from '../../components/TransactionList/'
import ErrorNotification from '../../components/ErrorNotification'

import { withConfig, } from '../../contexts/config'
import { withObservables, } from '../../contexts/observables'

import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError, } from '../../utils/handleError'
import bytesToHex from '../../utils/bytesToHex'
import { timeFormatter, } from '../../utils/timeFormatter'
import valueFormatter from '../../utils/valueFormatter'

const layouts = require('../../styles/layout')
const texts = require('../../styles/text.scss')
const styles = require('./block.scss')

const InfoHead = ({ header, }) => (
  <div className={styles.card}>
    <span className={styles.numberTitle}>Block: #{+header.number}</span>
    <span className={styles.blockNavs}>
      <Link
        to={`/height/0x${(+header.number - 1).toString(16)}`}
        href={`/height/0x${(+header.number - 1).toString(16)}`}
      >
        <svg aria-hidden="true">
          <use xlinkHref="#icon-left-arrow" />
        </svg>
      </Link>
      <Link
        to={`/height/0x${(+header.number + 1).toString(16)}`}
        href={`/height/0x${(+header.number + 1).toString(16)}`}
      >
        <svg aria-hidden="true">
          <use xlinkHref="#icon-left-arrow" />
        </svg>
      </Link>
    </span>
  </div>
)

const InfoCell = ({ name, children, ...props }) => (
  <ListItem {...props}>
    <span className={styles.itemTitle}>{name}</span>
    {children}
  </ListItem>
)

const InfoList = ({ headerInfo, header, }) =>
  headerInfo.map(item => (
    <InfoCell key={item.key} name={item.label}>
      <span
        className={`${header[item.key]}`.startsWith('0x') ? texts.hash : ''}
      >
        {header[item.key]}
      </span>
    </InfoCell>
  ))

const InfoContent = ({
  hash,
  header,
  transactions,
  toggleTransaction,
  quotaPrice,
  fee,
  symbol,
}) => {
  const headerInfo = [
    // { key: 'quotaUsed', label: 'Quota Used', },
    { key: 'receiptsRoot', label: 'Receipts Root', },
    { key: 'stateRoot', label: 'State Root', },
    { key: 'transactionsRoot', label: 'Transactions Root', },
  ]
  return (
    <div className={styles.card}>
      <List className={styles.items}>
        <InfoCell name="Block Hash">
          <span className={texts.hash}>{hash}</span>
        </InfoCell>

        <InfoCell name="Timestamp">
          <span>{timeFormatter(header.timestamp, true)}</span>
        </InfoCell>

        <InfoCell
          name="Transactions"
          onClick={transactions.length ? toggleTransaction(true) : undefined}
          style={transactions.length ? { cursor: 'pointer', } : undefined}
        >
          <span
            style={transactions.length ? { color: '#2647fdcc', } : undefined}
          >
            {transactions.length}
          </span>
        </InfoCell>

        <InfoCell name="Proposer">
          <span className={texts.hash}>{header.proposer}</span>{' '}
        </InfoCell>

        <InfoCell name="Quota Used">{header.quotaUsed}</InfoCell>

        <InfoCell name="Quota Price">1 {symbol} = {(+quotaPrice).toLocaleString()} Quota</InfoCell>

        <InfoCell name="Total Handling Fee">{fee}</InfoCell>

        <InfoCell name="Parent Hash">
          <span>
            <Link
              to={`/block/${header.prevHash}`}
              href={`/block/${header.prevHash}`}
              className={texts.addr}
            >
              {header.prevHash}
            </Link>
          </span>
        </InfoCell>

        <InfoList headerInfo={headerInfo} header={header} />
      </List>
    </div>
  )
}

const BlockInfo = ({
  hash,
  header,
  transactions,
  toggleTransaction,
  quotaPrice,
  fee,
  symbol,
}) => (
  <div className={layouts.main}>
    <InfoHead header={header} />
    <InfoContent
      hash={hash}
      header={header}
      transactions={transactions}
      toggleTransaction={toggleTransaction}
      quotaPrice={quotaPrice}
      fee={fee}
      symbol={symbol}
    />
  </div>
)

const initState = initBlockState
type IBlockState = typeof initState
interface IBlockProps extends IContainerProps {}

class Block extends React.Component<IBlockProps, IBlockState> {
  readonly state = initState;

  public componentDidMount () {
    hideLoader()
    this.onMount(this.props.match.params)
  }

  public componentWillReceiveProps (nextProps: IBlockProps) {
    const { blockHash, height, } = nextProps.match.params
    const {
      blockHash: oldBlockHash,
      height: oldHeight,
    } = this.props.match.params
    if (
      (blockHash && blockHash !== oldBlockHash) ||
      (height && height !== oldHeight)
    ) {
      this.onMount(nextProps.match.params)
    }
  }

  public componentDidCatch (err) {
    this.handleError(err)
  }

  private onMount = params => {
    const { blockHash, height, } = params
    if (blockHash) {
      this.setState(state => ({ loading: state.loading + 1, }))
      // NOTICE: async
      this.props.CITAObservables.blockByHash(blockHash).subscribe(
        (
          block: // RpcResult.BlockByHash
          any
        ) => this.handleReturnedBlock(block),
        this.handleError
      )
    }
    if (height) {
      // NOTICE: async
      this.setState(state => ({ loading: state.loading + 1, }))
      this.props.CITAObservables.blockByNumber(height).subscribe(
        (
          block: // RpcResult.BlockByNumber
          any
        ) => {
          this.handleReturnedBlock(block)
        },
        this.handleError
      )
    }
  };
  private handleQuotaPriceAndFee = (blockNumber: string, quotaUsed: string) => {
    this.props.CITAObservables.getQuotaPrice(blockNumber).subscribe(
      (price: string) => {
        const _price = price === '0x' ? 0 : +price
        this.setState(state => ({
          ...state,
          quotaPrice: `${_price}`,
          fee: valueFormatter(+quotaUsed * +_price, this.props.config.symbol),
        }))
      },
      this.handleError
    )
  }

  private handleReturnedBlock = (
    block: Chain.Block<Chain.TransactionInBlock>
  ) => {
    if (!block) {
      return this.handleError({
        error: {
          message: 'Block Not Found',
          code: '-1',
        },
      })
    }
    /* eslint-disable */
    block.body.transactions = block.body.transactions.map(tx => {
      const details = unsigner(tx.content);
      if (typeof tx.basicInfo !== 'string' && tx.basicInfo) {
        tx.basicInfo.value = '' + +bytesToHex(tx.basicInfo.value as any)
        tx.basicInfo.from = details.sender.address
      }
      return {
        ...tx,
        timestamp: `${block.header.timestamp}`,
      };
    });
    block.header.quotaUsed = `${+block.header.quotaUsed}`;
    // get quota price
    this.handleQuotaPriceAndFee(block.header.number, block.header.quotaUsed);
    /* eslint-enable */
    return this.setState(state =>
      Object.assign({}, state, { ...block, loading: state.loading - 1, })
    )
  }

  private toggleTransaction = (on: boolean = false) => e => {
    this.setState(state => ({
      ...state,
      transactionsOn: on,
    }))
  };

  private handleError = handleError(this);
  private dismissError = dismissError(this);

  public render () {
    const {
      loading,
      body: { transactions, },
      hash,
      header,
      transactionsOn,
      error,
      quotaPrice,
      fee,
    } = this.state
    return (
      <React.Fragment>
        <LinearProgress loading={loading} />
        <Banner />
        <BlockInfo
          hash={hash}
          header={header}
          transactions={transactions}
          toggleTransaction={this.toggleTransaction}
          fee={fee}
          quotaPrice={quotaPrice}
          symbol={this.props.config.symbol}
        />
        <Dialog
          on={transactionsOn}
          onClose={this.toggleTransaction()}
          dialogTitle="Transactions List"
        >
          <TransactionList
            transactions={transactions}
            symbol={this.props.config.symbol}
          />
        </Dialog>
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}
export default withConfig(withObservables(Block))
