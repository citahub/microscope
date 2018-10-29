const Image = {
  logo: `${process.env.PUBLIC}/images/microscopeLogo.svg`,
  extend: `${process.env.PUBLIC}/microscopeIcons/expand.png`,
  gas: `${process.env.PUBLIC}/microscopeIcons/petrol_barrel.svg`,
  banner: {
    block: `${process.env.PUBLIC}/banner/banner-Block.png`,
    transaction: `${process.env.PUBLIC}/banner/banner-Transaction.png`
  },
  icon: {
    block: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/block.svg`,
    transaction: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/transaction.svg`,
    statistics: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/statistics.svg`,
    config: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/config.svg`
  },
  iconActive: {
    block: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/block_active.svg`,
    transaction: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/transaction_active.svg`,
    statistics: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/statistics_active.svg`,
    config: `${process.env.PUBLIC}/microscopeIcons/mobile_navs/config_active.svg`
  }
}

export default Image
