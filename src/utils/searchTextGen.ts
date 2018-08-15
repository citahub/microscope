export const rangeSelectorText = (name: string, from: string | number | undefined, to: string | number | undefined) => {
  if (from === undefined && to === undefined) return ''
  return `${name} ${from !== undefined ? `from ${from}` : ''} ${to !== undefined ? `to ${to}` : ''}`
}
export default rangeSelectorText
