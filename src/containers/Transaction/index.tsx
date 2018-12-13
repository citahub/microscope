import * as React from 'react'
import { hexToUtf8, } from 'web3-utils'
import * as abiCoder from 'web3-eth-abi'
import { Link, } from 'react-router-dom'
import { Card, CardContent, List, ListSubheader, ListItem, ListItemText, Typography, Divider, } from '@material-ui/core'
import { unsigner, } from '@appchain/signer'
import { Chain, } from '@nervos/plugin/lib/typings/index.d'

import { LinearProgress, } from '../../components'
import Banner from '../../components/Banner'
import ErrorNotification from '../../components/ErrorNotification'

import { withConfig, } from '../../contexts/config'
import { withObservables, } from '../../contexts/observables'
import { IContainerProps, } from '../../typings/'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError, } from '../../utils/handleError'
import valueFormatter from '../../utils/valueFormatter'
import { format0x, } from '../../utils/check'
import Images from '../../images'

const layouts = require('../../styles/layout.scss')
const texts = require('../../styles/text.scss')
const styles = require('./transaction.scss')

export enum TX_TYPE {
  EXCHANGE = 'Exchange',
  CONTRACT_CREATION = 'Contract Creation',
  CONTRACT_CALL = 'Contract Call',
}
export enum TX_STATUS {
  SUCCESS = 'Success',
  FAILURE = 'Failure',
}
export enum DATA_TYPE {
  HEX = 'Hex',
  UTF8 = 'UTF-8',
}
const EMPTY_DATA = 'Empty Data'

const InfoItem = ({
  label,
  type,
  detail,
  action,
}: {
label: string
type?: string
detail: any
action?: {
label: string
cb: (e) => void
}
}) => (
  <ListItem>
    <ListItemText
      classes={{
        primary: styles.infoTitle,
        secondary: styles.infoValue,
      }}
      primary={
        <Typography variant="body2">
          {label}
          {action ? <button onClick={action.cb}>{action.label}</button> : null}
        </Typography>
      }
      secondary={
        type ? (
          <Link to={`/${type}/${detail}`} href={`/${type}/${detail}`} className={texts.addr}>
            {detail}
          </Link>
        ) : (
          detail
        )
      }
    />
  </ListItem>
)

interface TransactionProps extends IContainerProps {}

const initState = {
  hash: '',
  blockHash: '',
  blockNumber: '',
  from: '',
  to: '',
  nonce: '',
  validUntilBlock: '',
  value: '',
  data: '',
  utf8Str: '',
  quotaLimit: '',
  quotaUsed: '',
  version: 0,
  error: {
    message: '',
    code: '',
  },
  quotaPrice: '',
  timestamp: '',
  loading: 0,
  status: TX_STATUS.FAILURE as TX_STATUS | String,
  type: TX_TYPE.EXCHANGE,
  dataType: DATA_TYPE.HEX,
  parameters: '',
}

type ITransactionState = typeof initState

class Transaction extends React.Component<TransactionProps, ITransactionState> {
  static items = [
    { key: 'type', label: 'Type', },
    { key: 'status', label: 'Status', },
    { key: 'from', label: 'From', type: 'account', },
    { key: 'to', label: 'To', type: 'account', },
    { key: 'contractAddress', label: 'Contract', type: 'account', },
    { key: 'blockNumber', label: 'Block Height', type: 'Height', },
    { key: 'version', label: 'Version', },
    { key: 'nonce', label: 'Nonce', },
    { key: 'validUntilBlock', label: 'ValidUntilBlock', },
    { key: 'value', label: 'Value', },
    { key: 'quota', label: 'Quota', },
    { key: 'quotaPrice', label: 'Quota Price', },
    { key: 'fee', label: 'Fee', },
  ]
  readonly state = initState

  public componentDidMount () {
    hideLoader()
    const { transaction, } = this.props.match.params
    if (transaction) {
      this.fetchTransactionInfo(transaction)
    }
  }

  public componentWillReceiveProps (nextProps) {
    const { transaction, } = nextProps.match.params
    if (
      transaction &&
      transaction.replace(/^0x/, '').toLowerCase() !== this.state.hash.replace(/^0x/, '').toLowerCase()
    ) {
      this.fetchTransactionInfo(transaction)
    }
  }

  public componentDidCatch (err) {
    this.handleError(err)
  }

  private getQuotaPrice = () => {
    this.props.CITAObservables.getQuotaPrice().subscribe((price: string) => {
      this.setState(state => ({
        ...state,
        quotaPrice: `${price === '0x' ? '0' : +price}`,
      }))
    }, this.handleError)
  }

  private parseParamters = (contractAddr, data) => {
    this.props.CITAObservables.getAbi({
      contractAddr,
      blockNumber: 'pending',
    }).subscribe(hexAbi => {
      if (hexAbi) {
        try {
          const abis = JSON.parse(hexToUtf8(hexAbi))
          const fnHash = data.slice(0, 10)
          abis.forEach(_abi => {
            const _abiHash = abiCoder.encodeFunctionSignature(_abi.name)
            if (_abi.signature === fnHash) {
              const parameters = {}
              const p = abiCoder.decodeParameters(_abi.inputs, data)
              Object.keys(p).forEach(key => {
                parameters[key] = p[key]
              })
              Object.defineProperty(parameters, '__length__', {
                enumerable: false,
              })
              this.setState({ parameters: JSON.stringify(parameters, null, 2), })
            }
          })
        } catch (err) {
          console.warn(err)
        }
      }
    }, console.warn)
  }

  private fetchTransactionInfo = transaction => {
    const hash = format0x(transaction)
    this.setState(state => ({ loading: state.loading + 2, hash, }))
    this.props.CITAObservables.getTransaction(transaction).subscribe((tx: Chain.Transaction) => {
      setTimeout(() => {
        this.handleReturnedTx(tx)
      }, 100)
    }, this.handleError)
    this.props.CITAObservables.getTransactionReceipt(transaction).subscribe((receipt: // Chain.TransactionReceipt
    any) => {
      this.handleReturnedTxReceipt(receipt)
    }, this.handleError)
    this.getQuotaPrice()
  }

  private handleReturnedTx = (tx: Chain.Transaction) => {
    if (!tx) {
      this.handleError({
        error: {
          message: 'Transaction Not Found',
          code: '-1',
        },
      })
    }
    try {
      const unsignedTx = unsigner(tx.content)
      const { value, data, nonce, quota: quotaLimit, validUntilBlock, version, to, } = unsignedTx.transaction

      if (to !== '0x') {
        this.parseParamters(to, data)
      }

      this.setState(state => ({
        ...state,
        blockHash: tx.blockHash,
        blockNumber: `${+tx.blockNumber}`,
        index: `${+tx.index}`,
        data: data === '0x' ? EMPTY_DATA : data,
        from: unsignedTx.sender.address,
        to,
        quotaLimit,
        nonce,
        validUntilBlock,
        value,
        version,
        type: !to ? TX_TYPE.CONTRACT_CREATION : data.replace(/^0x/, '') ? TX_TYPE.CONTRACT_CALL : TX_TYPE.EXCHANGE,
        loading: state.loading - 1,
      }))

      const utf8Str = hexToUtf8(data)
      this.setState({
        utf8Str,
      })
    } catch (err) {
      console.warn(err)
      this.handleError({
        error: 'Invalid Transaction',
        code: '-1',
      })
    }
  }

  private handleReturnedTxReceipt = (receipt: Chain.TransactionReceipt) => {
    if (!receipt) {
      this.handleError({
        error: {
          message: 'Transaction Receipt Not Found',
          code: '-1',
        },
      })
    }
    const { errorMessage, quotaUsed, contractAddress, } = receipt as any
    this.setState(state => ({
      ...state,
      status: errorMessage ? `${TX_STATUS.FAILURE} ${errorMessage}` : TX_STATUS.SUCCESS,
      quotaUsed: `${+quotaUsed}`,
      contractAddress,
      loading: state.loading - 1,
    }))
  }

  private switchDataType = e => {
    this.setState(state => ({
      dataType: state.dataType === DATA_TYPE.HEX ? DATA_TYPE.UTF8 : DATA_TYPE.HEX,
    }))
  }

  private handleError = handleError(this)
  private dismissError = dismissError(this)

  public render () {
    const {
      data,
      utf8Str,
      dataType,
      hash,
      error,
      value,
      quotaUsed,
      quotaPrice,
      quotaLimit,
      loading,
      validUntilBlock,
      blockNumber,
      parameters,
    } = this.state
    const { symbol, } = this.props.config
    const txInfo = {
      ...this.state,
      blockNumber,
      quota: `${(+quotaUsed).toLocaleString()} / ${(+quotaLimit).toLocaleString()}`,
      fee: valueFormatter(+quotaUsed * +quotaPrice, symbol),
      quotaPrice: (+quotaPrice).toLocaleString(),
      value: valueFormatter(value, symbol),
      validUntilBlock: `${(+validUntilBlock).toLocaleString()}`,
      data: dataType === DATA_TYPE.HEX ? data : utf8Str,
    }
    return (
      <React.Fragment>
        <LinearProgress loading={loading} />
        <Banner bg={Images.banner.transaction}>
          <div className={styles.hashTitle}>Transaction</div>
          <div className={styles.hashText}>{hash}</div>
        </Banner>

        <div className={layouts.main}>
          <Card classes={{ root: layouts.cardContainer, }}>
            <CardContent classes={{ root: styles.cardContentRoot, }}>
              <div className={styles.lists}>
                <List
                  subheader={
                    <ListSubheader component="div" classes={{ root: styles.listHeaderRoot, }}>
                      Transaction
                    </ListSubheader>
                  }
                  classes={{
                    root: styles.listRoot,
                  }}
                >
                  <Divider classes={{ root: styles.divider, }} light />
                  {Transaction.items
                    .filter(item => txInfo[item.key])
                    .map(
                      item =>
                        txInfo[item.key] !== '' ? (
                          <InfoItem label={item.label} type={item.type} key={item.key} detail={txInfo[item.key]} />
                        ) : null
                    )}
                  {data ? (
                    <InfoItem
                      label="Data"
                      detail={txInfo.data}
                      action={utf8Str ? { label: 'HEX/UTF8', cb: this.switchDataType, } : undefined}
                    />
                  ) : null}
                  {parameters ? (
                    <InfoItem
                      label="Parameters"
                      type="Parameters"
                      detail={<pre style={{ color: '#000', }}>{parameters}</pre>}
                    />
                  ) : null}
                </List>
              </div>
            </CardContent>
          </Card>
        </div>
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}

export default withConfig(withObservables(Transaction))
