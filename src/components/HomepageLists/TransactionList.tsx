import * as React from 'react'
import { Link } from 'react-router-dom'
import { translate } from 'react-i18next'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { TransactionFromServer } from '../../typings/'
import { ContractCreation } from '../../initValues'
import { formatedAgeString } from '../../utils/timeFormatter'
import valueFormatter from '../../utils/valueFormatter'

const texts = require('../../styles/text.scss')
const styles = require('./homepageList.scss')

export default translate('microscope')(
  ({
    transactions,
    t,
    symbol
  }: {
  transactions: TransactionFromServer[]
  t: (key: string) => string
  symbol?: string
  }) => (
    <List
      classes={{
        padding: styles.listPadding
      }}
    >
      {transactions.map(tx => (
        <ListItem key={tx.hash} classes={{ root: styles.listItemContainer }}>
          <img
            src={`${process.env.PUBLIC}/microscopeIcons/transaction.svg`}
            alt="transaction"
            className={styles.txIcon}
          />
          <ListItemText
            classes={{ primary: styles.primary, root: styles.listItemTextRoot }}
            primary={
              <React.Fragment>
                <span style={{ maxWidth: '100%' }}>
                  {t('transaction')}:{' '}
                  <Link
                    to={`/transaction/${tx.hash}`}
                    href={`/transaction/${tx.hash}`}
                    className={styles.hashlink}
                    title={tx.hash}
                  >
                    <span className={`${texts.addr} ${texts.ellipsis}`}>{tx.hash.slice(0, -4)}</span>
                    <span className={texts.addr}>{tx.hash.slice(-4)}</span>
                  </Link>
                </span>
                <span className={styles.time}>{formatedAgeString(tx.timestamp)}</span>
              </React.Fragment>
            }
            secondary={
              <span className={styles.txInfo}>
                <span className={texts.ellipsis}>
                  {t('from')}:{' '}
                  <Link to={`/account/${tx.from}`} href={`/account/${tx.from}`} className={texts.addr}>
                    {tx.from || 'null'}
                  </Link>
                </span>
                <span className={texts.ellipsis}>
                  {t('to')}:{' '}
                  {tx.to === '0x' ? (
                    ContractCreation
                  ) : (
                    <Link to={`/account/${tx.to}`} href={`/account/${tx.to}`} className={texts.addr}>
                      {tx.to}
                    </Link>
                  )}
                </span>
                <span className={texts.ellipsis}>
                  {t('value')}:{' '}
                  <span className={styles.value} title={`${+tx.value}`}>
                    {valueFormatter(+tx.value, symbol)}
                  </span>
                </span>
              </span>
            }
          />
        </ListItem>
      ))}
    </List>
  )
)
