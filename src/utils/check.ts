import * as web3utils from 'web3-utils'
import transitions from '@material-ui/core/styles/transitions'

const startsWith0x = string => /^0x/i.test(string)

/* eslint-disable */
const checkDigits = number => typeof number === 'number' && isFinite(number) && Math.floor(number) === number
/* eslint-enable */

const checkDigitsString = number => {
  let value = number
  if (typeof value === 'string') {
    value = Number(value)
  }
  return checkDigits(value)
}

const format0x = string => {
  let value = string
  if (!value) {
    return value
  }
  if (!startsWith0x(value)) {
    if (checkDigitsString(value)) {
      value = `0x${Number(value).toString(16)}`
    } else {
      value = `0x${value}`
    }
  }
  return value
}

const checkDigitsStringDec = number => {
  const value = number
  if (startsWith0x(value)) {
    return false
  }
  return checkDigitsString(value)
}

const checkAddress = address => web3utils.isAddress(format0x(address))

const checkHeight = height => checkDigitsString(format0x(height))

const checkTransaction = transitionHash => {
  const value = format0x(transitionHash).toString()
  return value.length === 66 && checkDigitsString(value)
}

const check = {
  address: checkAddress,
  height: checkHeight,
  digits: checkDigitsString,
  digitsDec: checkDigitsStringDec,
  transaction: checkTransaction,
  format0x
}

const errorMessages = {
  address: 'Please enter Address here',
  // height: 'Please enter only Address',
  digits: 'Please enter only digits'
  // transaction: 'Please enter only transaction'
}

export { errorMessages, format0x }
export default check
