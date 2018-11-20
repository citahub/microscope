export const loadedLocalStorage = (key: string) => {
  const localChainData = window.localStorage.getItem(key)
  if (localChainData === null) return null
  const obj = JSON.parse(localChainData)
  return obj
}

export const saveLocalStorage = (key: string, value: any) => {
  const json = JSON.stringify(value)
  window.localStorage.setItem(key, json)
}

export const addChainHistory = info => {
  const key = 'chainHistory'
  let history = loadedLocalStorage(key)
  if (!Array.isArray(history)) {
    history = [info, ]
    saveLocalStorage(key, history)
  } else if (!history.map(obj => obj.serverIp).includes(info.serverIp)) {
    history.unshift(info)
    saveLocalStorage(key, history.slice(0, 2))
  }
}

export const formatedIpInfo = (ip, chainName) => {
  let protocol, host
  /* eslint-disable prefer-destructuring */
  if (ip.startsWith('http')) {
    const l = ip.split('//')
    protocol = l[0]
    host = l[1].split('/')[0]
  } else {
    protocol = 'http:'
    host = ip.split('/')[0]
  }
  /* eslint-enable prefer-destructuring */
  const origin = `${protocol}//${host}`
  const info = { serverName: chainName, serverIp: origin, }
  return info
}

export const saveChainHistoryLocal = (ip, chainName) => {
  const info = formatedIpInfo(ip, chainName)
  addChainHistory(info)
}
