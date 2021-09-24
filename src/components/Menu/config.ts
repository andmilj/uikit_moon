import { MenuEntry } from '@pancakeswap-libs/uikit'
import contracts from 'config/constants/contracts'

const config: MenuEntry[] = [
  {
    label: 'Home',
    icon: 'HomeIcon',
    href: '/',
  },
  {
    label: 'Trade',
    icon: 'TradeIcon',
    items: [
      {
        label: 'Swap (Solarbeam)',
        href: `https://solarbeam.io/exchange/swap?inputCurrency=ETH&outputCurrency=${
          contracts.cake[process.env.REACT_APP_CHAIN_ID]
        }`,
      },
      {
        label: 'Swap (Moonswap)',
        href: `https://swap.moonswap.in/#/swap?inputCurrency=KCS&outputCurrency=${
          contracts.cake[process.env.REACT_APP_CHAIN_ID]
        }`,
      },
      {
        label: 'Liquidity (Solarbeam)',
        href: `https://solarbeam.io/exchange/add/${contracts.cake[process.env.REACT_APP_CHAIN_ID]}/ETH`,
      },
      {
        label: 'Liquidity (Moonswap)',
        href: `https://swap.moonswap.in/#/add/${contracts.cake[process.env.REACT_APP_CHAIN_ID]}/ETH`,
      },
      {
        label: 'Charts',
        href: `https://charts.freeriver.exchange/?token=${contracts.cake[process.env.REACT_APP_CHAIN_ID]}`,
      },
    ],
  },
  {
    label: 'FrenchPress',
    icon: 'FrenchpressIcon',
    href: '/frenchpress',
  },
  {
    label: 'Drips',
    icon: 'DripIcon',
    href: '/drips',
  },
  // {
  //   label: 'Espresso',
  //   icon: 'EspressoIcon',
  //   href: '/espresso/moonkafe',
  // },
  // {
  //   label: 'Portfolio',
  //   icon: 'PortfolioIcon',
  //   href: '/portfolio',
  // },
  // {
  //   label: 'Lottery',
  //   icon: 'TicketIcon',
  //   href: '/lottery',
  // },
  // {
  //   label: 'NFT',
  //   icon: 'NftIcon',
  //   href: '/nft',
  // },
  // {
  //   label: 'Info',
  //   icon: 'InfoIcon',
  //   items: [
  //     {
  //       label: 'KoffeeSwap',
  //       href: `https://koffeeswap.exchange/#/swap?outputCurrency=${contracts.cake[process.env.REACT_APP_CHAIN_ID]}`,
  //     },
  //     {
  //       label: 'Kuswap',
  //       href: `https://kuswap.finance/#/swap?outputCurrency=${contracts.cake[process.env.REACT_APP_CHAIN_ID]}`,
  //     },
  //     // {
  //     //   label: 'CoinGecko',
  //     //   href: 'https://www.coingecko.com/en/coins/goose-finance',
  //     // },
  //     // {
  //     //   label: 'CoinMarketCap',
  //     //   href: 'https://coinmarketcap.com/currencies/goose-finance/',
  //     // },
  //     // {
  //     //   label: 'AstroTools',
  //     //   href: 'https://app.astrotools.io/pancake-pair-explorer/0x19e7cbecdd23a16dfa5573df54d98f7caae03019',
  //     // },
  //   ],
  // },
  // {
  //   label: 'Moonkafe Health',
  //   icon: 'StatusIcon',
  //   href: '/status',
  // },
  {
    label: 'More',
    icon: 'MoreIcon',
    items: [
      {
        label: 'Github',
        href: 'https://github.com/kukafe/',
      },
      {
        label: 'Docs',
        href: 'https://kukafe.gitbook.io/kukafe/',
      },
      {
        label: 'Blog',
        href: 'http://kafefinance.medium.com/',
      },
    ],
  },
  // {
  //   label: 'Obelisk Audit (soon)',
  //   icon: 'ObeliskIcon',
  //   href: '/audit',
  //   // href: '/status',
  // },

  // {
  //   label: 'Partnerships/IFO',
  //   icon: 'GooseIcon',
  //   href: 'https://docs.google.com/forms/d/e/1FAIpQLSe7ycrw8Dq4C5Vjc9WNlRtTxEhFDB1Ny6jlAByZ2Y6qBo7SKg/viewform?usp=sf_link',
  // },
  // {
  //   label: 'Audit by Hacken',
  //   icon: 'AuditIcon',
  //   href: 'https://www.goosedefi.com/files/hackenAudit.pdf',
  // },
  // {
  //   label: 'Audit by CertiK',
  //   icon: 'AuditIcon',
  //   href: 'https://certik.org/projects/goose-finance',
  // },
]

export default config
