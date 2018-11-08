import { Chain, } from '@nervos/plugin'
import { IContainerProps, TransactionFromServer, } from '../../typings'

const initState = {
  loading: 0,
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

interface HomepageProps extends IContainerProps {}
type HomepageState = typeof initState

export { HomepageProps, HomepageState, initState, }
