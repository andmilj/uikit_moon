export type IfoStatus = 'coming_soon' | 'live' | 'finished'

export interface Ifo {
  id: string
  isActive: boolean
  address: string
  name: string
  subTitle?: string
  description?: string
  launchDate: string
  launchTime: string
  saleAmount: string
  raiseAmount: string
  cakeToBurn: string
  projectSiteUrl: string
  currency: string
  currencyAddress: string
  tokenDecimals: number
  releaseBlockNumber: number
}

export enum QuoteToken {
  'BNB' = 'BNB',
  'CAKE' = 'CAKE',
  'ETH' = 'ETH',
  'SYRUP' = 'SYRUP',
  'BUSD' = 'BUSD',
  'TWT' = 'TWT',
  'UST' = 'UST',
  'KCS' = 'KCS',
  'WKCS' = 'WKCS',
  'USDT' = 'USDT',
  'KAFE' = 'KAFE',
  'USDC' = 'USDC',
  'WMOVR' = 'WMOVR',
  'MOVR' = 'MOVR',
  'MOON' = 'MOON',
  'MSWAP' = 'MSWAP',
  'SOLAR' = 'SOLAR',
  'FREE' = 'FREE',
  'RIB' = 'RIB',
  'DAI' = 'DAI',
  'mCAKE' = 'mCAKE',
  'RivrDoge' = 'RivrDoge',

  'SOLARMOVRSOLARLP' = 'SOLAR-MOVR SOLARLP',

  'RIBSOLARSOLARLP' = 'RIB-SOLAR SOLARLP',
  'RIBMOVRSOLARLP' = 'RIB-MOVR SOLARLP',
  'USDCMOVRSOLARLP' = 'USDC-MOVR SOLARLP',
  'SOLARUSDCSOLARLP' = 'SOLAR-USDC SOLARLP',
  'DAIUSDCSOLARLP' = 'DAI-USDC SOLARLP',
  'BUSDUSDCSOLARLP' = 'BUSD-USDC SOLARLP',
  'ETHUSDCSOLARLP' = 'ETH-USDC SOLARLP',
  'BNBBUSDSOLARLP' = 'BNB-BUSD SOLARLP',

  'MOONMOVRMOONLP' = 'MOON-MOVR MOONLP',
  'MSWAPMOVRMOONLP' = 'MSWAP-MOVR MOONLP',
  'MOONUSDCMOONLP' = 'MOON-USDC MOONLP',
  'MOVRUSDCMOONLP' = 'MOVR-USDC MOONLP',
  'MSWAPUSDCMOONLP' = 'MSWAP-USDC MOONLP',
  'BUSDUSDCMOONLP' = 'BUSD-USDC MOONLP',
  'DAIUSDCMOONLP' = 'DAI-USDC MOONLP',
  'USDTUSDCMOONLP' = 'USDT-USDC MOONLP',
  'BEANSMOVRMOONLP' = 'BEANS-MOVR MOONLP',
  
  'KAFEMOVRSOLARLP' = 'KAFE-MOVR SOLARLP',
  'KAFEUSDDCSOLARLP' = 'KAFE-USDC SOLARLP',
  'KAFEMOVRMOONLP' = 'KAFE-MOVR MOONLP'
}

export enum PoolCategory {
  'COMMUNITY' = 'Community',
  'CORE' = 'Core',
  'VAULT' = 'Vault',
  'PRIVATEVAULT' = 'Private Vault',
  'SYNTHETIX_VAULT' = 'Synthetix Vault',
  'GUESTVAULT' = 'Guest Vault',
  'BINANCE' = 'Binance', // Pools using native BNB behave differently than pools using a token
}

export interface Address {
  97?: string
  56?: string
  321?: string
  1285?: string
  31337?: string
}
export interface GuestConfig {
  sousId: number
  image?: string
  tokenName: string
  stakingTokenName: QuoteToken
  stakingTokenAddress?: string
  boostFinished?: boolean

  contractAddress: Address
  strategy: string
  poolCategory: PoolCategory
  projectLink: string
  projectName: string
  isFinished?: boolean
  lpBaseTokenAddress?: string
  routerForQuote?: string
  hidden?: boolean
  disclaimer?: string
  disclaimerPositive?: string
  disclaimerNegative?: string

  positiveTooltip?: string
  negativeTooltip?: string
  depositFee?: number

  excludeFromTvl?: boolean

  vaultShareFarmPid?: number
  vaultShareFarmContract?: string
  vaultShareRewardToken?: string

  vaultShareToken?: {
    tokenAddresses: Address
    quoteTokenSymbol: QuoteToken
    quoteTokenAdresses: Address
  }
}

export interface FarmConfig {
  pid: number
  lpSymbol: string
  lpAddresses: Address
  tokenSymbol: string
  tokenAddresses: Address
  quoteTokenSymbol: QuoteToken
  quoteTokenAdresses: Address
  multiplier?: string
  isTokenOnly?: boolean
  isCommunity?: boolean
  risk: number
  dual?: {
    rewardPerBlock: number
    earnLabel: string
    endBlock: number
  }
  // lpBaseTokenAddress: string
  routerForQuote: string
  farmType: string
  customMasterChef?: string
  customRewardToken?: string
  customRewardTokenSymbol?: string
  farmStart?: number
  farmEnd?: number
  customPid?: number
}

export interface PoolConfig {
  sousId: number
  image?: string
  tokenName: string
  stakingTokenName: QuoteToken
  // stakingLimit?: number
  stakingTokenAddress?: string
  // vaultAddress?: string
  contractAddress: Address
  poolCategory: PoolCategory
  projectLink: string
  projectName: string
  tokenPerBlock?: string
  // sortOrder?: number
  // harvest?: boolean
  isFinished?: boolean
  boostFinished?: boolean
  // tokenDecimals: number

  isLP?: boolean
  lpBaseTokenAddress?: string
  // pendingRewardsFunc?: string
  // emissionPerBlockFunc?: string
  rewardToken?: string
  rewardTokenName?: QuoteToken
  routerForQuote?: string
  poolId?: number
  underlyingMasterChef?: string
  masterChefAbi?: any
  hidden?: boolean
  ident?: string
  disclaimer?: string
  disclaimerPositive?: string
  disclaimerNegative?: string
  positiveTooltip?: string
  negativeTooltip?: string

  depositFee?: number
  vaultFactory?: string
  vaultFactoryStakingMode?: boolean
  vaultFactoryReferralMode?: boolean
  pendingRewardsFunc?: string
  tokenPerBlockFunc?: string
  depositedTokenFunc?: string
  tokenPerBlockMultiplier?: number

  vaultShareFarmPid?: number
  vaultShareFarmContract?: string
  vaultShareRewardToken?: string

  vaultShareToken?: {
    tokenAddresses: Address
    quoteTokenSymbol: QuoteToken
    quoteTokenAdresses: Address
  }
  excludeFromTvl?: boolean

  // for synthetix farming contract
  rewardRateFunction?: string
}

export type Nft = {
  name: string
  description: string
  originalImage: string
  previewImage: string
  blurImage: string
  sortOrder: number
  bunnyId: number
}
