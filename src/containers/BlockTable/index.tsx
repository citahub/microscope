/*
 * @Author: Keith-CY
 * @Date: 2018-08-02 12:05:46
 * @Last Modified by: Keith-CY
 * @Last Modified time: 2018-08-03 18:28:02
 */

import * as React from 'react'

import { LinearProgress } from '@material-ui/core'

import { IContainerProps } from '../../typings'
import { BlockFromServer } from '../../typings/block'
import { withConfig } from '../../contexts/config'

import TableWithSelector, { TableWithSelectorProps, SelectorType } from '../../components/TableWithSelector'
import ErrorNotification from '../../components/ErrorNotification'
import Banner from '../../components/Banner'

import { fetchBlocks } from '../../utils/fetcher'
import paramsFilter from '../../utils/paramsFilter'
import hideLoader from '../../utils/hideLoader'
import { handleError, dismissError } from '../../utils/handleError'
import { rangeSelectorText } from '../../utils/searchTextGen'

import { initBlockTableState } from '../../initValues'

interface BlockSelectors {
  selectorsValue: {
    [index: string]: number | string
  }
}
type BlockTableState = TableWithSelectorProps &
  BlockSelectors & {
    loading: number
    error: { code: string; message: string }
  }
interface BlockTableProps extends IContainerProps {}

const initialState: BlockTableState = initBlockTableState

class BlockTable extends React.Component<BlockTableProps, BlockTableState> {
  readonly state = initialState
  public componentWillMount () {
    this.setParamsFromUrl()
    this.setVisibleHeaders()
    this.setPageSize()
  }

  public componentDidMount () {
    hideLoader()
    this.fetchBlock({
      ...this.state.selectorsValue,
      offset: this.state.pageNo * this.state.pageSize,
      limit: this.state.pageSize
    })
  }
  public componentDidCatch (err) {
    this.handleError(err)
  }

  private onSearch = params => {
    this.setState(state => Object.assign({}, state, { selectorsValue: params }))
    this.fetchBlock(params)
  }
  private setPageSize = () => {
    const { blockPageSize: pageSize } = this.props.config.panelConfigs
    this.setState({ pageSize })
  }
  private setVisibleHeaders = () => {
    // hide invisible header
    this.setState(state => {
      const { headers } = state
      const visibleHeaders = headers.filter(
        header => this.props.config.panelConfigs[`block${header.key[0].toUpperCase()}${header.key.slice(1)}`] !== false
      )
      return { headers: visibleHeaders }
    })
  }

  private setParamsFromUrl = () => {
    const actParams = new URLSearchParams(this.props.location.search)
    const params = {
      numberFrom: '',
      numberTo: '',
      transactionFrom: '',
      transactionTo: '',
      pageNo: ''
    }
    Object.keys(params).forEach(key => {
      const value = actParams.get(key)
      params[key] = value
    })

    const selectorsValue = {}
    Object.keys(this.state.selectorsValue).forEach(key => {
      selectorsValue[key] = params[key] || this.state.selectorsValue[key]
    })

    const pageNo = +params.pageNo >= 1 ? +params.pageNo - 1 : this.state.pageNo

    this.setState({
      selectorsValue,
      pageNo
    })
  }
  private handlePageChanged = newPage => {
    const offset = newPage * this.state.pageSize
    const limit = this.state.pageSize
    this.fetchBlock({
      offset,
      limit,
      ...this.state.selectorsValue
    })
      .then(() => {
        this.setState({ pageNo: newPage })
      })
      .catch(this.handleError)
  }
  private fetchBlock = (params: { [index: string]: string | number } = {}) => {
    this.setState(state => ({ loading: state.loading + 1 }))
    return fetchBlocks(paramsFilter(params))
      .then(({ result }: { result: { blocks: BlockFromServer[]; count: number } }) => {
        this.setState(state => ({
          loading: state.loading - 1,
          count: result.count,
          items: result.blocks.map(block => ({
            key: block.hash,
            height: block.header.number,
            hash: block.hash,
            age: `${Math.round((Date.now() - block.header.timestamp) / 1000)}s ago`,
            transactions: `${block.transactionsCount}`,
            gasUsed: block.header.gasUsed
          }))
        }))
      })
      .catch(err => {
        this.handleError(err)
      })
  }
  private handleError = handleError(this)
  private dismissError = dismissError(this)

  public render () {
    const { headers, items, selectors, selectorsValue, count, pageSize, pageNo, loading, error } = this.state
    const activeParams = paramsFilter(selectorsValue) as any
    const blockSearchText = rangeSelectorText('Number', activeParams.numberFrom, activeParams.numberTo)
    const transactionSearchText = rangeSelectorText(
      'Transaction',
      activeParams.transactionFrom,
      activeParams.transactionTo
    )
    const searchText =
      blockSearchText && transactionSearchText
        ? `${blockSearchText}, ${transactionSearchText}`
        : blockSearchText || transactionSearchText

    return (
      <React.Fragment>
        {loading ? (
          <LinearProgress
            classes={{
              root: 'linearProgressRoot'
            }}
          />
        ) : null}
        <Banner bg={`${process.env.PUBLIC}/banner/banner-Block.png`}>
          {searchText ? `Current Search: ${searchText}` : 'Blocks'}
        </Banner>
        <TableWithSelector
          headers={headers}
          items={items}
          selectorsValue={selectorsValue}
          selectors={selectors}
          onSubmit={this.onSearch}
          count={count}
          pageSize={pageSize}
          pageNo={pageNo}
          handlePageChanged={this.handlePageChanged}
          searchText={searchText}
        />
        <ErrorNotification error={error} dismissError={this.dismissError} />
      </React.Fragment>
    )
  }
}

export default withConfig(BlockTable)
