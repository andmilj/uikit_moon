import KUSCHEF_ABI from 'config/abi/kuschef.json'
import KUDEXMASTERCHEF_ABI from 'config/abi/kudex_chef.json'
import SYNCHEF_ABI from 'config/abi/synchef.json'
import BigNumber from 'bignumber.js'
import { PoolConfig, QuoteToken, PoolCategory } from './types'
import contracts from './contracts'

const SOLAR_INFO = {
  poolCategory: PoolCategory.VAULT,
  isFinished: false,
  projectLink: 'https://solarbeam.io',
  projectName: 'solarbeam',

  isLP: true,
  rewardToken: contracts.SOLAR,
  routerForQuote: contracts.solarRouter,
  underlyingMasterChef: '0xf03b75831397D4695a6b9dDdEEA0E578faa30907',
  masterChefAbi: JSON.parse(JSON.stringify(KUDEXMASTERCHEF_ABI)),
  // sortOrder: 1,
  // tokenPerBlockMultiplier: 0.857,
  tokenPerBlockFunc: contracts.PERBLOCK_SOLAR,
  // hidden: true,
}
const MOONFARM_INFO = {
  poolCategory: PoolCategory.VAULT,
  isFinished: false,
  projectLink: 'https://app.moonfarm.in/',
  projectName: 'moonfarm',

  isLP: true,
  rewardToken: contracts.MOON,
  routerForQuote: contracts.moonRouter,
  underlyingMasterChef: '0x78aa55ce0b0dc7488d2c38bd92769f4d0c8196ff',
  masterChefAbi: KUDEXMASTERCHEF_ABI,
  // sortOrder: 1,
  // tokenPerBlockMultiplier: 0.857,
  tokenPerBlockFunc: contracts.PERBLOCK_MOON,
  // hidden: true,
}
const MOONKAFE_INFO = {
  poolCategory: PoolCategory.VAULT,
  isFinished: false,
  projectLink: 'https://moon.kafe.finance/',
  projectName: 'moonkafe',

  isLP: true,
  rewardToken: contracts.KAFE,
  routerForQuote: contracts.solarRouter,
  underlyingMasterChef: '0x91aD62286cb69d2C6abdB952564e0EFEA082869c',
  masterChefAbi: KUDEXMASTERCHEF_ABI,
  // sortOrder: 1,
  // tokenPerBlockMultiplier: 0.857,
  tokenPerBlockFunc: contracts.PERBLOCK_KAFE,
  // hidden: true,
}
const FREE_INFO = {
  poolCategory: PoolCategory.SYNTHETIX_VAULT,
  isFinished: false,
  projectLink: 'https://freeriver.exchange/',
  projectName: 'freeriver',

  isLP: true,
  rewardToken: contracts.FREE,
  routerForQuote: '0x0d0ac50741f2Aed4D19325bE385EBeFe49C0d186',
  masterChefAbi: SYNCHEF_ABI,
  // sortOrder: 1,
  // tokenPerBlockMultiplier: 0.857,
  tokenPerBlockFunc: contracts.PERBLOCK_KAFE,
  rewardRateFunction: 'rewardRate()',
  // hidden: true,
}
const DRAGON_INFO = {
  poolCategory: PoolCategory.VAULT,
  isFinished: false,
  projectLink: 'https://dragon.freeriver.exchange',
  projectName: 'dragon',

  isLP: true,
  rewardToken: contracts.DRAGON,
  routerForQuote: contracts.freeRouter,
  underlyingMasterChef: '0x71996CDc2874978C8fFE7580F6d2f5F11238Ecc2',
  masterChefAbi: KUDEXMASTERCHEF_ABI,
  // sortOrder: 1,
  // tokenPerBlockMultiplier: 0.857,
  tokenPerBlockFunc: contracts.PERBLOCK_DRAGON,
  // hidden: true,
}
// const KUDEX_INFO = {
//   poolCategory: PoolCategory.PRIVATEVAULT,
//   isFinished: false,
//   projectLink: 'https://kudex.finance',
//   projectName: 'kudex',

//   isLP: true,
//   rewardToken: '0xBd451b952dE19F2C7bA2c8c516bu0740484E953B2',
//   rewardTokenName: QuoteToken.KUD,
//   routerForQuote: '0x6074e20633d2d8fbdf82119867a81581cabe06dd',
//   underlyingMasterChef: '0x243e46d50130f346bede1d9548b41c49c6440872',
//   masterChefAbi: KUSCHEF_ABI,
//   // pendingRewardsFunc: 'pendingKUS',
//   // tokenDecimals: 18,

//   // vaultFactory: "0x95Bc9f3e093A8f4dDBBdE546386d96C460e0Dc3f", // v1
//   // vaultFactory: "0xA164DEB841dDfb2e257226df48961b315dFBf0f9", // v2
//   // vaultFactory: "0x2D37195232b67C368EED0c055409f474515364FF", // v2a
//   // vaultFactory: "0xeF21B7202Bc95636080AaF8dAb0879228c9F493F", // v2a
//   vaultFactory: '0x316eB64c6186FA56aC85255AF3fA9aa53d932Ca2', // v2b

//   vaultFactoryStakingMode: false,
//   vaultFactoryReferralMode: true,
//   // depositedTokenFunc: contracts.DEPOSITED_KUD,
//   tokenPerBlockFunc: contracts.PERBLOCK_KUD,
//   pendingRewardsFunc: contracts.PENDING_KUD, // pendingKudex(uint256,address) https://emn178.github.io/online-tools/keccak_256.html

// }

export const makeQuote = (add) => {
  return {
    1285: add,
    31337: add,
  }
}

const pools: PoolConfig[] = [
  
  {
    sousId: 0,
    poolId: 0,
    image: 'SOLAR-MOVR',
    tokenName: 'SOLAR-MOVR (SOLARLP)',
    stakingTokenName: QuoteToken.SOLARMOVRSOLARLP,
    stakingTokenAddress: '0x7eda899b3522683636746a2f3a7814e6ffca75e1', // lp address
    contractAddress: makeQuote('0xf68151a467CE39fB55F938135Ab83BBc7F2b0B7D'),
    // strategy: 0x28D5a7e73b70BFF27a2bbD3aDfF37A61779a9E77
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    vaultShareFarmPid: 7,
    vaultShareToken: {
      tokenAddresses: makeQuote(contracts.SOLAR),
      quoteTokenSymbol: QuoteToken.WMOVR,
      quoteTokenAdresses: contracts.wbnb,
    },
    // boostFinished: true,
    // disclaimerNegative: 'Boost Ended',
    disclaimerPositive: "Boosted",
  },
  {
    sousId: 1,
    poolId: 1,
    image: 'SOLAR',
    tokenName: 'SOLAR',
    stakingTokenName: QuoteToken.SOLAR,
    stakingTokenAddress: '0x6bd193ee6d2104f14f94e2ca6efefae561a4334b', // lp address
    contractAddress: makeQuote('0xD9e89665cfD2497C0Df486A73Daa30215ed4F774'),
    // strategy: 0xd0c03B5a5db74B7e5A5a2708f2B7231AD714D844
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
    hidden: true,
    // pendingRewardsFunc: 'pendingKUS',
    // tokenDecimals: 18,
  },
  {
    sousId: 2,
    poolId: 2,
    image: 'WMOVR',
    tokenName: 'WMOVR',
    stakingTokenName: QuoteToken.WMOVR,
    stakingTokenAddress: '0x98878b06940ae243284ca214f92bb71a2b032b8a', // lp address
    contractAddress: makeQuote('0xdC443A80188cd2790f7F2A5E333d7679E5e7BcE3'),
    // strategy: 0x862a9D8021CD73E9cEC675dCb0c6A7c9529CB180
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.USDC,
    isLP: false,
    depositFee: 5,
    
    // pendingRewardsFunc: 'pendingKUS',
    // tokenDecimals: 18,
  },
  {
    sousId: 3,
    poolId: 3,
    image: 'RIB-SOLAR',
    tokenName: 'RIB-SOLAR (SOLARLP)',
    stakingTokenName: QuoteToken.RIBSOLARSOLARLP,
    stakingTokenAddress: '0xf9b7495b833804e4d894fc5f7b39c10016e0a911', // lp address
    contractAddress: makeQuote('0x2E98C76898875073ADC805b85A2Fbd0E4e1a9b04'),
    // strategy: 0x99e86dBdC5D05D23Bd60681A8574AD9625a79854
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.SOLAR,
  },
  {
    sousId: 4,
    poolId: 4,
    image: 'RIB-MOVR',
    tokenName: 'RIB-MOVR (SOLARLP)',
    stakingTokenName: QuoteToken.RIBMOVRSOLARLP,
    stakingTokenAddress: '0x0acdb54e610dabc82b8fa454b21ad425ae460df9', // lp address
    contractAddress: makeQuote('0xa0c4d8C1c87a8cd972F0BCE86cda9Fb45169008F'),
    // strategy: 0xb8b2A3843870FD747eA89e534e18690Ec913fFA8
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
  },
  {
    sousId: 5,
    poolId: 5,
    image: 'RIB',
    tokenName: 'RIB',
    stakingTokenName: QuoteToken.RIB,
    stakingTokenAddress: '0xbd90a6125a84e5c512129d622a75cdde176ade5e', // lp address
    contractAddress: makeQuote('0x9BBa20fC0657310A3B44b29C66242d466711A624'),
    // strategy: 0xc6bC650178230672C7Ed4954Ef2f738FC0d3DE47
    ...SOLAR_INFO,
    isLP: false,
    lpBaseTokenAddress: contracts.WMOVR,
    depositFee: 5,
  },
  {
    sousId: 6,
    poolId: 6,
    image: 'USDC-MOVR',
    tokenName: 'USDC-MOVR (SOLARLP)',
    stakingTokenName: QuoteToken.USDCMOVRSOLARLP,
    stakingTokenAddress: '0xe537f70a8b62204832b8ba91940b77d3f79aeb81', // lp address
    contractAddress: makeQuote('0x3dD58167941F032bb13310D31801cdC03cC94eB4'),
    // strategy: 0x6dd7B14bd78366174e71C83feAB4275b642171E0
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    // depositFee: 3.5,
  },
  {
    sousId: 7,
    poolId: 7,
    image: 'SOLAR-USDC',
    tokenName: 'SOLAR-USDC (SOLARLP)',
    stakingTokenName: QuoteToken.SOLARUSDCSOLARLP,
    stakingTokenAddress: '0xdb66be1005f5fe1d2f486e75ce3c50b52535f886', // lp address
    contractAddress: makeQuote('0x6a970cfcAE96955410A50ADCCb58E47A1f707065'),
    // strategy: 0x6C3AD761403F525A2386c778933cF0C7e8965242
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 8,
    poolId: 8,
    image: 'DAI-USDC',
    tokenName: 'DAI-USDC (SOLARLP)',
    stakingTokenName: QuoteToken.DAIUSDCSOLARLP,
    stakingTokenAddress: '0xfe1b71bdaee495dca331d28f5779e87bd32fbe53', // lp address
    contractAddress: makeQuote('0xC9A7C932cA620FCCe4053E568b41FAF96FafAF4a'),
    // strategy: 0x397a5ba9fe6bC13Ed4AA34Ff4bf3aAd3760329D4
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 9,
    poolId: 9,
    image: 'BUSD-USDC',
    tokenName: 'BUSD-USDC (SOLARLP)',
    stakingTokenName: QuoteToken.BUSDUSDCSOLARLP,
    stakingTokenAddress: '0x384704557f73fbfae6e9297fd1e6075fc340dbe5', // lp address
    contractAddress: makeQuote('0xe8216Dd845137B12389e179A4D0105294A8a7978'),
    // strategy: 0x1aAAA06662E59Bcd5347d6c1d90d44f9c259aE1B
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 10,
    poolId: 10,
    image: 'ETH-USDC',
    tokenName: 'ETH-USDC (SOLARLP)',
    stakingTokenName: QuoteToken.ETHUSDCSOLARLP,
    stakingTokenAddress: '0xa0d8dfb2cc9dfe6905edd5b71c56ba92ad09a3dc', // lp address
    contractAddress: makeQuote('0xB5EF6444910092675a474801fD9Aa6Be171c93CE'),
    // strategy: 0xD513087d1E1F77C4D5cfC288746775636f0C7d72
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 11,
    poolId: 11,
    image: 'BNB-BUSD',
    tokenName: 'BNB-BUSD (SOLARLP)',
    stakingTokenName: QuoteToken.BNBBUSDSOLARLP,
    stakingTokenAddress: '0xfb1d0d6141fc3305c63f189e39cc2f2f7e58f4c2', // lp address
    contractAddress: makeQuote('0x626CCd58d89b891F55A587F1A605A05ce209F133'),
    // strategy: 0x0C1f2F11E29D8A1f4bEed9BEB8b9a3398421200F
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.BUSD,
  },
  {
    sousId: 12,
    poolId: 0,
    image: 'MOON-MOVR',
    tokenName: 'MOON-MOVR (MOONLP)',
    stakingTokenName: QuoteToken.MOONMOVRMOONLP,
    stakingTokenAddress: '0xf18433bbe972d8f1b2e908e3eb6c0234c9b24e7b', // lp address
    contractAddress: makeQuote('0x2CCC4641EDeE417a4752F6011499C219499b8190'),
    // strategy: 0xA164DEB841dDfb2e257226df48961b315dFBf0f9
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    vaultShareFarmPid: 8,
    vaultShareToken: {
      tokenAddresses: makeQuote(contracts.MOON),
      quoteTokenSymbol: QuoteToken.WMOVR,
      quoteTokenAdresses: contracts.wbnb,
    },
    // boostFinished: true,
    // disclaimerNegative: 'Boost Ended',
    disclaimerPositive: "Boosted",
  },
  {
    sousId: 13,
    poolId: 1,
    image: 'MSWAP-MOVR',
    tokenName: 'MSWAP-MOVR (MOONLP)',
    stakingTokenName: QuoteToken.MSWAPMOVRMOONLP,
    stakingTokenAddress: '0x66fFF9B5072CbdFb4bCe50563eC13B237d6A4972', // lp address
    contractAddress: makeQuote('0x81885B1BD801334445920ccA9A33b0729Ec23337'),
    // strategy: 0xD076D70A91997e610eC0618899b2259B0e7bFc78
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
  },
  {
    sousId: 14,
    poolId: 2,
    image: 'WMOVR',
    tokenName: 'WMOVR',
    stakingTokenName: QuoteToken.WMOVR,
    stakingTokenAddress: '0x98878b06940ae243284ca214f92bb71a2b032b8a', // lp address
    contractAddress: makeQuote('0x1920217068359c0F5c6e6f05f8823284D6dF6c22'),
    // strategy: 0xA9355D3107906E40F8CCc16B954dAC28330b824B
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
    isLP: false,
    depositFee: 4,
  },
  {
    sousId: 15,
    poolId: 4,
    image: 'MSWAP',
    tokenName: 'MSWAP',
    stakingTokenName: QuoteToken.MSWAP,
    stakingTokenAddress: '0xb3fb48bf090bedff4f6f93ffb40221742e107db7', // lp address
    contractAddress: makeQuote('0x372bA1dE767C523cf01f545023f49549304ED49B'),
    // strategy: 0x53A7faa4E50eFdD0929E278654197D8803aC74F1
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
  },
  {
    sousId: 16,
    poolId: 9,
    image: 'MOON',
    tokenName: 'MOON',
    stakingTokenName: QuoteToken.MOON,
    stakingTokenAddress: '0xb497c3e9d27ba6b1fea9f1b941d8c79e66cfc9d6', // lp address
    contractAddress: makeQuote('0x9Aaf321Da4e04289C58bC1D84eDd539327899c15'),
    // strategy: 0xB2c247396a9CA8cE8FcD9787f459B5e8aC04EBE5
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
  },
  {
    sousId: 17,
    poolId: 12,
    image: 'USDC',
    tokenName: 'USDC',
    stakingTokenName: QuoteToken.USDC,
    stakingTokenAddress: '0xe3f5a90f9cb311505cd691a46596599aa1a0ad7d', // lp address
    contractAddress: makeQuote('0xab366E397Ad87e508e571366248Ecf0Fcf580da0'),
    // strategy: 0x1573F010F6D856B45a8e87c75f81dA1080f342B4
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
  },
  {
    sousId: 18,
    poolId: 14,
    image: 'DAI',
    tokenName: 'DAI',
    stakingTokenName: QuoteToken.DAI,
    stakingTokenAddress: '0x80a16016cc4a2e6a2caca8a4a498b1699ff0f844', // lp address
    contractAddress: makeQuote('0x21ad5F45467d1d8b3Aa7424efD12Ae805c290477'),
    // strategy: 0x2BD4F31b65bbAC4D7421082F5905738B0d4443B0
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
    isLP: false,
  },
  {
    sousId: 19,
    poolId: 17,
    image: 'BUSD',
    tokenName: 'BUSD',
    stakingTokenName: QuoteToken.BUSD,
    stakingTokenAddress: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818', // lp address
    contractAddress: makeQuote('0x0ccd33838bBb91D3e16eEF59fb0C3ce7315C99A6'),
    // strategy: 0x7E23B56C5373c9c9AE4326edBe8aD74a110b1896
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
    isLP: false,
    
  },
  {
    sousId: 20,
    poolId: 20,
    image: 'MOON-USDC',
    tokenName: 'MOON-USDC (MOONLP)',
    stakingTokenName: QuoteToken.MOONUSDCMOONLP,
    stakingTokenAddress: '0x5964a6c85a2f88e01f28f066ea36dc158864c638', // lp address
    contractAddress: makeQuote('0x8d0Ca73068608fa32c3360943B78B75F03B469ab'),
    // strategy: 0x1fa6700e1bA5Dd664B60506a3173d59Fcc1743F2
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 21,
    poolId: 22,
    image: 'MOVR-USDC',
    tokenName: 'MOVR-USDC (MOONLP)',
    stakingTokenName: QuoteToken.MOVRUSDCMOONLP,
    stakingTokenAddress: '0x74888A02891586EBecCc7B04A0F7a9b5098Daf05', // lp address
    contractAddress: makeQuote('0x46395842C0d55fD61f9BcC805D45CB6aF92e99Fc'),
    // strategy: 0x5b6cDc980CBc67A6b5fcA58B0367359567979eE6
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 22,
    poolId: 23,
    image: 'MSWAP-USDC',
    tokenName: 'MSWAP-USDC (MOONLP)',
    stakingTokenName: QuoteToken.MSWAPUSDCMOONLP,
    stakingTokenAddress: '0x02158E0c90F1CD780c56b68F6904c8EE2f72eFB7', // lp address
    contractAddress: makeQuote('0x39402a9DC7526d9cA782b786150275d2DA9d5E89'),
    // strategy: 0x60d573B63bDC5b5afC48cdBc906A449efBC725C9
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 23,
    poolId: 25,
    image: 'BUSD-USDC',
    tokenName: 'BUSD-USDC (MOONLP)',
    stakingTokenName: QuoteToken.BUSDUSDCMOONLP,
    stakingTokenAddress: '0x7Fae055c7836D135f0E755395b0179D4d5Af3E4D', // lp address
    contractAddress: makeQuote('0x222e31addB2172b67db6D040f06De0987851d72B'),
    // strategy: 0xc9d678D687A8649938D1703791d30FD678Ae8eCF
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 24,
    poolId: 26,
    image: 'DAI-USDC',
    tokenName: 'DAI-USDC (MOONLP)',
    stakingTokenName: QuoteToken.DAIUSDCMOONLP,
    stakingTokenAddress: '0x07866497aAF2E8B201300759720C5Ac873DbF0e7', // lp address
    contractAddress: makeQuote('0x7088553f71aAA8Ffb8C89e98E58AB505D46d3c6b'),
    // strategy: 0x2992507ab3619f31E10FA7fC7d1C3502F3b5254b
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },
  {
    sousId: 25,
    poolId: 27,
    image: 'USDT-USDC',
    tokenName: 'USDT-USDC (MOONLP)',
    stakingTokenName: QuoteToken.USDTUSDCMOONLP,
    stakingTokenAddress: '0x9EC8b8818fd07A24481f5635D5283B2aB85dbB5a', // lp address
    contractAddress: makeQuote('0x5E4A10a089768aED8Ff355CD6B8Fd4715B060e52'),
    // strategy: 0x754EB4C710A2bC2c8B4bFA92a91B6811E15169C3
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
  },

  {
    sousId: 26,
    poolId: 28,
    image: 'mCAKE',
    tokenName: 'mCAKE',
    stakingTokenName: QuoteToken.mCAKE,
    stakingTokenAddress: '0x4f43ffd28d00999d3c813b20dee9f315757c6e1b', // lp address
    contractAddress: makeQuote('0x46944A4Dd92d263b385dd212eA0D1F6EDa50EfB6'),
    // strategy: 0xD3009c94664D947650B5803a3dE3B8509FC9cbF4
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,

    },
  {
    sousId: 27,
    poolId: 29,
    image: 'RivrDoge',
    tokenName: 'RivrDoge',
    stakingTokenName: QuoteToken.RivrDoge,
    stakingTokenAddress: '0x5D4360f1Be94bD6f182F09cFE5EF9832e65EB1ac', // lp address
    contractAddress: makeQuote('0x3fF00501bA0c429e11A8263d32373C159aF890C6'),
    // strategy: 0x49cb834C4dF47D8F77B593530a067A5351987426
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
    depositFee: 4,
  },
    {
      sousId: 28,
      poolId: 0,
      image: 'KAFE',
      tokenName: 'KAFE',
      stakingTokenName: QuoteToken.KAFE,
      stakingTokenAddress: contracts.KAFE, // lp address
      contractAddress: makeQuote('0x1C5398aB5ACBD58437B5391A114C790C55701743'),
      // strategy: 0xD509a79FeAda2654ee23761c4924DaF61f64754c
      ...MOONKAFE_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
      isLP: false,
    },
    {
      sousId: 29,
      poolId: 1,
      image: 'WMOVR',
      tokenName: 'WMOVR',
      stakingTokenName: QuoteToken.WMOVR,
      stakingTokenAddress: contracts.WMOVR, // lp address
      contractAddress: makeQuote('0xba998D265625D34b6c84a6B8237658216A27BFbB'),
      // strategy: 0x16678eDB02936BBCF2C064bCac1EeD54609A69Ff
      ...MOONKAFE_INFO,
      lpBaseTokenAddress: contracts.USDC,
      isLP: false,
      depositFee: 3.5,
    },
    {
      sousId: 30,
      poolId: 2,
      image: 'USDC',
      tokenName: 'USDC',
      stakingTokenName: QuoteToken.USDC,
      stakingTokenAddress: contracts.USDC, // lp address
      contractAddress: makeQuote('0x19acE41c2aAcB78d0AD9cdbdBA340F75A8E17B4d'),
      // strategy: 0x678434E2ae11b7Fe9F1aF35cf47841A56d6C45a8
      ...MOONKAFE_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
      isLP: false,
      depositFee: 3.5,
    },
    {
      sousId: 31,
      poolId: 3,
      image: 'KAFE-MOVR',
      tokenName: 'KAFE-MOVR (SOLARLP)',
      stakingTokenName: QuoteToken.KAFEMOVRSOLARLP,
      stakingTokenAddress: "0xb60B5ddAe68aE71481d26659A1D0E9A9D941a8d1", // lp address
      contractAddress: makeQuote('0xf5791D77c5975610aF1bE35b423189A8f5Eb6923'),
      // strategy: 0xa28dCE7f091F97da759386E9e80323aCE55426E0
      ...MOONKAFE_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
    },
    {
      sousId: 32,
      poolId: 4,
      image: 'KAFE-USDC',
      tokenName: 'KAFE-USDC (SOLARLP)',
      stakingTokenName: QuoteToken.KAFEUSDDCSOLARLP,
      stakingTokenAddress: "0xF6d6F801C568C4b4aeFbC2c9859D755318d40fAe", // lp address
      contractAddress: makeQuote('0x5bc257E44843B710f4813FC07716e761D7cF1A41'),
      // strategy: 0x527dF2073fdB2E13De95323F9a640FD054C389CA
      ...MOONKAFE_INFO,
      lpBaseTokenAddress: contracts.USDC,
      // hidden: false,
    },
    {
      sousId: 33,
      poolId: 6,
      image: 'KAFE-MOVR',
      tokenName: 'KAFE-MOVR (MOONLP)',
      stakingTokenName: QuoteToken.KAFEMOVRMOONLP,
      stakingTokenAddress: "0xe5FFF70b2e265f6784e2300bb88A29D5CB012B8A", // lp address
      contractAddress: makeQuote('0xB9FC48b5364014b912DED9c3535EAEde80e2b6cc'),
      // strategy: 0x251274e4B1cF2bEbEAFF82024358A9C7B5cFcc43
      ...MOONKAFE_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
    },
    {
      sousId: 34,
      poolId: 5,
      image: 'USDC-MOVR',
      tokenName: 'USDC-MOVR (MOONLP)',
      stakingTokenName: QuoteToken.USDCMOVRSOLARLP,
      stakingTokenAddress: "0xe537f70a8b62204832B8Ba91940B77d3f79AEb81", // lp address
      contractAddress: makeQuote('0x8AD8E1aD610204F1Fa40857De82732710471d36d'),
      // strategy: 0x94B7A6c0FaAA047B59f073F016b0E651448049a1
      ...MOONKAFE_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
      // depositFee: 3.5,
    },
    {
      sousId: 35,
      poolId: 30,
      image: 'BEANS-MOVR',
      tokenName: 'BEANS-MOVR (MOONLP)',
      stakingTokenName: QuoteToken.BEANSMOVRMOONLP,
      stakingTokenAddress: '0x20472b3CCA87f1e8AEd70E1Cf3Ac31E97eD13A1E', // lp address
      contractAddress: makeQuote('0x2F81dD0c54DE7e301C1d8D860c9E5D50Df426F51'),
      // strategy: 0x119Ff34e7e66B0Be370762cB8a615BbBFd396549
      ...MOONFARM_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
      hidden: false,

      disclaimerPositive: "Boosted",

      vaultShareFarmPid: 0,
      vaultShareFarmContract: "0x71018266d5Ebc292f7CDB56B0fE55f13a101fDC2",
      vaultShareRewardToken: contracts.BEANS,
      vaultShareToken: {
        tokenAddresses: makeQuote(contracts.BEANS),
        quoteTokenSymbol: QuoteToken.WMOVR,
        quoteTokenAdresses: contracts.wbnb
      },
      boostEndBlock: 601403,

    },
    {
      sousId: 36,
      poolId: 31,
    image: 'LAIKA-MOVR',
      tokenName: 'LAIKA-MOVR (MOONLP)',
      stakingTokenName: QuoteToken.LAIKAMOVRMOONLP,
      stakingTokenAddress: '0x9eE6b4Ea23BeD962A8a7c069eFc928D2D847f644', // lp address
      contractAddress: makeQuote('0xE4F33eD8978Ee9c3e0F00842754463eD13e0D14A'),
      // strategy: 0xBc9153c163A832aB20d8e5E8bF2ABD16881972E8
      ...MOONFARM_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
      // hidden: true,

      disclaimerPositive: "Boosted",

      vaultShareFarmPid: 0,
      vaultShareFarmContract: "0xe1f427890397402964A1c72974040546936676Ca",
      vaultShareRewardToken: contracts.LAIKA,
      vaultShareToken: {
        tokenAddresses: makeQuote(contracts.LAIKA),
        quoteTokenSymbol: QuoteToken.WMOVR,
        quoteTokenAdresses: contracts.wbnb
      },
      boostEndBlock: 608336,


    },
    {
      sousId: 37,
      poolId: 0,
      image: 'SOLAR',
      tokenName: 'SOLAR',
      stakingTokenName: QuoteToken.SOLAR,
      stakingTokenAddress: '0x6bd193ee6d2104f14f94e2ca6efefae561a4334b', // lp address
      contractAddress: makeQuote('0xaF96165115347c8d41c3F8F85d76501602F3677d'),
      // strategy: 0xBEe0dd6adFE0642e5172420b02CFFc69f6f166ef
      ...SOLAR_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
      isLP: false,
      underlyingMasterChef: '0x7e6E03822D0077F3C417D33caeAc900Fc2645679',
      projectName: 'solarbeam',
      // pendingRewardsFunc: 'pendingKUS',
      // tokenDecimals: 18,
    },

    {
      sousId: 38,
      poolId: 12,
      image: 'WBTC-USDC',
      tokenName: 'WBTC-USDC (SOLARLP)',
      stakingTokenName: QuoteToken.WBTCUSDCSOLARLP,
      stakingTokenAddress: '0x83d7a3fc841038e8c8f46e6192bbcca8b19ee4e7', // lp address
      contractAddress: makeQuote('0xC78F7f19d4bf7518D789F206983de0dE906E2274'),
      // strategy: 0x2059F024b49AA9Cd4D8984d7a4Ca984066497E57
      ...SOLAR_INFO,
      lpBaseTokenAddress: contracts.USDC,
    },
    {
      sousId: 39,
      poolId: 13,
      image: 'USDT-USDC',
      tokenName: 'USDT-USDC (SOLARLP)',
      stakingTokenName: QuoteToken.USDTUSDCSOLARLP,
      stakingTokenAddress: '0x2a44696DDc050f14429bd8a4A05c750C6582bF3b', // lp address
      contractAddress: makeQuote('0x99f27Ec60C6c0094d7f9136603A60f87C315A692'),
      // strategy: 0x6037DB31D1439552b86Fa1539F2FEeaec32e6E79
      ...SOLAR_INFO,
      lpBaseTokenAddress: contracts.USDC,
    },
    {
      sousId: 40,
      poolId: 1001,
      image: 'FREE-MOVR',
      tokenName: 'FREE-MOVR (FREELP)',
      stakingTokenName: QuoteToken.FREEMOVRFREELP,
      stakingTokenAddress: '0x043BA93eE173adf942c1dfa4115803555a65759e', // lp address
      contractAddress: makeQuote('0xeEd355da46e9E4b6054AF4E3E5A3EDF5e0B9Fa8B'),
      // incoming: 0x342c687f0d0fC5E119a06a4670bb4ab1053cA934
      ...FREE_INFO,
      underlyingMasterChef: '0x31341761A726585257067D15967AD301187504B2',
      lpBaseTokenAddress: contracts.WMOVR, // wkcs
    },
    {
      sousId: 41,
      poolId: 1002,
      image: 'FREE-USDC',
      tokenName: 'FREE-USDC (FREELP)',
      stakingTokenName: QuoteToken.FREEUSDCFREELP,
      stakingTokenAddress: '0x2397E65E2fCc07e33b49E657D8eEbFf634CfB288', // lp address
      contractAddress: makeQuote('0x841b0f62E5Ea00EDa3cb3DbF084DEc2ba0B6Ea9a'),
      // incoming: 0xE94857638a906284f4e93e453362fe5B0E7738bB
      ...FREE_INFO,
      underlyingMasterChef: '0xfA382b7fb23C558136602a2D4C09D527ea76bb5A',
      lpBaseTokenAddress: contracts.USDC, // wkcs
    },
    {
      sousId: 42,
      poolId: 1003,
      image: 'MOVR-USDC',
      tokenName: 'MOVR-USDC (FREELP)',
      stakingTokenName: QuoteToken.MOVRUSDCFREELP,
      stakingTokenAddress: '0x8C105c1800FB5baf368ca8A91a2121891966dB3E', // lp address
      contractAddress: makeQuote('0x046ed11a053258d49Af44e4A556Ff9Eaca1F7E31'),
      // incoming: 0xEB1F8fe18c26f73807150220CEf07bA70ce884a6
      ...FREE_INFO,
      underlyingMasterChef: '0x7355894158181566BCB6CF09c0A6fEbA13b9c2D3',
      lpBaseTokenAddress: contracts.USDC, // wkcs
    },

    {
      sousId: 43,
      poolId: 0,
      image: 'DRAGON-USDC',
      tokenName: 'DRAGON-USDC (FREELP)',
      stakingTokenName: QuoteToken.DRAGONUSDCFREELP,
      stakingTokenAddress: '0xfD3d74D1e6FF4CE57b360507ea7db7AD8541c554', // lp address
      contractAddress: makeQuote('0x2a3C1b8ac3634B27d4409Fc43e7BBf1fB97B12A2'),
      // strategy: 0xE2aF738a590773008C49788946B5A623f0AC6Ff6
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.USDC,
    },
    {
      sousId: 44,
      poolId: 1,
      image: 'DRAGON-MOVR',
      tokenName: 'DRAGON-MOVR (FREELP)',
      stakingTokenName: QuoteToken.DRAGONMOVRFREELP,
      stakingTokenAddress: '0x77ef76AA05c78376a3b624621b499c503308d0C6', // lp address
      contractAddress: makeQuote('0x17c3BF96cB920794a98CfEcDD09D102Ab1C14633'),
      // strategy: 0xf9C34D0b81ef4d2DC71892c0162422c92C0a7E7E
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.MOVR,
    },
    {
      sousId: 45,
      poolId: 2,
      image: 'MOVR-USDC',
      tokenName: 'MOVR-USDC (FREELP)',
      stakingTokenName: QuoteToken.MOVRUSDCFREELP,
      stakingTokenAddress: '0x8C105c1800FB5baf368ca8A91a2121891966dB3E', // lp address
      contractAddress: makeQuote('0xd9304bC22f2C5001eFfE21342B90f425C97f7b9f'),
      // strategy: 0x64b79575F3Fd64a9887e4878A5cD65D3C3eE8D10
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.USDC,
      depositFee: 4,
    },
    {
      sousId: 46,
      poolId: 3,
      image: 'FREE-MOVR',
      tokenName: 'FREE-MOVR (FREELP)',
      stakingTokenName: QuoteToken.FREEMOVRFREELP,
      stakingTokenAddress: '0x043BA93eE173adf942c1dfa4115803555a65759e', // lp address
      contractAddress: makeQuote('0xCce06dee4f92471e4eb745Ab93F00A98BCEADe32'),
      // strategy: 0xcABeefb7042DD7a71Cbe906e27F2498BcA6De8Ce
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
    },
    {
      sousId: 47,
      poolId: 4,
      image: 'FREE-USDC',
      tokenName: 'FREE-USDC (FREELP)',
      stakingTokenName: QuoteToken.FREEUSDCFREELP,
      stakingTokenAddress: '0x2397E65E2fCc07e33b49E657D8eEbFf634CfB288', // lp address
      contractAddress: makeQuote('0xdC557d005d8c45fF7C6ad27840Af5065e35DBBe9'),
      // strategy: 0x73f971f2b5E603C153c76081436c973eeCb96d14
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.USDC,
    },
    {
      sousId: 48,
      poolId: 5,
      image: 'DRAGON',
      tokenName: 'DRAGON',
      stakingTokenName: QuoteToken.DRAGON,
      stakingTokenAddress: '0x062bD733268269d7Ecb85Cd3EA84281E6bEd7f5F', // lp address
      contractAddress: makeQuote('0xA6Ab63f0ac643Fab33Da75122Cb700679c683C45'),
      // strategy: 0x54DD703255097919b6E4b63B85e2fa60ADb9BF53
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.USDC,
      isLP: false,
    },
    {
      sousId: 49,
      poolId: 6,
      image: 'USDC',
      tokenName: 'USDC',
      stakingTokenName: QuoteToken.USDC,
      stakingTokenAddress: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D', // lp address
      contractAddress: makeQuote('0x2F1dC17e5dAb5E67fD2e1078aD4cb92643F1C48d'),
      // strategy: 0x74a9aA5C74B608CC51488e946CEFC21963bc98BE
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.WMOVR,
      depositFee: 4,
      isLP: false,
    },
    {
      sousId: 50,
      poolId: 7,
      image: 'FREE',
      tokenName: 'FREE',
      stakingTokenName: QuoteToken.FREE,
      stakingTokenAddress: '0x63F2ADf5f76F00d48fe2CBef19000AF13Bb8de82', // lp address
      contractAddress: makeQuote('0x624c9244DD2fA2701bAd7e6E6c4a71a61497A54E'),
      // strategy: 0x623E8275E273764E14E5323065A2C6140A2456fb
      ...DRAGON_INFO,
      lpBaseTokenAddress: contracts.USDC,
      isLP: false,
    },
]

export default pools
