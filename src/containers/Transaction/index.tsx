import * as React from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, List, ListSubheader, ListItem, ListItemText, Divider } from '@material-ui/core'
import { unsigner } from '@nervos/signer'
import { Chain } from '@nervos/plugin/lib/typings/index.d'

import { LinearProgress } from '../../components'
import Banner from '../../components/Banner'
import Icon from '../../components/Icons'
import ErrorNotification from '../../components/ErrorNotification'

import { withObservables } from '../../contexts/observables'
import { IContainerProps, DetailedTransaction } from '../../typings/'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError } from '../../utils/handleError'
import bytesToHex from '../../utils/bytesToHex'
import valueFormatter from '../../utils/valueFormatter'
import {format0x} from '../../utils/check'
import Images from '../../images'

const layouts = require('../../styles/layout.scss')
const texts = require('../../styles/text.scss')
const styles = require('./transaction.scss')

const InfoList = ({ infos, details }) =>
  infos.map(info => (
    <ListItem key={info.key}>
      <ListItemText
        classes={{
          primary: styles.infoTitle,
          secondary: styles.infoValue
        }}
        primary={info.label}
        secondary={
          info.type && !['Contract Creation'].includes(details[info.key]) ? (
            <Link
              to={`/${info.type}/${details[info.key]}`}
              href={`/${info.type}/${details[info.key]}`}
              className={texts.addr}
            >
              {details[info.key] || 'null'}
            </Link>
          ) : (
            details[info.key] || 'null'
          )
        }
      />
    </ListItem>
  ))

const Info = ({ title, infos, details }) => (
  <List
    subheader={
      <ListSubheader component="div" classes={{ root: styles.listHeaderRoot }}>
        {title}
      </ListSubheader>
    }
    classes={{
      root: styles.listRoot
    }}
  >
    <Divider classes={{ root: styles.divider }} light />
    <InfoList infos={infos} details={details} />
  </List>
)

const Timestamp = (timestamp, gasUsed) => (
  <Card classes={{ root: styles.hashCardRoot }}>
    <CardContent>
      <div className={styles.attrs}>
        <span>
          <Icon name="time" />
          <span className={styles.attrTitle}>Time: </span>
          {new Date(timestamp).toLocaleString()}
        </span>
        {gasUsed ? (
          <span>
            <img src={Images.gas} alt="gas used" className={styles.gasIcon} />
            <span className={styles.attrTitle}>Gas Used: </span>
            {gasUsed}
          </span>
        ) : null}
      </div>
    </CardContent>
  </Card>
)

interface TransactionProps extends IContainerProps {}

interface TransactionState extends DetailedTransaction {
  timestamp: ''
  gasUsed: ''
  error: {
    message: string
    code: string
  }
  loading: number
}
const initState: TransactionState = {
  hash: '',
  blockHash: '',
  blockNumber: '',
  index: '',
  content: '',
  basicInfo: {
    from: '',
    to: '',
    nonce: '',
    validUntilBlock: '',
    value: '',
    data: '',
    quotaLimit: '',
    quotaPrice: '',
    quotaUsed: '',
    createdContractAddress: '',
    errorMessage: ''
  },
  error: {
    message: '',
    code: ''
  },
  timestamp: '',
  gasUsed: '',
  loading: 0
}

class Transaction extends React.Component<TransactionProps, TransactionState> {
  readonly state = initState

  public componentWillMount () {
    const { transaction } = this.props.match.params
    if (transaction) {
      this.fetchTransactionInfo(transaction)
    }
  }

  public componentDidMount () {
    hideLoader()
  }

  public componentWillReceiveProps (nextProps) {
    const { transaction } = nextProps.match.params
    if (transaction) {
      this.fetchTransactionInfo(transaction)
    }
  }

  public componentDidCatch (err) {
    this.handleError(err)
  }

  private getQuotaPrice = () => {
    this.props.CITAObservables.getQuotaPrice().subscribe((price: string) => {
      this.setState(state =>
        Object.assign({}, state, {
          basicInfo: {
            ...state.basicInfo,
            quotaPrice: `${price === '0x' ? '0' : +price}`
          }
        })
      )
    }, this.handleError)
  }

  private fetchTransactionInfo = transaction => {
    const hash = format0x(transaction)
    this.setState(state => ({ loading: state.loading + 2, hash }))
    this.props.CITAObservables.getTransaction(transaction).subscribe((tx: Chain.Transaction) => {
      this.handleReturnedTx(tx)
    }, this.handleError)
    this.props.CITAObservables.getTransactionReceipt(transaction).subscribe((receipt: Chain.TransactionReceipt) => {
      this.handleReturnedTxReceipt(receipt)
    }, this.handleError)
    this.getQuotaPrice()
  }

  private handleReturnedTx = (tx: Chain.Transaction) => {
    if (!tx) {
      this.handleError({
        error: {
          message: 'Transaction Not Found',
          code: '-1'
        }
      })
    }
    const details = unsigner(tx.content)
    let { data, value } = details.transaction
    const { nonce, quota: quotaLimit, validUntilBlock } = details.transaction
    let { address: from } = details.sender
    let { to } = tx.basicInfo as any

    const hexData = bytesToHex(data as any)
    data = hexData === '0x' ? 'null' : hexData
    value = valueFormatter(bytesToHex(value as any))
    from = `0x${from}`
    to = to ? `0x${to}` : 'Contract Creation'

    this.setState(state =>
      Object.assign({}, state, {
        blockHash: tx.blockHash,
        blockNumber: `${+tx.blockNumber}`,
        index: `${+tx.index}`,
        basicInfo: {
          ...state.basicInfo,
          data,
          value,
          from,
          nonce,
          quotaLimit,
          validUntilBlock,
          to
        },
        loading: state.loading - 1
      })
    )
  }

  private handleReturnedTxReceipt = (receipt: Chain.TransactionReceipt) => {
    if (!receipt) {
      this.handleError({
        error: {
          message: 'Transaction Not Found',
          code: '-1'
        }
      })
    }
    const { errorMessage, gasUsed: quotaUsed, contractAddress: createdContractAddress } = receipt
    this.setState(state =>
      Object.assign({}, state, {
        basicInfo: {
          ...state.basicInfo,
          errorMessage,
          quotaUsed,
          createdContractAddress
        },
        loading: state.loading - 1
      })
    )
    // this.setState(state => ({
    //   ...state,
    //   basicInfo: {
    //     ...state.basicInfo,
    //     errorMessage,
    //     quotaUsed,
    //     createdContractAddress
    //   },
    //   loading: state.loading - 1
    // }))
  }

  private infos = [
    { key: 'blockHash', label: 'Block Hash', type: 'block' },
    { key: 'blockNumber', label: 'Height', type: 'height' },
    { key: 'index', label: 'Index' }
  ]

  private basicInfo = [
    { key: 'from', label: 'From', type: 'account' },
    { key: 'to', label: 'To', type: 'account' },
    { key: 'nonce', label: 'Nonce' },
    { key: 'validUntilBlock', label: 'ValidUntilBlock' },
    { key: 'value', label: 'Value' },
    { key: 'data', label: 'Data' },
    { key: 'quotaLimit', label: 'Quota Limit' },
    { key: 'quotaPrice', label: 'Quota Price' },
    { key: 'quotaUsed', label: 'Quota Used' },
    { key: 'createdContractAddress', label: 'Created Contract Address' },
    { key: 'errorMessage', label: 'Error Message' }
  ]

  private handleError = handleError(this)
  private dismissError = dismissError(this)

  public render () {
    const { hash, error, timestamp, gasUsed, loading } = this.state
    return (
      <React.Fragment>
        <LinearProgress loading={loading} />
        <Banner bg={Images.banner.transaction}>
          <div className={styles.hashTitle}>Transaction</div>
          <div className={styles.hashText}>{hash}</div>
        </Banner>

        <div className={layouts.main}>
          {timestamp ? <Timestamp timestamp={timestamp} gasUsed={gasUsed} /> : null}
          <Card classes={{ root: layouts.cardContainer }}>
            <CardContent classes={{ root: styles.cardContentRoot }}>
              <div className={styles.lists}>
                <Info title="Transaction" infos={this.basicInfo} details={this.state.basicInfo} />
                <Info title="Block" infos={this.infos} details={this.state} />
              </div>
            </CardContent>
          </Card>
        </div>
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}

export default withObservables(Transaction)
