import contracts from './contracts'
import { FarmConfig, QuoteToken } from './types'

const makeQuote = (add) => {
  return {
    1285: add,
    31337: add,
  }
}

const farms: FarmConfig[] = [
  {
    pid: 0,
    risk: 5,
    lpSymbol: 'KAFE',
    lpAddresses: {
      1285: contracts.cakeKcsPair[process.env.REACT_APP_CHAIN_ID],
      31337: contracts.cakeKcsPair[process.env.REACT_APP_CHAIN_ID],
    },
    tokenSymbol: 'KAFE',
    tokenAddresses: contracts.cake,
    quoteTokenSymbol: QuoteToken.WMOVR,
    quoteTokenAdresses: contracts.wbnb,

    isTokenOnly: true,
    // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
    routerForQuote: contracts.solarRouter,
    farmType: 'native',
  },
  {
    pid: 1,
    risk: 5,
    lpSymbol: 'WMOVR',
    lpAddresses: makeQuote('0xe537f70a8b62204832B8Ba91940B77d3f79AEb81'),
    tokenSymbol: 'WMOVR',
    tokenAddresses: makeQuote(contracts.WMOVR),
    quoteTokenSymbol: QuoteToken.USDC,
    quoteTokenAdresses: makeQuote(contracts.USDC),

    isTokenOnly: true,
    routerForQuote: contracts.solarRouter,
    farmType: 'native',
  },
  {
    pid: 2,
    risk: 5,
    lpSymbol: 'USDC',
    lpAddresses: makeQuote('0xe537f70a8b62204832B8Ba91940B77d3f79AEb81'),
    tokenSymbol: 'USDC',
    tokenAddresses: makeQuote(contracts.USDC),
    quoteTokenSymbol: QuoteToken.WMOVR,
    quoteTokenAdresses: makeQuote(contracts.WMOVR),

    isTokenOnly: true,
    routerForQuote: contracts.solarRouter,
    farmType: 'native',
  },
  {
    pid: 3,
    risk: 5,
    lpSymbol: 'KAFE-MOVR SOLARLP',
    lpAddresses: contracts.cakeKcsPair,
    tokenSymbol: 'KAFE',
    tokenAddresses: contracts.cake,
    quoteTokenSymbol: QuoteToken.WMOVR,
    quoteTokenAdresses: contracts.wbnb,

    isTokenOnly: false,
    // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
    routerForQuote: contracts.solarRouter,
    farmType: 'native',
  },
  {
    pid: 6,
    risk: 5,
    lpSymbol: 'KAFE-MOVR MOONLP',
    lpAddresses: makeQuote("0xe5FFF70b2e265f6784e2300bb88A29D5CB012B8A"),
    tokenSymbol: 'KAFE',
    tokenAddresses: contracts.cake,
    quoteTokenSymbol: QuoteToken.WMOVR,
    quoteTokenAdresses: contracts.wbnb,

    isTokenOnly: false,
    // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
    routerForQuote: contracts.moonRouter,
    farmType: 'native',
  },
  {
    pid: 4,
    risk: 5,
    lpSymbol: 'KAFE-USDC SOLARLP',
    lpAddresses: makeQuote('0xF6d6F801C568C4b4aeFbC2c9859D755318d40fAe'),
    tokenSymbol: 'KAFE',
    tokenAddresses: contracts.cake,
    quoteTokenSymbol: QuoteToken.USDC,
    quoteTokenAdresses: makeQuote(contracts.USDC),

    isTokenOnly: false,
    // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
    routerForQuote: contracts.solarRouter,
    farmType: 'native',
  },
  {
    pid: 5,
    risk: 5,
    lpSymbol: 'MOVR-USDC SOLARLP',
    lpAddresses: makeQuote('0xe537f70a8b62204832B8Ba91940B77d3f79AEb81'),
    tokenSymbol: 'MOVR',
    tokenAddresses: makeQuote(contracts.WMOVR),
    quoteTokenSymbol: QuoteToken.USDC,
    quoteTokenAdresses: makeQuote(contracts.USDC),

    isTokenOnly: false,
    // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
    routerForQuote: contracts.solarRouter,
    farmType: 'native',
    // farmStart: 1631667600,
  },

  
]

export default farms
