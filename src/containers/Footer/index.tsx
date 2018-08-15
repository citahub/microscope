import * as React from 'react'
import { createPortal } from 'react-dom'
import { I18n, translate } from 'react-i18next'

const layout = require('../../styles/layout.scss')
const styles = require('./styles.scss')

interface Product {
  logo: string
  title: string
  url: string
  overview: string
}
interface Contact {
  icon: any
  title: string
  url: string
}

class Footer extends React.Component<{ t: (key: string) => string }, any> {
  state = {
    overview: {
      title: 'overview',
      content: 'Across the Microscope, we can reach every cell in Nervos Network',
    },
    products: {
      title: 'other product',
      items: [
        {
          logo:
            'https://uploads-ssl.webflow.com/5b10cb31f2733b937fe55ab5/5b185b65683265ce7a42c13c_nervos%20logo.png',
          title: 'Nervos AppChain',
          url: 'http://nervos.org/',
          overview: 'Nervos AppChain',
        },
        {
          logo:
            'https://raw.githubusercontent.com/cryptape/assets/master/CITA-logo.png',
          title: 'CITA',
          url: 'https://github.com/cryptape/cita',
          overview: 'CITA',
        },
      ] as Product[],
    },
    contacts: {
      title: 'contact us',
      items: [
        {
          icon: 'email',
          title: 'appchain.contact@cryptape.com',
          url: 'mailto:appchain.contact@cryptape.com',
        },
        {
          icon: 'group',
          title: 'Nervos-AppChain 开发者群组',
          url: 'https://t.me/joinchat/GkxnS1L8xTx_c1InzeC0Cw',
        },
        {
          icon: 'wechat',
          title: '微信公众号',
          url:
            'https://mp.weixin.qq.com/mp/profile_ext?action=home&__biz=MzUzNzg4NTAzOA==&scene=124&#wechat_redirect',
        },
      ] as Contact[],
    },
  }
  render () {
    const { overview, products, contacts } = this.state
    const { t } = this.props
    return (
      <div className={`${styles.footer} ${layout.center}`}>
        <div className={styles.overview}>
          <h1>{t(overview.title)}</h1>
          <div>{overview.content}</div>
        </div>
        <div className={styles.products}>
          <h1>{t(products.title)}</h1>
          <div>
            {products.items.map(item => (
              <div key={item.title}>
                <a href={item.url} rel="noreferrer noopener" target="_blank">
                  <img src={item.logo} alt={item.title} />
                </a>
                <p>{t(item.overview)}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.contacts}>
          <h1>{t(contacts.title)}</h1>
          <div>
            {contacts.items.map(item => (
              <a
                key={item.title}
                href={item.url}
                rel="noreferrer noopener"
                target="_blank"
              >
                <svg className="icon" aria-hidden="true">
                  <use xlinkHref={`#icon-${item.icon}`} />
                </svg>
                <span>{t(item.title)}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }
}

const TransFooter = translate('microscope')(Footer)

export default () =>
  createPortal(<TransFooter />, document.getElementById(
    'footer',
  ) as HTMLElement)
