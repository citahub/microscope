import * as React from 'react'
import { createPortal, } from 'react-dom'
import { translate, } from 'react-i18next'
import { Subject, Subscription, } from '@reactivex/rxjs'
import { AppBar, Toolbar, Menu, MenuItem, Typography, Button, IconButton, } from '@material-ui/core'
import { Translate as TranslateIcon, Close as CloseIcon, } from '@material-ui/icons'
import { Chain, } from '@nervos/plugin'
import containers from '../../Routes/containers'
import HeaderNavs from '../../components/HeaderNavs'
import SidebarNavs from '../../components/SidebarNavs'
import ErrorNotification from '../../components/ErrorNotification'
import RightSidebar from '../../components/RightSidebar'
import MetadataPanel, { ServerList, } from '../../components/MetadataPanel'
import BriefStatisticsPanel from '../../components/BriefStatistics'
import SearchPanel from '../../components/SearchPanel'
import { withConfig, } from '../../contexts/config'
import { withObservables, } from '../../contexts/observables'
import { fetchStatistics, fetchServerList, fetchMetadata, } from '../../utils/fetcher'
import { initMetadata, } from '../../initValues'
import { handleError, dismissError, } from '../../utils/handleError'
import { initHeaderState as initState, HeaderState, HeaderProps, } from './init'
import Image from '../../images'

const styles = require('./header.scss')
const layout = require('../../styles/layout')

const BlockOvertimeAlert = ({ metadata, overtime, }) => {
  let { blockInterval: interval, } = metadata
  if (interval === 0) {
    interval = 3000
  }
  let openAlert = false
  let openHardAlert = false
  if (overtime > 3 * interval) {
    openAlert = true
    openHardAlert = true
  } else if (overtime > 2 * interval) {
    openAlert = true
  }

  if (!openAlert) {
    return null
  }
  return (
    <div
      style={{
        maxHeight: openAlert ? '100vh' : '0',
        lineHeight: '1rem',
        padding: openAlert ? '1rem 0' : '0',
        fontSize: '1rem',
        overflow: 'hidden',
        background: openHardAlert ? '#fc4141' : '#f5a623',
        textAlign: 'center',
        transition: 'height 0.5s ease 0s, padding 0.5s ease 0s',
      }}
    >
      {`Notice：No blocks loaded in ${openHardAlert ? Math.floor(overtime / 1000) : Math.floor(overtime / 100) / 10}s`}
    </div>
  )
}

class Header extends React.Component<HeaderProps, HeaderState> {
  public readonly state = initState

  public componentWillMount () {
    this.onSearch$ = new Subject()
    this.initBlockTimestamp()
  }

  public componentDidMount () {
    // start search subscription
    this.searchSubscription = this.onSearch$.debounceTime(1000).subscribe(({ key, value, }) => {
      if (key === 'searchIp') {
        this.getChainMetadata(value)
      }
    }, this.handleError)

    // fetch status of brief-statistics panel
    this.fetchStatisticsPanel()

    // fetch data of metadata panel
    this.fetchMetaDataPanel()

    this.checkFetchBlockOvertime()
  }

  public componentWillReceiveProps (nextProps: HeaderProps) {
    if (this.props.location.pathname !== nextProps.location.pathname) {
      this.togglePanel('')()
    }
  }

  public componentDidCatch (err) {
    this.handleError(err)
  }

  public componentWillUnmount () {
    clearInterval(this.intervalCheckOvertime)
  }

  private onSearch$: Subject<any>

  private getChainMetadata = ip => {
    fetchMetadata(ip)
      .then(({ result, }) => {
        this.setState({
          otherMetadata: {
            ...result,
            genesisTimestamp: new Date(result.genesisTimestamp).toLocaleString(),
          },
        })
      })
      .catch(this.handleError)
  }

  private intervalCheckOvertime = -1 as any

  private initBlockTimestamp = () => {
    const { timestamp, } = this.state.block.header
    if (timestamp === '') {
      this.setState(state =>
        Object.assign({}, state, {
          block: {
            ...state.block,
            header: {
              ...state.block.header,
              timestamp: Date.now(),
            },
          },
        })
      )
    }
  }

  private checkFetchBlockOvertime = () => {
    clearInterval(this.intervalCheckOvertime)
    let prevBlockTime = 0
    let prevFetchTime = 0
    const ms = 100
    this.intervalCheckOvertime = setInterval(() => {
      const { timestamp, } = this.state.block.header
      if (prevBlockTime === +timestamp) {
        this.setState(state => ({
          ...state,
          overtime: Date.now() - prevFetchTime,
        }))
      } else {
        prevBlockTime = +timestamp
        prevFetchTime = Date.now()
        this.setState(state => ({
          ...state,
          overtime: 0,
        }))
      }
    }, ms)
  }

  private toggleSideNavs = (open: boolean = false) => (e: React.SyntheticEvent<HTMLElement>) => {
    this.setState({ sidebarNavs: open, })
  }

  private fetchNewBlockLoop = () => {
    const { newBlockSubjectAdd, } = this.props.CITAObservables
    newBlockSubjectAdd(
      'header',
      block => {
        this.setState({
          block,
        })
      },
      this.handleError
    )
  }

  /**
   * @method fetchStatisticsPanel
   */
  private fetchStatisticsPanel = () => {
    // fetch brief statistics
    fetchStatistics({ type: 'brief', })
      .then(({ result: { tps, tpb, ipb, }, }) => {
        this.setState(state => ({ ...state, tps, tpb, ipb, }))
      })
      .catch(this.handleError)
    // fetch peer Count
    const { peerCount, } = this.props.CITAObservables
    peerCount(60000).subscribe(
      (count: string) => this.setState((state: any) => ({ ...state, peerCount: +count, })),
      this.handleError
    )
    this.fetchNewBlockLoop()
    this.fetchServerList()
  }

  private fetchServerList = () => {
    // fetch server list
    fetchServerList()
      .then(servers => {
        if (!servers) return
        const serverList = [] as ServerList
        Object.keys(servers).forEach(serverName => {
          serverList.push({
            serverName,
            serverIp: servers[serverName],
          })
        })
        this.setState({ serverList, })
      })
      .catch(this.handleError)
  }

  private fetchMetaDataPanel = () => {
    // fetch metadata
    this.props.CITAObservables.metaData({
      blockNumber: 'latest',
    }).subscribe((metadata: Chain.MetaData) => {
      this.setState({
        metadata: {
          ...metadata,
          genesisTimestamp: new Date(metadata.genesisTimestamp).toLocaleString(),
        },
      })
      this.props.config.setSymbol(metadata.tokenSymbol)
    }, this.handleError)

    this.fetchServerList()
  }

  private togglePanel = (panel: string) => (e?: any) => {
    this.setState({
      activePanel: panel,
    })
  }

  public handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.keyCode === 13) {
      this.switchChain('')()
    }
  }

  protected handleInput = key => (e: React.SyntheticEvent<HTMLInputElement>) => {
    const { value, } = e.currentTarget
    if (key === 'searchIp') {
      this.onSearch$.next({ key: 'searchIp', value, })
    }
    this.setState(state => ({
      ...state,
      [key]: value,
      otherMetadata: initMetadata,
      inputChainError: false,
      waitingMetadata: false,
    }))
  }

  private toggleLngMenu = (lngOpen = false) => e => {
    this.setState({ lngOpen, anchorEl: e.currentTarget, })
  }

  private changeLng = (lng = 'en') => e => {
    this.setState({ lngOpen: false, })
    window.localStorage.setItem('i18nextLng', lng)
    window.location.reload()
  }

  private switchChainImmediate = chain => {
    const ip = chain || this.state.searchIp
    this.props.CITAObservables.setServer(ip.startsWith('http') ? ip : `https://${ip}`)
    const chainIp = ip.startsWith('http') ? ip : `https://${ip}`
    window.localStorage.setItem('chainIp', chainIp)
    let i = 0
    const reload = () => {
      if (i++ > 20) return
      setTimeout(() => {
        if (window.localStorage.getItem('chainIp') === chainIp) {
          window.location.reload()
        } else {
          reload()
        }
      }, 100)
    }
    reload()
  }

  private switchChain = (chain: string = '', immediate = false) => (e?: any) => {
    window.location.search = ''
    if (immediate) {
      this.switchChainImmediate(chain)
    }
    const { otherMetadata, } = this.state
    this.setState({ inputChainError: false, })
    this.setState({ waitingMetadata: true, })
    setTimeout(() => {
      if (otherMetadata.chainId !== -1) {
        this.switchChainImmediate(chain)
      } else {
        this.setState({ inputChainError: true, })
        this.setState({ waitingMetadata: false, })
      }
    }, 1000)
  }

  private handleError = handleError(this)
  private dismissError = dismissError(this)
  private searchSubscription: Subscription
  private translations = process.env.LNGS ? process.env.LNGS.split(',') : ['zh', 'en', ]

  private ActivePanel = () => {
    const { serverList, inputChainError, waitingMetadata, activePanel, } = this.state
    if (activePanel === 'metadata') {
      return (
        <MetadataPanel
          metadata={this.state.metadata}
          handleInput={this.handleInput}
          searchIp={this.state.searchIp}
          searchResult={this.state.otherMetadata}
          switchChain={this.switchChain}
          handleKeyUp={this.handleKeyUp}
          serverList={serverList}
          inputChainError={inputChainError}
          waitingMetadata={waitingMetadata}
        />
      )
    } else if (activePanel === 'statistics') {
      return (
        <BriefStatisticsPanel
          peerCount={this.state.peerCount}
          number={this.state.block.header.number}
          timestamp={this.state.block.header.timestamp}
          proposal={this.state.block.header.proof.Bft.proposal}
          tps={this.state.tps}
          tpb={this.state.tpb}
          ipb={this.state.ipb}
        />
      )
    }
    return <SearchPanel />
  }

  public render () {
    const { anchorEl, lngOpen, error, metadata, overtime, } = this.state
    const {
      location: { pathname, },
      t,
    } = this.props
    const ignoredContainer = [this.props.config.panelConfigs.debugger ? '' : 'Debugger', ]
    const displayedContainers = containers.filter(container => !ignoredContainer.includes(container.name))

    return createPortal(
      <React.Fragment>
        <AppBar position="fixed" elevation={0}>
          <BlockOvertimeAlert metadata={metadata} overtime={overtime} />
          <Toolbar
            className={layout.center}
            classes={{
              root: styles.toolbarRoot,
            }}
          >
            <IconButton
              aria-label="open drawer"
              onClick={this.toggleSideNavs(true)}
              classes={{ root: styles.toggleIcon, }}
            >
              <img src={Image.extend} alt="expand" />
            </IconButton>
            <HeaderNavs containers={displayedContainers} pathname={pathname} logo={Image.logo} />
            <SidebarNavs
              open={this.state.sidebarNavs}
              containers={displayedContainers}
              pathname={pathname}
              toggleSideNavs={this.toggleSideNavs}
              logo={Image.logo}
            />
            <div className={styles.rightNavs}>
              <Button className={styles.navItem} onClick={this.togglePanel('metadata')}>
                {this.state.metadata.chainName || 'InvalidChain'}
              </Button>
              {/* this.props.config.panelConfigs.TPS ? (
                <Button className={styles.navItem} onClick={this.togglePanel('statistics')}>
                  {t('TPS')}: {this.state.tps.toFixed(2)}
                </Button>
              ) : null */}
              <IconButton className={styles.navItem} onClick={this.togglePanel('search')}>
                <svg className="icon" aria-hidden="true">
                  <use xlinkHref="#icon-magnifier" />
                </svg>
              </IconButton>
              {this.translations.length > 1 ? (
                <IconButton onClick={this.toggleLngMenu(true)}>
                  <TranslateIcon />
                </IconButton>
              ) : null}
              <Menu open={lngOpen} anchorEl={anchorEl} onClose={this.toggleLngMenu()}>
                {this.translations.map(lng => (
                  <MenuItem onClick={this.changeLng(lng)} key={lng}>
                    {t(lng).toUpperCase()}
                  </MenuItem>
                ))}
              </Menu>
            </div>
          </Toolbar>
        </AppBar>
        <RightSidebar on={this.state.activePanel !== ''} onClose={this.togglePanel('')} onOpen={() => {}}>
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
            {this.ActivePanel()}
          </div>
        </RightSidebar>
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>,
      document.getElementById('header') as HTMLElement
    )
  }
}

export default translate('microscope')(withConfig(withObservables(Header)))
