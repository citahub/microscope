import CITAObservables from '@nervos/observables'
import { Config } from '../contexts/config'
import i18n from '../config/i18n'
import './block'

export * from './block'
/* eslint-disable no-restricted-globals */
export interface IContainerProps {
  config: Config
  CITAObservables: CITAObservables
  history: any
  match: {
    path: string
    params: {
      height?: string
      blockHash?: string
      transaction?: string
      account?: string
    }
  }
  location: {
    hash: string
    pathname: string
    search: string
  }

  i18n: typeof i18n
  t: (key: string) => string
  // i18n: {

  // }
}

export interface ABIElement {
  constant: boolean
  inputs: { name: string; type: string; value?: string }[]
  name: string
  outputs: { name: string; type: string; value?: string }[]
  payable: boolean
  stateMutability: string
  type: string
}
/* eslint-enable no-restricted-globals */

export type ABI = ABIElement[]

export interface IContainerState {}
