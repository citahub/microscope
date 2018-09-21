/*
 * @Author: Keith-CY
 * @Date: 2018-07-22 21:11:41
 * @Last Modified by: Keith-CY
 * @Last Modified time: 2018-08-03 14:23:19
 */

import axios, { AxiosResponse } from 'axios'
import { initServerList } from '../initValues'
import ErrorTexts from '../typings/errors'

const baseURL = window.localStorage.getItem('chainIp') || initServerList[0]

const axiosIns = axios.create({
  baseURL
})

interface Params {
  [index: string]: string | number
}

export const fetch10Transactions = () =>
  axiosIns
    .get('api/transactions')
    .then((res: AxiosResponse) => res.data)
    .catch(() => {
      throw new Error(ErrorTexts.CACHE_SERVER_NOT_AVAILABLE)
    })

export const fetchBlocks = (params: Params) =>
  axiosIns
    .get('api/blocks', { params })
    .then((res: AxiosResponse) => res.data)
    .catch(() => {
      throw new Error(ErrorTexts.CACHE_SERVER_NOT_AVAILABLE)
    })

export const fetchTransactions = (params: Params) =>
  axiosIns
    .get('api/transactions', { params })
    .then((res: AxiosResponse) => res.data)
    .catch(() => {
      throw new Error(ErrorTexts.CACHE_SERVER_NOT_AVAILABLE)
    })

export const fetchStatistics = params =>
  axiosIns
    .get('/api/statistics', { params })
    .then((res: AxiosResponse) => res.data)
    .catch(() => {
      throw new Error(ErrorTexts.CACHE_SERVER_NOT_AVAILABLE)
    })

export const fetchServerList = () =>
  axios
    .get(`${process.env.PUBLIC}/defaultServerList.json?${new Date().getTime}`)
    .then((res: AxiosResponse) => res.data)
    .catch(() => {
      throw new Error(ErrorTexts.SERVER_LIST_NOT_FOUND)
    })

export const fetchMetadata = ip =>
  axios
    .post(ip.startsWith('http') ? ip : `https://${ip}`, {
      jsonrpc: '2.0',
      method: 'getMetaData',
      params: ['latest'],
      id: 1
    })
    .then((res: AxiosResponse) => res.data)
    .catch(() => {
      throw new Error(ErrorTexts.CACHE_SERVER_NOT_AVAILABLE)
    })
