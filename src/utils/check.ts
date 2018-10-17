import * as web3utils from 'web3-utils'

const checkAddress = address => web3utils.isAddress(address)
// const checkHeight = address => web3utils.isAddress(address)
// const checkTransaction = address => web3utils.isAddress(address)
const checkDigitsString = number => {
  console.log('checkDigitsString', number)
  let n = number
  if (typeof n === 'string') {
    n = Number(n)
  }
  return Number.isInteger(n)
}

const check = {
  address: checkAddress,
  // height: checkHeight,
  digits: checkDigitsString,
  // transaction: checkTransaction
}

const errorMessages = {
  address: 'Please enter Address here',
  // height: 'Please enter only Address',
  digits: 'Please enter only digits'
  // transaction: 'Please enter only transaction'
}

export { errorMessages }
export default check
