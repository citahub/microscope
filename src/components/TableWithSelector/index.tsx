import * as React from 'react'
import { Link } from 'react-router-dom'
import { translate } from 'react-i18next'
import { Paper } from '@material-ui/core'
import Pager from 'react-pager'
import { KeyboardArrowLeft, KeyboardArrowRight, SkipNext, SkipPrevious } from '@material-ui/icons'
import { ContractCreation } from '../../initValues'

import Dialog from '../../containers/Dialog'
import paramsFilter from '../../utils//paramsFilter'

const text = require('../../styles/text.scss')
const layout = require('../../styles/layout.scss')
const styles = require('./tableWithSelector.scss')

export enum SelectorType {
  SINGLE,
  MULTIPLE,
  RANGE
}

export interface TableHeaderWithSelector {
  key: string
  text: string
  href?: string
}
export interface TableRowWithSelector {
  key: string
  [index: string]: string
}

export interface TableWithSelectorProps {
  headers: TableHeaderWithSelector[]
  items: TableRowWithSelector[]
  count: number
  pageSize: number
  pageNo: number
  selectors: {
    type: SelectorType
    key: string
    text: string
    items?: { key: string; text: string; check?: any; errorMessage?: any }[]
    check?: any
    errorMessage?: any
  }[]
  selectorsValue?: any
  onSubmit?: any
  handlePageChanged?: (pageNo: number) => void
  // showInOut?: boolean
  showInout?: boolean
  inset?: boolean
  searchText?: string
}

class TableWithSelector extends React.Component<TableWithSelectorProps & { t: (key: string) => string }, any> {
  state = {
    on: false,
    selectorsValue: this.props.selectorsValue,
    selectorsError: {} as any
  }

  showDialog = (on: boolean = false) => (e?: any) => {
    this.setState(state => ({
      on
    }))
  }

  handleSelectorInput = (selector: string) => e => {
    e.persist()
    this.setState(state => {
      const { selectorsValue } = state
      const newSelectorsValue = {
        ...selectorsValue,
        [selector]: e.target.value
      }

      return {
        selectorsValue: newSelectorsValue
      }
    })
  }
  handleSubmit = e => {
    const { selectorsError } = this.state
    let allright = true
    Object.keys(selectorsError).forEach(key => {
      const error = selectorsError[key]
      if (error === undefined || error) {
        allright = false
      }
    })
    if (allright) {
      this.props.onSubmit(this.state.selectorsValue)
      this.showDialog(false)()
    }
  }
  handleSelectorBlur = (selector: string, check: any = () => false) => e => {
    e.persist()
    const {value} = e.target
    const valueError = !check(value)
    this.setState(state => {
      const { selectorsValue, selectorsError } = state
      const newSelectorsValue = {
        ...selectorsValue,
        [selector]: value
      }
      const newSelectorsError = {
        ...selectorsError,
        [selector]: valueError
      }

      return {
        selectorsValue: newSelectorsValue,
        selectorsError: newSelectorsError
      }
    })
  }
  render () {
    const { on, selectorsValue, selectorsError } = this.state
    const { headers, items, selectors, pageSize, pageNo, count, t, inset, searchText } = this.props
    const total = Math.ceil(count / pageSize)
    // const activeParams = paramsFilter(this.props.selectorsValue)
    return (
      <Paper className={`${layout.center} ${inset ? styles.insetContainer : styles.container}`} elevation={0}>
        <Dialog on={!!on} dialogTitle={t('advanced selector')} onClose={this.showDialog(false)} maxWidth="md">
          <div className={styles.dialog}>
            <div className={styles.fields}>
              <div className={styles.titles}>
                {selectors.map(selector => (
                  <span className={styles.title} key={selector.key}>
                    {t(selector.text)}
                  </span>
                ))}
              </div>
              <div className={styles.inputs}>
                {selectors.map(
                  selector =>
                    selector.items ? (
                      <div key={selector.key} className={styles.rangeSelector}>
                        {selector.items.map(item => (
                          <div className={`${styles.inputouter} ${selectorsError[item.key] ? styles.error : ''}`}>
                            <input
                              key={item.key}
                              value={selectorsValue[item.key]}
                              placeholder={t(item.text)}
                              onChange={this.handleSelectorInput(item.key)}
                              onBlur={this.handleSelectorBlur(item.key, item.check)}
                            />
                            {selectorsError[item.key] ? (
                              <div className={`${styles.errormessage}`}>{item.errorMessage}</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div key={selector.key} className={styles.singleSelector}>
                        <div className={`${styles.inputouter} ${selectorsError[selector.key] ? styles.error : ''}`}>
                          <input
                            value={selectorsValue[selector.key]}
                            placeholder={t(selector.text)}
                            onChange={this.handleSelectorInput(selector.key)}
                            onBlur={this.handleSelectorBlur(selector.key, selector.check)}
                          />
                          {selectorsError[selector.key] ? (
                            <div className={`${styles.errormessage}`}>{selector.errorMessage}</div>
                          ) : null}
                        </div>
                      </div>
                    )
                )}
              </div>
            </div>
            <button onClick={this.handleSubmit}>{t('submit')}</button>
          </div>
        </Dialog>
        <div className={styles.options}>
          <span>
            {t('current params')}: {searchText}
          </span>
          <button onClick={this.showDialog(true)}>{t('advanced selector')}</button>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map(header => (
                <th key={header.key}>{t(header.text)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.key}>
                {headers.map(header => (
                  <td key={header.key} className={text.ellipsis} title={item[header.key]}>
                    {header.href === undefined || (header.key === 'to' && [ContractCreation].includes(item.to)) ? (
                      item[header.key] === null ? (
                        '/'
                      ) : (
                        item[header.key]
                      )
                    ) : (
                      <Link
                        to={`${header.href}${item[header.key]}`}
                        href={`${header.href}${item[header.key]}`}
                        className={text.addr}
                      >
                        {item[header.key] === null ? '/' : item[header.key]}
                      </Link>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <Pager
          total={total}
          current={pageNo}
          visiblePages={3}
          titles={{
            first: <SkipPrevious />,
            last: <SkipNext />,
            prev: <KeyboardArrowLeft />,
            next: <KeyboardArrowRight />
          }}
          className={styles.pager}
          onPageChanged={this.props.handlePageChanged}
        />
      </Paper>
    )
  }
}
// export default TableWithSelector
export default translate('microscope')(TableWithSelector)
