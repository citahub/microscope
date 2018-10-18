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
    value: new URLSearchParams(window.location.search).get('chain')
  })
}

export const initObservables: CITAObservables = new CITAObservables({
  server: window.urlParamChain || window.localStorage.getItem('chainIp') || process.env.CHAIN_SERVERS || '',
  interval: (process.env.OBSERVABLE_INTERVAL && +process.env.OBSERVABLE_INTERVAL) || 1000
})
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
