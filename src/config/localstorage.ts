export enum LOCAL_STORAGE {
  SERVER_LIST = 'server_list',
  PRIV_KEY_LIST = 'privkey_list',
  PANEL_CONFIGS = 'panel_configs',
  LOCAL_DEBUG_ACCOUNTS = 'localDebugAccounts'
}
export interface PanelConfigs {
  logo: string
  TPS: boolean
  blockHeight: boolean
  blockHash: boolean
  blockAge: boolean
  blockTransactions: boolean
  blockGasUsed: boolean
  blockPageSize: number
  transactionHash: boolean
  transactionFrom: boolean
  transactionTo: boolean
  transactionValue: boolean
  transactionAge: boolean
  transactionGasUsed: boolean
  transactionBlockNumber: boolean
  transactionPageSize: number
  graphIPB: true
  graphTPB: true
  graphGasUsedBlock: true
  graphGasUsedTx: true
  graphProposals: true
  graphMaxCount: number
}

export default LOCAL_STORAGE
