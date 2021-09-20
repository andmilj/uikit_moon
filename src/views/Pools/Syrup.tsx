import React, { useState } from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch } from 'react-redux'
import contracts from 'config/constants/contracts'
import guestConfig from 'config/constants/guest'
import { Route, useLocation, useRouteMatch } from 'react-router-dom'
import { getMasterChefAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { useWallet } from 'use-wallet'
import { Checkbox, Heading, Text } from '@pancakeswap-libs/uikit'
import { setHideBalancesAction } from 'state/config'
import orderBy from 'lodash/orderBy'
import { getCakeProfitsPerYearVs, getVsApy, hasTikuStake, hasVaultStake } from 'utils/callHelpers'
import useI18n from 'hooks/useI18n'
import useBlock from 'hooks/useBlock'
import { toDollar } from 'utils/formatBalance'
import useQuotePrice from 'hooks/useQuotePrice'
import { useMediaQuery } from '@material-ui/core'
import { useFarms, useGuestFromProject, useGuests, useHideBalances, usePools } from 'state/hooks'
import { PoolCategory, QuoteToken } from 'config/constants/types'
import FlexLayout from 'components/layout/Flex'
import Page from 'components/layout/Page'
import PoolCard2 from './components/PoolCard2'
import PoolTabButtons from './components/PoolTabButtons'
import Divider from './components/Divider'

const Farm: React.FC = () => {
  const hasMinWidth = !useMediaQuery('(max-width:700px)')

  const { path } = useRouteMatch()
  const TranslateString = useI18n()
  const { account } = useWallet()
  const pools = usePools(account)
  const farms = useFarms(account)
  const block = useBlock()

  const quotePrice = useQuotePrice()
  const [onlyStaked, setOnlyStaked] = useState(false)
  const [sortApy, setSortApy] = useState(true)
  const g = useGuests(account)
  const tikuPool = useGuestFromProject('Tiku')
  const dispatch = useDispatch()
  const hideBalances = useHideBalances()

  const toggleHideBalances = () => {
    dispatch(setHideBalancesAction(!hideBalances))
  }

  const toggleOnlyStaked = () => setOnlyStaked(!onlyStaked)
  const toggleSortApy = () => setSortApy(!sortApy)

  // find pools with vault share staking.
  // const farmIdsNeeded = pools.filter(p => !p.hidden && p.vaultShareFarmPid).map(p => ({
  //   vaultShareFarmPid: p.vaultShareFarmPid,
  //   vaultShareFarmContract: p.vaultShareFarmContract??getMasterChefAddress(),
  //   vaultShareRewardToken: p.vaultShareRewardToken,

  // }));
  // const vFarms = farmIdsNeeded.reduce((acc,neededFarm) => {
  //   // console.log(farms,neededId)
  //   return {
  //    ...acc,
  //    [neededId]: farms.find(f => `${f.pid}` === `${neededId}`)
  //   }

  // },{})
  // console.log("vFarms",vFarms)

  const getDollarValue = (quoteTokenAmt, lpBaseTokenAddress) => {
    return toDollar(quoteTokenAmt, lpBaseTokenAddress.toLowerCase(), quotePrice)
  }

  const combinedPools = [...pools, tikuPool]

  const dollarProfitsPerYearVs = getCakeProfitsPerYearVs(
    combinedPools.filter((p) => p && !p.hidden && p.vaultShareFarmPid >= 0),
  )
  Object.keys(dollarProfitsPerYearVs).forEach((_sousId) => {
    const _pool = combinedPools.find((p) => p.sousId === parseInt(_sousId))
      // console.log(_sousId, _pool.image, dollarProfitsPerYearVs[_sousId].toString(), dollarProfitsPerYearVs[_sousId].toString())
      dollarProfitsPerYearVs[_sousId] = getDollarValue(
      dollarProfitsPerYearVs[_sousId],
      _pool.vaultShareRewardToken || contracts.KAFE,
      )
      // console.log(_sousId, _pool.image, "$", dollarProfitsPerYearVs[_sousId].toString())
  })

  const poolsWithApy = (
    onlyStaked ? pools.filter((p) => !p.hidden && hasVaultStake(p)) : pools.filter((p) => !p.hidden)
  ).map((pool) => {
    const totalStaked = getDollarValue(
      new BigNumber(pool.totalStakedAsQuoteToken),
      pool.lpBaseTokenAddress.toLowerCase(),
    )
    // console.log("totalStaked",pool.totalStakedAsQuoteToken,totalStaked.toString())
    const vsApy = getVsApy(pool, dollarProfitsPerYearVs[pool.sousId], getDollarValue)

    const privatePoolInfo =
      pool && pool.userData && pool.userData.privatePoolInfo
        ? {
            ...pool.userData.privatePoolInfo,
            stakedAmt: pool.userData.privatePoolInfo.stakedAmt.map((a) => new BigNumber(a)),
            rewardLockedUp: pool.userData.privatePoolInfo.rewardLockedUp.map((a) => new BigNumber(a)),
            allowance: pool.userData.privatePoolInfo.allowance.map((a) => new BigNumber(a)),
            stakingTokenBalance: pool.userData.privatePoolInfo.stakingTokenBalance.map((a) => new BigNumber(a)),
            capital: pool.userData.privatePoolInfo.capital.map((a) => new BigNumber(a)),
            pendingRewards: pool.userData.privatePoolInfo.pendingRewards.map((a) => new BigNumber(a)),
          }
        : {}

    let stakeBalanceDollar = new BigNumber(0)
    let stakeVsBalanceDollar = new BigNumber(0)

    let bothTotalStaked = new BigNumber(0) // stakedBalance.plus(stakedVsBalance);
    let bothTotalStakedDollar = new BigNumber(0) // stakeBalanceDollar.plus(stakeVsBalanceDollar);
    // normal vault
    if (
      pool &&
      pool.stakePriceAsQuoteToken &&
      pool.userData &&
      pool.userData.stakedBalance &&
      new BigNumber(pool.userData.stakedBalance).isGreaterThan(0)
    ) {
      // console.log(pool.tokenName, pool.userData.stakedBalance, pool.apy, pool.pricePerShare)

      stakeBalanceDollar = getDollarValue(
        new BigNumber(pool.userData.stakedBalance)
          .multipliedBy(pool.pricePerShare)
          .multipliedBy(pool.stakePriceAsQuoteToken),
        pool.lpBaseTokenAddress,
      )
      // console.log("stakeBalanceDollar",stakeBalanceDollar.toString())
      bothTotalStaked = bothTotalStaked.plus(pool.userData.stakedBalance)
      bothTotalStakedDollar = bothTotalStakedDollar.plus(stakeBalanceDollar)
    }

    // with vs
    if (pool && pool.stakePriceAsQuoteToken && vsApy.isGreaterThan(0)) {
      const stakedVsBalance = pool.userData ? new BigNumber(pool.userData.stakedVsBalance) : new BigNumber(0)
      // const totalVsApy = new BigNumber(pool.apy).plus(vsApy);
      stakeVsBalanceDollar = getDollarValue(
        stakedVsBalance.multipliedBy(pool.pricePerShare).multipliedBy(pool.stakePriceAsQuoteToken),
        pool.lpBaseTokenAddress,
      )
      // console.log("vs earnings",stakeVsBalanceDollar.multipliedBy(totalVsApy).dividedBy(36500).toFixed(2))

      bothTotalStaked = bothTotalStaked.plus(stakedVsBalance)
      bothTotalStakedDollar = bothTotalStakedDollar.plus(stakeVsBalanceDollar)
    }

    const r = {
      ...pool,
      isFinished: pool.sousId === 0 ? false : pool.isFinished || block > pool.endBlock,
      apy: pool.apy,
      // apyCompound: pool.apyCompound,
      // apyCompoundDay: pool.apyCompoundDay,
      totalStaked: pool.totalStakedAsQuoteToken ? totalStaked : new BigNumber(0),
      stakePriceAsQuoteToken: pool.stakePriceAsQuoteToken,
      privateStakedBal: new BigNumber(pool.privateStakedBal || 0),
      vPoolWeight: new BigNumber(pool.vPoolWeight || 0),
      userData: {
        ...pool.userData,
        privatePoolInfo,
      },
      vStakedBalance: new BigNumber(pool.vStakedBalance || 0),
      vsApy,
      sortApy: new BigNumber(pool.apy).plus(vsApy).toNumber(),
      sortDefault: pool.sousId,

      stakeBalanceDollar,
      stakeVsBalanceDollar,
      bothTotalStaked,
      bothTotalStakedDollar,
    }
    return r
  })

  // const openPools =  poolsWithApy.filter(p => !p.hidden);
  // const [finishedPools, openPools] = partition(poolsWithApy, (pool) => pool.isFinished)

  // const sortedPoolsWithApy = sortBy(poolsWithApy, p => new BigNumber(p.apy).plus(p.vsApy).toNumber() * -1);

  const sortField = sortApy ? 'sortApy' : 'sortDefault'
  const sortOrder = sortApy ? 'desc' : 'asc'

  const regularVaults = orderBy(
    poolsWithApy.filter(
      (p) => p.poolCategory === PoolCategory.VAULT || p.poolCategory === PoolCategory.SYNTHETIX_VAULT,
    ),
    [(p) => (p.projectName === 'moonkafe' ? 0 : 1), sortField],
    ['asc', sortOrder],
  )
  const privateVaults = poolsWithApy.filter((p) => p.poolCategory === PoolCategory.PRIVATEVAULT)

  // const openPools =  groupBy(regularVaults, (openp) => openp.projectName);
  // const openPrivatePools =  groupBy(privateVaults, (openp) => openp.projectName);
  // const poolKeys = Object.keys(openPools)
  // poolKeys.sort(p => p === "moonkafe" ? 0 : 1);

  const getProjectPools = (projectName) => {
    return (
      <div style={{ maxWidth: '100%', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* <ProjectNameTag color="contrast">{projectName.toUpperCase()} vaults</ProjectNameTag> */}
        <PoolCardContainer>
          {regularVaults
            .filter((p) => p.projectName === projectName)
            .map((_p) => (
              <PoolCard2 key={_p.sousId} pool={_p} />
            ))}
        </PoolCardContainer>

      </div>
    )
  }

  const hasTiku = !!guestConfig.find((c) => !c.hidden && c.projectName === 'Tiku' && hasTikuStake(tikuPool))

  return (
    <>
      <Helmet>
        <title>Moonkafe Finance</title>
      </Helmet>
      <WidePage>
        {/* <Hero style={{width: "100%"}}> */}
          <HeroRow>
            <HeroLeft>
              <Heading as="h1" size="xxl" mb="16px">
                MOONKAFE Vaults
              </Heading>
              
            </HeroLeft>

            <HeroRight>
              <Text>Stake LP into autocompounding vaults</Text>
              <Text>You can unstake at any time</Text>

                            
              <Text>3.5% performance fees on profits</Text>
              <Text>0.1% withdrawal fees on capital</Text>
              
            </HeroRight>
            
          </HeroRow>
        {/* </Hero> */}

        <FlexRowDiv>
          <Warning color="warning">
            Using Smart Contracts, Tokens and Crypto is always a risk. DYOR before investing.
          </Warning>
        </FlexRowDiv>
        <div
          style={{
            marginBottom: '5px',
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <Text color="secondary"> Hide Balances</Text>&nbsp;
          <Checkbox checked={hideBalances} scale="sm" onChange={toggleHideBalances} />
          &nbsp; &nbsp;
          <Text color="secondary"> Show Only Staked</Text>&nbsp;
          <Checkbox checked={onlyStaked} scale="sm" onChange={toggleOnlyStaked} />
          &nbsp; &nbsp;
          <Text color="secondary"> Sort by APR</Text>&nbsp;
          <Checkbox checked={sortApy} scale="sm" onChange={toggleSortApy} />
        </div>
        <PoolTabButtons />

        <Divider />
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            marginBottom: '10px',
            flex: 1,
            width: '100%',
          }}
        >
          <Text fontSize="14px" color="grey">
            Espresso (previously <i>vault shares</i>) represent your share of deposited tokens in a vault. You can
            redeem them for the underlying tokens any time!
          </Text>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            flexDirection: 'row',
            marginBottom: '10px',
            flex: 1,
            width: '100%',
          }}
        >
          <Text fontSize="14px" color="grey">
            Deposit fees, if indicated, are charged by{' '}
            <u>
              <b>the underlying farms</b>
            </u>
            . If you suspect they are displayed wrongly, please inform the team.
          </Text>
        </div>
        <FlexLayout>
          <Route exact path={`${path}`}>
            <>
              <div
                style={{
                  maxWidth: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <PoolCardContainer>
                  {regularVaults
                    .filter((p) => hasVaultStake(p))
                    .map((_p) => (
                      <PoolCard2 key={_p.sousId} pool={_p} />
                    ))}
                </PoolCardContainer>

            

              </div>
            </>
          </Route>

          {/* <Route exact path={`${path}`}>
          {getProjectPools("kukafe")}
        </Route> */}
          <Route path={`${path}/moonkafe`}>{getProjectPools('moonkafe')}</Route>
          <Route path={`${path}/solarbeam`}>{getProjectPools('solarbeam')}</Route>
          <Route path={`${path}/moonfarm`}>{getProjectPools('moonfarm')}</Route>
          <Route path={`${path}/freeriver`}>{getProjectPools('freeriver')}</Route>
          <Route path={`${path}/dragon`}>{getProjectPools('dragon')}</Route>
        </FlexLayout>
{/* 
        <div style={{display: 'flex', justifyContent:'center', flexDirection:'row', flex:1, width: '100%'}}>
          <Text fontSize="14px" color="failure">⚠️Random snapshots will be taken throughout prelaunch phase, so stay staked for maximum KAFE!</Text>
        </div> */}

        <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'row', flex: 1, width: '100%' }}>
          <Text fontSize="14px" color="contrast">
            ❓ The APRs are calculated by our own baristas and may differ from other websites. Please report to us if
            the figures have been miscalculated!
          </Text>
        </div>

        <div style={{ position: 'absolute', bottom: 0, right: 5 }}>
          <Text color="primary">Version {contracts.VERSION}</Text>
        </div>
      </WidePage>
    </>
  )
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
const HeroRow = styled(FlexRowDiv)`
  width: 100%;
  min-width: 100%;
  // justify-content: space-between;
`
const HeroLeft = styled(FlexColDiv)`
  flex: 1;
  justify-content: flex-start;
  align-items: flex-start;
`
const HeroRight = styled(FlexColDiv)`
  flex: 2;
  justify-content: flex-start;
  align-items: flex-end;
  font-size: 10px;
  > div {
    color: grey;

  }
`
const Warning = styled(Text)`
  background-color: ${(props) => props.theme.card.background};
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 6px;
  padding-bottom: 3px;
  padding-top: 3px;
  border: 1px solid ${(props) => props.theme.colors.primary};
  margin-bottom: 12px;
  text-align: center;
  max-width: 80%;
`

const WidePage = styled(Page)`
  max-width: 100% !important;
  width: 100% !important;
`
const Hero = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
  display: grid;
  grid-gap: 32px;
  grid-template-columns: 1fr;
  margin-left: auto;
  margin-right: auto;
  max-width: 250px;
  padding: 48px 0;
  ul {
    margin: 0;
    padding: 0;
    list-style-type: none;
    font-size: 16px;
    li {
      margin-bottom: 4px;
    }
  }
  img {
    height: auto;
    max-width: 100%;
  }
  @media (min-width: 576px) {
    grid-template-columns: 1fr 1fr;
    margin: 0;
    max-width: none;
  }
`

const PoolCardContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  flex-wrap: wrap;
  width: 100%;
  & > * {
    min-width: 280px;
    max-width: 31.5%;
    width: 100%;
    margin: 0 8px;
    margin-bottom: 32px;
  }
`

const ProjectNameTag = styled(Text)`
  font-size: 20px;
`

export default Farm
