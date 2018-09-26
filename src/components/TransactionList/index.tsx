import * as React from 'react'
import { Link } from 'react-router-dom'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Transaction } from '../../typings/'

const texts = require('../../styles/text.scss')
const styles = require('./styles.scss')

export default ({ transactions }: { transactions: Transaction[] }) => (
  <List>
    {transactions.map(tx => (
      <ListItem key={tx.hash}>
        <ListItemText
          classes={{ primary: styles.primary }}
          primary={
            <React.Fragment>
              <Link to={`/transaction/${tx.hash}`} href={`/transaction/${tx.hash}`}>
                <h1 className={styles.txHash}>
                  TXID: <span className={texts.addr}>{tx.hash}</span>
                </h1>
              </Link>
              <span>{tx.timestamp && new Date(+tx.timestamp).toLocaleString()}</span>
            </React.Fragment>
          }
          secondary={
            tx.basicInfo ? (
              <div>
                From:{' '}
                <Link
                  to={`/account/${tx.basicInfo.from}`}
                  href={`/account/${tx.basicInfo.from}`}
                  className={texts.addr}
                >
                  {tx.basicInfo.from || 'null'}
                </Link>
                {' To: '}
                {['Contract Creation'].includes(tx.basicInfo.to) ? (
                  tx.basicInfo.to
                ) : (
                  <Link to={`/account/${tx.basicInfo.to}`} href={`/account/${tx.basicInfo.to}`} className={texts.addr}>
                    {tx.basicInfo.to}
                  </Link>
                )}
                Value
                {': '} <span className={texts.highlight}>{tx.basicInfo.value || '0'}</span>
              </div>
            ) : (
              <div>{tx.content}</div>
            )
          }
        />
      </ListItem>
    ))}
  </List>
)
