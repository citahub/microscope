/*
 * @Author: Keith-CY
 * @Date: 2018-08-02 11:37:01
 * @Last Modified by: Keith-CY
 * @Last Modified time: 2018-09-11 14:28:32
 */

import * as React from 'react'
import { Link } from 'react-router-dom'
import { LinearProgress, Card, CardContent, List, ListItem } from '@material-ui/core'

import { unsigner } from '@nervos/signer'
import { RpcResult, Chain } from '@nervos/plugin/lib/typings/index.d'
import { IContainerProps, IBlock } from '../../typings'

import { initBlockState } from '../../initValues'

import Dialog from '../Dialog/'
import Banner from '../../components/Banner'
import TransactionList from '../../components/TransactionList/'
import ErrorNotification from '../../components/ErrorNotification'

import { withConfig } from '../../contexts/config'
import { withObservables } from '../../contexts/observables'

import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError } from '../../utils/handleError'
import bytesToHex from '../../utils/bytesToHex'

const layouts = require('../../styles/layout')
const texts = require('../../styles/text.scss')
const styles = require('./block.scss')

const initState = initBlockState
type IBlockState = typeof initState
interface IBlockProps extends IContainerProps {}
class Block extends React.Component<IBlockProps, IBlockState> {
  readonly state = initState
  public componentWillMount () {
    this.onMount(this.props.match.params)
  }
  public componentDidMount () {
    hideLoader()
  }
  public componentWillReceiveProps (nextProps: IBlockProps) {
    const { blockHash, height } = nextProps.match.params
    const { blockHash: oldBlockHash, height: oldHeight } = this.props.match.params
    if ((blockHash && blockHash !== oldBlockHash) || (height && height !== oldHeight)) {
      this.onMount(nextProps.match.params)
    }
  }

  public componentDidCatch (err) {
    this.handleError(err)
  }
  private onMount = params => {
    const { blockHash, height } = params
    if (blockHash) {
      this.setState(state => ({ loading: state.loading + 1 }))
      // NOTICE: async
      this.props.CITAObservables.blockByHash(blockHash).subscribe(
        (block: RpcResult.BlockByHash) => this.handleReturnedBlock(block),
        this.handleError
      )
    }
    if (height) {
      // NOTICE: async
      this.setState(state => ({ loading: state.loading + 1 }))
      this.props.CITAObservables.blockByNumber(height).subscribe((block: RpcResult.BlockByNumber) => {
        this.handleReturnedBlock(block)
      }, this.handleError)
    }
  }
  private handleReturnedBlock = (block: Chain.Block<Chain.TransactionInBlock>) => {
    if (!block) {
      return this.handleError({
        error: {
          message: 'Block Not Found',
          code: '-1'
        }
      })
    }
    /* eslint-disable */
    block.body.transactions = block.body.transactions.map(tx => {
      const details = unsigner(tx.content)
      if (typeof tx.basicInfo !== 'string' && tx.basicInfo) {
        tx.basicInfo.value = '' + +bytesToHex(tx.basicInfo.value as any)
        tx.basicInfo.from = '0x' + details.sender.address
      }
      return {
        ...tx,
        timestamp: `${block.header.timestamp}`
      }
    })
    block.header.gasUsed = `${+block.header.gasUsed}`
    /* eslint-enable */
    return this.setState(state => Object.assign({}, state, { ...block, loading: state.loading - 1 }))
  }
  private toggleTransaction = (on: boolean = false) => e => {
    this.setState(state => ({
      ...state,
      transactionsOn: on
    }))
  }

  private handleError = handleError(this)
  private dismissError = dismissError(this)
  private headerInfo = [
    { key: 'gasUsed', label: 'Quota Used' },
    { key: 'receiptsRoot', label: 'Receipts Root' },
    { key: 'stateRoot', label: 'State Root' },
    { key: 'transactionsRoot', label: 'Transactions Root' }
  ]

  render () {
    const {
      loading,
      body: { transactions },
      hash,
      header,
      transactionsOn,
      error
    } = this.state
    return (
      <React.Fragment>
        {loading ? (
          <LinearProgress
            classes={{
              root: 'linearProgressRoot'
            }}
          />
        ) : null}
        <Banner bg={`${process.env.PUBLIC}/banner/banner-Block.png`}>
          <div>Block</div>
          <div className={styles.height}>
            <Link
              to={`/height/0x${(+header.number - 1).toString(16)}`}
              href={`/height/0x${(+header.number - 1).toString(16)}`}
            >
              <svg className="icon" aria-hidden="true">
                <use xlinkHref="#icon-left" />
              </svg>
            </Link>
            Height: {+header.number}
            <Link
              to={`/height/0x${(+header.number + 1).toString(16)}`}
              href={`/height/0x${(+header.number + 1).toString(16)}`}
            >
              <svg className="icon" aria-hidden="true" style={{ transform: 'rotate(180deg)' }}>
                <use xlinkHref="#icon-left" />
              </svg>
            </Link>
          </div>
        </Banner>
        <div className={layouts.main}>
          <Card
            classes={{
              root: styles.hashCardRoot
            }}
          >
            <CardContent>
              <div className={styles.hashTitle}>Block Hash</div>
              <div className={styles.hashText}>{hash}</div>
            </CardContent>
          </Card>
          <Card classes={{ root: layouts.cardContainer }}>
            <CardContent>
              <List className={styles.items}>
                <ListItem>
                  <span className={styles.itemTitle}>TimeStamp</span>
                  <span>{new Date(header.timestamp).toLocaleString()}</span>
                </ListItem>
                <ListItem
                  onClick={transactions.length ? this.toggleTransaction(true) : undefined}
                  style={transactions.length ? { cursor: 'pointer' } : undefined}
                >
                  <span className={styles.itemTitle}>Transactions</span>
                  <span style={transactions.length ? { color: '#2647fdcc' } : undefined}>{transactions.length}</span>
                </ListItem>
                <ListItem>
                  <span className={styles.itemTitle}>Proposer</span>
                  <span className={texts.hash}>{header.proposer}</span>
                </ListItem>
                <ListItem>
                  <span className={styles.itemTitle}>Parent Hash</span>
                  <span>
                    <Link to={`/block/${header.prevHash}`} href={`/block/${header.prevHash}`} className={texts.addr}>
                      {header.prevHash}
                    </Link>
                  </span>
                </ListItem>
                {this.headerInfo.map(item => (
                  <ListItem key={item.key}>
                    <span className={styles.itemTitle}>{item.label}</span>
                    <span>{header[item.key]}</span>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </div>
        <Dialog on={transactionsOn} onClose={this.toggleTransaction()} dialogTitle="Transactions List">
          <TransactionList transactions={transactions} />
        </Dialog>
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}
export default withConfig(withObservables(Block))
