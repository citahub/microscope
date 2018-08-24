import * as React from 'react'
import { Link } from 'react-router-dom'
import {
  LinearProgress,
  Card,
  CardContent,
  List,
  ListSubheader,
  ListItem,
  ListItemText,
  Divider
} from '@material-ui/core'
import { unsigner } from '@nervos/signer'
import { Chain } from '@nervos/plugin/lib/typings/index.d'

import Banner from '../../components/Banner'

import { withObservables } from '../../contexts/observables'
import { IContainerProps, DetailedTransaction } from '../../typings/'
import ErrorNotification from '../../components/ErrorNotification'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError } from '../../utils/handleError'
import bytesToHex from '../../utils/bytesToHex'

const layouts = require('../../styles/layout.scss')
const texts = require('../../styles/text.scss')
const styles = require('./transaction.scss')

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
    to: '',
    from: '',
    data: '',
    value: ''
  },
  error: {
    message: '',
    code: ''
  },
  timestamp: '',
  gasUsed: '',
  loading: 0
}

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
          info.type ? (
            <Link
              to={`/${info.type}/${details[info.key]}`}
              href={`/${info.type}/${details[info.key]}`}
              className={texts.addr}
            >
              {details[info.key] || '_'}
            </Link>
          ) : (
            details[info.key] || '_'
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
class Transaction extends React.Component<TransactionProps, TransactionState> {
  readonly state = initState
  componentWillMount () {
    const { transaction } = this.props.match.params
    if (transaction) {
      this.setState(state => ({ loading: state.loading + 1 }))
      this.props.CITAObservables.getTransaction(transaction).subscribe((tx: Chain.TransactionInBlock) => {
        this.handleReturnedTx(tx)
      }, this.handleError)
    }
  }
  componentDidMount () {
    hideLoader()
  }
  componentDidCatch (err) {
    this.handleError(err)
  }
  private handleReturnedTx = (tx: Chain.TransactionInBlock) => {
    if (!tx) {
      this.handleError({
        error: {
          message: 'Transaction Not Found',
          code: '-1'
        }
      })
    }
    const details = unsigner(tx.content)
    if (tx.basicInfo && typeof tx.basicInfo !== 'string') {
      /* eslint-disable */
      const { data, value } = details.transaction
      const { address } = details.sender
      tx.basicInfo.data = bytesToHex(data as any)
      tx.basicInfo.value = '' + +bytesToHex(value as any)
      tx.basicInfo.from = '0x' + address
      /* eslint-enable */
    }
    // return this.setState(state => ({ ...tx, loading: state.loading - 1 }))
    return this.setState(state => Object.assign({}, state, tx, { loading: state.loading - 1 }))
  }
  private infos = [
    { key: 'blockHash', label: 'Block Hash', type: 'block' },
    { key: 'blockNumber', label: 'Height', type: 'height' },
    { key: 'index', label: 'Index' }
  ]
  private basicInfo = [
    { key: 'from', label: 'From', type: 'account' },
    { key: 'to', label: 'To', type: 'account' },
    { key: 'value', label: 'value' },
    { key: 'data', label: 'data' }
  ]

  private handleError = handleError(this)
  private dismissError = dismissError(this)
  render () {
    const { hash, error, timestamp, gasUsed } = this.state
    return (
      <React.Fragment>
        {hash ? null : (
          <LinearProgress
            classes={{
              root: 'linearProgressRoot'
            }}
          />
        )}
        <Banner bg={`${process.env.PUBLIC}/banner/banner-Transaction.png`}>
          <div className={styles.hashTitle}>Transaction</div>
          <div className={styles.hashText}>{hash}</div>
        </Banner>

        <div className={layouts.main}>
          <Card classes={{ root: styles.hashCardRoot }}>
            <CardContent>
              <div className={styles.attrs}>
                {timestamp ? (
                  <span>
                    <svg className="icon" aria-hidden="true">
                      <use xlinkHref="#icon-time" />
                    </svg>
                    <span className={styles.attrTitle}>Time: </span>
                    {new Date(timestamp).toLocaleString()}
                  </span>
                ) : null}
                {gasUsed ? (
                  <span>
                    <img
                      src={`${process.env.PUBLIC}/microscopeIcons/petrol_barrel.svg`}
                      alt="gas used"
                      className={styles.gasIcon}
                    />

                    <span className={styles.attrTitle}>Gas Used: </span>
                    {gasUsed}
                  </span>
                ) : null}
              </div>
            </CardContent>
          </Card>
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
