/*
 * @Author: Keith-CY
 * @Date: 2018-07-22 19:59:17
 * @Last Modified by:   Keith-CY
 * @Last Modified time: 2018-07-22 19:59:17
 */

import * as React from 'react'
import { render } from 'react-dom'
import { I18nextProvider } from 'react-i18next'
import 'normalize.css'

import i18n from './config/i18n'
import App from './App'

import './styles/common'

const mount = (Comp: any) =>
  render(
    <I18nextProvider i18n={i18n}>
      <Comp />
    </I18nextProvider>,
    document.getElementById('root') as HTMLElement,
  )

mount(App)

if (module.hot) {
  module.hot.accept('./App', () => {
    /* eslint-disable global-require */
    const NextApp = require('./App').default
    /* eslint-enable global-require */
    mount(NextApp)
  })
}
