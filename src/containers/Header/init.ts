import { initHeaderState, } from '../../initValues'
import { IContainerProps, } from '../../typings'

type HeaderState = typeof initHeaderState
interface HeaderProps extends IContainerProps {}

export { initHeaderState, HeaderState, HeaderProps, }
