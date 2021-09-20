import { useWallet } from 'use-wallet'
import React, { useState } from 'react'
import useBlock from 'hooks/useBlock'
import {
  getBalanceNumber,
  getBalanceNumberPrecisionFloatFixed,
  removeTrailingZero,
  toDollar,
  toDollarQuote,
} from 'utils/formatBalance'
import { ChefInfo, ChefPoolInfo, ChefPoolUserData, ChefType, getAbiFromChef } from 'config/constants/chefs'
import { PoolCategory } from 'config/constants/types'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'
import { Pool } from 'state/types'
import { useHideBalances, usePools } from 'state/hooks'
import { useChefHarvest, useSynChefHarvest } from 'hooks/useHarvest'
import useQuotePrice from 'hooks/useQuotePrice'
import styled from 'styled-components'

import {
  Card,
  CardBody,
  TicketRound,
  Text,
  Heading,
  Flex,
  Button,
  Image,
  LinkExternal,
  Tag,
  useModal,
} from '@pancakeswap-libs/uikit'
import contracts from 'config/constants/contracts'
import Balance from 'components/Balance'
import { BLOCKS_PER_YEAR } from 'config'
import usePriceRewards from 'hooks/usePriceRewards'
import ReactTooltip from 'react-tooltip'
import { useMediaQuery } from '@material-ui/core'
import { getMasterChefAddress } from 'utils/addressHelpers'
// import { poolsConfig } from 'config/constants';
// import MigrateFromFarmModal from '../MigrateFromFarmModal';
// import SelectVaultModal from '../SelectVaultModal';

interface CardProps {
  chef?: ChefInfo
  pool?: ChefPoolInfo
  userData?: ChefPoolUserData
  onRocketClick?: (chefId: number, poolId: string, lpToken: string) => void
}
const SECS_THRESOLD = 30 * 60

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

const VerticalFillDivider = styled.div`
  height: 100%;
  flex: 1;
`
const VerticalDivider = styled.div`
  height: 100%;
  width: 10px;
`
const MyLink = styled.a`
  // text-decoration: underline;
  :hover {
    text-decoration: underline;
  }
`

const StyledCard = styled(Card)`
  margin-top: 5px;
  margin-bottom: 5px;

  width: 100%;
`
const Card2 = styled(Card)`
  width: 98%;
  border-radius: 15px;
  max-width: 100% !important;
  margin-bottom: 10px !important;
  margin-left: 0px !important;
  // width: 100% !important;
  box-shadow: ${({ theme }) => (theme.isDark ? '2px 4px  #f5c42f17' : '2px 4px  #a0410d0f')};
`
const CardTopRow = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;

  // display: flex;
  // flex-direction: row;
  // justify-content: space-between;
  // align-items: center;
  width: 100%;
  // flex-wrap: wrap;

  display: grid;
  grid-template-columns: 3fr 4fr 1.5fr;
`
const CardTopRowGrid = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
`

const LeftSection = styled(FlexRowDiv)`
  flex: 2;
  height: auto;
  padding-left: 10px;
`
const MidSection = styled.div`
  flex: 3;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas: 'claimbutton left mid right';
`
const MidSectionMobile = styled.div`
  height: 100%;
  display: grid;

  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    'left mid right'
    'claimbutton claimbutton claimbutton';
`
const RightSection = styled(FlexRowDiv)`
  height: auto;
  justify-content: flex-end;
  padding-right: 12px;
`
const RightSectionMobile = styled(FlexRowDiv)`
  flex: 1;
  height: auto;
  justify-content: center;
`
const CardHeader = styled.div`
  align-items: center;
  display: flex;
`

const IconWrapper = styled.div`
  margin-right: 16px;
  svg {
    width: 48px;
    height: 48px;
  }
`

const TicketCountWrapper = styled.div`
  display: flex;
  flex-direction: column;
`
const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const EarningsButton = styled(Button)`
  font-size: 12px;
`
const TextEleLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 2;
`
const TextRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;

  width: 95%;
`
const TextEle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 3px;
  margin-right: 3px;
  // flex: 1;
`

const MobileRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  width: 100%;
`

const CardTopRowCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`
const MultiplierTag = styled(Tag)`
  margin-right: 3px;
`
const MyButton = styled(Button)`
  > div {
    color: black !important;
  }
  font-size: 12px;
  height: 24px;
  padding-left: 10px;
  padding-right: 10px;
  color: black !important;
  border-radius: 5px;
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
  height: 25px;
  width: 25px;
`

const ChefFarmCard: React.FC<CardProps> = ({ chef, pool, userData, onRocketClick }) => {
  const hasMinWidth = !useMediaQuery('(max-width:700px)')
  const { account } = useWallet()

  const quotePrice = useQuotePrice()
  const rewardPrices = usePriceRewards()
  const rewardPrice = rewardPrices[chef.rewardToken.toLowerCase()] || new BigNumber(0)
  const vaults = usePools(account)
  const hideBalances = useHideBalances()
  
  const vaultEquivalent = vaults.filter(
    (p) => p.stakingTokenAddress.toLowerCase() === pool.lpToken.toLowerCase(),
  )

  const hasVaultEquivalent = vaultEquivalent.length > 0
  // const [selectedSous, setSelectedSous] = useState(-1)
  // console.log("parent selectedSous", selectedSous)
  // const [onPresentFarmMigrate] = useModal(
  //   <MigrateFromFarmModal
  //     oldChef={chef}
  //     oldPool={pool}
  //     selectedSous={selectedSous}
  //     onConfirm={() => {console.log("confirm")}}
  //   />,
  // )

  const onPresentSelectVault = () => {
    onRocketClick(chef.chefId, pool.pid, pool.lpToken)
  }

  const { onReward: onRewardChef } = useChefHarvest(
    chef.masterchefAddress || getMasterChefAddress(),
    getAbiFromChef(chef),
    pool.pid,
    chef.referralMode,
    chef.stakingMode,
  )
  const { onReward: onRewardSyn } = useSynChefHarvest(
    (chef.type === ChefType.MASTERCHEF) ? getMasterChefAddress():pool.pid,
    getAbiFromChef(chef),
  )

  const onReward = () => {
    if (chef.type === ChefType.MASTERCHEF){
      onRewardChef()
    } 
    else if (chef.type === ChefType.MASTERCHEF_SYNTHETIX){
      onRewardSyn()
    }else {
      console.log(chef)

    }
  }



  // const allowance = new BigNumber(userData?.allowance || 0)
  // const stakingTokenBalance = new BigNumber(userData?.tokenBalance || 0)
  const stakedBalance = new BigNumber(userData?.stakedBalance || 0)
  const earnings = new BigNumber(userData?.earnings || 0)
  // const toDisplayNumber = (n) => {
  //   if (!n){
  //     return 0
  //   }
  //   return new BigNumber(latestEvent.lpAdded).dividedBy(1e18).precision(4, BigNumber.ROUND_UP).toString()

  // }
  // console.log(pool)
  const getDollar = (amtInQuote) => {
    return toDollar(amtInQuote, pool.baseToken.toLowerCase(), quotePrice)
  }

  const getStakedBalanceDollar = () => {
    if (pool.isLP) {
      return getDollar(new BigNumber(stakedBalance).multipliedBy(pool.lpTotalInQuoteToken).div(pool.depositedLp))
    }
    return getDollar(new BigNumber(stakedBalance).multipliedBy(pool.tokenPriceVsQuote).dividedBy(1e18))
  }
  // const getEarningsDollar = () => {
  //   return new BigNumber(earnings).dividedBy(1e18).multipliedBy(rewardPrice)
  // }

  const tvl = getDollar(new BigNumber(pool.lpTotalInQuoteToken))

  const stakedDollar = getStakedBalanceDollar()
  // const earningsDollar = getEarningsDollar()
  const depositFee = pool.depositFee
  // const getLpDollar = (amt) => {
  //   const stakeBalanceDollar = toDollar(amt.multipliedBy(pool.stakePriceAsQuoteToken), pool.lpBaseTokenAddress.toLowerCase(), {
  //     kcs: priceKCS,
  //     kafe: priceCAKE,
  //     eth: priceETH,
  //     bnb: priceBNB,
  //     kus: priceKUS,
  //   });

  //   // console.log(stakeBalanceDollar.dividedBy(1e18).precision(5).toString())
  //   return stakeBalanceDollar;
  // }
  const butcher = (n) => {
    return `${n.slice(0, 4)}...${n.slice(38)}`
  }

  // calculate tvl
  const getApy = () => {
    let cakeRewardPerBlock;
    let cakeRewardPerYear;
    if (chef.type === ChefType.MASTERCHEF){
      cakeRewardPerBlock = new BigNumber(chef.perBlock || 1)
        .times(new BigNumber(pool.poolWeight))
        .times(chef.rewardsMultiplier || 1)
        .times(chef.customRewardMultiplier || 1)
        .div(new BigNumber(10).pow(18))
      cakeRewardPerYear = cakeRewardPerBlock.times(BLOCKS_PER_YEAR)
    }else if (chef.type === ChefType.MASTERCHEF_SYNTHETIX){
      cakeRewardPerBlock = new BigNumber(pool.perBlock || 1)
        .div(new BigNumber(10).pow(18))
      cakeRewardPerYear = cakeRewardPerBlock.multipliedBy(86400 * 365)
    }
    // console.log("poolweight",farm.poolWeight)
    const apy = new BigNumber(rewardPrice).times(cakeRewardPerYear).times(100).dividedBy(tvl)
    return apy
  }
  const apy = getApy()

  const cleanName = (name) => {
    return name.replace('WKCS', 'KCS').replace('WBTC', 'BTC')
  }

  // const [onPresentSelectVault] = useModal(
  //   <SelectVaultModal
  //     vaults={vaultEquivalent}
  //     onConfirm={(sousId) => {
  //       console.log("select sousId",sousId);
  //       setSelectedSous(sousId);
  //       setTimeout(onPresentFarmMigrate,500)
  //     }}
  //     apy={apy}
  //   />,
  // )

  const stakingTokenName = pool.isLP ? cleanName(`${pool.tokString}-${pool.quoteString}`) : cleanName(pool.tokString)
  const image = cleanName(stakingTokenName)

  // console.log(pool)
  const left = () => {
    const content = (
      <>
        <div style={{ width: 80, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={`./images/tokens/${image.toUpperCase()}.png`} width={pool.isLP ? 80 : 52} height={52} alt={stakingTokenName} />
        </div>

        <VerticalDivider />
        <TextEleLeft>
          <div style={{ display: 'flex', alignItems: 'flex-end', flexDirection: 'row', width: '100%' }}>
            <Text color="primary">{stakingTokenName}</Text>

            {hasVaultEquivalent && (
              <BoostIconContainer onClick={onPresentSelectVault}>
                <BoostIcon
                  data-delay-show={300}
                  data-tip="Optimize yield with moonkafe"
                  src="images/rocket.png"
                  width={25}
                  height={25}
                />
              </BoostIconContainer>
            )}
          </div>
          <ReactTooltip />
          <Text style={{ marginTop: '-5px' }} color="grey" fontSize="15px">
            <MyLink href={chef.projectLink}>{chef.name}</MyLink>
          </Text>
          <TextRow>
            {depositFee ? <MultiplierTag variant="failure">{depositFee}% Deposit Fee</MultiplierTag> : ''}
          </TextRow>
        </TextEleLeft>
      </>
    )

    return <LeftSection>{content}</LeftSection>
  }
  const middle = () => {
    const content = (
      <>
        {earnings.isGreaterThan(0) ? (
          <TextEle style={{ gridArea: 'claimbutton' }}>
            <Text style={{ textAlign: 'center' }} color="grey" fontSize="12px">
              Claim
            </Text>

            <MyButton onClick={onReward}>
              {hideBalances ? (
                <Text fontSize="20px">*****</Text>
              ) : (
                <Balance decimals={2} fontSize="20px" value={getBalanceNumber(earnings)} />
              )}
            </MyButton>

            <Text style={{ textAlign: 'center' }} color="grey" fontSize="12px">
              Pending {chef.rewardTokenSymbol}
            </Text>
          </TextEle>
        ) : (
          ''
        )}

        <TextEle style={{ gridArea: 'left' }}>
          {!stakedBalance.isGreaterThan(0) ? (
            <div style={{ textAlign: 'center', fontSize: '20px' }}>0</div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {/* <Balance decimals={4} fontSize="20px" value={getBalanceNumber(stakedBalance)} />
              <Balance decimals={2} suffix=")" prefix="($" fontSize="14px" value={stakedDollar.toNumber()} /> */}

              {hideBalances ? (
                <Text fontSize="18px">*****</Text>
              ) : (
                <>
                  <Text fontSize="18px">{removeTrailingZero(getBalanceNumber(stakedBalance), 2)}</Text>
                  <Text style={{ marginTop: '-5px' }} fontSize="12px">
                    (${stakedDollar.toFixed(2)})
                  </Text>
                </>
              )}
            </div>
          )}

          <Text color="grey" fontSize="12px">
            Staked
          </Text>
        </TextEle>

        <TextEle style={{ gridArea: 'mid' }}>
          <div style={{ textAlign: 'center', fontSize: '20px' }}>
            {!apy ? 0 : getBalanceNumberPrecisionFloatFixed(apy.dividedBy(365), 0, 2)}%
          </div>
          <Text color="grey" fontSize="12px">
            Daily
          </Text>
        </TextEle>

        <TextEle style={{ gridArea: 'right' }}>
          <div style={{ textAlign: 'center', fontSize: '20px' }}>
            {!apy ? 0 : getBalanceNumberPrecisionFloatFixed(apy, 0, 2)}%
          </div>
          <Text color="grey" fontSize="12px">
            APR
          </Text>
        </TextEle>
      </>
    )

    if (hasMinWidth) {
      return <MidSection>{content}</MidSection>
    }
    return <MidSectionMobile>{content}</MidSectionMobile>
  }
  const right = () => {
    const content = (
      <TextEle>
        <div>
          {!apy ? (
            <Balance decimals={0} fontSize="20px" value={0} />
          ) : (
            <Balance fontSize="20px" value={tvl.toNumber()} decimals={0} prefix="$" />
          )}
        </div>
        <Text color="grey" fontSize="12px">
          TVL
        </Text>
      </TextEle>
    )
    if (hasMinWidth) {
      return <RightSection>{content}</RightSection>
    }

    return <RightSectionMobile>{content}</RightSectionMobile>
  }

  return (
    <Card2>
      {hasMinWidth ? (
        <CardTopRow>
          {left()}
          {middle()}
          {right()}
        </CardTopRow>
      ) : (
        <CardTopRowGrid>
          {left()}
          {middle()}
          {right()}
        </CardTopRowGrid>
      )}
    </Card2>
  )
}

export default ChefFarmCard
