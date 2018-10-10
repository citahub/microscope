const copyToClipboard = (text: string = '') => {
  const textField = document.createElement('textarea')
  textField.innerText = text
  document.body.appendChild(textField)
  textField.select()
  const success = document.execCommand('copy')
  textField.remove()
  return success
}

export {
  copyToClipboard
}

export default copyToClipboard
