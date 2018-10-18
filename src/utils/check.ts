import * as web3utils from 'web3-utils'
import transitions from '@material-ui/core/styles/transitions'

if (!Number.isInteger) {
  Number.isInteger = function (value) {
    /* eslint-disable */
    return typeof value === 'number' && isFinite(value) && Math.floor(value) === value
    /* eslint-enable */
  }
}

const checkDigitsString = number => {
  console.log('checkDigitsString', number)
  let n = number
  if (typeof n === 'string') {
    n = Number(n)
  }
  return Number.isInteger(n)
}

const checkAddress = address => web3utils.isAddress(address)

const checkHeight = height => {
  let h = height
  if (checkDigitsString(h)) {
    return true
  }
  h = `0x${height}`
  return checkDigitsString(h)
}

const checkTransaction = transitionHash => {
  let hx = transitionHash.toString()
  if (hx.slice(0, 2) !== '0x') {
    hx = `0x${hx}`
  }
  return hx.length === 66 && checkDigitsString(hx)
}

const check = {
  address: checkAddress,
  height: checkHeight,
  digits: checkDigitsString,
  transaction: checkTransaction
}

const errorMessages = {
  address: 'Please enter Address here',
  // height: 'Please enter only Address',
  digits: 'Please enter only digits'
  // transaction: 'Please enter only transaction'
}

export { errorMessages }
export default check
