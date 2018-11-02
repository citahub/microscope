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
import Icon, {Loading} from '../../components/Icons'

import { withConfig } from '../../contexts/config'
import hideLoader from '../../utils/hideLoader'
import { ConfigPageProps, ConfigPageState, ConfigDetailType, ConfigType, ConfigPageDefault} from './init'

const layout = require('../../styles/layout.scss')
const styles = require('./config.scss')

const ConfigDetail = translate('microscope')(
  ({
    config,
    value,
    handleSwitch,
    handleInput,
    controlInputScope,
    saving,
    t
  }: {
  config: ConfigDetailType
  value: number | string | boolean | undefined
  handleSwitch: (key: string) => (e: any) => void
  handleInput: (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => void
  controlInputScope: any
  saving: any
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
            <TextField value={`${value}`} onChange={controlInputScope(config.key)} />
            {saving ? <Loading /> : <Icon name="ok" />}
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
    controlInputScope,
    saving,
    t
  }: {
  title: any
  configs: any
  values: any
  handleSwitch: any
  handleInput: any
  controlInputScope: any
  saving: any
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
              controlInputScope={controlInputScope}
              saving={saving}
            />
          ))}
        </List>
      </ExpansionPanelDetails>
      <Divider />
    </ExpansionPanel>
  )
)

class ConfigPage extends React.Component<ConfigPageProps, ConfigPageState> {
  static panels = ConfigPageDefault.panels
  static configs = ConfigPageDefault.configs

  public constructor (props) {
    super(props)
    this.state = {
      configs: props.config.panelConfigs,
      inputTimeout: null,
      saving: false
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

  private controlInputScope = key => e => {
    const { configs, inputTimeout } = this.state
    const { value } = e.currentTarget
    let v = Number(value)
    this.setState({ configs: { ...configs, [key]: v }, saving: true })

    clearTimeout(inputTimeout)
    if (Math.round(v) === v && v >= 10 && v <= 100) {
      this.props.config.changePanelConfig({ ...configs, [key]: v })
      this.setState({ saving: false })
    } else {
      const t = setTimeout(() => {
        if (v < 10) {
          v = 10
        } else {
          v = 100
        }
        this.props.config.changePanelConfig({ ...configs, [key]: v })
        this.setState({ configs: { ...configs, [key]: v }, saving: false })
      }, 1000)
      this.setState({ inputTimeout: t, saving: true })
    }
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
              controlInputScope={this.controlInputScope}
              saving={this.state.saving}
            />
          ))}
        </div>
      </React.Fragment>
    )
  }
}

export default withConfig(ConfigPage)
