const second = 1
const minute = 60 * second
const hour = 60 * minute
const day = 24 * hour

const tGen = (n, unit) => {
  if (!n) {
    return ' '
  }

  if (n === 1) {
    return ` 1 ${unit}`
  }
  return ` ${n} ${unit}s`
}

export const fromNow = time => {
  let r = (new Date().getTime() - time) / 1000
  const d = Math.floor(r / day)
  const dText = tGen(d, 'day')
  r -= d * day
  const h = Math.floor(r / hour)
  const hText = tGen(h, 'hr')
  r -= h * hour
  const m = Math.floor(r / minute)
  const mText = tGen(m, 'min')
  r -= m * minute
  const s = Math.floor(r / second)
  const sText = tGen(s, 'sec')
  return dText + hText + mText + sText
}

export default {
  fromNow
}
