/* eslint-disable */
/// <reference path="../typings/react/index.d.ts" />
/* eslint-enable */
import * as React from 'react'
import LOCAL_STORAGE, { PanelConfigs } from '../config/localstorage'
import { initPanelConfigs } from '../initValues'

const getServerList = () => {
  const storedList = window.localStorage.getItem(LOCAL_STORAGE.SERVER_LIST)
  if (storedList) {
    const servers = JSON.parse(storedList)
    return servers.length
      ? servers
      : (process.env.CHAIN_SERVERS || '').split(',')
  }
  return (process.env.CHAIN_SERVERS || '').split(',')
}

const getPrivkeyList = () => {
  const storedList = window.localStorage.getItem(LOCAL_STORAGE.PRIV_KEY_LIST)
  if (storedList) {
    return JSON.parse(storedList)
  }
  return []
}
const getPanelConfigs = (defaultConfig: PanelConfigs = initPanelConfigs) => {
  const localConfigs = window.localStorage.getItem(LOCAL_STORAGE.PANEL_CONFIGS)
  if (localConfigs) {
    try {
      return JSON.parse(localConfigs)
    } catch (e) {
      return defaultConfig
    }
  }
  return defaultConfig
}

const initConfig = {
  localStorage: LOCAL_STORAGE,
  serverList: getServerList(),
  privkeyList: getPrivkeyList(),
  panelConfigs: getPanelConfigs(),
  changeServer: server => window.localStorage.setItem('server', server),
  changePrivkey: privkey => window.localStorage.setItem('privkey', privkey),
  addServer: server => false,
  deleteServer: server => false,
  addPrivkey: privkey => false,
  deletePrivkey: privkey => false,
  changePanelConfig: (config: any) => false,
}

interface ConfigProviderActions {
  addServer: (server: string) => boolean
  deleteServer: (idx: number) => boolean
  addPrivkey: (privkey: string) => boolean
  deletePrivkey: (idx: number) => boolean
  changePanelConfig: (configs: any) => boolean
}

export type IConfig = typeof initConfig & ConfigProviderActions

const ConfigContext = React.createContext<IConfig>({
  ...initConfig,
})

class ConfigProvider extends React.Component<any, IConfig> {
  state = initConfig
  protected addServer = (server: string): boolean => {
    const serverList = [...this.state.serverList]
    if (!serverList.includes(server)) {
      const newServerList = [...serverList, server]
      this.setState(state => ({
        serverList: newServerList,
      }))
      window.localStorage.setItem(
        LOCAL_STORAGE.SERVER_LIST,
        JSON.stringify(newServerList),
      )
      return true
    }
    return false
  }
  protected deleteServer = (idx: number): boolean => {
    const serverList = [...this.state.serverList]
    serverList.splice(idx, 1)
    this.setState(state => ({
      serverList,
    }))
    window.localStorage.setItem(
      LOCAL_STORAGE.SERVER_LIST,
      JSON.stringify(serverList),
    )
    return true
  }
  protected addPrivkey = (privkey: string): boolean => {
    const privkeyList = [...this.state.privkeyList]
    if (!privkeyList.includes(privkey)) {
      const newPrivkeyList = [...privkeyList, privkey]
      this.setState(state => ({ privkeyList: newPrivkeyList }))
      window.localStorage.setItem(
        LOCAL_STORAGE.PRIV_KEY_LIST,
        JSON.stringify(newPrivkeyList),
      )
      return true
    }
    return false
  }
  protected deletePrivkey = (idx: number): boolean => {
    const privkeyList = [...this.state.privkeyList]
    privkeyList.splice(idx, 1)
    this.setState(state => ({ privkeyList }))
    window.localStorage.setItem(
      LOCAL_STORAGE.PRIV_KEY_LIST,
      JSON.stringify(privkeyList),
    )
    return true
  }
  protected changePanelConfig = newPanelConfigs => {
    this.setState(state => {
      window.localStorage.setItem(
        LOCAL_STORAGE.PANEL_CONFIGS,
        JSON.stringify(newPanelConfigs),
      )
      return { panelConfigs: newPanelConfigs }
    })
    return true
  }
  render () {
    return (
      <ConfigContext.Provider
        value={{
          ...this.state,
          addServer: this.addServer,
          deleteServer: this.deleteServer,
          addPrivkey: this.addPrivkey,
          deletePrivkey: this.deletePrivkey,
          changePanelConfig: this.changePanelConfig,
        }}
      >
        {this.props.children}
      </ConfigContext.Provider>
    )
  }
}

export const provideConfig = Comp => props => (
  <ConfigProvider>
    <Comp {...props} />
  </ConfigProvider>
)

export const withConfig = Comp => props => (
  <ConfigContext.Consumer>
    {config => <Comp {...props} config={config} />}
  </ConfigContext.Consumer>
)

export default ConfigContext
