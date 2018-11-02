import { PanelConfigs } from '../../config/localstorage'
import { withConfig, Config } from '../../contexts/config'

enum ConfigType {
  DISPLAY,
  COUNT,
  ITEMS,
  VALUE
}

enum ConfigPanel {
  GENERAL = 'general',
  HEADER = 'header',
  BLOCK = 'block',
  TRANSACTION = 'transaction',
  GRAPH = 'graph',
  DEBUGGER = 'debugger'
}

/* eslint-disable no-use-before-define */
interface ConfigDetailType {
  panel: ConfigPanel
  type: ConfigType
  key: string
  title: string
}
/* eslint-enable no-use-before-define */

const panels = [
  // ConfigPanel.GENERAL,
  // ConfigPanel.HEADER,
  ConfigPanel.BLOCK,
  ConfigPanel.TRANSACTION,
  ConfigPanel.GRAPH,
  ConfigPanel.DEBUGGER
]

const configs = [
  {
    panel: ConfigPanel.GENERAL,
    type: ConfigType.VALUE,
    key: 'logo',
    title: 'logo'
  },
  {
    panel: ConfigPanel.HEADER,
    type: ConfigType.DISPLAY,
    key: 'TPS',
    title: 'TPS'
  },
  {
    panel: ConfigPanel.BLOCK,
    type: ConfigType.DISPLAY,
    key: 'blockHeight',
    title: 'height'
  },
  {
    panel: ConfigPanel.BLOCK,
    type: ConfigType.DISPLAY,
    key: 'blockHash',
    title: 'hash'
  },
  {
    panel: ConfigPanel.BLOCK,
    type: ConfigType.DISPLAY,
    key: 'blockAge',
    title: 'age'
  },
  {
    panel: ConfigPanel.BLOCK,
    type: ConfigType.DISPLAY,
    key: 'blockTransactions',
    title: 'transactions'
  },
  {
    panel: ConfigPanel.BLOCK,
    type: ConfigType.DISPLAY,
    key: 'blockGasUsed',
    title: 'quota used'
  },
  {
    panel: ConfigPanel.BLOCK,
    type: ConfigType.VALUE,
    key: 'blockPageSize',
    title: 'page size'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.DISPLAY,
    key: 'transactionHash',
    title: 'hash'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.DISPLAY,
    key: 'transactionFrom',
    title: 'from'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.DISPLAY,
    key: 'transactionTo',
    title: 'to'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.DISPLAY,
    key: 'transactionValue',
    title: 'value'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.DISPLAY,
    key: 'transactionAge',
    title: 'age'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.DISPLAY,
    key: 'transactionBlockNumber',
    title: 'block height'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.DISPLAY,
    key: 'transactionGasUsed',
    title: 'quota used'
  },
  {
    panel: ConfigPanel.TRANSACTION,
    type: ConfigType.VALUE,
    key: 'transactionPageSize',
    title: 'page size'
  },
  {
    panel: ConfigPanel.GRAPH,
    type: ConfigType.DISPLAY,
    key: 'graphIPB',
    title: 'Interval/Block'
  },
  {
    panel: ConfigPanel.GRAPH,
    type: ConfigType.DISPLAY,
    key: 'graphTPB',
    title: 'Transactions/Block'
  },
  {
    panel: ConfigPanel.GRAPH,
    type: ConfigType.DISPLAY,
    key: 'graphGasUsedBlock',
    title: 'Quota Used/Block'
  },
  {
    panel: ConfigPanel.GRAPH,
    type: ConfigType.DISPLAY,
    key: 'graphGasUsedTx',
    title: 'Quota Used/Transaction'
  },
  {
    panel: ConfigPanel.GRAPH,
    type: ConfigType.DISPLAY,
    key: 'graphProposals',
    title: 'Proposals/Validator'
  },
  {
    panel: ConfigPanel.GRAPH,
    type: ConfigType.VALUE,
    key: 'graphMaxCount',
    title: 'MaxCount'
  },
  {
    panel: ConfigPanel.DEBUGGER,
    type: ConfigType.DISPLAY,
    key: 'debugger',
    title: 'Debugger'
  }
] as ConfigDetailType[]

const ConfigPageDefault = {
  configs,
  panels
}

interface ConfigPageProps {
  config: Config
  t: (key: string) => string
}

interface ConfigPageState {
  configs: PanelConfigs
  inputTimeout?: any
  saving?: boolean
}

export {
  ConfigPageProps,
  ConfigPageState,
  ConfigDetailType,
  ConfigType,
  ConfigPanel,
  ConfigPageDefault,
}
