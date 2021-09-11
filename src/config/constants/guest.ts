import KUSCHEF_ABI from 'config/abi/kuschef.json'
import { Guest } from 'state/types'
import BigNumber from 'bignumber.js'
import { PoolConfig, QuoteToken, PoolCategory } from './types'
import contracts from './contracts'

const TIKU_INFO = {
  poolCategory: PoolCategory.GUESTVAULT,
  isFinished: false,
  projectLink: 'https://rewards.tikutoken.com/AUTO-KCS',
  projectName: 'Tiku',
  routerForQuote: '0xc0ffee0000c824d24e0f280f1e4d21152625742b',
}

const makeQuote = (add) => {
  return {
    1285: add,
    31337: add,
  }
}

const guestPools: Guest[] = [
  // {
  //   sousId: 10001,
  //   image: 'TIKU',
  //   tokenName: 'TIKU',
  //   stakingTokenName: QuoteToken.TIKU,
  //   stakingTokenAddress: '0xd4b52510719c594514ce7fed6cc876c03278ccf8', // lp address
  //   contractAddress: makeQuote('0x6356D07680c9DD397a50877E3550870d761F8B6b'),
  //   strategy: '0xeeE7e483d0408b15608089B1aBA2cCb0CD790559',
  //   ...TIKU_INFO,
  //   lpBaseTokenAddress: '0x4446fc4eb47f2f6586f9faab68b3498f86c07521', // wkcs
  //   vaultShareFarmPid: 18,
  //   // disclaimerPositive: "Boosted",
  //   vaultShareToken: {
  //     tokenAddresses: makeQuote('0xd4b52510719c594514ce7fed6cc876c03278ccf8'),
  //     quoteTokenSymbol: QuoteToken.WKCS,
  //     quoteTokenAdresses: contracts.wbnb,
  //   },
  //   boostFinished: true,
  //   // hidden: true,
  //   disclaimerNegative: 'Boost Ended',
  // },
]

export default guestPools
