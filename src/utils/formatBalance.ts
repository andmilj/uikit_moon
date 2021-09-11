import BigNumber from 'bignumber.js'
import contracts from 'config/constants/contracts'
import { QuoteToken } from 'config/constants/types'

export const getBalanceNumber = (balance: BigNumber, decimals = 18) => {
  const displayBalance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals))
  return displayBalance.toNumber()
}

export const getBalanceNumberPrecision = (balance: BigNumber, decimals = 18, precision = 16) => {
  const displayBalance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals))
  return parseInt(displayBalance.toPrecision(precision))
}
export const getBalanceNumberPrecisionFloat = (balance: BigNumber, decimals = 18, precision = 16) => {
  const displayBalance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals))
  return parseFloat(displayBalance.toPrecision(precision))
}
export const getBalanceNumberPrecisionFloatFixed = (balance: BigNumber, decimals = 18, precision = 16) => {
  const displayBalance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals))
  return displayBalance.toFixed(precision)
}
export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed()
}

export interface QuotePrices {
  kcs?: BigNumber
  movr?: BigNumber
  kafe?: BigNumber
  eth?: BigNumber
  bnb?: BigNumber
  moon?: BigNumber
  mswap?: BigNumber
  solar?: BigNumber
  free?: BigNumber
}
export const toDollar = (amt, base, prices: QuotePrices) => {
  switch (base) {
    case contracts.MOVR.toLowerCase():
      return prices.movr.multipliedBy(amt)
    // case contracts.KCS.toLowerCase():
    //   return prices.kcs.multipliedBy(amt)
    // case contracts.KAFE.toLowerCase():
    //   return prices.kafe.multipliedBy(amt)
    case contracts.ETH.toLowerCase():
      return prices.eth.multipliedBy(amt)
    case contracts.BNB.toLowerCase():
      return prices.bnb.multipliedBy(amt)
    case contracts.MOON.toLowerCase():
      return prices.moon.multipliedBy(amt)
    case contracts.MSWAP.toLowerCase():
      return prices.mswap.multipliedBy(amt)
    case contracts.SOLAR.toLowerCase():
      return prices.solar.multipliedBy(amt)
    case contracts.FREE.toLowerCase():
      return prices.free.multipliedBy(amt)

    default:
      return amt // assume 1 dollar per tok
  }
}
export const toDollarQuote = (amt, quote, prices: QuotePrices) => {
  switch (quote) {
    case QuoteToken.MOVR:
      return prices.movr.multipliedBy(amt)
    case QuoteToken.KCS:
      return prices.kcs.multipliedBy(amt)
    // case QuoteToken.KAFE:
    //   return prices.kafe.multipliedBy(amt)
    // case QuoteToken.CAKE:
    //   return prices.kafe.multipliedBy(amt)
    case QuoteToken.ETH:
      return prices.eth.multipliedBy(amt)
    case QuoteToken.BNB:
      return prices.bnb.multipliedBy(amt)
    case QuoteToken.MOON:
      return prices.moon.multipliedBy(amt)
    case QuoteToken.MSWAP:
      return prices.mswap.multipliedBy(amt)
    case QuoteToken.SOLAR:
      return prices.solar.multipliedBy(amt)
    case QuoteToken.FREE:
      return prices.free.multipliedBy(amt)

    default:
      return amt // assume 1 dollar per tok
  }
}

export const isValidBase = (add) => {
  switch (add.toLowerCase()) {
    case contracts.MOVR.toLowerCase():
      return true
    case contracts.USDT.toLowerCase():
      return true
    case contracts.USDC.toLowerCase():
      return true
    case contracts.BUSD.toLowerCase():
      return true
    case contracts.ETH.toLowerCase():
      return true
    case contracts.DAI.toLowerCase():
      return true
    case contracts.MOON.toLowerCase():
      return true
    case contracts.MSWAP.toLowerCase():
      return true
    case contracts.SOLAR.toLowerCase():
      return true
    case contracts.BNB.toLowerCase():
      return true
    case contracts.FREE.toLowerCase():
      return true
    default:
      return false
  }
}
export const getAddressName = (add) => {
  switch (add.toLowerCase()) {
    case contracts.WMOVR.toLowerCase():
      return 'WMOVR'
    case contracts.USDT.toLowerCase():
      return 'USDT'
    case contracts.USDC.toLowerCase():
      return 'USDC'
    case contracts.BUSD.toLowerCase():
      return 'BUSD'
    case contracts.ETH.toLowerCase():
      return 'ETH'
    case contracts.DAI.toLowerCase():
      return 'DAI'
    case contracts.MOON.toLowerCase():
      return 'MOON'
    case contracts.MSWAP.toLowerCase():
      return 'MSWAP'
    case contracts.SOLAR.toLowerCase():
      return 'SOLAR'
    case contracts.BNB.toLowerCase():
      return 'BNB'
    case contracts.FREE.toLowerCase():
      return 'FREE'
    default:
      return false
  }
}

export const removeTrailingZero = (n, decimals = 2) => {
  if (new BigNumber(n).isLessThan(0.01)) {
    return parseFloat(n).toPrecision(4).toLocaleString()
  }
  return parseFloat(n.toFixed(decimals)).toLocaleString()
}

export const mightHide = (n, hide: boolean) => {
  return hide ? '*****' : n
}

export const getLiquidLink = (stakingTokenName, liquidityUrlPathParts) => {
  if (stakingTokenName.toString().includes('SOLARLP')) {
    return `https://solarbeam.io/exchange/add/${liquidityUrlPathParts}`
  }
  if (stakingTokenName.toString().includes('MOONLP')) {
    return `https://swap.moonfarm.in/#/add/${liquidityUrlPathParts}`
  }
  if (stakingTokenName.toString().includes('FREELP')) {
    return `https://freeriver.exchange/#/add/${liquidityUrlPathParts}`
  }
 

  const tok = liquidityUrlPathParts.split('/')[0]
  if (tok === 'ETH') {
    return `https://solarbeam.io/exchange/swap?inputCurrency=ETH`
  }
  return `https://solarbeam.io/exchange/swap?inputCurrency=ETH&outputCurrency=${tok}`
}
