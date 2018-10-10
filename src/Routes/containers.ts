export default [
  { path: '/', name: 'Header', component: 'Header', nav: false },
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
    icon: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/block.svg`,
    iconActive: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/block_active.svg`
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: 'TransactionTable',
    exact: true,
    nav: true,
    icon: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/transaction.svg`,
    iconActive: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/transaction_active.svg`
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
    icon: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/statistics.svg`,
    iconActive: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/statistics_active.svg`
  },
  {
    path: '/debugger',
    name: 'Debugger',
    component: 'Debugger',
    exact: true,
    nav: true,
    icon: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/statistics.svg`,
    iconActive: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/statistics_active.svg`
  },
  {
    path: '/config',
    name: 'Config',
    component: 'ConfigPage',
    exact: true,
    nav: true,
    icon: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/config.svg`,
    iconActive: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/config_active.svg`
  },
  { path: '/', name: 'Footer', component: 'Footer', exact: false, nav: false }
]
