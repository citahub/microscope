/*
 * @Author: Keith-CY
 * @Date: 2018-07-22 21:05:01
 * @Last Modified by: Keith-CY
 * @Last Modified time: 2018-10-15 21:17:12
 */

import { initPanelConfigs, initServerList, initPrivateKeyList } from '../initValues'
import LOCAL_STORAGE, { PanelConfigs } from '../config/localstorage'

export const getServerList = () => {
  const storedList = window.localStorage.getItem(LOCAL_STORAGE.SERVER_LIST)
  if (storedList) {
    try {
      const servers = JSON.parse(storedList)
      return servers.length ? servers : initServerList
    } catch (err) {
      console.error(err)
      return initServerList
    }
  }
  return initServerList
}

export const getPrivkeyList = () => {
  const storedList = window.localStorage.getItem(LOCAL_STORAGE.PRIV_KEY_LIST)
  if (storedList) {
    try {
      return JSON.parse(storedList)
    } catch (err) {
      console.error(err)
      return initPrivateKeyList
    }
  }
  return initPrivateKeyList
}
export const getPanelConfigs = (defaultConfig: PanelConfigs = initPanelConfigs) => {
  const localConfigs = window.localStorage.getItem(LOCAL_STORAGE.PANEL_CONFIGS)
  if (localConfigs) {
    try {
      return JSON.parse(localConfigs)
    } catch (err) {
      console.error(err)
      return defaultConfig
    }
  }
  return defaultConfig
}

export const setLocalDebugAccounts = (accounts: string[] = []) => {
  if (Array.isArray(accounts)) {
    window.localStorage.setItem(LOCAL_STORAGE.LOCAL_DEBUG_ACCOUNTS, accounts.join(','))
  }
}

export const getLocalDebugAccounts = () => {
  const accounts = window.localStorage.getItem(LOCAL_STORAGE.LOCAL_DEBUG_ACCOUNTS)
  if (accounts) {
    return Array.from(new Set(accounts.split(',')))
  }
  return []
}
