import contracts from './contracts'
import { FarmConfig, QuoteToken } from './types'

const makeQuote = (add) => {
  return {
    1285: add,
    31337: add,
  }
}

const farms: FarmConfig[] = [
  // {
  //   pid: 0,
  //   risk: 5,
  //   lpSymbol: 'KAFE',
  //   lpAddresses: {
  //     1285: contracts.cakeKcsPair[process.env.REACT_APP_CHAIN_ID],
  //     31337: contracts.cakeKcsPair[process.env.REACT_APP_CHAIN_ID],
  //   },
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.KCS,
  //   quoteTokenAdresses: contracts.wbnb,

  //   isTokenOnly: true,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
  //   farmType: 'native',
  // },
  // {
  //   pid: 1,
  //   risk: 5,
  //   lpSymbol: 'KAFE-KCS KUDEXLP',
  //   lpAddresses: contracts.cakeKcsPair,
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.KCS,
  //   quoteTokenAdresses: contracts.wbnb,

  //   isTokenOnly: false,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
  //   farmType: 'native',
  // },
  // {
  //   pid: 2,
  //   risk: 5,
  //   lpSymbol: 'KAFE-USDT KUDEXLP',
  //   lpAddresses: {
  //     1285: '0x7282115f63C162F76eb382c0A8B7fE631BDBaee1',
  //     31337: '0x7282115f63C162F76eb382c0A8B7fE631BDBaee1',
  //   },
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.USDT,
  //   quoteTokenAdresses: contracts.quoteUsdt,

  //   isTokenOnly: false,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
  //   farmType: 'native',
  // },
  // {
  //   pid: 3,
  //   risk: 5,
  //   lpSymbol: 'KAFE-USDC KUDEXLP',
  //   lpAddresses: {
  //     1285: '0xf9Bd0b2D266cD521dd708430e7a791Eb62df4d04',
  //     31337: '0xf9Bd0b2D266cD521dd708430e7a791Eb62df4d04',
  //   },
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.USDC,
  //   quoteTokenAdresses: contracts.quoteUsdc,

  //   isTokenOnly: false,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
  //   farmType: 'native',
  // },

  // {
  //   pid: 14,
  //   risk: 5,
  //   lpSymbol: 'KAFE-KCS KUSWAPLP',
  //   lpAddresses: makeQuote('0xCD42aDaA456f1B95Cd4ad0aDFB1095762ee4225f'),
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.KCS,
  //   quoteTokenAdresses: contracts.wbnb,

  //   isTokenOnly: false,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0xa58350d6dee8441aa42754346860e3545cc83cda',
  //   farmType: 'native',
  // },
  // {
  //   pid: 15,
  //   risk: 5,
  //   lpSymbol: 'KAFE-USDT KUSWAPLP',
  //   lpAddresses: makeQuote('0xd898Ed3C4d5320196F53B8f35895d00272dE020c'),
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.USDT,
  //   quoteTokenAdresses: contracts.quoteUsdt,

  //   isTokenOnly: false,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0xa58350d6dee8441aa42754346860e3545cc83cda',
  //   farmType: 'native',
  // },
  // {
  //   pid: 16,
  //   risk: 5,
  //   lpSymbol: 'KAFE-KUS KUSWAPLP',
  //   lpAddresses: makeQuote('0xBDb51F561793BD36a9B02D45f16337B4331442BA'),
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.KUS,
  //   quoteTokenAdresses: contracts.quoteKus,

  //   isTokenOnly: false,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0xa58350d6dee8441aa42754346860e3545cc83cda',
  //   farmType: 'native',
  // },
  // {
  //   pid: 17,
  //   risk: 5,
  //   lpSymbol: 'KAFE-KUD KUDEXLP',
  //   lpAddresses: makeQuote('0xf2A806e7AA5b9CC663021A11E3b224Ade72b23F3'),
  //   tokenSymbol: 'KUD',
  //   tokenAddresses: makeQuote(contracts.KUD),
  //   quoteTokenSymbol: QuoteToken.KAFE,
  //   quoteTokenAdresses: makeQuote(contracts.KAFE),

  //   isTokenOnly: false,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
  //   farmType: 'native',
  // },
  // {
  //   pid: 1000,
  //   risk: 5,
  //   lpSymbol: 'KAFE',
  //   lpAddresses: contracts.cakeKcsPair,
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.KCS,
  //   quoteTokenAdresses: contracts.wbnb,

  //   isTokenOnly: true,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
  //   farmType: 'guest',
  //   customPid: 0,
  //   customMasterChef: '0x2B2A12F4Be4b06681243cD9D4cBF03Bc096a169E',
  //   customRewardToken: '0xbd451b952de19f2c7ba2c8c516b0740484e953b2',
  //   customRewardTokenSymbol: 'KUD',
  //   farmEnd: 1629306000,
  //   farmStart: 1628701200,
  // },
  // {
  //   pid: 1001,
  //   risk: 5,
  //   lpSymbol: 'KAFE',
  //   lpAddresses: contracts.cakeKcsPair,
  //   tokenSymbol: 'KAFE',
  //   tokenAddresses: contracts.cake,
  //   quoteTokenSymbol: QuoteToken.KCS,
  //   quoteTokenAdresses: contracts.wbnb,
  //   isTokenOnly: true,
  //   // lpBaseTokenAddress: "0x4446fc4eb47f2f6586f9faab68b3498f86c07521", // wkcs
  //   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
  //   farmType: 'guest',
  //   customMasterChef: '0x5E269C636E281f2ADE30E8BFdF53d387E8861214',
  //   customRewardToken: contracts.WMOVR,
  //   customRewardTokenSymbol: 'WKCS',
  //   customPid: 0,
  //   farmEnd: 1630083600,
  //   farmStart: 1629478800,
  // },
]

export default farms
