export enum LOCAL_STORAGE {
  SERVER_LIST = 'server_list',
  PRIV_KEY_LIST = 'privkey_list',
  PANEL_CONFIGS = 'panel_configs',
  LOCAL_DEBUG_ACCOUNTS = 'localDebugAccounts',
}
export interface PanelConfigs {
  logo: string;
  TPS: boolean;
  blockHeight: boolean;
  blockHash: boolean;
  blockAge: boolean;
  blockTransactions: boolean;
  blockQuotaUsed: boolean;
  blockPageSize: number;
  transactionHash: boolean;
  transactionFrom: boolean;
  transactionTo: boolean;
  transactionValue: boolean;
  transactionAge: boolean;
  transactionQuotaUsed: boolean;
  transactionBlockNumber: boolean;
  transactionPageSize: number;
  graphIPB: true;
  graphTPB: true;
  graphQuotaUsedBlock: true;
  graphQuotaUsedTx: true;
  graphProposals: true;
  graphMaxCount: number;
}

export default LOCAL_STORAGE
