/*
 * @Author: Keith-CY
 * @Date: 2018-07-22 21:33:48
 * @Last Modified by: Keith-CY
 * @Last Modified time: 2018-07-26 17:25:09
 */

import { initError } from './../initValues'

const lastErrorMessageTable = {} as any
let lastErrorMessage = ''

export const handleError = ctx => error => {
  if (!window.localStorage.getItem('chainIp')) return
  // only active when chain ip exsits
  if (error.message === lastErrorMessageTable[ctx]) return
  if (error.message === lastErrorMessage) return
  // only active when the last error message is different
  lastErrorMessageTable[ctx] = error.message
  lastErrorMessage = error.message
  ctx.setState(state => ({
    loading: state.loading - 1,
    error
  }))
  // }
}

export const dismissError = ctx => () => {
  ctx.setState({ error: initError })
}
