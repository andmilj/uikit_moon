import React, { useEffect, useCallback, useState } from 'react'
import { Route, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'
import { Helmet } from 'react-helmet'
import useQuotePrice from 'hooks/useQuotePrice'
import { useDispatch } from 'react-redux'
import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import { provider } from 'web3-core'
import { Image, Heading } from '@pancakeswap-libs/uikit'
import { BLOCKS_PER_YEAR } from 'config'
import FlexLayout from 'components/layout/Flex'
import Page from 'components/layout/Page'
import { useFarms } from 'state/hooks'
import useRefresh from 'hooks/useRefresh'
import { toDollarQuote } from 'utils/formatBalance'
import useI18n from 'hooks/useI18n'
import useCakePrice from 'hooks/useCakePrice'
import usePriceRewards from 'hooks/usePriceRewards'
import FarmCard, { FarmWithStakedValue } from './components/FarmCard/FarmCard'
import FarmTabButtons from './components/FarmTabButtons'
import Divider from './components/Divider'

export interface FarmsProps {
  tokenMode?: boolean
}

const Farms: React.FC<FarmsProps> = (farmsProps) => {
  const { path } = useRouteMatch()
  const { account, ethereum }: { account: string; ethereum: provider } = useWallet()
  const TranslateString = useI18n()
  const farmsLP = useFarms(account)

  const rewardPrices = usePriceRewards()
  const quotePrice = useQuotePrice()
  const { tokenMode } = farmsProps

  const dispatch = useDispatch()
  const { fastRefresh } = useRefresh()

  const [stakedOnly, setStakedOnly] = useState(false)

  const activeFarms = farmsLP.filter((farm) => !!farm.isTokenOnly === !!tokenMode && farm.multiplier !== '0X')
  const inactiveFarms = farmsLP.filter((farm) => !!farm.isTokenOnly === !!tokenMode && farm.multiplier === '0X')

  const stakedOnlyFarms = activeFarms.filter(
    (farm) => farm.userData && new BigNumber(farm.userData.stakedBalance).isGreaterThan(0),
  )

  // /!\ This function will be removed soon
  // This function compute the APY for each farm and will be replaced when we have a reliable API
  // to retrieve assets prices against USD
  const farmsList = useCallback(
    (farmsToDisplay, removed: boolean) => {
      // const cakePriceVsBNB = new BigNumber(farmsLP.find((farm) => farm.pid === CAKE_POOL_PID)?.tokenPriceVsQuote || 0)
      const farmsToDisplayWithAPY: FarmWithStakedValue[] = farmsToDisplay.map((farm) => {
        // if (!farm.tokenAmount || !farm.lpTotalInQuoteToken || !farm.lpTotalInQuoteToken) {
        //   return farm
        // }
        const cakeRewardPerBlock = new BigNumber(farm.eggPerBlock || 1)
          .times(new BigNumber(farm.poolWeight))
          .times(farm.rewardsMultiplier || 1)
          .div(new BigNumber(10).pow(18))
        const cakeRewardPerYear = cakeRewardPerBlock.times(BLOCKS_PER_YEAR)
        // console.log("poolweight",farm.poolWeight)
        // console.log("rewardsMultiplier",farm.rewardsMultiplier)
        // console.log("cakeRewardPerBlock",cakeRewardPerBlock.toString())
        // console.log("rewardPrices",rewardPrices)
        // console.log("cakeRewardPerYear",cakeRewardPerYear.toString())
        // console.log("quotePrice", quotePrice)
        const rPrice =
          farm.farmType === 'native'
            ? quotePrice.kafe
            : rewardPrices[farm.customRewardToken.toLowerCase()] || new BigNumber(1)

        let apy = rPrice.times(cakeRewardPerYear)
        // console.log("apy", apy.toString())

        // 9808313364
        let totalValue = new BigNumber(farm.lpTotalInQuoteToken || 0)

        totalValue = toDollarQuote(totalValue, farm.quoteTokenSymbol, quotePrice)
        // console.log("totalValue",totalValue.toString())
        if (totalValue.comparedTo(0) > 0) {
          apy = apy.div(totalValue)
        } else {
          apy = apy.div(500)
        }
        return { ...farm, apy }
      })
      // console.log(farmsToDisplayWithAPY)
      return farmsToDisplayWithAPY.map((farm) => (
        <FarmCard
          key={`${farm.farmType}-${farm.pid}`}
          farm={farm}
          removed={removed}
          ethereum={ethereum}
          account={account}
        />
      ))
    },
    [rewardPrices, quotePrice, account, ethereum],
  )

  return (
    <>
      <Helmet>
        <title>Moonkafe Finance</title>
      </Helmet>

      <WidePage>
        <Heading as="h1" size="lg" color="primary" mb="50px" style={{ textAlign: 'center' }}>
          {tokenMode ? 'Stake tokens to earn KAFE' : 'Stake LP tokens to earn KAFE'}
        </Heading>
        <Heading as="h2" color="secondary" mb="50px" style={{ textAlign: 'center' }}>
          {TranslateString(10000, 'Deposit Fee will be used to buyback KAFE')}
        </Heading>
        <FarmTabButtons stakedOnly={stakedOnly} setStakedOnly={setStakedOnly} />
        <div>
          <Divider />
          <FlexLayout>
            <Route exact path={`${path}`}>
              {stakedOnly ? farmsList(stakedOnlyFarms, false) : farmsList(activeFarms, false)}
            </Route>
            <Route exact path={`${path}/history`}>
              {farmsList(inactiveFarms, true)}
            </Route>
          </FlexLayout>
        </div>
        {/* <Image src="./images/egg/8.png" alt="illustration" width={1352} height={587} responsive /> */}
      </WidePage>
    </>
  )
}

const WidePage = styled(Page)`
  max-width: 100% !important;
  width: 100% !important;
`
export default Farms
