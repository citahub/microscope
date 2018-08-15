import * as React from 'react'
import { translate } from 'react-i18next'

import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  TextField,
  Typography,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  Divider,
  Switch
} from '@material-ui/core'
import { ExpandMore as ExpandMoreIcon } from '@material-ui/icons'

import Banner from '../../components/Banner'

import { PanelConfigs } from '../../config/localstorage'

import { withConfig, Config } from '../../contexts/config'
import hideLoader from '../../utils/hideLoader'

const layout = require('../../styles/layout.scss')
const styles = require('./config.scss')

/* eslint-disable no-use-before-define */
interface ConfigDetail {
  panel: ConfigPanel
  type: ConfigType
  key: string
  title: string
}
/* eslint-enable no-use-before-define */

enum ConfigType {
  DISPLAY,
  COUNT,
  ITEMS,
  VALUE
}

enum ConfigPanel {
  GENERAL = 'general',
  HEADER = 'header',
  BLOCK = 'block',
  TRANSACTION = 'transaction',
  GRAPH = 'graph'
}

export interface ConfigPageProps {
  config: Config
  t: (key: string) => string
}

export interface ConfigPageState {
  configs: PanelConfigs
}

const ConfigDetail = translate('microscope')(
  ({
    config,
    value,
    handleSwitch,
    handleInput,
    t
  }: {
  config: ConfigDetail
  value: number | string | boolean | undefined
  handleSwitch: (key: string) => (e: any) => void
  handleInput: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void
  t: (key: string) => string
  }) => (
    <ListItem key={config.key}>
      <ListItemText
        primary={
          <React.Fragment>
            {t(config.type === ConfigType.DISPLAY ? 'display' : 'set')} {t(config.title)}
          </React.Fragment>
        }
      />
      <ListItemSecondaryAction>
        {config.type === ConfigType.DISPLAY ? (
          <Switch
            classes={{
              bar: styles.switchBar,
              checked: styles.switchChecked,
              colorPrimary: styles.switchColorPrimary,
              colorSecondary: styles.switchColorSecondary,
              icon: styles.iOSIcon
            }}
            onChange={handleSwitch(config.key)}
            checked={!!value}
          />
        ) : (
          <div>
            <TextField value={`${value}`} onChange={handleInput(config.key)} />
          </div>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  )
)

const ConfigItem = translate('microscope')(
  ({
    title,
    configs,
    values,
    handleSwitch,
    handleInput,
    t
  }: {
  title: any
  configs: any
  values: any
  handleSwitch: any
  handleInput: any
  t: any
  }) => (
    <ExpansionPanel defaultExpanded classes={{ root: styles.panel }} elevation={0}>
      <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="caption" classes={{ caption: styles.panelTitle }}>
          {t(title)} {t('config')}
        </Typography>
      </ExpansionPanelSummary>
      <Divider />
      <ExpansionPanelDetails>
        <List style={{ width: '100%' }}>
          {configs.map((config, idx) => (
            <ConfigDetail
              key={config.key}
              config={config}
              value={values[config.key]}
              handleSwitch={handleSwitch}
              handleInput={handleInput}
            />
          ))}
        </List>
      </ExpansionPanelDetails>
      <Divider />
    </ExpansionPanel>
  )
)

class ConfigPage extends React.Component<ConfigPageProps, ConfigPageState> {
  static panels = [
    // ConfigPanel.GENERAL,
    // ConfigPanel.HEADER,
    ConfigPanel.BLOCK,
    ConfigPanel.TRANSACTION,
    ConfigPanel.GRAPH
  ]
  static configs = [
    {
      panel: ConfigPanel.GENERAL,
      type: ConfigType.VALUE,
      key: 'logo',
      title: 'logo'
    },
    {
      panel: ConfigPanel.HEADER,
      type: ConfigType.DISPLAY,
      key: 'TPS',
      title: 'TPS'
    },
    {
      panel: ConfigPanel.BLOCK,
      type: ConfigType.DISPLAY,
      key: 'blockHeight',
      title: 'height'
    },
    {
      panel: ConfigPanel.BLOCK,
      type: ConfigType.DISPLAY,
      key: 'blockHash',
      title: 'hash'
    },
    {
      panel: ConfigPanel.BLOCK,
      type: ConfigType.DISPLAY,
      key: 'blockAge',
      title: 'age'
    },
    {
      panel: ConfigPanel.BLOCK,
      type: ConfigType.DISPLAY,
      key: 'blockTransactions',
      title: 'transactions'
    },
    {
      panel: ConfigPanel.BLOCK,
      type: ConfigType.DISPLAY,
      key: 'blockGasUsed',
      title: 'gas used'
    },
    {
      panel: ConfigPanel.BLOCK,
      type: ConfigType.VALUE,
      key: 'blockPageSize',
      title: 'page size'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.DISPLAY,
      key: 'transactionHash',
      title: 'hash'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.DISPLAY,
      key: 'transactionFrom',
      title: 'from'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.DISPLAY,
      key: 'transactionTo',
      title: 'to'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.DISPLAY,
      key: 'transactionValue',
      title: 'value'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.DISPLAY,
      key: 'transactionAge',
      title: 'age'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.DISPLAY,
      key: 'transactionBlockNumber',
      title: 'block number'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.DISPLAY,
      key: 'transactionGasUsed',
      title: 'gas used'
    },
    {
      panel: ConfigPanel.TRANSACTION,
      type: ConfigType.VALUE,
      key: 'transactionPageSize',
      title: 'page size'
    },
    {
      panel: ConfigPanel.GRAPH,
      type: ConfigType.DISPLAY,
      key: 'graphIPB',
      title: 'Interval/Block'
    },
    {
      panel: ConfigPanel.GRAPH,
      type: ConfigType.DISPLAY,
      key: 'graphTPB',
      title: 'Transactions/Block'
    },
    {
      panel: ConfigPanel.GRAPH,
      type: ConfigType.DISPLAY,
      key: 'graphGasUsedBlock',
      title: 'Gas Used/Block'
    },
    {
      panel: ConfigPanel.GRAPH,
      type: ConfigType.DISPLAY,
      key: 'graphGasUsedTx',
      title: 'Gas Used/Transaction'
    },
    {
      panel: ConfigPanel.GRAPH,
      type: ConfigType.DISPLAY,
      key: 'graphProposals',
      title: 'Proposals/Validator'
    },
    {
      panel: ConfigPanel.GRAPH,
      type: ConfigType.VALUE,
      key: 'graphMaxCount',
      title: 'MaxCount'
    }
  ] as ConfigDetail[]
  public constructor (props) {
    super(props)
    this.state = {
      configs: props.config.panelConfigs
    }
  }

  public componentDidMount () {
    hideLoader()
  }
  private handleSwitch = key => (e?: any) => {
    this.setState(state => {
      const { configs } = this.state
      const newConfig = { ...configs, [key]: !configs[key] }
      if (this.props.config.changePanelConfig(newConfig)) {
        return { configs: newConfig }
      }
      return state
    })
  }
  private handleInput = key => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.currentTarget
    this.setState(state => {
      const { configs } = state
      const newConfig = { ...configs, [key]: value }
      if (this.props.config.changePanelConfig(newConfig)) {
        return { configs: newConfig }
      }
      return state
    })
  }
  public render () {
    return (
      <React.Fragment>
        <Banner bg={`${process.env.PUBLIC}/banner/banner-Setting.png`}>Config</Banner>
        <div className={`${styles.main} ${layout.center}`}>
          {ConfigPage.panels.map(panel => (
            <ConfigItem
              title={panel}
              key={panel}
              configs={ConfigPage.configs.filter(config => config.panel === panel)}
              values={this.state.configs}
              handleSwitch={this.handleSwitch}
              handleInput={this.handleInput}
            />
          ))}
        </div>
      </React.Fragment>
    )
  }
}

export default withConfig(ConfigPage)
