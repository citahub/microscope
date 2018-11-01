import Image from '../images'

export default [
  {
    path: '/',
    name: 'Header',
    component: 'Header',
    nav: false
  },
  {
    path: '/',
    name: 'Homepage',
    component: 'Homepage',
    exact: true,
    nav: false
  },
  {
    path: '/block/:blockHash',
    name: 'BlockByHash',
    component: 'Block',
    exact: true,
    nav: false
  },
  {
    path: '/height/:height',
    name: 'BlockByHeight',
    component: 'Block',
    exact: true,
    nav: false
  },
  {
    path: '/blocks',
    name: 'Blocks',
    component: 'BlockTable',
    exact: true,
    nav: true,
    icon: Image.icon.block,
    iconActive: Image.iconActive.block
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: 'TransactionTable',
    exact: true,
    nav: true,
    icon: Image.icon.transaction,
    iconActive: Image.iconActive.transaction
  },
  {
    path: '/transaction/:transaction',
    name: 'Transaction',
    component: 'Transaction',
    exact: true,
    nav: false
  },
  {
    path: '/account/:account',
    name: 'Account',
    component: 'Account',
    exact: true,
    nav: false
  },
  {
    path: '/graphs',
    name: 'Statistics',
    component: 'Graphs',
    exact: true,
    nav: true,
    icon: Image.icon.statistics,
    iconActive: Image.iconActive.statistics
  },
  {
    path: '/debugger',
    name: 'Debugger',
    component: 'Debugger',
    exact: true,
    nav: true,
    icon: Image.icon.statistics,
    iconActive: Image.iconActive.statistics
  },
  {
    path: '/config',
    name: 'Config',
    component: 'ConfigPage',
    exact: true,
    nav: true,
    icon: Image.icon.config,
    iconActive: Image.iconActive.config
  },
  {
    path: '/',
    name: 'Footer',
    component: 'Footer',
    exact: false,
    nav: false
  }
]
