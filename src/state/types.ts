import BigNumber from 'bignumber.js'
import { ChefInfo } from 'config/constants/chefs'
import { Address, FarmConfig, GuestConfig, PoolConfig, QuoteToken } from 'config/constants/types'

export interface Farm extends FarmConfig {
  tokenAmount?: BigNumber
  // quoteTokenAmount?: BigNumber
  lpTotalInQuoteToken?: BigNumber
  tokenPriceVsQuote?: BigNumber
  poolWeight?: number
  depositFeeBP?: number
  eggPerBlock?: number
  depositedLp?: BigNumber
  rewardsMultiplier?: number
  userData?: {
    allowance: BigNumber
    tokenBalance: BigNumber
    stakedBalance: BigNumber
    earnings: BigNumber
  }
}
export interface PrivatePoolInfo {
  address?: string[]
  ident2?: string[]
  stakedAmt?: BigNumber[]
  exitMode?: boolean[]
  rewardLockedUp?: BigNumber[]
  nextHarvest?: BigNumber[]
  allowance?: BigNumber[]
  stakingTokenBalance?: BigNumber[]
  capital?: BigNumber[]
  pendingRewards?: BigNumber[]
  vaultType?: string[]
  compoundTime?: any[]
  validVaultIndex?: number
}

export interface Pool extends PoolConfig {
  totalStaked?: BigNumber
  startBlock?: number
  endBlock?: number
  userData?: {
    allowance: BigNumber
    stakingTokenBalance: BigNumber
    stakedBalance: BigNumber
    pendingReward: BigNumber
    privatePoolInfo?: PrivatePoolInfo
    stakedVsBalance?: BigNumber
    pendingVsReward?: BigNumber
    vsAllowance?: BigNumber
    vsBal?: BigNumber
  }
  totalStakedAsQuoteToken?: string
  stakePriceAsQuoteToken?: string
  apy?: string
  vsApy?: BigNumber
  // apyCompound?: string
  // apyCompoundDay?: string
  pricePerShare?: string

  lpToken?: string
  allocPoint?: string
  totalAllocPoint?: string
  rewardMultiplier?: number
  privateStakedBal?: BigNumber

  vStakedBalance?: BigNumber
  vPoolWeight?: BigNumber
  vsEggPerBlock?: string
  vsRewardMultiplier?: number

  // for synthetix vault
  synRewardRate?: string

  // calculated on syrup/portfolio
  stakeBalanceDollar?: BigNumber
  stakeVsBalanceDollar?: BigNumber
  bothTotalStaked?: BigNumber
  bothTotalStakedDollar?: BigNumber

  token0?: string
  token1?: string
}

export interface Guest extends GuestConfig {
  userData?: {
    allowance: BigNumber
    stakingTokenBalance: BigNumber
    stakedBalance: BigNumber

    stakedVsBalance?: BigNumber
    pendingVsReward?: BigNumber
    vsAllowance?: BigNumber
    vsBal?: BigNumber
  }
  stakePriceAsQuoteToken?: string
  totalStaked?: string
  pending?: string
  apy?: string
  pricePerShare?: string

  vStakedBalance?: BigNumber
  vPoolWeight?: BigNumber
  vsEggPerBlock?: string
  vsRewardMultiplier?: number
}

export interface FarmsState {
  data: Farm[]
}

export interface PoolsState {
  data: Pool[]
}
export interface GuestsState {
  data: Guest[]
}
export interface ChefsState {
  data: ChefInfo[]
}
export interface AppConfigState {
  data: AppConfig
}
// Global state

export interface State {
  farms: FarmsState
  pools: PoolsState
  guests: GuestsState
  chefs: ChefsState
  config: AppConfigState
}

export interface AppConfig {
  hideBalances: boolean
  refreshWallet: number

  migration: MigrationConfig
}
export interface MigrationConfig {
  lpToken?: string
  oldChefId?: number
  oldChefPoolId?: number
  selectedSous?: number
  migrateMode?: string // farm||wallet
}
