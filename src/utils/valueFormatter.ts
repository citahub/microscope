// export default (value: number | string) => (+value > 1e9 ? `${+value / 1e9} Coins` : `${+value} Quota`)
export default (value: number | string) => `${+value}`
