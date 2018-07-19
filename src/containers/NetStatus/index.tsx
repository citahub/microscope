import * as React from 'react'
import { Typography, Toolbar } from '@material-ui/core'
import { withObservables } from '../../contexts/observables'
import { withConfig } from '../../contexts/config'
import { IContainerProps, IContainerState } from '../../typings/'

const PlainState = ({ title, value }: { title: string; value: string }) => (
  <div style={{ flex: 1, textAlign: 'center' }}>
    <Typography align="center" variant="title">
      {title}
    </Typography>
    <Typography align="center" variant="body1">
      {value}
    </Typography>
  </div>
)

const initialState = {
  peerCount: '0',
  blockNumber: '',
  block: {
    body: '',
    hash: '',
    header: {
      gasUsed: '',
      number: '',
      prevHash: '',
      timestamp: '',
    },
    version: 0,
  },
  gasPrice: 0,
  // network: process.env.CHAIN_SERVERS || '',
  network: '',
}

type INetStatusState = Readonly<typeof initialState>
interface INetStatusProps extends IContainerProps {}
class NetStatus extends React.Component<INetStatusProps, INetStatusState> {
  static plainStates = [
    { title: 'Peer Count', value: 'peerCount' },
    { title: 'Current Height', value: 'blockNumber' },
    { title: 'Gas Price', value: 'gasPrice' },
    { title: 'Network', value: 'network' },
  ]
  static updateInterval: any
  readonly state = initialState
  componentWillMount () {
    this.fetchStatus()
  }

  private fetchStatus = () => {
    // fetch peer Count
    const { peerCount, newBlockByNumberSubject } = this.props.CITAObservables
    peerCount(60000).subscribe((count: string) =>
      this.setState(state => ({ peerCount: count.slice(2) })),
    )
    // fetch Block Number and Block
    newBlockByNumberSubject.subscribe(block => {
      this.setState(state => ({ blockNumber: block.header.number }))
    })
    newBlockByNumberSubject.connect()
  }
  render () {
    const { block } = this.state
    return (
      <Toolbar style={{ display: 'flex' }}>
        {NetStatus.plainStates.map(state => (
          <PlainState
            {...state}
            key={state.title}
            value={this.state[state.value]}
          />
        ))}
      </Toolbar>
    )
  }
}
export default withConfig(withObservables(NetStatus))
