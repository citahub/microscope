import {
  Button,
  ExpansionPanel,
  ExpansionPanelActions,
  ExpansionPanelDetails,
  ExpansionPanelSummary,
  List,
  ListItem,
  ListItemText,
  TextField
} from '@material-ui/core'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'
import { Link } from 'react-router-dom'
import * as React from 'react'

const styles = require('./debugAccounts.scss')
const texts = require('../../styles/text.scss')

export interface DebugAccount {
  privateKey: string
  address: string
  balance?: string
}
const DebugAccounts = ({
  accounts,
  privateKeysField,
  handleAccountsInput,
  updateDebugAccounts
}: {
accounts: DebugAccount[]
privateKeysField: string
handleAccountsInput: React.EventHandler<React.SyntheticEvent<HTMLElement>>
updateDebugAccounts: React.EventHandler<React.SyntheticEvent<HTMLElement>>
}) => (
  <ExpansionPanel defaultExpanded style={{ marginBottom: '15px' }}>
    <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
      Debug Accounts(
      {accounts.length})
    </ExpansionPanelSummary>
    <ExpansionPanelDetails>
      <List style={{ width: '100%' }}>
        <ListItem>
          <ListItemText primary="Address & Private Key" />
          <ListItemText
            primary="Balance"
            classes={{
              primary: styles.accountSecondaryText
            }}
          />
        </ListItem>
        {accounts.map(account => (
          <ListItem key={account.privateKey}>
            <ListItemText
              primary={
                <Link to={`/account/${account.address}`} href={`/account/${account.address}`} className={texts.addr}>
                  {account.address || 'null'}
                </Link>
              }
              secondary={account.privateKey}
            />
            <ListItemText
              primary={account.balance}
              classes={{
                primary: styles.accountSecondaryText
              }}
            />
          </ListItem>
        ))}
      </List>
    </ExpansionPanelDetails>
    <ExpansionPanelActions style={{ flexDirection: 'column' }}>
      <TextField
        multiline
        fullWidth
        value={privateKeysField}
        onChange={handleAccountsInput}
        // onKeyPress={handleKeyPress}
      />
      <div
        style={{
          padding: '15px',
          textAlign: 'right'
        }}
      >
        <Button variant="raised" onClick={updateDebugAccounts}>
          Update
        </Button>
      </div>
    </ExpansionPanelActions>
  </ExpansionPanel>
)

export default DebugAccounts
