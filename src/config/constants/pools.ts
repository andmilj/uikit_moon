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

// const KUDEX_INFO = {
//   poolCategory: PoolCategory.PRIVATEVAULT,
//   isFinished: false,
//   projectLink: 'https://kudex.finance',
//   projectName: 'kudex',

//   isLP: true,
//   rewardToken: '0xBd451b952dE19F2C7bA2c8c516b0740484E953B2',
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

//   // hidden: true,
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
    contractAddress: makeQuote('0x604a259e50C23943Ddc5D98B6F08769bf1E0fa27'),
    // strategy: 0x9815b371861A57d27C514de00a7b5Fb34532811b
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
  },
  {
    sousId: 1,
    poolId: 1,
    image: 'SOLAR',
    tokenName: 'SOLAR',
    stakingTokenName: QuoteToken.SOLAR,
    stakingTokenAddress: '0x6bd193ee6d2104f14f94e2ca6efefae561a4334b', // lp address
    contractAddress: makeQuote('0x22e6719Fa4Cc386Ac6172a6F7Ed7ECc5d235b8c1'),
    // strategy: 0x2C32829713Af0Add943bE901B2d7BEFAa6171977
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
    // pendingRewardsFunc: 'pendingKUS',
    // tokenDecimals: 18,
  },
  {
    sousId: 2,
    poolId: 2,
    image: 'MOVR',
    tokenName: 'MOVR',
    stakingTokenName: QuoteToken.MOVR,
    stakingTokenAddress: '0x98878b06940ae243284ca214f92bb71a2b032b8a', // lp address
    contractAddress: makeQuote('0xE00eeD5E67635A0c27ca10077189a0aF35FA9a3b'),
    // strategy: 0x3481c1FAe8fFa9eEC1113b9b404C89447fE97303
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.USDC,
    isLP: false,
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
    contractAddress: makeQuote('0x5AF4bD9621Ff07aB98EC8C4CDef47979F43Bf87E'),
    // strategy: 0x75b35C7aBAaF57ffeBfCF5a9748908e311CB3dB7
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
    contractAddress: makeQuote('0xE10621494a08E1b65AC2f10f7D1aFf7F6886491B'),
    // strategy: 0xB8fBd7F4120F90b1DCF83BF0488aEc96B1114Ee7
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
    contractAddress: makeQuote('0xb356F291cDFe3A28140B5b70A3b39135B9Ce7e2d'),
    // strategy: 0xAe94B52D9FB330D7170619d54bf6913D8773E662
    ...SOLAR_INFO,
    isLP: false,
    lpBaseTokenAddress: contracts.WMOVR,
  },
  {
    sousId: 6,
    poolId: 6,
    image: 'USDC-MOVR',
    tokenName: 'USDC-MOVR (SOLARLP)',
    stakingTokenName: QuoteToken.USDCMOVRSOLARLP,
    stakingTokenAddress: '0xe537f70a8b62204832b8ba91940b77d3f79aeb81', // lp address
    contractAddress: makeQuote('0x7025a55d6edd6871CF0be5961b79e61737B99d27'),
    // strategy: 0x381bD834Fa3cA43f5A3C0866C813898A7B94aeA3
    ...SOLAR_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
  },
  {
    sousId: 7,
    poolId: 7,
    image: 'SOLAR-USDC',
    tokenName: 'SOLAR-USDC (SOLARLP)',
    stakingTokenName: QuoteToken.SOLARUSDCSOLARLP,
    stakingTokenAddress: '0xdb66be1005f5fe1d2f486e75ce3c50b52535f886', // lp address
    contractAddress: makeQuote('0xC1371932E5235585afecc6fBA127BEe8E035B55E'),
    // strategy: 0xA2e56A3E7F9013AFe9738fB283C63261f7BA5082
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
    contractAddress: makeQuote('0x4a9bFF68b3485b63a4637A3918F4A9BeDff8e3f6'),
    // strategy: 0x34f7e093F386EaF63721022697C17bcDaaf000C5
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
    contractAddress: makeQuote('0xB2c3493A8C8F62aD2406feE090683724C13F8064'),
    // strategy: 0x7ADB2047C4727F9EF2c7F2614B0C8dEFa23E0BDC
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
    contractAddress: makeQuote('0xB653a24eEa1FDE673a59eA22605E6E68C5322607'),
    // strategy: 
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
    contractAddress: makeQuote('0x3eD965718e581dcCFef403901667Efd65565Aa00'),
    // strategy: 0x70DAaf8EAaeCe74F21309Bb53290F07f628b5E1b
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
    contractAddress: makeQuote('0xcff6F550b4E02701e5767bA9B5F96A5e51dCe9Cb'),
    // strategy: 0xCEbdcA6C2587f839Cfc7A079cbeaf1065B7A40d9
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
  },
  {
    sousId: 13,
    poolId: 1,
    image: 'MSWAP-MOVR',
    tokenName: 'MSWAP-MOVR (MOONLP)',
    stakingTokenName: QuoteToken.MSWAPMOVRMOONLP,
    stakingTokenAddress: '0x66fFF9B5072CbdFb4bCe50563eC13B237d6A4972', // lp address
    contractAddress: makeQuote('0x1670B2fb6359a8038D17076d713CB6b281583bAD'),
    // strategy: 0xf8bc4B5234198cbbDc558e873EE3E0BD02C9A665
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
    contractAddress: makeQuote('0xD84b5D03B5C49892Faea9d614DfcEB20aa7FfE8A'),
    // strategy: 0xf39331180D0f4c82f0Bcd927a2Af1469834368fE
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.USDC,
    isLP: false,
  },
  {
    sousId: 15,
    poolId: 4,
    image: 'MSWAP',
    tokenName: 'MSWAP',
    stakingTokenName: QuoteToken.MSWAP,
    stakingTokenAddress: '0xb3fb48bf090bedff4f6f93ffb40221742e107db7', // lp address
    contractAddress: makeQuote('0x9c5B62e7A989df1cfEFa02f127b9007d21995379'),
    // strategy: 0x2D2f7Ae3B377570Fa049be0e476A99C00E9219Ef
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
    contractAddress: makeQuote('0x1A4F1e9C262B89FC0d716cb328c6C324883338b7'),
    // strategy: 0xf2Db1F44D92213f8b0875F378AF69D973fe7eD71
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
    contractAddress: makeQuote('0xbf188be769fa680bC44661C3D06E918F9D0863Dd'),
    // strategy: 0x836F66D3CEEe42f46bA41c5d7d917d4D95276a23
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
    contractAddress: makeQuote('0xbFb3577C50C03594DD2dEa6e565B72E9869FbdF7'),
    // strategy: 0xBd79673C0243aB5404c9ee088DA9C9B5E9b9C560
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
  },
  {
    sousId: 19,
    poolId: 17,
    image: 'BUSD',
    tokenName: 'BUSD',
    stakingTokenName: QuoteToken.BUSD,
    stakingTokenAddress: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818', // lp address
    contractAddress: makeQuote('0xDc001e8d07FbFdCA21bBA5De9a43C26D6e131A48'),
    // strategy: 0xc5adfB025fDAAD22bB5d46cA64857b8984aab3ab
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
    },
  {
    sousId: 20,
    poolId: 20,
    image: 'MOON-USDC',
    tokenName: 'MOON-USDC (MOONLP)',
    stakingTokenName: QuoteToken.MOONUSDCMOONLP,
    stakingTokenAddress: '0x5964a6c85a2f88e01f28f066ea36dc158864c638', // lp address
    contractAddress: makeQuote('0xF43ee2C374BBb3A650c4624eBd769E9ad31fFB2f'),
    // strategy: 0xF881A84e891a3bDBa07FcE373617200bA62C3C57
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
    contractAddress: makeQuote('0x0093298b1714Fbb9c6E50444eA88d6Cfd4846cCa'),
    // strategy: 0xCF6440E3D9c563Dae55dfdc01e82C3ad3d6aECf8
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
    contractAddress: makeQuote('0x5Db498915C711f1Ebec9faecC74610154efd49f7'),
    // strategy: 0x66111aE6392C5940DB0C2739dc2785B186C36147
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
    contractAddress: makeQuote('0xD622b218ed3198239b9E4337f6C28b8207D3Be1D'),
    // strategy: 0xAD55E269D9598CF7C7c650a9898Fa2f5CaAb5C50
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
    contractAddress: makeQuote('0x4619553BA1705FFE98457600f5e70E6558992F11'),
    // strategy: 0x35D21cA2059c090e5Ad639f481301FED9aB27e1e
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
    contractAddress: makeQuote('0xd936F8934312b82898218E5608c0adf3B067a5B5'),
    // strategy: 0xefAA7294304f8AA38095D6De20024611a46613f3
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
    contractAddress: makeQuote('0x20BC20DEc3E89c7c65E8Ee6D24F742270322fBA0'),
    // strategy: 0xBb498040b3b933c9FbC8F22F90624095bfbC4EC2
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
    contractAddress: makeQuote('0x30825264687407139e17d8c30dbDcE08203603A2'),
    // strategy: 0xAD65e5D87A0226e53cfA354d58F6072733a9bcab
    ...MOONFARM_INFO,
    lpBaseTokenAddress: contracts.WMOVR,
    isLP: false,
    }
]

export default pools
