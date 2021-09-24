import React, { useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import ReactTooltip from 'react-tooltip'
import styled, { keyframes } from 'styled-components'
import { toDollarQuote } from 'utils/formatBalance'
import useCakePrice from 'hooks/useCakePrice'
import useQuotePrice from 'hooks/useQuotePrice'
import usePriceRewards from 'hooks/usePriceRewards'
import { Flex, Text, Skeleton, Image } from '@pancakeswap-libs/uikit'
import { communityFarms } from 'config/constants'
import { Farm } from 'state/types'
import { provider } from 'web3-core'
import useI18n from 'hooks/useI18n'
import ExpandableSectionButton from 'components/ExpandableSectionButton'
import { QuoteToken } from 'config/constants/types'
import DetailsSection from './DetailsSection'
import CardActionsContainer from './CardActionsContainer'
import ApyButton from './ApyButton'
import CardHeading from './CardHeading'
import contracts from '../../../../config/constants/contracts'

export interface FarmWithStakedValue extends Farm {
  apy?: BigNumber
}

const RainbowLight = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`

const StyledCardAccent = styled.div`
  background: linear-gradient(
    45deg,
    rgba(255, 0, 0, 1) 0%,
    rgba(255, 154, 0, 1) 10%,
    rgba(208, 222, 33, 1) 20%,
    rgba(79, 220, 74, 1) 30%,
    rgba(63, 218, 216, 1) 40%,
    rgba(47, 201, 226, 1) 50%,
    rgba(28, 127, 238, 1) 60%,
    rgba(95, 21, 242, 1) 70%,
    rgba(186, 12, 248, 1) 80%,
    rgba(251, 7, 217, 1) 90%,
    rgba(255, 0, 0, 1) 100%
  );
  background-size: 300% 300%;
  animation: ${RainbowLight} 2s linear infinite;
  border-radius: 16px;
  filter: blur(6px);
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  z-index: -1;
`

const FCard = styled.div`
  max-width: 22% !important;
  align-self: baseline;
  background: ${(props) => props.theme.card.background};
  border-radius: 32px;
  box-shadow: 0px 2px 12px -8px rgba(25, 19, 38, 0.1), 0px 1px 1px rgba(25, 19, 38, 0.05);
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 24px;
  position: relative;
  text-align: center;
`

const Divider = styled.div`
  background-color: ${({ theme }) => theme.colors.borderColor};
  height: 1px;
  margin: 28px auto;
  width: 100%;
`

const ExpandingWrapper = styled.div<{ expanded: boolean }>`
  height: ${(props) => (props.expanded ? '100%' : '0px')};
  overflow: hidden;
`
const Expand = styled.div`
  flex: 1;
`

interface FarmCardProps {
  farm: FarmWithStakedValue
  removed: boolean
  ethereum?: provider
  account?: string
}

const FarmCard: React.FC<FarmCardProps> = ({ farm, removed, ethereum, account }) => {
  const TranslateString = useI18n()
  const cakePrice = useCakePrice()
  const rewardPrices = usePriceRewards()
  const rPrices =
    farm.farmType === 'native' ? cakePrice : rewardPrices[farm.customRewardToken.toLowerCase()] || new BigNumber(1)

  const quotePrices = useQuotePrice()
  const [showExpandableSection, setShowExpandableSection] = useState(false)

  // const isCommunityFarm = communityFarms.includes(farm.tokenSymbol)
  // We assume the token name is coin pair + lp e.g. CAKE-BNB LP, LINK-BNB LP,
  // NAR-CAKE LP. The images should be cake-bnb.svg, link-bnb.svg, nar-cake.svg
  // const farmImage = farm.lpSymbol.split(' ')[0].toLocaleLowerCase()
  const farmImage = farm.isTokenOnly
    ? farm.tokenSymbol.toLowerCase()
    : `${farm.tokenSymbol.toLowerCase()}-${farm.quoteTokenSymbol.toLowerCase()}`
  const totalValue: BigNumber = useMemo(() => {
    // console.log(farm.tokenSymbol, farm.quoteTokenSymbol, farm.lpTotalInQuoteToken)

    if (!farm.lpTotalInQuoteToken) {
      return null
    }
    return toDollarQuote(farm.lpTotalInQuoteToken, farm.quoteTokenSymbol, quotePrices)
  }, [quotePrices, farm.lpTotalInQuoteToken, farm.quoteTokenSymbol])

  const myValue: BigNumber = useMemo(() => {
    let value = new BigNumber(0)
    if (farm.userData && farm.tokenPriceVsQuote && farm.userData.stakedBalance) {
      if (farm.isTokenOnly) {
        const quoteTokenAddress = farm.quoteTokenAdresses[process.env.REACT_APP_CHAIN_ID]
        let val = new BigNumber(farm.tokenPriceVsQuote)
          .times(farm.userData.stakedBalance)
          // token not having 18 decimals need to be fixed
          .dividedBy(new BigNumber(10).pow(contracts.tokenDecimals[quoteTokenAddress.toLocaleLowerCase()] || 18))
          .times(new BigNumber(10).pow(18))

        val = toDollarQuote(val, farm.quoteTokenSymbol, quotePrices)
        value = value.plus(val)
      } else if (farm.userData?.stakedBalance && farm.lpTotalInQuoteToken) {
        // get staked lp divided by total staked lp(raw),  times by lpTotalInQuoteToken
        // let val = new BigNumber(farm.tokenAmount).times(2).times(farm.tokenPriceVsQuote);
        // console.log(farm.tokenAmount, farm.tokenPriceVsQuote, val.toString())

        let val = new BigNumber(farm.userData.stakedBalance)
          .multipliedBy(farm.lpTotalInQuoteToken)
          .div(farm.depositedLp)
        val = toDollarQuote(val, farm.quoteTokenSymbol, quotePrices)
        value = value.plus(val.times(1e18))
      }
    }
    return value
  }, [
    quotePrices,
    farm.quoteTokenAdresses,
    farm.depositedLp,
    farm.isTokenOnly,
    farm.lpTotalInQuoteToken,
    farm.quoteTokenSymbol,
    farm.tokenPriceVsQuote,
    farm.userData,
  ])

  const totalValueFormated = totalValue
    ? `$${Number(totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : '-'

  const lpLabel = farm.lpSymbol
  const earnLabel = farm.farmType === 'native' ? 'KAFE' : farm.customRewardTokenSymbol

  const isFinished = farm.farmEnd ? Date.now() / 1000 >= farm.farmEnd : false

  const farmAPY =
    farm.apy &&
    farm.apy.times(new BigNumber(100)).toNumber().toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  // console.log("farmImage",farmImage)
  const { quoteTokenAdresses, quoteTokenSymbol, tokenAddresses, risk } = farm
  return (
    <FCard>
      {farm.tokenSymbol === 'KAFE' && <StyledCardAccent />}
      <CardHeading
        lpLabel={lpLabel}
        multiplier={farm.multiplier}
        risk={risk}
        depositFee={farm.depositFeeBP}
        farmImage={farmImage.toUpperCase()}
        tokenSymbol={farm.tokenSymbol}
        isToken={farm.isTokenOnly}
        farmType={farm.farmType}
        earnSymbol={farm.customRewardTokenSymbol}
        farmEnd={farm.farmEnd}
        farmStart={farm.farmStart}
      />
      {!removed && (
        <Flex justifyContent="space-between" alignItems="center">
          <Text>{TranslateString(352, 'APR')}:</Text>
          <Text bold style={{ display: 'flex', alignItems: 'center' }}>
            {farm.apy ? (
              <>
                <ApyButton
                  lpLabel={lpLabel}
                  quoteTokenAdresses={quoteTokenAdresses}
                  quoteTokenSymbol={quoteTokenSymbol}
                  tokenAddresses={tokenAddresses}
                  cakePrice={rPrices}
                  apy={isFinished ? new BigNumber(0) : farm.apy}
                  isToken={farm.isTokenOnly}
                  customRewardTokenSymbol={farm.customRewardTokenSymbol}
                />
                {isFinished ? 0 : farmAPY}%
              </>
            ) : (
              <Skeleton height={24} width={80} />
            )}
          </Text>
        </Flex>
      )}
      <Flex justifyContent="space-between">
        <Text>{TranslateString(318, 'Earn')}:</Text>
        <Expand />
        <Text bold>{earnLabel}</Text>
      </Flex>
      {farm.depositFeeBP > 0 ? (
        <Flex justifyContent="space-between" alignItems="center">
          <Text style={{ fontSize: '24px' }}>{TranslateString(10001, 'Deposit Fee')}:</Text>
          <Text bold style={{ fontSize: '24px' }}>
            {farm.depositFeeBP / 100}%
          </Text>
        </Flex>
      ) : (
        ''
      )}
      <CardActionsContainer farm={farm} ethereum={ethereum} account={account} />
      <Divider />
      <ExpandableSectionButton
        onClick={() => setShowExpandableSection(!showExpandableSection)}
        expanded={showExpandableSection}
      />
      <ExpandingWrapper expanded={showExpandableSection}>
        <DetailsSection
          removed={removed}
          isTokenOnly={farm.isTokenOnly}
          bscScanAddress={
            farm.isTokenOnly
              ? `https://blockscout.moonriver.moonbeam.network/tokens/${
                  farm.tokenAddresses[process.env.REACT_APP_CHAIN_ID]
                }`
              : `https://blockscout.moonriver.moonbeam.network/tokens/${
                  farm.lpAddresses[process.env.REACT_APP_CHAIN_ID]
                }`
          }
          totalValueFormated={totalValueFormated}
          lpLabel={lpLabel}
          quoteTokenAdresses={quoteTokenAdresses}
          quoteTokenSymbol={quoteTokenSymbol}
          tokenAddresses={tokenAddresses}
          myValue={myValue}
        />
      </ExpandingWrapper>
    </FCard>
  )
}

export default FarmCard
