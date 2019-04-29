/*
 * @Author: Keith-CY
 * @Date: 2018-07-22 21:35:08
 * @Last Modified by:   Keith-CY
 * @Last Modified time: 2018-07-22 21:35:08
 */

export default params => {
  const p = {}
  Object.keys(params).forEach(key => {
    if (params[key] !== '' && typeof params[key] !== 'undefined') {
      p[key] = params[key]
    }
  })
  return p
}

/*
 * @Author: wyy
 * @Date: 2019-04-28 20:07:00
 * @Last Modified by:   wyy
 * @Last Modified time: 2019-04-28 20:07:00
 */

// findIndex might not support by some browser
const findIndex = (array:Array<string>, element:string): number => {
  let resultIndex = -1 // not found
  if (array && array.length > 0 && element) {
    for (let i = 0; i < array.length; i++) {
      if (element === array[i]) {
        resultIndex = i
        break
      }
    }
  }
  return resultIndex
}

const oldParams = ['blockFrom', 'blockTo', 'transactionFrom', 'transactionTo', ]
const newParams = ['block_from', 'block_to', 'min_transaction_count', 'max_transaction_count', ]
export const paramsBlocksV2Adapter = params => {
  const p = {}
  Object.keys(params).forEach(key => {
    if (params[key] !== '' && typeof params[key] !== 'undefined') {
      const index = findIndex(oldParams, key)
      if (index > -1) {
        p[newParams[index]] = params[key]
      } else {
        p[key] = params[key]
      }
    }
  })
  return p
}
