import BigNumber from 'bignumber.js'

const makeQuote = (add) => {
  return {
    1285: add,
    31337: add,
  }
}


export default {
  cake: {
    // 1285: '0x516F50028780B60e2FE08eFa853124438f9E46a7',
    // 31337: '0x516F50028780B60e2FE08eFa853124438f9E46a7',
  },
  hasLaunchedFarm: false,
  cakeKcsPair: {
    // 1285: '0x9ABEd90465B15Bd95A50a1E984385510C4AB399d',
    // 31337: '0x9ABEd90465B15Bd95A50a1E984385510C4AB399d',
  },
  masterChef: {
    1285: '0xf03b75831397D4695a6b9dDdEEA0E578faa30907', // placeholder
    // 31337: '0x3Cd0651a06b293e6c21C894aFb71cC8251802fc5',
  },
  wbnb: {
    1285: '0x98878b06940ae243284ca214f92bb71a2b032b8a',
    31337: '0x98878b06940ae243284ca214f92bb71a2b032b8a',
  },
  lottery: {
    56: '',
    97: '',
  },
  lotteryNFT: {
    56: '',
    97: '',
  },
  mulltiCall: makeQuote('0xe584193B093390a1A1270af2579B3b69AF84d445'),

  router: makeQuote(''),
  quoteUsdt: makeQuote('0xB44a9B6905aF7c801311e8F4E76932ee959c663C'),
  quoteUsdc: makeQuote('0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D'),
  quoteBnb: makeQuote('0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c'),
  quoteEth: makeQuote('0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C'),
  quoteSolar: makeQuote('0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B'),
  quoteMswap: makeQuote('0xB3FB48bF090bEDFF4f6F93FFb40221742E107db7'),
  quoteMoonfarm: makeQuote('0xB497c3E9D27Ba6b1fea9F1b941d8C79E66cfC9d6'),
  quoteRib: makeQuote('0xbD90A6125a84E5C512129D622a75CDDE176aDE5E'),
  quoteFree: makeQuote('0x63F2ADf5f76F00d48fe2CBef19000AF13Bb8de82'),

  KAFE: '',

  WMOVR: '0x98878b06940ae243284ca214f92bb71a2b032b8a',
  MOVR: '0x98878b06940ae243284ca214f92bb71a2b032b8a',
  MOON: '0xB497c3E9D27Ba6b1fea9F1b941d8C79E66cfC9d6',
  MSWAP: '0xB3FB48bF090bEDFF4f6F93FFb40221742E107db7',
  SOLAR: '0x6bD193Ee6D2104F14F94E2cA6efefae561A4334B',
  RIB: '0xbD90A6125a84E5C512129D622a75CDDE176aDE5E',
  FREE: '0x63F2ADf5f76F00d48fe2CBef19000AF13Bb8de82',

  BTC: '0x6aB6d61428fde76768D7b45D8BFeec19c6eF91A8',
  USDT: '0xB44a9B6905aF7c801311e8F4E76932ee959c663C',
  USDC: '0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D',
  BNB: '0x2bF9b864cdc97b08B6D79ad4663e71B8aB65c45c',
  BUSD: '0x5D9ab5522c64E1F6ef5e3627ECCc093f56167818',
  ETH: '0x639A647fbe20b6c8ac19E48E2de44ea792c62c5C',
  BURNADDRESS: '0x0000000000000000000000000000000000000000',
  DAI: '0x80A16016cC4A2E6a2CACA8a4a498b1699fF0f844',

  swapPathRegistry: '0x5B809D154E4e01975EB183A5B771db18beaeCd6b',
  vaultRegistry: '0x179cA28a3f6cc4565fF4d6F37684497f63B47064',
  feeStrat: '0xcfbd005644E8c91D5DC912A66b130bD72Ee2330a',

  TOTALALLOCPOINT: 'totalAllocPoint()',

  PENDING_SOLAR: 'pendingSolar(uint256,address)',
  PENDING_MOON: 'pendingmoonfarm(uint256,address)',

  PERBLOCK_SOLAR: 'solarPerBlock()',
  PERBLOCK_MOON: 'moonfarmPerBlock()',

  DEPOSITED_KUD: 'depositedKud()',

  VERSION: '1.0',
  compoundPeriodInSecs: 600,
  performanceFee: 0.035,

  personalVaultSrc: {
    // latest: "V3",
    createNewVaultButton: true,
    triggerCreateVault: ['V1', 'V2'],
    V1: {
      url: 'https://kukafe.mypinata.cloud/ipfs/QmdeyAhfcxG9XxGp7NJQ9oEDFKYZUPYS4H2Z8kDt82jGnN',
    },
    V2: {
      url: 'https://kukafe.mypinata.cloud/ipfs/QmQqhpnpK7MVBSncXH9Lj73nrbiqSK4hLxZZkT3YvJPg8A',
    },
    V2A: {
      url: 'https://kukafe.mypinata.cloud/ipfs/QmUMssRyQHLu7enrYFpQtSmywhKZ986ZxY9Bf1c3fuHDcL',
    },
    V2B: {
      url: 'https://kukafe.mypinata.cloud/ipfs/QmaJmRDPB8FkYFt5AaJzzQdrSuVfkif3eSypMZqkHny4QJ',
    },
    mappings: {
      LPReferralHarvestLock: 'V1',
      StrategyLPPersonalVault: 'V2',
      StrategyLPPersonalVault2a: 'V2A',
      StrategyLPPersonalVault2b: 'V2B',
    },
  },

  HELPER: '0x8424984E0f70f8B4Ef28F77e4aE174c7C7938Ec1',
  GAS_LIMIT: 2000000,

  solarRouter: '0xdF71f363940A2298e831F18f44266C80015c8Dfd', // wrapper
  // solarRouter: '0xAA30eF758139ae4a7f798112902Bf6d65612045f', // 0x049581aEB6Fe262727f290165C29BDAB065a1B68
  moonRouter: '0x120999312896F36047fBcC44AD197b7347F499d6', // 0x056973f631a5533470143bb7010c9229c19c04d2 
  seaRouter: '0x802B0B134B76765378e10F1Ef5175349751af90a',
  freeRouter: '0x0d0ac50741f2Aed4D19325bE385EBeFe49C0d186',

  teamWallets: ['0x9aB7A2E735231Af9D7555AF5AF24d664bB138bE3', '0x453A9aCF28e09f67F443Ecf5295a6f7E071c05c8'],
  teamWalletsNumber: [
    // new BigNumber('5000').multipliedBy(1e18).toString(), // to shibance
  ],
  // kafeEspresso: 39,

  isSushiRouter: (router) => {
    if (router.toLowerCase() === '0x12fdca1a4AB7c536709c4045a0532c22176CEB2b'.toLowerCase()){
      return true;
    } // solar
    return false;
  },

  tokenDecimals:{
    ["0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D".toLowerCase()]: 6, // USDC
    ["0xB44a9B6905aF7c801311e8F4E76932ee959c663C".toLowerCase()]: 6, // USDT
  }
}
