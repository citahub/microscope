export type Hash = string
export type BlockNumber = string
export type Timestamp = string | number
export interface IBlockHeader {
  timestamp: Timestamp
  prevHash: Hash
  number: BlockNumber
  stateRoot: string
  transactionsRoot: string
  receiptsRoot: string
  gasUsed: string
  proof: {
    Bft: {
      proposal: string
    }
  }
}

export interface Transaction {
  hash: Hash
  timestamp?: string
  content?: string
  basicInfo?: {
    from: string
    to: string
    value: string
    data: string
  }
  // content: string
  // id: string
  // from: Hash
  // to: Hash
  // tokenValue: string
  // timestamp: Timestamp
}

export interface DetailedTransaction {
  hash: Hash
  content?: string
  basicInfo?: {
    to: string
    from: string
    data: string
    value: string
  }
  blockHash: Hash
  blockNumber: string
  index: string
}

export interface IBlock {
  body: {
    transactions: Transaction[]
  }
  hash: Hash
  header: IBlockHeader
  version: string | number
}
export interface TransactionFromServer {
  blockNumber: string
  content: string
  from: string
  gasUsed: string
  hash: string
  timestamp: number
  to: string
  value: number
}

export interface BlockFromServer {
  version: number
  transactionsCount: number
  header: {
    transactionsRoot: string
    timestamp: number
    stateRoot: string
    receiptsRoot: string
    proof: {
      Bft: {
        proposal: string
      }
    }
    prevHash: string
    number: string
    gasUsed: string
  }
  hash: string
}

export interface ProposalFromServer {
  validator: string
  count: number
}
export interface Metadata {
  chainId: number
  chainName: string
  operator: string
  website: string
  genesisTimestamp: string
  validators: string[]
  blockInterval: number
}
