import * as React from 'react'
import { Link } from 'react-router-dom'
import { translate } from 'react-i18next'
import { List, ListItem, ListItemText } from '@material-ui/core'
import { Chain } from '@nervos/plugin'
// import Avatar from '@material-ui/core/Avatar'
import { IBlock } from '../../typings/'

const texts = require('../../styles/text.scss')
const styles = require('./homepageList.scss')

export default translate('microscope')(
  ({ blocks, t }: { blocks: Chain.Block<Chain.TransactionInBlock>[]; t: (key: string) => string }) => (
    <List
      classes={{
        padding: styles.listPadding
      }}
    >
      {blocks.map((block: Chain.Block<Chain.TransactionInBlock>) => (
        <ListItem
          key={block.hash}
          classes={{
            root: styles.listItemContainer
          }}
        >
          <div
            className={styles.blockIcon}
            style={{ backgroundImage: `url(${`${process.env.PUBLIC}/images/BlockBg.png`})` }}
          >
            <span>{t('block')}</span>
            <Link to={`/height/${block.header.number}`} href={`/height/${block.header.number}`}>
              #{+block.header.number}
            </Link>
          </div>
          <ListItemText
            classes={{
              primary: styles.primary,
              secondary: styles.secondary,
              root: styles.listItemTextRoot
            }}
            primary={
              <React.Fragment>
                <span className={texts.ellipsis}>
                  {t('hash')}:{' '}
                  <Link to={`/block/${block.hash}`} href={`/block/${block.hash}`}>
                    <span className={texts.addr} title={block.hash}>
                      {block.hash}
                    </span>
                  </Link>
                </span>
                <span className={styles.time}>
                  {Math.round((Date.now() - +block.header.timestamp) / 1000)}s {t('ago')}
                </span>
              </React.Fragment>
            }
            secondary={
              <React.Fragment>
                <span className={texts.ellipsis}>
                  {t('including')} <b>{block.body.transactions.length}</b> {t('Transactions')}.{' '}
                </span>
                <span className={texts.ellipsis}>
                  {t('proposed by')} <span className={texts.highlight}>{block.header.proof.Bft.proposal}</span>
                </span>
              </React.Fragment>
            }
          />
        </ListItem>
      ))}
    </List>
  )
)
