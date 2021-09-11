import KUSWAP_CHEF_ABI from 'config/abi/kuswap_chef.json'
import MASTERCHEF_ABI from 'config/abi/masterchef.json'
import BigNumber from 'bignumber.js'
import { PrivatePoolInfo } from 'state/types'
import poolConfigs from 'config/constants/pools'
import contracts from './contracts'

export interface TokenConfig {
  address: string
  symbol: string // also used for image
  routerForQuote: string
  isLP?: boolean
  base?: string
  image?: string
  routeVia?: string
}

export interface TokenInfo extends TokenConfig {
  priceVsQuoteToken: BigNumber
  balance?: BigNumber
  token0?: string
  token1?: string
  decimals?: number
  value?: number
  valuePer?: number
}

// kukafe chefs
// kukafe vaults

// kudex, kuswap, boneswap, kandy, kubeans

const tokens: TokenConfig[] = [


  
  // { symbol: 'BTC', address: contracts.BTC, routerForQuote: contracts.solar },
  { symbol: 'USDT', address: contracts.USDT, routerForQuote: contracts.moonRouter },
  { symbol: 'USDC', address: contracts.USDC, routerForQuote: contracts.solarRouter },
  // { symbol: 'BNB', address: contracts.BNB, routerForQuote: contracts.kuswapRouter },
  // { symbol: 'BUSD', address: contracts.BUSD, routerForQuote: contracts.kuswapRouter },
  // { symbol: 'ETH', address: contracts.ETH, routerForQuote: contracts.kuswapRouter },
  { symbol: 'DAI', address: contracts.DAI, routerForQuote: contracts.moonRouter },

  { symbol: 'MOON', address: contracts.MOON, routerForQuote: contracts.moonRouter },
  { symbol: 'SOLAR', address: contracts.SOLAR, routerForQuote: contracts.solarRouter },
  { symbol: 'MSWAP', address: contracts.MSWAP, routerForQuote: contracts.moonRouter, routeVia: contracts.USDT},
  { symbol: 'FREE', address: contracts.FREE, routerForQuote: contracts.freeRouter },

  // { symbol: 'KDOGE', address: contracts.FREE, routerForQuote: contracts.moonRouter },
  { symbol: 'RivrDoge', address: "0x5d4360f1be94bd6f182f09cfe5ef9832e65eb1ac", routerForQuote: contracts.moonRouter },
  { symbol: 'KMOON', address: "0x480cd4fa911eeeff93cb11135c97237455617862", routerForQuote: contracts.moonRouter },
  { symbol: 'RIB', address: "0xbd90a6125a84e5c512129d622a75cdde176ade5e", routerForQuote: contracts.solarRouter },
  // {
  //   symbol: 'RS',
  //   address: '0x1bbd57143428452a4deb42519391a0a436481c8e',
  //   routerForQuote: contracts.ksfRouter,
  //   routeVia: contracts.KSF,
  // },
  // { symbol: "KUP", address: "0x4928946Bd0a8D736c2924DaC752E83a6e1949Aa6", routerForQuote: contracts.kupRouter},

  ...poolConfigs
    .filter((p) => !p.hidden)
    .map((p) => {
      return {
        image: p.image,
        symbol: p.tokenName,
        address: p.stakingTokenAddress.toLowerCase(),
        routerForQuote: p.routerForQuote,
        isLP: p.isLP,
        base: p.lpBaseTokenAddress,
      }
    }),
]
export default tokens
