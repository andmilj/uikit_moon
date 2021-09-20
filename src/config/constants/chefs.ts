import KUSWAP_CHEF_ABI from 'config/abi/kuswap_chef.json'
import MASTERCHEF_ABI from 'config/abi/masterchef.json'
import KUDEXMASTERCHEF_ABI from 'config/abi/kudex_chef.json'
import BigNumber from 'bignumber.js'
import { PrivatePoolInfo } from 'state/types'
import contracts from './contracts'

export interface ChefConfig {
  chefId: number
  image: string
  name: string
  masterchefAddress?: string
  factories: string[]
  rewardToken: string
  poolIds?: number[]
  perBlockSignature: string
  hasDepositFee?: boolean // has deposit fee on some pools
  depositedCakeSignature?: string
  pendingRewardsSignature: string
  type: ChefType
  quoteRouters?: string[] // routers to use in finding reward token price
  referralMode?: boolean
  stakingMode?: boolean
  rewardTokenSymbol?: string
  projectLink?: string
  customRewardMultiplier?: number

  // for synthetix
  poolContracts?: string[]
  
}
export enum ChefType {
  MASTERCHEF,
  VAULT,
  MASTERCHEF_SYNTHETIX
}

export interface ChefInfo extends ChefConfig {
  // type: ChefType
  // farms
  totalAllocPoint?: number
  perBlock?: number
  rewardsMultiplier?: number
  depositedCake?: string
  pools?: ChefPoolInfo[]
  userData?: ChefPoolInfoUser
}
export interface ChefInfoDict {
  [chefId: number]: ChefInfo
}
export interface ChefInfoUser {
  [id: number]: ChefPoolInfoUser
}
export interface ChefPoolInfoUser {
  [pid: string]: ChefPoolUserData
}

export interface ChefPoolUserData {
  allowance?: string
  tokenBalance?: string
  stakedBalance?: string
  earnings?: string
}

export interface ChefPoolInfo {
  pid: string
  isLP: boolean
  token: string
  baseToken: string
  quoteLp: string
  tokString: string
  quoteString: string

  lpToken: string
  allocPoint: string
  depositFee: string

  tokenBalanceLP: string
  quoteTokenBlanceLP: string
  lpTokenBalanceMC: string
  lpTotalSupply: string
  tokenDecimals: string
  quoteTokenDecimals: string

  tokenAmount: string
  lpTotalInQuoteToken: string
  tokenPriceVsQuote: string
  poolWeight: string
  multiplier: string
  depositedLp: string

  perBlock: string
  // userData?: ChefPoolUserData
}

// kukafe chefs
// kukafe vaults

// kudex, kuswap, boneswap, kandy, kubeans
export const getAbiFromChef = (chef) => {
  if (!chef) {
    return MASTERCHEF_ABI // JSON.parse(JSON.stringify(MASTERCHEF_ABI))
  }
  switch (chef.name) {
    case 'solarbeam': // deposit fee
    case 'moonfarm': // deposit fee
    case 'moonkafe': // deposit fee
      return MASTERCHEF_ABI //  JSON.parse(JSON.stringify(MASTERCHEF_ABI))
      // return JSON.parse(JSON.stringify(KUSWAP_CHEF_ABI))
      // return JSON.parse(JSON.stringify(KUDEXMASTERCHEF_ABI))
    default:
      return MASTERCHEF_ABI // JSON.parse(JSON.stringify(MASTERCHEF_ABI))
  }
}
export const chefs: ChefConfig[] = [
  {
    chefId: 0,
    type: ChefType.MASTERCHEF,
    image: '',
    name: 'solarbeam',
    projectLink: 'https://solarbeam.io',
    masterchefAddress: '0xf03b75831397D4695a6b9dDdEEA0E578faa30907',
    rewardToken: contracts.SOLAR,
    rewardTokenSymbol: 'SOLAR',
    // poolIds: [2],
    poolIds: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    perBlockSignature: contracts.PERBLOCK_SOLAR,
    pendingRewardsSignature: contracts.PENDING_SOLAR,
    factories: ['0x049581aEB6Fe262727f290165C29BDAB065a1B68'],
    // depositedCakeSignature: 'totalSolarInPools()',
    quoteRouters: ['0xdF71f363940A2298e831F18f44266C80015c8Dfd'],
    // quoteRouters: ['0xAA30eF758139ae4a7f798112902Bf6d65612045f'],
    referralMode: false,
    stakingMode: false,
    hasDepositFee: true,
  },
  {
    chefId: 1,
    type: ChefType.MASTERCHEF,
    image: '',
    name: 'solarbeam vault',
    projectLink: 'https://solarbeam.io',
    masterchefAddress: '0x7e6E03822D0077F3C417D33caeAc900Fc2645679',
    rewardToken: contracts.SOLAR,
    rewardTokenSymbol: 'SOLAR',
    // poolIds: [2],
    poolIds: [0],
    perBlockSignature: contracts.PERBLOCK_SOLAR,
    pendingRewardsSignature: contracts.PENDING_SOLAR,
    factories: ['0x049581aEB6Fe262727f290165C29BDAB065a1B68'],
    // depositedCakeSignature: 'totalSolarInPools()',
    quoteRouters: ['0xdF71f363940A2298e831F18f44266C80015c8Dfd'],
    // quoteRouters: ['0xAA30eF758139ae4a7f798112902Bf6d65612045f'],
    referralMode: false,
    stakingMode: false,
    hasDepositFee: true,
  // },

  },
  {
    chefId: 2,
    type: ChefType.MASTERCHEF,
    image: '',
    name: 'moonfarm',
    projectLink: 'https://app.moonfarm.in/',
    masterchefAddress: '0x78aa55ce0b0dc7488d2c38bd92769f4d0c8196ff',
    rewardToken: contracts.MOON,
    rewardTokenSymbol: 'MOON',
    poolIds: [
      // 12 (eth), 15 (btc) removed as there is no liq pool

      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 
      10, 12, 13, 14, 16, 17, 18, 19,
      20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 
      30, 31
    
    ],
    perBlockSignature: contracts.PERBLOCK_MOON,
    pendingRewardsSignature: contracts.PENDING_MOON,
    factories: ['0x056973f631a5533470143bb7010c9229c19c04d2'],
    // depositedCakeSignature: 'totalSolarInPools()',
    quoteRouters: ['0x120999312896F36047fBcC44AD197b7347F499d6'],
    referralMode: false,
    stakingMode: false,
    hasDepositFee: true,
  },

  {
    chefId: 3,
    type: ChefType.MASTERCHEF,
    image: '',
    name: 'moonkafe',
    projectLink: 'https://moon.kafe.finance/',
    masterchefAddress: '0x91aD62286cb69d2C6abdB952564e0EFEA082869c',
    rewardToken: contracts.KAFE,
    rewardTokenSymbol: 'KAFE',
    poolIds: [
      // 12 (eth), 15 (btc) removed as there is no liq pool
      0, 1, 2, 3, 4, 5, 6
    ],
    perBlockSignature: contracts.PERBLOCK_KAFE,
    pendingRewardsSignature: contracts.PENDING_KAFE,
    factories: ['0x049581aEB6Fe262727f290165C29BDAB065a1B68'],
    // depositedCakeSignature: 'totalSolarInPools()',
    quoteRouters: ['0xdF71f363940A2298e831F18f44266C80015c8Dfd'],
    referralMode: false,
    stakingMode: false,
    hasDepositFee: true,
  },

  {
    chefId: 4,
    type: ChefType.MASTERCHEF_SYNTHETIX,
    image: '',
    name: 'freeriver',
    projectLink: 'https://freeriver.exchange',
    // masterchefAddress: '0x91aD62286cb69d2C6abdB952564e0EFEA082869c',
    rewardToken: contracts.FREE,
    rewardTokenSymbol: 'FREE',
    poolContracts: [
      "0x31341761A726585257067D15967AD301187504B2",
      "0xfA382b7fb23C558136602a2D4C09D527ea76bb5A",
      "0x7355894158181566BCB6CF09c0A6fEbA13b9c2D3"
    ], 
    perBlockSignature: "rewardRate()",
    pendingRewardsSignature: "earned(address)",
    factories: ['0x52abD262B13bef4E65Ff624880E8A0595a17af48'],
    // depositedCakeSignature: 'totalSolarInPools()',
    quoteRouters: ['0x0d0ac50741f2Aed4D19325bE385EBeFe49C0d186'],
  },



]
export default chefs
