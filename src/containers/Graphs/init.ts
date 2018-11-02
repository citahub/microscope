import {
  IBlock,
  TransactionFromServer,
  ProposalFromServer,
  IContainerProps,
  BlockNumber,
  Timestamp,
  Hash
} from '../../typings/'

const PRICE = 1

const initState = {
  blocks: [] as IBlock[],
  transactions: [] as TransactionFromServer[],
  proposals: [] as ProposalFromServer[],
  loadBlockHistory: false,
  maxCount: 10,
  error: {
    code: '',
    message: ''
  }
}

const GraphsDefault = {
  initState,
  PRICE
}

interface GraphsProps extends IContainerProps {}
type GraphState = typeof initState
type BlockGraphData = [BlockNumber, Timestamp, number, string]
type TxGraphData = [Hash, number]
type ProposalData = [string, number]

export { GraphsDefault, IBlock, GraphsProps, GraphState, BlockGraphData, TxGraphData, ProposalData }
