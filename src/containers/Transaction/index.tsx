import * as React from 'react'
import { hexToUtf8, } from 'web3-utils'
import * as abiCoder from 'web3-eth-abi'
import { Link, } from 'react-router-dom'
import { Card, CardContent, List, } from '@material-ui/core'
import { unsigner, } from '@appchain/signer'
import { Chain, } from '@appchain/plugin/lib/typings/index.d'

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
  PARAMETERS = 'Parameters',
}

const EMPTY_DATA = 'Empty Data'

const InfoItem = ({
  label,
  type,
  detail,
}: {
label: string
type?: string
detail: any
}) => (
  <div key={label} className={styles.detailItem}>
    <span>{label}</span>
    <span>
      {type ? (
        <Link
          className={texts.addr}
          to={`/${type}/${detail}`.replace(/,/g, '')}
          href={`/${type}/${detail}`.replace(/,/g, '')}
        >
          {detail}
        </Link>
      ) : (
        detail
      )}
    </span>
  </div>
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
  errorMessage: '',
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
  // status: TX_STATUS.FAILURE as TX_STATUS | String,
  type: TX_TYPE.EXCHANGE,
  dataType: DATA_TYPE.HEX,
  parameters: '',
}

type ITransactionState = typeof initState

class Transaction extends React.Component<TransactionProps, ITransactionState> {
  static items = [
    { key: 'type', label: 'Type', },
    { key: 'from', label: 'From', type: 'account', },
    { key: 'to', label: 'To', type: 'account', },
    { key: 'contractAddress', label: 'Contract', type: 'account', },
    { key: 'blockNumber', label: 'Block Height', type: 'height', },
    { key: 'version', label: 'Version', },
    { key: 'nonce', label: 'Nonce', },
    { key: 'validUntilBlock', label: 'ValidUntilBlock', },
    { key: 'value', label: 'Value', },
    { key: 'quota', label: 'Quota', },
    { key: 'quotaPrice', label: 'Quota Price', },
    // { key: 'fee', label: 'Fee', },
  ];
  readonly state = initState;

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
      transaction.replace(/^0x/, '').toLowerCase() !==
        this.state.hash.replace(/^0x/, '').toLowerCase()
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
  };

  private parseParamters = (contractAddr, data) =>
    this.props.CITAObservables.getAbi({
      contractAddr,
      blockNumber: 'pending',
    }).subscribe(hexAbi => {
      if (hexAbi) {
        try {
          const abis = JSON.parse(hexToUtf8(hexAbi))
          const fnHash = data.slice(0, 10)
          abis.forEach(_abi => {
            if (_abi.signature === fnHash) {
              const parameters = {}
              const p = abiCoder.decodeParameters(_abi.inputs, `0x${data.slice(10)}`)
              Object.keys(p).forEach(key => {
                parameters[key] = p[key]
              })
              Object.defineProperty(parameters, '__length__', {
                enumerable: false,
              })
              this.setState({
                parameters: JSON.stringify(parameters, null, 2),
              })
            }
          })
        } catch (err) {
          console.warn(err)
        }
      }
    }, console.warn);

  private fetchTransactionInfo = transaction => {
    const hash = format0x(transaction)
    this.setState(state => ({ loading: state.loading + 2, hash, }))
    this.props.CITAObservables.getTransaction(transaction).subscribe(
      (tx: Chain.Transaction) => {
        setTimeout(() => {
          this.handleReturnedTx(tx)
        }, 100)
      },
      this.handleError
    )
    this.props.CITAObservables.getTransactionReceipt(transaction).subscribe(
      (
        receipt: // Chain.TransactionReceipt
        any
      ) => {
        this.handleReturnedTxReceipt(receipt)
      },
      this.handleError
    )
    this.getQuotaPrice()
  };

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
      const {
        value,
        data,
        nonce,
        quota: quotaLimit,
        validUntilBlock,
        version,
        to,
      } = unsignedTx.transaction

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
        type: !to
          ? TX_TYPE.CONTRACT_CREATION
          : data.replace(/^0x/, '')
            ? TX_TYPE.CONTRACT_CALL
            : TX_TYPE.EXCHANGE,
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
  };

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
      errorMessage,
      quotaUsed: `${+quotaUsed}`,
      contractAddress,
      loading: state.loading - 1,
    }))
  };

  private switchDataType = (dataType: DATA_TYPE) => {
    this.setState(state => ({
      dataType,
    }))
  }

  private handleError = handleError(this);
  private dismissError = dismissError(this);

  public render () {
    const {
      data,
      errorMessage,
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
      blockNumber: `${(+blockNumber).toLocaleString()}`,
      quota: `${(+quotaUsed).toLocaleString()} / ${(+quotaLimit).toLocaleString()}`,
      fee: valueFormatter(+quotaUsed * +quotaPrice, symbol),
      quotaPrice: (+quotaPrice).toLocaleString(),
      value: valueFormatter(value, symbol),
      validUntilBlock: `${(+validUntilBlock).toLocaleString()}`,
      data:
        dataType === DATA_TYPE.HEX
          ? data
          : dataType === DATA_TYPE.UTF8
            ? utf8Str
            : parameters,
    }
    const dataTypes = [DATA_TYPE.HEX, ]
    if (utf8Str) {
      dataTypes.push(DATA_TYPE.UTF8)
    }
    if (parameters) {
      dataTypes.push(DATA_TYPE.PARAMETERS)
    }
    return (
      <React.Fragment>
        <LinearProgress loading={loading} />
        <Banner>
          <div className={styles.hashTitle}>Transaction: </div>
          <div className={styles.hashText}>{hash}</div>
        </Banner>

        <div className={layouts.main}>
          <Card classes={{ root: layouts.cardContainer, }}>
            <CardContent classes={{ root: styles.cardContentRoot, }}>
              <div className={styles.lists}>
                <List
                  classes={{
                    root: styles.listRoot,
                  }}
                >
                  <InfoItem
                    label="Status"
                    detail={
                      errorMessage ? (
                        <span className={styles.failure}>
                          <svg className="icon" aria-hidden="true">
                            <use xlinkHref="#icon-cancel-circle" />
                          </svg>
                          {`${TX_STATUS.FAILURE}. ${errorMessage}`}
                        </span>
                      ) : (
                        <span className={styles.success}>
                          <svg className="icon" aria-hidden="true">
                            <use xlinkHref="#icon-check-circle" />
                          </svg>
                          {TX_STATUS.SUCCESS}
                        </span>
                      )
                    }
                  />
                  {Transaction.items
                    .filter(item => txInfo[item.key])
                    .map(
                      item =>
                        txInfo[item.key] !== '' ? (
                          <InfoItem
                            label={item.label}
                            type={item.type}
                            key={item.key}
                            detail={txInfo[item.key]}
                          />
                        ) : null
                    )}
                  <div className={styles.detailItem}>
                    <span>data</span>
                    <span className={styles.dataTypeSwitch}>
                      {dataTypes.map((type: DATA_TYPE) => (
                        <span
                          key={type}
                          onClick={e => this.switchDataType(type)}
                          className={type === dataType ? styles.active : ''}
                        >
                          {type}
                        </span>
                      ))}
                    </span>
                  </div>
                  {dataType === DATA_TYPE.PARAMETERS ? (
                    <pre className={styles.parameters}>{parameters}</pre>
                  ) : (
                    <textarea
                      className={styles.hexData}
                      disabled
                      value={txInfo.data}
                    />
                  )}
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
