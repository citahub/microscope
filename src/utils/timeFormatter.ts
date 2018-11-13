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
  if (r < 0) {
    return 'Time Error'
  }
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
  const t = dText + hText + mText + sText
  return t.trim().length ? t : '0 sec'
}

export const parsedNow = time => {
  let r = (new Date().getTime() - time) / 1000
  if (r < 0) {
    return 'Time Error'
  }
  const d = Math.floor(r / day)
  r -= d * day
  const h = Math.floor(r / hour)
  r -= h * hour
  const m = Math.floor(r / minute)
  r -= m * minute
  const s = Math.floor(r / second)
  return {
    day: d,
    hour: h,
    minute: m,
    second: s,
  }
}

export const formatedAgeString = time => {
  const t = fromNow(time)
  if (t === 'Time Error') {
    return t
  }
  return `${t} ago`
}

export const timeFormatter = (time, withDate = false): string => {
  const _time = new Date(+time)
  return _time[withDate ? 'toLocaleString' : 'toLocaleTimeString']('zh', { hour12: false, })
}

export default {
  fromNow,
  timeFormatter,
}
