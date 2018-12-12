import * as React from 'react'
import { List, ListItem, ListItemText, } from '@material-ui/core'
import { translate, } from 'react-i18next'
import { Metadata, } from '../../typings'
import { Loading, } from '../../components/Icons'

const styles = require('./metadata.scss')
const text = require('../../styles/text.scss')

const list = [
  { name: 'Name', value: 'chainName', },
  { name: 'Id', value: 'chainId', },
  { name: 'Operator', value: 'operator', },
  { name: 'Website', value: 'website', },
  { name: 'Genesis Time', value: 'genesisTimestamp', },
  { name: 'Version', value: 'version', },
  { name: 'Block Interval', value: 'blockInterval', unitName: 'ms', },
  { name: 'Token Name', value: 'tokenName', },
  { name: 'Token Symbol', value: 'tokenSymbol', },
  { name: 'Economical Model', value: 'economicalModel', },
]

const MetadataRender = translate('microscope')(
  ({ metadata, t, }: { metadata: Metadata; t: (key: string) => string }) => (
    <div className={styles.display}>
      {list.map(item => (
        <div key={item.name} className={`${styles.item} ${text.ellipsis}`}>
          {t(item.name)}:{' '}
          <span className={styles.itemValue}>
            {metadata[item.value]} {item.unitName || ''}
          </span>
        </div>
      ))}
      <div className={styles.validators}>
        <div className={styles.item}>{t('Validators')}:</div>
        {metadata.validators && metadata.validators.length ? (
          <div className={styles.box}>
            {metadata.validators.map((validator, index) => (
              <div key={validator} className={`${text.ellipsis} ${text.hash}`}>
                {index + 1}: {validator}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
)

export type ServerList = { serverName: string; serverIp: string }[]

interface MetadataPanelProps {
  metadata: Metadata
  searchIp: string
  searchResult: Metadata
  waitingMetadata: boolean
  inputChainError: boolean
  handleInput: (key: string) => (e: any) => void
  switchChain: (ip?: string, immediate?: boolean) => (e) => void
  handleKeyUp: (e: React.KeyboardEvent<HTMLInputElement>) => void
  t: (key: string) => string
  serverList: ServerList
}

export const ChainSwitchPanel = ({
  metadata,
  searchIp,
  searchResult,
  inputChainError,
  waitingMetadata,
  handleInput,
  handleKeyUp,
  switchChain,
  t,
  serverList,
}) => (
  <div>
    <div className={styles.fields}>
      <input
        className={inputChainError ? styles.error : ''}
        type="text"
        onChange={handleInput('searchIp')}
        placeholder="Please enter chain URL"
        value={searchIp}
        onKeyUp={handleKeyUp}
      />
      <button onClick={switchChain('')} disabled={!searchIp}>
        {waitingMetadata ? <Loading /> : t('switch')}
      </button>
      {inputChainError ? (
        <div className={`${styles.chainerror} ${styles.alert}`}>
          Please enter a URL to AppChain node or ReBirth server
        </div>
      ) : (
        <div className={styles.alert}>
          If you connect to an AppChain node instead of a <a href="https://github.com/cryptape/re-birth">ReBirth</a>{' '}
          server, Microscope will NOT be fully functional.
        </div>
      )}
    </div>

    {searchResult.chainId !== -1 ? (
      <MetadataRender metadata={searchResult} />
    ) : (
      <List>
        {serverList.map(({ serverName, serverIp, }) => (
          <ListItem
            key={serverName}
            onClick={switchChain(serverIp, true)}
            classes={{
              root: styles.listItem,
              gutters: styles.serverGutters,
            }}
          >
            <ListItemText
              classes={{
                primary: styles.serverPrimary,
                secondary: styles.serverSecondary,
              }}
              primary={serverName}
              secondary={serverIp}
            />
          </ListItem>
        ))}
      </List>
    )}
  </div>
)
