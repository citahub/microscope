import * as React from 'react'
import { List, Divider } from '@material-ui/core'
import { ABI, ABIElement } from '../../typings'
import { withObservables } from '../../contexts/observables'
import { copyToClipboard } from '../../utils/copyToClipboard'
import { handleError, dismissError } from '../../utils/handleError'

const styles = require('./styles.scss')

const Infoblock = ({ title, code }) => (
  <div className={styles.infoblock}>
    <div className={styles.header}>
      <span className={styles.title}>{title}</span>
      <button className={styles.button} onClick={() => copyToClipboard(code)}>
        Copy
      </button>
    </div>
    <div className={styles.code}>{code}</div>
  </div>
)

interface PanelProps {
  CITAObservables: any
  // account: string
  abi: any
  code: string
}

interface PanelState {
  // abi: string
  // code: string
}

// class Panel extends React.Component<PanelProps, PanelState> {
//   state = {
//     abi: JSON.stringify(this.props.abi),
//     code: ''
//   }
//   public componentWillMount () {
//     // this.getabi()
//     this.getcode()
//   }
//   // private getabi = () => this.props.CITAObservables.getAbi(this.citaParams).subscribe((abi) => this.setState({ abi }))
//   private getcode = () => this.props.CITAObservables.getCode(this.citaParams).subscribe(code => this.setState({ code }))
//   private citaParams = {
//     contractAddr: this.props.account,
//     blockNumber: 'latest'
//   }
//   public render () {
//     // const { abi, code } = this.state
//     const abi = JSON.stringify(this.props.abi)
//     const { code } = this.props
//     return (
//       <div>
//         <Infoblock title="Contract Abi" code={abi} />
//         <Infoblock title="Contract Creation Code" code={code} />
//       </div>
//     )
//   }
// }

const Panel = (props: PanelProps) => {
  // const { abi, code } = this.state
  const abi = JSON.stringify(props.abi)
  const { code } = props
  return (
    <div>
      <Infoblock title="Contract Abi" code={abi} />
      <Infoblock title="Contract Creation Code" code={code} />
    </div>
  )
}

export default withObservables(Panel)
