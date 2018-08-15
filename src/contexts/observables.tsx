/* eslint-disable */
/// <reference path="../typings/react/index.d.ts" />
/* eslint-enable */
// import { Observable, ReplaySubject } from 'rxjs'
import * as React from 'react'
import CITAObservables from '@nervos/observables'

export const initObservables: CITAObservables = new CITAObservables({
  server: window.localStorage.getItem('chainIp') || process.env.CHAIN_SERVER || '',
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
