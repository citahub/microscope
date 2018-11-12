/* eslint-disable */
/// <reference path="../typings/react/index.d.ts" />
/* eslint-enable */
import * as React from 'react'
import CITAObservables from '@nervos/observables'

declare global {
  interface Window {
    urlParamChain: string | null
  }
}

if (URLSearchParams) {
  Object.defineProperty(window, 'urlParamChain', {
    value: new URLSearchParams(window.location.search).get('chain'),
  })
}

const initObservables: any = new CITAObservables({
  server: window.urlParamChain || window.localStorage.getItem('chainIp') || process.env.CHAIN_SERVERS || '',
  interval: (process.env.OBSERVABLE_INTERVAL && +process.env.OBSERVABLE_INTERVAL) || 1000,
})

const newBlockCallbackTable = {} as any
let newBlockCallbackInterval = -1 as any

const handleError = error => {
  Object.keys(newBlockCallbackTable).forEach(key => {
    const callbackInfo = newBlockCallbackTable[key]
    callbackInfo.error(error)
  })
}

const handleCallback = block => {
  Object.keys(newBlockCallbackTable).forEach(key => {
    const callbackInfo = newBlockCallbackTable[key]
    callbackInfo.callback(block)
  })
}

const fetchBlockByNumber = (number, time = 10) => {
  initObservables.blockByNumber(number, false).subscribe(handleCallback, error => {
    const t = time - 1
    if (t > -1) {
      fetchBlockByNumber(number, t)
    }
    handleError(error)
  })
}

export const startSubjectNewBlock = () => {
  clearInterval(newBlockCallbackInterval)
  let current = 0
  newBlockCallbackInterval = setInterval(() => {
    initObservables.newBlockNumber(0, false).subscribe(blockNumber => {
      const latest = +blockNumber
      if (current === 0) {
        current = latest - 1
      }
      if (latest <= +current) return
      if (latest === current + 1) {
        current = latest
        fetchBlockByNumber(latest)
      } else {
        while (current < latest) {
          current++
          fetchBlockByNumber(current)
        }
      }
    }, handleError)
  }, 1000)
}

initObservables.newBlockSubjectAdd = (key, callback, error, { ...params }) => {
  newBlockCallbackTable[key] = {
    callback,
    error,
    ...params,
  }
}

const ObservableContext = React.createContext(initObservables)

export const withObservables = Comp => props => (
  <ObservableContext.Consumer>
    {(observables: CITAObservables) => <Comp {...props} CITAObservables={observables} />}
  </ObservableContext.Consumer>
)
export const provideObservabls = Comp => props => (
  <ObservableContext.Provider value={initObservables}>
    <Comp {...props} />
  </ObservableContext.Provider>
)

export default ObservableContext
