/*
 * @Author: Keith-CY
 * @Date: 2018-07-22 19:59:22
 * @Last Modified by: Keith-CY
 * @Last Modified time: 2018-11-06 16:01:15
 */

import { Chain, } from '@nervos/plugin'
import { IBlock, IBlockHeader, Transaction, Metadata, ABI, UnsignedTransaction, TransactionFromServer, } from './typings'
import widerThan from './utils/widerThan'
import { Contract, AccountType, } from './typings/account'
import { LocalAccount, } from './components/LocalAccounts'
import { ServerList, } from './components/MetadataPanel'
import { SelectorType, } from './components/TableWithSelector'
import LOCAL_STORAGE, { PanelConfigs, } from './config/localstorage'
import { getServerList, getPrivkeyList, getPanelConfigs, } from './utils/accessLocalstorage'
import check, { errorMessages, } from './utils/check'

const isDesktop = widerThan(800)
export const initHeader: IBlockHeader = {
  timestamp: '',
  prevHash: '',
  number: '',
  stateRoot: '',
  transactionsRoot: '',
  receiptsRoot: '',
  gasUsed: '',
  proposer: '',
  proof: {
    Bft: {
      proposal: '',
    },
  },
}
export const initBlock: IBlock = {
  body: {
    transactions: [],
  },
  hash: '',
  header: initHeader,
  version: 0,
}

export const initTransaction: Transaction = {
  hash: '',
  timestamp: '',
  content: '',
  basicInfo: {
    from: '',
    to: '',
    value: '',
    data: '',
  },
}
export const initUnsignedTransaction: UnsignedTransaction = {
  crypto: 0,
  signature: '',
  sender: {
    address: '',
    publicKey: '',
  },
  transaction: {
    data: [] as number[],
    nonce: '',
    quota: 0,
    to: '',
    validUntilBlock: 0,
    value: [] as number[],
    version: 0,
  },
}
export const initMetadata: Metadata = {
  chainId: -1,
  chainName: '',
  operator: '',
  website: '',
  genesisTimestamp: '',
  validators: [],
  blockInterval: 0,
  economicalModel: 0,
  version: null,
}

// init config values
export const initPanelConfigs: PanelConfigs = {
  logo: 'www.demo.com',
  TPS: true,
  blockHeight: true,
  blockHash: true,
  blockAge: isDesktop,
  blockTransactions: true,
  blockGasUsed: isDesktop,
  blockPageSize: 10,
  transactionHash: true,
  transactionFrom: isDesktop,
  transactionTo: isDesktop,
  transactionValue: isDesktop,
  transactionAge: isDesktop,
  transactionGasUsed: isDesktop,
  transactionBlockNumber: true,
  transactionPageSize: 10,
  graphIPB: true,
  graphTPB: true,
  graphGasUsedBlock: true,
  graphGasUsedTx: true,
  graphProposals: true,
  graphMaxCount: 10,
}

export const initServerList = (process.env.CHAIN_SERVERS || '').split(',')
export const initPrivateKeyList = []
export const initError = { message: '', code: '', }

export const initHeaderState = {
  keyword: '',
  metadata: initMetadata,
  sidebarNavs: false,
  activePanel: window.urlParamChain || window.localStorage.getItem('chainIp') ? '' : 'metadata',
  searchIp: '',
  otherMetadata: initMetadata,
  tps: 0,
  tpb: 0,
  ipb: 0,
  peerCount: 0,
  block: initBlock,
  anchorEl: undefined,
  lngOpen: false,
  lng: window.localStorage.getItem('i18nextLng'),
  inputChainError: false,
  waitingMetadata: false,
  error: {
    code: '',
    message: '',
  },
  overtime: 0,
  serverList: [] as ServerList,
}

export const initAccountState = {
  loading: 0,
  type: AccountType.NORMAL,
  addr: '',
  abi: [] as ABI,
  code: '0x',
  contract: { _jsonInterface: [], methods: [], } as Contract,
  balance: '',
  txCount: 0,
  creator: '',
  transactions: [] as Transaction[],
  customToken: {
    name: '',
  },

  normals: [] as LocalAccount[],
  erc20s: [] as LocalAccount[],
  erc721s: [] as LocalAccount[],
  panelOn: 'tx',
  addrsOn: false,
  normalsAdd: {
    name: '',
    addr: '',
  },
  erc20sAdd: {
    name: '',
    addr: '',
  },
  erc721sAdd: {
    name: '',
    addr: '',
  },
  error: {
    code: '',
    message: '',
  },
}

export const initBlockState = {
  loading: 0,
  hash: '',
  header: {
    timestamp: '',
    prevHash: '',
    number: '',
    stateRoot: '',
    transactionsRoot: '',
    receiptsRoot: '',
    gasUsed: '',
    proposer: '',
    proof: {
      Bft: {
        proposal: '',
      },
    },
  },
  body: {
    transactions: [],
  },
  version: 0,
  transactionsOn: false,
  error: initError,
  quotaPrice: '',
  fee: '',
}

export const initBlockTableState = {
  headers: [
    { key: 'height', text: 'height', href: '/height/', },
    { key: 'hash', text: 'hash', href: '/block/', },
    { key: 'age', text: 'age', },
    { key: 'transactions', text: 'transactions', },
    { key: 'gasUsed', text: 'quota used', },
  ],
  items: [] as any[],
  count: 0,
  pageSize: 10,
  pageNo: 0,
  selectors: [
    {
      type: SelectorType.RANGE,
      key: 'number',
      text: 'height selector',
      items: [
        {
          key: 'numberFrom',
          text: 'Height From',
        },
        {
          key: 'numberTo',
          text: 'Height To',
        },
      ],
      check: check.digitsDec,
      errorMessage: errorMessages.digits,
    },
    {
      type: SelectorType.RANGE,
      key: 'transaction',
      text: 'transactions counts',
      items: [
        {
          key: 'transactionFrom',
          text: 'From',
        },
        {
          key: 'transactionTo',
          text: 'To',
        },
      ],
      check: check.digitsDec,
      errorMessage: errorMessages.digits,
    },
  ],
  selectorsValue: {
    numberFrom: '',
    numberTo: '',
    transactionFrom: '',
    transactionTo: '',
  },
  loading: 0,
  error: {
    code: '',
    message: '',
  },
}
export const initConfigContext = {
  localStorage: LOCAL_STORAGE,
  serverList: getServerList(),
  privkeyList: getPrivkeyList(),
  panelConfigs: getPanelConfigs(),
  symbol: '',
  setSymbol: (symbol: string) => false,
  addServer: server => false,
  deleteServer: server => false,
  addPrivkey: privkey => false,
  deletePrivkey: privkey => false,
  changePanelConfig: (config: any) => false,
}

export const ContractCreation = 'Contract Creation'

export const initHomePageState = {
  loading: 0,
  metadata: initMetadata,
  overtime: 0,
  blocks: [] as Chain.Block<Chain.TransactionInBlock>[],
  transactions: [] as TransactionFromServer[],
  healthy: {
    count: '',
  },
  error: {
    code: '',
    message: '',
  },
}
