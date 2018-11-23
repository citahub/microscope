import * as React from 'react'
import { Link, } from 'react-router-dom'
import { translate, } from 'react-i18next'
import { List, ListItem, ListItemText, } from '@material-ui/core'
import { TransactionFromServer, } from '../../typings/'
import { ContractCreation, } from '../../initValues'
import { formatedAgeString, } from '../../utils/timeFormatter'
import valueFormatter from '../../utils/valueFormatter'
import { TX_TYPE, } from '../../containers/Transaction'
import Image from '../../images'

const texts = require('../../styles/text.scss')
const styles = require('./homepageList.scss')

const TransactionTypeInfo = {
  [TX_TYPE.EXCHANGE]: {
    icon: Image.type.exchange,
  },
  [TX_TYPE.CONTRACT_CREATION]: {
    icon: Image.type.contractCreation,
  },
  [TX_TYPE.CONTRACT_CALL]: {
    icon: Image.type.contractCall,
  },
}

const Primary = ({ tx, t, symbol, }) => (
  <React.Fragment>
    <div>TX#:</div>
    <Link to={`/transaction/${tx.hash}`} href={`/transaction/${tx.hash}`} className={styles.hashlink} title={tx.hash}>
      <span className={`${texts.addr} ${texts.addrStart}`}>{tx.hash.slice(0, -4)}</span>
      <span className={`${texts.addr} ${texts.addrEnd}`}>{tx.hash.slice(-4)}</span>
    </Link>
    <span className={styles.time}>{formatedAgeString(tx.timestamp)}</span>
  </React.Fragment>
)

const Secondary = ({ tx, t, symbol, }) => (
  <span className={styles.txInfo}>
    <div className={styles.fromTo}>
      <span className={texts.ellipsis}>
        <div>From</div>
        <Link to={`/account/${tx.from}`} href={`/account/${tx.from}`} className={texts.addr}>
          {tx.from}
        </Link>
      </span>
      {(tx.type === TX_TYPE.CONTRACT_CREATION || tx.to === '0x') ? null : (
        <span className={texts.ellipsis}>
          <div>To</div>
          <Link to={`/account/${tx.to}`} href={`/account/${tx.to}`} className={texts.addr}>
            {tx.to}
          </Link>
        </span>
      )}
    </div>
    <span className={texts.ellipsis}>
      {t('value')}:{' '}
      <span className={styles.value} title={`${+tx.value}`}>
        {valueFormatter(+tx.value, symbol)}
      </span>
    </span>
  </span>
)

const TransactionCell = ({ tx, t, symbol, }) => (
  <ListItem key={tx.hash} classes={{ root: styles.listItemContainer, }}>
    <div>
      <img src={TransactionTypeInfo[tx.type].icon} alt='' />
      {tx.error ? <div>error</div> : null}
    </div>
    <ListItemText
      classes={{ primary: styles.primary, root: styles.listItemTextRoot, }}
      primary={<Primary {...{ tx, t, symbol, }} />}
      secondary={<Secondary {...{ tx, t, symbol, }} />}
    />
  </ListItem>
)

export default translate('microscope')(
  ({
    transactions,
    t,
    symbol,
  }: {
  transactions: TransactionFromServer[]
  t: (key: string) => string
  symbol?: string
  }) => (
    <List
      classes={{
        padding: styles.listPadding,
      }}
    >
      {transactions.map(tx => (
        <TransactionCell {...{ tx, t, symbol, }} />
      ))}
    </List>
  )
)
