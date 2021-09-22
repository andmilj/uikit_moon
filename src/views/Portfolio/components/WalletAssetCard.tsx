import BigNumber from 'bignumber.js'
import ReactTooltip from 'react-tooltip'
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import React, { useState } from 'react'
import { useWallet } from 'use-wallet'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import { useMediaQuery } from '@material-ui/core'
import useTheme from 'hooks/useTheme'
import { Pool } from 'state/types'
import { useHideBalances, usePools } from 'state/hooks'
import styled from 'styled-components'
import Tooltip from '@material-ui/core/Tooltip'
import { Image, Text, useModal } from '@pancakeswap-libs/uikit'
import contracts from 'config/constants/contracts'
import { TokenInfo } from 'config/constants/tokens'
import { getBalanceNumber, getBalanceNumberPrecisionFloatFixed, getDecimals, mightHide, removeTrailingZero } from 'utils/formatBalance'
import { PoolCategory } from 'config/constants/types'
import SelectVaultModal from './SelectVaultModal'
import MigrateFromWalletModal from './MigrateFromWalletModal'

interface WalletAssetCardProps {
  token: TokenInfo
  onRocketClick: (lpToken: string) => void
}

const FlexRowDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`
const FlexColDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`

const WalletAssetRow = styled(FlexRowDiv)`
  justify-content: space-between;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 5px;
  width: 100%;
  :hover {
    background-color: ${(props) => (props.theme.isDark ? '#444444' : '#eeeeee')};
  }
`
const ExpandingSpacer = styled.div`
  flex: 1;
`

const TokenLogo = styled(FlexColDiv)`
  height: 48px;
  margin-right: 10px;
  width: 46px;
  min-width: 46px;
`

const TokenRight = styled(FlexColDiv)`
  align-items: flex-end;
`

const TokenLeft = styled(FlexColDiv)`
  align-items: flex-start;
`
const BoostIcon = styled(Image)`
  animation: blink 5s ease-in infinite;
  cursor: pointer;
  @keyframes blink {
    from,
    to {
      opacity: 0.9;
    }
    50% {
      opacity: 0.2;
    }
  }
`
const BoostIconContainer = styled.div`
  height: 20px;
  width: 20px;
  min-width: 20px;
`
const WalletAssetCard: React.FC<WalletAssetCardProps> = ({ token, onRocketClick }) => {
  const { account, ethereum} = useWallet()
  const logoWidth = token.image ? 46 : 32
  const { isDark } = useTheme()
  const vaults = usePools(account)
  const hasMinWidth = !useMediaQuery('(max-width:700px)')

  //   const vaults = [] //  usePools(account)

  const vaultEquivalent = vaults.filter((p) => p.stakingTokenAddress.toLowerCase() === token.address.toLowerCase())
  const hasVaultEquivalent = vaultEquivalent.length > 0
  const hideBalances = useHideBalances()

  const onPresentSelectVault = () => {
    onRocketClick(token.address)
  }
  //   const [onPresentWalletMigrate] = useModal(
  //     <MigrateFromWalletModal
  //       selectedSous={selectedSous}
  //       onConfirm={() => {console.log("confirm")}}
  //     />,
  //   )

  //   const [onPresentSelectVault] = useModal(
  //     <SelectVaultModal
  //       vaults={vaultEquivalent}
  //       onConfirm={(sousId) => {
  //         console.log("select sousId",sousId);
  //         setSelectedSous(sousId);
  //         setTimeout(() => {
  //             if (selectedSous > 0){
  //                 onPresentWalletMigrate()
  //             }
  //         }, 200)
  //       }}
  //       apy={new BigNumber(0)}
  //     />,
  //   )

  const logoClick = () => {
    window.open(getWalletLink(token), '_blank')
  }
  const toChart = () => {
    window.open(`https://charts.freeriver.exchange/?token=${token.address.toLowerCase()}`, '_blank')
    
  }
  
  const addToMeta = async ()=>{
    const wasAdded = await ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: token.address, // The address that the token is at.
          symbol: token.symbol
          .replace(/[^\w]/gi, '')
          .replace("SOLARLP","SLP")
          .replace("MOONLP","MLP")
          .replace("FREELP","FLP")
          .slice(0,11)
          ,
          decimals: token.decimals || 18, // The number of decimals in the token
          image: token.isLP?null:`https://moon.kafe.finance/images/tokens/${token.symbol}.png`, // A string url of the token logo
        },
      },
    });
    console.log("wasAdded", wasAdded)
  
  }

  const getWalletLink = (t) => {
    // if (!token.isLP) {
    //   return `https://kcc.poocoin.app/tokens/${token.address}`
    // }

    if (token.routerForQuote === contracts.moonRouter) {
      return (token.isLP) ? `https://swap.moonfarm.in/#/remove/${token.token0.toLowerCase().replace(contracts.WMOVR.toLowerCase(), 'ETH')}/${token.token1}`:
        `https://swap.moonfarm.in/#/swap?inputCurrency=${token.address}`
    }
    if (token.routerForQuote === contracts.solarRouter) {
      return (token.isLP) ? `https://solarbeam.io/exchange/remove/${token.token0.toLowerCase().replace(contracts.WMOVR.toLowerCase(), 'ETH')}/${token.token1}`:
      `https://solarbeam.io/exchange/swap?inputCurrency=${token.address}`
    }
    if (token.routerForQuote === contracts.freeRouter) {
      return (token.isLP) ?  `https://freeriver.exchange/#/remove/${token.token0.toLowerCase().replace(contracts.WMOVR.toLowerCase(), 'ETH')}/${token.token1}`:
      `https://freeriver.exchange/#/swap?inputCurrency=${token.address}`
    }
    return ''
  }
  
  const getExchange = () => {
    // if (!token.isLP) {
    //   return 'poocoin'
    // }

    if (token.routerForQuote === contracts.moonRouter) {
      return 'moonswap'
    }
    if (token.routerForQuote === contracts.solarRouter) {
      return 'solarbeam'
    }
    if (token.routerForQuote === contracts.freeRouter) {
      return 'freeriver'
    }
   
    return ''
  }
  const viewOn = getExchange()

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  // onClick={logoClick}
  return (
    <WalletAssetRow key={token.symbol}>
      <ReactTooltip />


      <TokenLogo style={{ cursor: 'pointer' }} data-delay-show={300} data-tip={`View on ${viewOn}`} 
      aria-controls="basic-menu"
      aria-haspopup="true"
      aria-expanded={open ? 'true' : undefined}
      onClick={handleClick}
      >
        <Image
          src={`images/tokens/${token.image || token.symbol}.png`}
          width={logoWidth}
          height={32}
          alt={token.symbol}
        />
      </TokenLogo>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        {(token.isLP) ? (<MenuItem onClick={logoClick}>Liquidity</MenuItem>):(<MenuItem onClick={logoClick}>Swap</MenuItem>)}
        {(!token.isLP) && <MenuItem onClick={toChart}>Chart</MenuItem>}
        {token.symbol !== "MOVR" && <MenuItem onClick={addToMeta}>Add To Metamask</MenuItem>}
        {/* <MenuItem onClick={handleClose}>Logout</MenuItem> */}
      </Menu>


      <TokenLeft>
        <FlexRowDiv style={{ justifyContent: 'flex-start' }}>
          <Text fontSize="16px">{token.symbol}</Text>
          {hasVaultEquivalent && (
            <BoostIconContainer
              data-delay-show={300}
              data-tip="Optimize yield with moonkafe"
              onClick={onPresentSelectVault}
            >
              <BoostIcon src="images/rocket.png" width={20} height={20} />
            </BoostIconContainer>
          )}
        </FlexRowDiv>

        <Text color="grey" fontSize="14px">
          {mightHide(`${removeTrailingZero(getBalanceNumber(token.balance, token.decimals))}`, hideBalances)}{' '}
          {token.image || token.symbol}
          {hasMinWidth ? (<>
            {` - $${token.valuePer}`}
          </>):("")}
        </Text>
      </TokenLeft>

      <ExpandingSpacer />

      <TokenRight>
        {(token.isLP ? (<Text data-effect="solid" data-multiline data-tip={`${removeTrailingZero(getBalanceNumber(token.balanceToken0, getDecimals(token.token0)),2)} ${token.token0Symbol}<br>+<br>${removeTrailingZero(getBalanceNumber(token.balanceToken1,getDecimals(token.token1)),2)} ${token.token1Symbol}`} fontSize="16px">{mightHide(`$${token.value.toLocaleString()}`, hideBalances)}</Text>):
          (<Text fontSize="16px">{mightHide(`$${token.value.toLocaleString()}`, hideBalances)}</Text>))}
        
      </TokenRight>
    </WalletAssetRow>
  )
}
export default WalletAssetCard
