import * as React from 'react'
import { createPortal } from 'react-dom'
import { translate } from 'react-i18next'
import { Subject, Subscription } from '@reactivex/rxjs'
import axios, { AxiosResponse, AxiosPromise } from 'axios'
import {
  AppBar,
  Toolbar,
  Menu,
  MenuItem,
  Typography,
  Button,
  IconButton,
} from '@material-ui/core'
import {
  Translate as TranslateIcon,
  Close as CloseIcon,
} from '@material-ui/icons'
import { containers } from '../../Routes'
import HeaderNavs from '../../components/HeaderNavs'
import SidebarNavs from '../../components/SidebarNavs'
import ErrorNotification from '../../components/ErrorNotification'
import { IContainerProps, Metadata } from '../../typings'
import RightSidebar from '../../components/RightSidebar'
import MetadataPanel from '../../components/MetadataPanel'
import BriefStatisticsPanel from '../../components/BriefStatistics'
import SearchPanel from '../../components/SearchPanel'
import { withConfig } from '../../contexts/config'
import { withObservables } from '../../contexts/observables'
import { isIp } from '../../utils/validators'
import { fetchStatistics } from '../../utils/fetcher'
import { initBlock, initMetadata } from '../../initValues'
import { handleError, dismissError } from '../../utils/handleError'

const styles = require('./header.scss')

const LOGO = `${process.env.PUBLIC}/images/microscopeLogo.svg`
const layout = require('../../styles/layout')

const initState = {
  keyword: '',
  metadata: initMetadata,
  sidebarNavs: false,
  activePanel: window.localStorage.getItem('chainIp') ? '' : 'metadata',
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
  error: {
    code: '',
    message: '',
  },
}
type HeaderState = typeof initState
interface HeaderProps extends IContainerProps {}

class Header extends React.Component<HeaderProps, HeaderState> {
  state = initState
  componentWillMount () {
    this.onSearch$ = new Subject()
    this.fetchStatus()
  }
  componentDidMount () {
    // console.log(this.props)

    this.searchSubscription = this.onSearch$
      .debounceTime(1000)
      .subscribe(({ key, value }) => {
        if (key === 'searchIp') {
          this.getChainMetadata(value)
        }
      }, this.handleError)
    this.props.CITAObservables.metaData({
      blockNumber: 'latest',
    }).subscribe((metadata: Metadata) => {
      this.setState({
        metadata: {
          ...metadata,
          genesisTimestamp: new Date(
            metadata.genesisTimestamp,
          ).toLocaleString(),
        },
      })
    }, this.handleError)
  }
  componentWillReceiveProps (nextProps: HeaderProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.togglePanel('')()
    }
  }
  componentDidCatch (err) {
    this.handleError(err)
  }
  private onSearch$: Subject<any>
  private getChainMetadata = ip => {
    if (isIp(ip)) {
      axios
        .post(`http://${ip}`, {
          jsonrpc: '2.0',
          method: 'getMetaData',
          params: ['latest'],
          id: 1,
        })
        .then((res: AxiosResponse) => {
          if (res.data && res.data.result) {
            this.setState({
              otherMetadata: {
                ...res.data.result,
                genesisTimestamp: new Date(
                  res.data.result.genesisTimestamp,
                ).toLocaleString(),
              },
            })
          } else {
            throw new Error('Error Response')
          }
        })
        .catch(this.handleError)
    }
  }
  private toggleSideNavs = (open: boolean = false) => (
    e: React.SyntheticEvent<HTMLElement>,
  ) => {
    this.setState({ sidebarNavs: open })
  }
  /**
   * @method fetchStatus
   */
  private fetchStatus = () => {
    // fetch brief statistics
    fetchStatistics({ type: 'brief' })
      .then(({ result: { tps, tpb, ipb } }) => {
        this.setState(state => ({ ...state, tps, tpb, ipb }))
      })
      .catch(this.handleError)
    // fetch peer Count
    const { peerCount, newBlockByNumberSubject } = this.props.CITAObservables
    peerCount(60000).subscribe(
      (count: string) =>
        this.setState((state: any) => ({ ...state, peerCount: +count })),
      this.handleError,
    )
    // fetch Block Number and Block
    newBlockByNumberSubject.subscribe(block => {
      this.setState({
        block,
      })
    }, this.handleError)
    newBlockByNumberSubject.connect()
  }
  private togglePanel = (panel: string) => (e?: any) => {
    this.setState(state => ({
      activePanel: panel,
    }))
  }

  private handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      this.switchChain()
    }
  }

  protected handleInput = key => (
    e: React.SyntheticEvent<HTMLInputElement>,
  ) => {
    const { value } = e.currentTarget
    if (key === 'searchIp') {
      this.onSearch$.next({ key: 'searchIp', value })
    }
    this.setState(state => ({
      ...state,
      [key]: value,
      otherMetadata: initMetadata,
    }))
  }
  private toggleLngMenu = (lngOpen = false) => e => {
    this.setState({ lngOpen, anchorEl: e.currentTarget })
  }

  private changeLng = (lng = 'en') => e => {
    this.setState({ lngOpen: false })
    // this.props.i18n.changeLanguage(lng)
    window.localStorage.setItem('i18nextLng', lng)
    window.location.reload()
  }
  private switchChain = (chain?: string) => {
    const ip = chain || this.state.searchIp
    this.props.CITAObservables.setServer(
      ip.startsWith('http') ? ip : `http://${ip}`,
    )
    const chainIp = ip.startsWith('http') ? ip : `http://${ip}`
    window.localStorage.setItem('chainIp', chainIp)
    window.location.reload()
  }

  private handleError = handleError(this)
  private dismissError = dismissError(this)
  private searchSubscription: Subscription
  private translations = ['zh', 'en', 'ja-JP', 'ko', 'de', 'it', 'fr']
  render () {
    const { anchorEl, lngOpen, error } = this.state
    const {
      location: { pathname },
      t,
    } = this.props
    return createPortal(
      <React.Fragment>
        <AppBar position="static" elevation={0}>
          <Toolbar
            className={layout.center}
            classes={{
              root: styles.toolbarRoot,
            }}
          >
            <IconButton
              aria-label="open drawer"
              onClick={this.toggleSideNavs(true)}
              classes={{ root: styles.toggleIcon }}
            >
              <img
                src={`${process.env.PUBLIC}/microscopeIcons/expand.png`}
                alt="expand"
              />
            </IconButton>
            <HeaderNavs
              containers={containers}
              pathname={pathname}
              logo={LOGO}
            />
            <SidebarNavs
              open={this.state.sidebarNavs}
              containers={containers}
              pathname={pathname}
              toggleSideNavs={this.toggleSideNavs}
              logo={LOGO}
            />
            <div className={styles.rightNavs}>
              <Button
                className={styles.navItem}
                onClick={this.togglePanel('metadata')}
              >
                {this.state.metadata.chainName || 'InvalidChain'}
              </Button>
              {this.props.config.panelConfigs.TPS ? (
                <Button
                  className={styles.navItem}
                  onClick={this.togglePanel('statistics')}
                >
                  {t('TPS')}: {this.state.tps.toFixed(2)}
                </Button>
              ) : null}
              <IconButton
                className={styles.navItem}
                onClick={this.togglePanel('search')}
              >
                <svg className="icon" aria-hidden="true">
                  <use xlinkHref="#icon-magnifier" />
                </svg>
              </IconButton>
              <IconButton onClick={this.toggleLngMenu(true)}>
                <TranslateIcon />
              </IconButton>
              <Menu
                open={lngOpen}
                anchorEl={anchorEl}
                onClose={this.toggleLngMenu()}
              >
                {this.translations.map(lng => (
                  <MenuItem onClick={this.changeLng(lng)} key={lng}>
                    {t(lng).toUpperCase()}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        <RightSidebar
          on={this.state.activePanel !== ''}
          onClose={this.togglePanel('')}
          onOpen={() => {}}
        >
          <div className={styles.rightSidebarContent}>
            <AppBar color="default" position="sticky" elevation={0}>
              <Toolbar
                classes={{
                  root: styles.toolbarRoot,
                }}
              >
                <Typography variant="title" color="inherit">
                  {this.state.activePanel}
                </Typography>
                <IconButton onClick={this.togglePanel('')}>
                  <CloseIcon />
                </IconButton>
              </Toolbar>
            </AppBar>
            {this.state.activePanel === 'metadata' ? (
              <MetadataPanel
                metadata={this.state.metadata}
                handleInput={this.handleInput}
                searchIp={this.state.searchIp}
                searchResult={this.state.otherMetadata}
                switchChain={this.switchChain}
                handleKeyUp={this.handleKeyUp}
                serverList={this.props.config.serverList}
              />
            ) : this.state.activePanel === 'statistics' ? (
              <BriefStatisticsPanel
                peerCount={this.state.peerCount}
                number={this.state.block.header.number}
                timestamp={this.state.block.header.timestamp}
                proposal={this.state.block.header.proof.Tendermint.proposal}
                tps={this.state.tps}
                tpb={this.state.tpb}
                ipb={this.state.ipb}
              />
            ) : (
              <SearchPanel />
            )}
          </div>
        </RightSidebar>
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>,
      document.getElementById('header') as HTMLElement,
    )
  }
}

export default translate('microscope')(withConfig(withObservables(Header)))
