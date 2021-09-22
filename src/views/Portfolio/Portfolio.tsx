import ReactGA from 'react-ga';
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet'
// import { PieChart, Pie, Sector, Cell, ResponsiveContainer, Label } from 'recharts';
import useTheme from 'hooks/useTheme'
import { setHideBalancesAction, setMigrationInfoAction } from 'state/config'
import { useMediaQuery } from '@material-ui/core'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import { BLOCKS_PER_YEAR } from 'config'
import BigNumber from 'bignumber.js'
import { PoolCategory } from 'config/constants/types'
import { useWallet } from 'use-wallet'
import usePriceRewards from 'hooks/usePriceRewards'
import {
  useChefs,
  useFarms,
  useGuestFromProject,
  useHideBalances,
  useMigration,
  usePools,
  useTotalPersonalValue,
} from 'state/hooks'
import contracts from 'config/constants/contracts'
import { ChefType } from 'config/constants/chefs';
import guestConfig from 'config/constants/guest'
import PoolCard2 from 'views/Pools/components/PoolCard2'

import orderBy from 'lodash/orderBy'
import useQuotePrice from 'hooks/useQuotePrice'
import { getBalanceNumber, getBalanceNumberPrecisionFloatFixed, getDecimals, getExpDecimals, mightHide, toDollar } from 'utils/formatBalance'
import { getCakeProfitsPerYearVs, getVsApy, hasTikuStake, hasVaultStake } from 'utils/callHelpers'
import Balance from 'components/Balance'
import useTokenInfo from 'hooks/useTokenInfo'
import styled from 'styled-components'
import moment from 'moment'
import { Text, Checkbox, Image, Tag, Button, useModal } from '@pancakeswap-libs/uikit'
import Page from 'components/layout/Page'
import InfoBox from './components/InfoBox'
import ChefFarmCard from './components/ChefFarmCard'
import MigrateFromFarmModal from './components/MigrateFromFarmModal'
import WalletAssetCard from './components/WalletAssetCard'
import SelectVaultModal from './components/SelectVaultModal'

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
const WidePage = styled(Page)`
  max-width: 100% !important;
  width: 100% !important;
`
const PortfolioContainer = styled(FlexColDiv)`
  border: 1px solid;
  border-radius: 5px;
  // min-height: 300px;
  border-color: ${(props) => props.theme.colors.contrast}44;
`

const YFHeader = styled(FlexRowDiv)`
  justify-content: space-between;
  width: 96%;
`
const YFStats = styled(FlexRowDiv)`
  flex: 1;
  justify-content: space-between;
`
const YFApyBadge = styled.div`
  border: 2px solid grey;
  border-radius: 5px;
  padding-top: 3px;
  padding-bottom: 3px;
  padding-left: 8px;
  padding-right: 8px;
  color: black;
  font-size: 18px;
  background-color: ${(props) => props.theme.colors.primary};
`
const DropdownWrapper = styled(FlexColDiv)`
  width: 32px;
  height: 64px;
  cursor: pointer;
`
const EyeWrapper = styled(FlexColDiv)`
  width: 32px;
  height: 32px;
  cursor: pointer;
`
const ChefContainer = styled(FlexColDiv)``
const FarmTitleRow = styled.div`
  width: 100% !important;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`

const ChartsContainer = styled.div`
  position: relative;
  width: 100% !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`
const ChartsContainer2 = styled.div`  
  height: 400px
  width: 600px; 
  border: 1px solid black;
`

const MainWrapper = styled(FlexColDiv)`
  flex: 1;
  width: 100%;
  align-items: flex-start;
  justify-content: flex-start;
`

const Header = styled(FlexRowDiv)`
  justify-content: flex-start;
`
const HeaderCol = styled(FlexColDiv)``
const HeaderStatsRow = styled(FlexRowDiv)`
  width: 100%;
  // display: grid;
  // grid-template-columns: 1fr 1fr 1fr
`
const HeaderStatsCol = styled(FlexColDiv)`
  width: 100%;
  // display: grid;
  // grid-template-columns: 1fr 1fr 1fr
`

const OptionsRow = styled(FlexRowDiv)``

const HeaderStat = styled(FlexColDiv)`
  flex: 1;
  margin-top: 5px;
  margin-bottom: 5px;
`

// const StatTitle = styled(Text)`
//   font-size: 30px;
// `
// const StatSubtitle = styled(Text)`
//   font-size: 20px;
// `
const Content = styled(FlexRowDiv)`
  width: 100%;
  align-items: flex-start;
  flex-wrap: wrap;
`
const ContentCol = styled(FlexColDiv)`
  width: 100%;
  justify-content: flex-start;
  // align-items: flex-start;
  // flex-wrap: wrap;
`

const LeftCol = styled(FlexColDiv)`
  flex: 5;
  justify-content: flex-start;
`
const RightCol = styled(FlexColDiv)`
  flex: 2;
  justify-content: flex-start;
  align-self: flex-start;
`
const WalletContainer = styled(FlexColDiv)`
  width: 100%;
  // min-height: 300px;
  padding-bottom: 10px;
  border: 1px solid;
  border-radius: 5px;
  padding-top: 10px;
  // left-padding: 10px;
  // right-padding: 10px;
  justify-content: flex-start;
  border-color: ${(props) => props.theme.colors.contrast}44;
`

const WalletHeader = styled(FlexRowDiv)`
  justify-content: space-between;
  width: 95%;
`
const HorizDivider = styled.div`
  width: 100%;
  height: 5px;
`
const VerticalDivider = styled.div`
  height: 100%;
  width: 5px;
`
const MainInfo = styled(FlexColDiv)`
  font-size: 40px;
  align-items: flex-start;
  justify-content: flex-start;
  height: 100%;
  align-self: flex-start;
  flex: 2;
`
const ChartWrapper = styled(FlexRowDiv)`
  flex: 2;
  padding-top: 10px;
  padding-bottom: 10px;
`

const ExpandingSpacer = styled.div`
  flex: 1;
`

const NoAccount = styled(FlexRowDiv)`
  flex: 1;
`
const NoAccountTag = styled(Tag)`
  font-size: 40px;
  padding-left: 20px;
  padding-right: 20px;
  height: 40px;
`
const HorizontalDivider = styled.div`
  width: 100%;
  height: 5px;
`

const HeaderLeft = styled(FlexColDiv)`
  align-items: flex-start;
`

const PrivatePoolContainer = styled(FlexRowDiv)`
  flex-wrap: wrap;
  width: 100%;
  > div {
    margin-right: 5px;
    margin-left: 5px;
  }
`

const BetaTag = styled(Tag)`
  font-size: 14px;
  margin-bottom: -17px;
  color: black;
`
const ConnectButton = styled(Button)`
  border-radius: 20px;
  height: 37px;
`
const Portfolio: React.FC = () => {
  const chefs = useChefs()
  // console.log("kudex", chefs.find(c => c.name === "kudex"))
  const { account, connect } = useWallet()
  const pools = usePools(account)
  // console.log(pools[16].userData)
  // const farms = useFarms(account)
  // const tikuPool = useGuestFromProject('Tiku')
  
  // const chefIds = chefs.map((c) => c.chefId)

  const quotePrice = useQuotePrice()
  const rewardPrices = usePriceRewards()
  const [onlyStaked, setOnlyStaked] = useState(true)
  const [sortApy, setSortApy] = useState(true)
  const totalPersonalVaultValue = useTotalPersonalValue({ includeFarms: false })
  const tokens = useTokenInfo().filter(f => f.isLP)
  const dispatch = useDispatch()
  const hideBalances = useHideBalances()

  const toggleHideBalances = () => {
    dispatch(setHideBalancesAction(!hideBalances))
  }

  useEffect(() => {
    if (account){
      console.log("accessed portfolio")
      ReactGA.event({
        category: "Portfolio",
        action: "portfolio",
      });
    }


  },[account])
  const { isDark } = useTheme()
  const RADIAN = Math.PI / 180

  const [expandSection1, setExpandSection1] = useState(true) // yield farming section
  const [expandSection2, setExpandSection2] = useState(false) // vault section
  const [expandWallet, setExpandWallet] = useState(false)

  const sortField = sortApy ? 'sortApy' : 'sortDefault'
  const sortOrder = sortApy ? 'desc' : 'asc'
  const hasMinWidth = !useMediaQuery('(max-width:700px)')
  const migrationInfo = useMigration()
  const [migrationMode, setMigrationMode] = useState('')

  const getDollar = (amtInQuote, baseTok) => {
    return toDollar(amtInQuote, baseTok.toLowerCase(), quotePrice)
  }
  // const getDollar = useCallback(_getDollar, [quotePrice])

  const onChefRocketClick = (chefId, poolId, lpToken) => {
    console.log('onChefRocketClick', chefId, poolId, lpToken)
    dispatch(setMigrationInfoAction({ lpToken, oldChefId: chefId, oldChefPoolId: poolId, migrateMode: 'farm' }))
    setMigrationMode('farm')
    onPresentSelectVault()
  }

  const onWalletRocketClick = (lpToken) => {
    dispatch(setMigrationInfoAction({ lpToken, migrateMode: 'wallet' }))
    setMigrationMode('wallet')
    onPresentSelectVault()
  }

  const setSous = (sousId) => {
    dispatch(setMigrationInfoAction({ selectedSous: sousId }))
    setTimeout(() => {
      onPresentFarmMigrate()
    }, 500)
  }
  const [onPresentSelectVault] = useModal(<SelectVaultModal onConfirm={setSous} />)

  const [onPresentFarmMigrate] = useModal(
    <MigrateFromFarmModal
      onConfirm={() => {
        console.log('confirm')
      }}
    />,
  )
  // const [onPresentWalletMigrate] = useModal(
  //   <MigrateFromWalletModal
  //     onConfirm={() => {console.log("confirm")}}
  //   />,
  // )

  // =========== vault share related ===========
  // find pools with vault share staking.
  // const farmIdsNeeded = pools.filter(p => !p.hidden && p.vaultShareFarmPid).map(p => p.vaultShareFarmPid);
  // const vFarms = farmIdsNeeded.reduce((acc,neededId) => {
  //   // console.log(farms,neededId)
  //   return {
  //    ...acc,
  //    [neededId]: farms.find(f => `${f.pid}` === `${neededId}`)
  //   }

  // },{})

  const combinedPools = pools

  const dollarProfitsPerYearVs = getCakeProfitsPerYearVs(
    combinedPools.filter((p) => p && !p.hidden && p.vaultShareFarmPid >= 0),
  )
  Object.keys(dollarProfitsPerYearVs).forEach((_sousId) => {
    const _pool = combinedPools.find((p) => p.sousId === parseInt(_sousId))
    dollarProfitsPerYearVs[_sousId] = getDollar(
      dollarProfitsPerYearVs[_sousId],
      _pool.vaultShareRewardToken || contracts.KAFE,
    )
  })

  // 267894*3.7

  // 68000

  //     const arr = getCakeProfitsPerYearVs([...pools,tikuPool].filter(p => p && !p.hidden && p.vaultShareFarmPid))
  //     Object.keys(arr).forEach(k => {
  //       arr[k] = arr[k].multipliedBy(quotePrice.kafe);
  //     })
  //     return arr;
  // }, [quotePrice.kafe, pools, tikuPool])

  const poolsWithApy = pools
    .filter((p) => !p.hidden && (!onlyStaked || hasVaultStake(p)))
    .map((pool) => {
      const totalStaked = getDollar(new BigNumber(pool.totalStakedAsQuoteToken), pool.lpBaseTokenAddress.toLowerCase())
      const vsApy = getVsApy(pool, dollarProfitsPerYearVs[pool.sousId], getDollar)

      const privatePoolInfo: any =
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

      let earningsPerDay = new BigNumber(0)
      let stakeBalanceDollar
      let stakeVsBalanceDollar

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

        stakeBalanceDollar = getDollar(
          new BigNumber(pool.userData.stakedBalance)
            .multipliedBy(pool.pricePerShare)
            .multipliedBy(pool.stakePriceAsQuoteToken),
          pool.lpBaseTokenAddress,
        )
        earningsPerDay = earningsPerDay.plus(stakeBalanceDollar.multipliedBy(new BigNumber(10).pow(18-getDecimals(pool.lpBaseTokenAddress))).multipliedBy(pool.apy).dividedBy(36500))
        // console.log(pool.image, "earningsPerDay", earningsPerDay.toString())
        bothTotalStaked = bothTotalStaked.plus(pool.userData.stakedBalance)
        bothTotalStakedDollar = bothTotalStakedDollar.plus(stakeBalanceDollar)
      }
      // private vault
      if (
        pool &&
        pool.stakePriceAsQuoteToken &&
        pool.userData &&
        pool.userData.privatePoolInfo &&
        privatePoolInfo.stakedAmt.length > 0
      ) {
        const total = privatePoolInfo.stakedAmt.reduce((acc, a) => acc.plus(a), new BigNumber(0))
        // console.log(privatePoolInfo.stakedAmt, total.toString())
        earningsPerDay = earningsPerDay.plus(
          getDollar(total.multipliedBy(pool.stakePriceAsQuoteToken), pool.lpBaseTokenAddress)
          .multipliedBy(new BigNumber(10).pow(18-getDecimals(pool.lpBaseTokenAddress)))
            .multipliedBy(pool.apy)
            .dividedBy(36500),
        )
      }
      // console.log("earnings", pool.tokenName, earningsPerDay.dividedBy(1e18).toFixed(2))

      // with vs
      if (pool && pool.stakePriceAsQuoteToken && vsApy.isGreaterThan(0)) {
        const stakedVsBalance = pool.userData ? new BigNumber(pool.userData.stakedVsBalance) : new BigNumber(0)
        const totalVsApy = new BigNumber(pool.apy).plus(vsApy)
        stakeVsBalanceDollar = getDollar(
          stakedVsBalance.multipliedBy(pool.pricePerShare).multipliedBy(pool.stakePriceAsQuoteToken),
          pool.lpBaseTokenAddress,
        )
        // console.log("vs earnings",stakeVsBalanceDollar.multipliedBy(totalVsApy).dividedBy(36500).toFixed(2))
        earningsPerDay = earningsPerDay.plus(stakeVsBalanceDollar.multipliedBy(totalVsApy).dividedBy(36500))

        bothTotalStaked = bothTotalStaked.plus(stakedVsBalance)
        bothTotalStakedDollar = bothTotalStakedDollar.plus(stakeVsBalanceDollar)
      }

      const r = {
        ...pool,
        // isFinished: pool.sousId === 0 ? false : pool.isFinished || block > pool.endBlock,
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
          earningsPerDay: earningsPerDay.dividedBy(1e18),
        },
        vStakedBalance: new BigNumber(pool.vStakedBalance || 0),
        vsApy,
        sortApy: new BigNumber(pool.apy).plus(vsApy || 0).toNumber(),
        sortDefault: pool.sousId,

        stakeBalanceDollar,
        stakeVsBalanceDollar,
        bothTotalStaked,
        bothTotalStakedDollar,
      }
      return r
    })

  const regularVaults = orderBy(
    poolsWithApy.filter(
      (p) => p.poolCategory === PoolCategory.VAULT || p.poolCategory === PoolCategory.SYNTHETIX_VAULT,
    ),
    [sortField],
    [sortOrder],
  )
  const privateVaults = poolsWithApy.filter((p) => p.poolCategory === PoolCategory.PRIVATEVAULT)
  // console.log("privateVaults",privateVaults)

  // const hasTiku = !!guestConfig.find((c) => !c.hidden && c.projectName === 'Tiku' && hasTikuStake(tikuPool))

  // const getTikuEarningsPerDay = () => {
  //   if (!hasTiku) {
  //     return new BigNumber(0)
  //   }
  //   let earnings = new BigNumber(0)

  //   if (!tikuPool.apy || !new BigNumber(tikuPool.apy).isGreaterThan(0)) {
  //     const userStakedBalance = new BigNumber(tikuPool.userData?.stakedBalance || 0)
  //     // console.log("tiku apy", tikuPool.apy);
  //     if (userStakedBalance.isGreaterThan(0)) {
  //       const userStakeBalanceDollar = getDollar(
  //         userStakedBalance.multipliedBy(tikuPool.pricePerShare).multipliedBy(tikuPool.stakePriceAsQuoteToken),
  //         tikuPool.lpBaseTokenAddress,
  //       )
  //       // console.log("tiku userStakeBalanceDollar",userStakeBalanceDollar.toString())
  //       earnings = earnings.plus(userStakeBalanceDollar.multipliedBy(tikuPool.apy).dividedBy(36500))
  //     }
  //   }
  //   const hasVaultShare = tikuPool.vaultShareFarmPid >= 0
  //   if (hasVaultShare) {
  //     const userStakedVsBalance =
  //       hasVaultShare && tikuPool.userData ? new BigNumber(tikuPool.userData.stakedVsBalance) : new BigNumber(0)
  //     if (userStakedVsBalance.isGreaterThan(0)) {
  //       const vsApy = getVsApy(tikuPool, dollarProfitsPerYearVs[tikuPool.sousId], getDollar)
  //       // console.log("tiku vsApy", vsApy.toFixed(2));
  //       if (vsApy.isGreaterThan(0)) {
  //         const userStakeVsBalanceDollar = getDollar(
  //           userStakedVsBalance.multipliedBy(tikuPool.pricePerShare).multipliedBy(tikuPool.stakePriceAsQuoteToken),
  //           tikuPool.lpBaseTokenAddress,
  //         )
  //         earnings = earnings.plus(userStakeVsBalanceDollar.multipliedBy(vsApy).dividedBy(36500))
  //       }
  //     }
  //   }
  //   // console.log("tiku earningsPerDay", earnings.dividedBy(1e18).toFixed(2))
  //   return earnings.dividedBy(1e18)
  // }
  // const tikuEarningsPerDay = getTikuEarningsPerDay()

  const checkStakedBalances = () => {
    const results: any = {}
    const resultsPerPool: any = {}
    // console.log(chefs)

    chefs.forEach((chef) => {
      if (chef.pools) {
        // console.log(chef.pools)
        if (chef.type === ChefType.MASTERCHEF){
          const poolsIds = chef.poolIds
          results[chef.chefId] = new BigNumber(0)
          // resultsPerPool[chef.chefId] = {};

          const userData = chef.userData
          // console.log("userData", userData)
          poolsIds.forEach((pid) => {
            const pool = chef.pools[pid]
            if (userData[pid]) {
              const userPoolInfo = userData[pid]
              if (userPoolInfo && new BigNumber(userPoolInfo.stakedBalance).isGreaterThan(0)) {
                // console.log(pool)
                // console.log("pid", pid)
                let val
                if (pool.isLP) {
                  val = getDollar(
                    new BigNumber(userPoolInfo.stakedBalance)
                      .multipliedBy(pool.lpTotalInQuoteToken)
                      .div(pool.depositedLp),
                    pool.baseToken,
                  )
                } else {
                  val = getDollar(
                    new BigNumber(userPoolInfo.stakedBalance).multipliedBy(pool.tokenPriceVsQuote).dividedBy(getExpDecimals(pool.lpToken)),
                    pool.baseToken,
                  )
                }
                if (!resultsPerPool[chef.chefId]) {
                  resultsPerPool[chef.chefId] = {}
                }
                // console.log(pool.pid,pool.tokString, val.toString())
                resultsPerPool[chef.chefId][pid] = val
                results[chef.chefId] = results[chef.chefId].plus(val)
              }
            }
          })
        }
        else if (chef.type === ChefType.MASTERCHEF_SYNTHETIX){
          const poolContracts = chef.poolContracts
          results[chef.chefId] = new BigNumber(0)
          // resultsPerPool[chef.chefId] = {};

          const userData = chef.userData
          // console.log("userData", userData)
          poolContracts.forEach((pc) => {
            const pool = chef.pools[pc]
            if (userData[pc]) {
              const userPoolInfo = userData[pc]
              if (userPoolInfo && new BigNumber(userPoolInfo.stakedBalance).isGreaterThan(0)) {
                // console.log(pool)
                // console.log("pid", pid)
                let val
                if (pool.isLP) {
                  val = getDollar(
                    new BigNumber(userPoolInfo.stakedBalance)
                      .multipliedBy(pool.lpTotalInQuoteToken)
                      .div(pool.depositedLp),
                    pool.baseToken,
                  )
                } else {
                  val = getDollar(
                    new BigNumber(userPoolInfo.stakedBalance).multipliedBy(pool.tokenPriceVsQuote).dividedBy(getExpDecimals(pool.lpToken)),
                    pool.baseToken,
                  )
                }
                if (!resultsPerPool[chef.chefId]) {
                  resultsPerPool[chef.chefId] = {}
                }
                // console.log(pool.pid,pool.tokString, val.toString())
                resultsPerPool[chef.chefId][pc] = val
                results[chef.chefId] = results[chef.chefId].plus(val)
              }
            }
          })
        }
      }
    })
    // console.log("results", results, "resultsPerPool", resultsPerPool)
    return { results, resultsPerPool }
  }

  const { results: stakedValues, resultsPerPool: stakedValuesPerPool } = checkStakedBalances()

  const getChefTvlApys = (_stakedValues, _stakedValuesPerPool) => {
    const f = {}

    chefs
      .filter((c) => !onlyStaked || (_stakedValues[c.chefId] && _stakedValues[c.chefId].isGreaterThan(0)))
      .forEach((chef) => {
        f[chef.chefId] = {}

        const rewardPrice = rewardPrices[chef.rewardToken.toLowerCase()] || new BigNumber(1)
        // console.log(chef.name, "rewardPrice",rewardPrice.toFixed(5))
        if (chef.pools) {
          if (chef.type === ChefType.MASTERCHEF){
            chef.poolIds.forEach((pid) => {
              if (
                _stakedValuesPerPool[chef.chefId] &&
                _stakedValuesPerPool[chef.chefId][pid] &&
                _stakedValuesPerPool[chef.chefId][pid].isGreaterThan(0)
              ) {
                const pool = chef.pools[pid]
                // console.log(chef.name, pool, _stakedValuesPerPool[chef.chefId][pid].toString())
                const tvl = getDollar(new BigNumber(pool.lpTotalInQuoteToken), pool.baseToken.toLowerCase())
                // console.log("tvl",tvl.toFixed(2))
                const cakeRewardPerBlock = new BigNumber(chef.perBlock || 1)
                  .times(new BigNumber(pool.poolWeight))
                  .times(chef.rewardsMultiplier || 1)
                  .times(chef.customRewardMultiplier || 1)
                  .div(new BigNumber(10).pow(18))
                // console.log("cakeRewardPerBlock",cakeRewardPerBlock.toString())
                const cakeRewardPerYear = cakeRewardPerBlock.times(BLOCKS_PER_YEAR)
                // console.log("cakeRewardPerYear",cakeRewardPerYear.toFixed(2))
                const apy = new BigNumber(rewardPrice).times(cakeRewardPerYear).times(100).dividedBy(tvl)
                // console.log("apy",apy.toFixed(2))
                f[chef.chefId][pid] = { pid, tvl, apy: apy.toNumber() }
              }
            })
          }
          else if (chef.type === ChefType.MASTERCHEF_SYNTHETIX){
            chef.poolContracts.forEach((pc) => {
              if (
                _stakedValuesPerPool[chef.chefId] &&
                _stakedValuesPerPool[chef.chefId][pc] &&
                _stakedValuesPerPool[chef.chefId][pc].isGreaterThan(0)
              ) {
                const pool = chef.pools[pc]
                // console.log(chef.name, pool, _stakedValuesPerPool[chef.chefId][pid].toString())
                const tvl = getDollar(new BigNumber(pool.lpTotalInQuoteToken), pool.baseToken.toLowerCase())
                // console.log("tvl",tvl.toFixed(2))
                const cakeRewardPerBlock = new BigNumber(pool.perBlock || 1)
                  // .times(new BigNumber(pool.poolWeight))
                  // .times(chef.rewardsMultiplier || 1)
                  // .times(chef.customRewardMultiplier || 1)
                  .div(new BigNumber(10).pow(18))

                // console.log("cakeRewardPerBlock",cakeRewardPerBlock.toString())
                const cakeRewardPerYear = cakeRewardPerBlock.times(365*86400)
                // console.log("cakeRewardPerYear",cakeRewardPerYear.toFixed(2))
                const apy = new BigNumber(rewardPrice).times(cakeRewardPerYear).times(100).dividedBy(tvl)
                // console.log("apy",apy.toFixed(2))
                f[chef.chefId][pc] = { pid: pc, tvl, apy: apy.toNumber() }
              }
            })
          }
        }
      })
    // console.log("chefTvlsApy", f)
    return f
  }
  // console.log("stakedValuesPerPool",stakedValuesPerPool)
  const chefTvlApys = getChefTvlApys(stakedValues, stakedValuesPerPool)
  // console.log("chefTvlApys",chefTvlApys)

  const getFarmEarnings = () => {
    let farmEarnings = new BigNumber(0)

    Object.keys(stakedValuesPerPool).forEach((chefId) => {
      const poolStakeInfos =  stakedValuesPerPool[chefId]
      // console.log(poolStakeInfos)
      if (poolStakeInfos) {
        const poolIds = Object.keys(poolStakeInfos)
        poolIds.forEach((pid) => {
          // console.log("poolStakeInfos",pid, poolStakeInfos[pid].toString())
          if (chefTvlApys && chefTvlApys[chefId] && chefTvlApys[chefId][pid]) {
            const { apy } = chefTvlApys[chefId][pid]
            if (apy) {
              // console.log(pid, apy, poolStakeInfos[pid].toString(), )
              farmEarnings = farmEarnings.plus(poolStakeInfos[pid].multipliedBy(apy).dividedBy(36500))
            }
          }
        })
      }
    })
    // console.log("farmEarnings",farmEarnings.toString())
    return farmEarnings
  }
  const farmEarnings = getFarmEarnings()
  const vaultEarnings = poolsWithApy.reduce((acc, p) => {
    if (p.userData && p.userData.earningsPerDay) {
      return acc.plus(new BigNumber(p.userData.earningsPerDay))
    }
    return acc
  }, new BigNumber(0))

  // console.log("vaultEarnings", vaultEarnings.toFixed(2))
  // console.log("farmEarnings", farmEarnings.toFixed(2))
  // console.log("tikuEarnings", tikuEarningsPerDay.toFixed(2))
  const overallEarnings = vaultEarnings.plus(farmEarnings)
  // console.log("overallEarnings",overallEarnings.toFixed(2))

  const sumFarm = Object.keys(stakedValues).reduce((acc, n) => {
    return acc.plus(stakedValues[n])
  }, new BigNumber(0))
  // console.log("sumFarm", sumFarm.toFixed(2))

  const sumVault = totalPersonalVaultValue
  // console.log("sumVault", sumVault.toFixed(2))

  // const getSumTokenAssets = () => {
  //   return tokens.filter(t => t.balance.isGreaterThan(0)).reduce((acc,t) => {
  //     if (t.isLP){
  //       return acc.plus(t.balance.multipliedBy(t.priceVsQuoteToken))

  //       // console.log(t.symbol, t.balance.multipliedBy(t.priceVsQuoteToken).multipliedBy(priceKCS).dividedBy(1e18).toFixed(2))
  //     }else{
  //       return acc.plus(t.balance.multipliedBy(t.priceVsQuoteToken))
  //     }
  //   }, new BigNumber(0)).multipliedBy(priceKCS);
  // }
  // const sumWallet = getSumTokenAssets().dividedBy(1e18)
  // console.log("sumWallet", sumWallet.toFixed(2))

  // console.log("farmAvgApy",farmAvgApy.toFixed(2))
  // console.log("vaultAvgApy",vaultAvgApy.toFixed(2))
  // console.log("overallAvgApy",overallAvgApy.toFixed(2))

  const tokensWithDollar = orderBy(
    tokens.filter((b) => b.symbol === 'KAFE' || b.balance.isGreaterThan(0)).map((t) => {
      const dec = new BigNumber(10).pow(t.decimals)
      const quoteDec = new BigNumber(10).pow(contracts.tokenDecimals[t.base?.toLowerCase()]|| 18)
      const valuePer = getDollar(dec.multipliedBy(t.priceVsQuoteToken).dividedBy(quoteDec), t.base || contracts.WMOVR)
      const displayPerTok = valuePer.toFixed(2) === "0.00" ? valuePer.toPrecision(5) : valuePer.toFixed(2);
      return {
        ...t,
        value: parseFloat(valuePer.multipliedBy(t.balance).dividedBy(dec).toFixed(2)),
        valuePer: parseFloat(displayPerTok),
      }
    }),
    ['value'],
    ['desc'],
  )

  const sumWallet = tokensWithDollar.reduce((acc, t) => {
    return acc + t.value
  }, 0)

  const farmAvgApy = farmEarnings.multipliedBy(36500).dividedBy(sumFarm)
  const vaultAvgApy = vaultEarnings.multipliedBy(36500).dividedBy(sumVault)
  const overallAvgApy = farmEarnings
    .plus(vaultEarnings)
    .multipliedBy(36500)
    .dividedBy(sumFarm.plus(sumVault).plus(sumWallet))

  const data = [
    { name: 'Wallet', value: parseFloat(sumWallet.toFixed(2)) },
    { name: 'Yield Farming', value: parseFloat(sumFarm.toFixed(2)) },
    { name: 'Optimized Farming', value: parseFloat(sumVault.toFixed(2)) },
  ]

  const sumTotalAssets = data.reduce((acc, d) => {
    return acc + d.value
  }, 0)

  const expand1 = () => {
    console.log('click section1')
    setExpandSection1(!expandSection1)
  }
  const expand2 = () => {
    console.log('click section2')
    setExpandSection2(!expandSection2)
  }
  const expandWalletSection = () => {
    console.log('click wallet')
    setExpandWallet(!expandWallet)
  }

  const farmApyTip = `${farmAvgApy.isNaN() ? 0 : farmAvgApy.dividedBy(365).toFixed(2)}% / $${farmEarnings.toFixed(
    2,
  )} per day`
  const vaultApyTip = `${vaultAvgApy.isNaN() ? 0 : vaultAvgApy.dividedBy(365).toFixed(2)}% / $${vaultEarnings.toFixed(
    2,
  )} per day`

  const getChefPools = (chef) => {
    // console.log(chef)
    if (chef && chef.pools) {
      const pids = Object.keys(chef.pools)

      return pids
        .filter(
          (pid) =>
            !onlyStaked || 
            stakedValuesPerPool[chef.chefId] &&
            stakedValuesPerPool[chef.chefId][pid] &&
            stakedValuesPerPool[chef.chefId][pid].isGreaterThan(0),
        )
        .map((pid) => (
          <ChefFarmCard
            key={`${chef.chefId}_${pid}`}
            chef={chef}
            pool={chef.pools[pid]}
            onRocketClick={onChefRocketClick}
            userData={chef.userData[pid]}
          />
        ))
    }
    return ''
  }

  const leftcol = () => {
    return (
      <LeftCol>
        <PortfolioContainer>
          {hasMinWidth ? (
            <YFHeader onClick={expand1}>
              <Text style={{ flex: 1 }} fontSize="24px">
                Yield Farming
              </Text>

              <YFStats>
                <YFApyBadge data-tip={farmApyTip}>
                  {hasMinWidth ? 'Avg Apr: ' : 'Avg: '}
                  {farmAvgApy.isNaN() ? 0 : parseFloat(farmAvgApy.toFixed(2)).toLocaleString()}%
                </YFApyBadge>

                <ExpandingSpacer />
                <Text style={{ marginRight: '10px' }} fontSize="24px">
                  {mightHide(`$${parseFloat(sumFarm.toFixed(2)).toLocaleString()}`, hideBalances)}
                </Text>
                <DropdownWrapper>
                  {isDark && !expandSection1 && (
                    <Image src="images/arrowdarkdown.png" width={28} height={14} alt="token" />
                  )}
                  {isDark && expandSection1 && (
                    <Image src="images/arrowdarkup.png" width={28} height={14} alt="token" />
                  )}
                  {!isDark && !expandSection1 && (
                    <Image src="images/arrowlightdown.png" width={28} height={14} alt="token" />
                  )}
                  {!isDark && expandSection1 && (
                    <Image src="images/arrowlightup.png" width={28} height={14} alt="token" />
                  )}
                </DropdownWrapper>
              </YFStats>
            </YFHeader>
          ) : (
            <YFHeader onClick={expand1}>
              <HeaderLeft>
                <Text style={{ flex: 1 }} fontSize="20px">
                  Yield Farming
                </Text>
                <YFApyBadge data-tip={farmApyTip} style={{ fontSize: '16px' }}>
                  Avg Apr: {farmAvgApy.isNaN() ? 0 : parseFloat(farmAvgApy.toFixed(2)).toLocaleString()}%
                </YFApyBadge>
              </HeaderLeft>

              <ExpandingSpacer />
              <Text style={{ marginRight: '10px' }} fontSize="24px">
                {mightHide(`$${parseFloat(sumFarm.toFixed(2)).toLocaleString()}`, hideBalances)}
              </Text>
              <DropdownWrapper>
                {isDark && !expandSection1 && (
                  <Image src="images/arrowdarkdown.png" width={28} height={14} alt="token" />
                )}
                {isDark && expandSection1 && <Image src="images/arrowdarkup.png" width={28} height={14} alt="token" />}
                {!isDark && !expandSection1 && (
                  <Image src="images/arrowlightdown.png" width={28} height={14} alt="token" />
                )}
                {!isDark && expandSection1 && (
                  <Image src="images/arrowlightup.png" width={28} height={14} alt="token" />
                )}
              </DropdownWrapper>
            </YFHeader>
          )}

          {expandSection1
            ? chefs
                .filter((c) => !onlyStaked || (stakedValues[c.chefId] && stakedValues[c.chefId].isGreaterThan(0)))
                .map((chef) => {
                  return <ChefContainer key={chef.chefId}>{getChefPools(chef)}</ChefContainer>
                })
            : ''}
        </PortfolioContainer>

        <HorizDivider />

        <PortfolioContainer>
          {hasMinWidth ? (
            <YFHeader onClick={expand2}>
              <Text style={{ flex: 1 }} fontSize="24px">
                Optimized Farming
              </Text>
              <YFStats>
                <YFApyBadge data-tip={vaultApyTip}>
                  {hasMinWidth ? 'Avg Apr: ' : 'Avg: '}
                  {vaultAvgApy.isNaN() ? 0 : vaultAvgApy.toFixed(2)}%
                </YFApyBadge>
                <ExpandingSpacer />
                <Text fontSize="24px" style={{ marginRight: '10px' }}>
                  {mightHide(`$${parseFloat(totalPersonalVaultValue.toFixed(2)).toLocaleString()}`, hideBalances)}
                </Text>
                <DropdownWrapper>
                  {isDark && !expandSection2 && (
                    <Image src="images/arrowdarkdown.png" width={28} height={14} alt="token" />
                  )}
                  {isDark && expandSection2 && (
                    <Image src="images/arrowdarkup.png" width={28} height={14} alt="token" />
                  )}
                  {!isDark && !expandSection2 && (
                    <Image src="images/arrowlightdown.png" width={28} height={14} alt="token" />
                  )}
                  {!isDark && expandSection2 && (
                    <Image src="images/arrowlightup.png" width={28} height={14} alt="token" />
                  )}
                </DropdownWrapper>
              </YFStats>
            </YFHeader>
          ) : (
            <YFHeader onClick={expand2}>
              <HeaderLeft>
                <Text style={{ flex: 1 }} fontSize="20px">
                  Optimized Farming
                </Text>
                <YFApyBadge data-tip={vaultApyTip} style={{ fontSize: '16px' }}>
                  Avg Apr: {vaultAvgApy.isNaN() ? 0 : vaultAvgApy.toFixed(2)}%
                </YFApyBadge>
              </HeaderLeft>

              <ExpandingSpacer />
              <Text fontSize="24px" style={{ marginRight: '10px' }}>
                {mightHide(`$${parseFloat(totalPersonalVaultValue.toFixed(2)).toLocaleString()}`, hideBalances)}
              </Text>
              <DropdownWrapper>
                {isDark && !expandSection2 && (
                  <Image src="images/arrowdarkdown.png" width={28} height={14} alt="token" />
                )}
                {isDark && expandSection2 && <Image src="images/arrowdarkup.png" width={28} height={14} alt="token" />}
                {!isDark && !expandSection2 && (
                  <Image src="images/arrowlightdown.png" width={28} height={14} alt="token" />
                )}
                {!isDark && expandSection2 && (
                  <Image src="images/arrowlightup.png" width={28} height={14} alt="token" />
                )}
              </DropdownWrapper>
            </YFHeader>
          )}

          {expandSection2 ? (
            <>
              {regularVaults.map((_p) => (
                <PoolCard2 key={_p.sousId} pool={_p} tokenInfo={tokens}/>
              ))}

            </>
          ) : (
            ''
          )}
        </PortfolioContainer>
      </LeftCol>
    )
  }

  const rightcol = () => {
    return (
      <RightCol>
        <WalletContainer>
          <WalletHeader onClick={expandWalletSection}>
            <Text fontSize={hasMinWidth ? '24px' : '20px'}>Wallet Assets</Text>
            <Text fontSize={hasMinWidth ? '24px' : '20px'}>
              {mightHide(`$${parseInt(sumWallet.toFixed(2)).toLocaleString()}`, hideBalances)}
            </Text>
          </WalletHeader>
          {expandWallet || hasMinWidth ? (
            <>
              <HorizDivider />
              <HorizDivider />

              {tokensWithDollar.map((t) => {
                return (
                  <WalletAssetCard key={`${t.symbol}_${t.address}`} token={t} onRocketClick={onWalletRocketClick} />
                )
              })}
            </>
          ) : (
            ''
          )}
        </WalletContainer>
      </RightCol>
    )
  }

  const stats = () => {
    return (
      <>
        <HeaderStat>
          <Text color="primary" style={{ lineHeight: '1' }} fontSize="50px">
            {mightHide(`$${sumTotalAssets.toLocaleString()}`, hideBalances)}{' '}
          </Text>
          <Text color="grey">of assets</Text>
        </HeaderStat>

        <HeaderStat>
          <Text color="primary" style={{ lineHeight: '1' }} fontSize="50px">
            {overallAvgApy.isNaN() ? 0 : parseFloat(overallAvgApy.toFixed(2)).toLocaleString()}%
          </Text>
          <Text color="grey">Avg Apr </Text>
        </HeaderStat>

        <HeaderStat>
          <Text color="primary" style={{ lineHeight: '1' }} fontSize="50px">
            {mightHide(
              `$${overallEarnings.isNaN() ? 0 : parseFloat(overallEarnings.toFixed(2)).toLocaleString()}`,
              hideBalances,
            )}
          </Text>
          <Text color="grey">A Day</Text>
        </HeaderStat>
      </>
    )
  }

  const title = hideBalances
    ? 'Moonkafe Finance'
    : `$${parseInt(sumTotalAssets.toString()).toLocaleString()} | Moonkafe Finance`

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      {/* <Hero /> */}
      <WidePage>
        <MainWrapper>
          <BetaTag variant="primary">BETA</BetaTag>
          {hasMinWidth ? (
            <Header>
              <Text color="contrast" fontSize="50px">
                Portfolio
              </Text>
              &nbsp; &nbsp;
              <InfoBox
                total={sumTotalAssets}
                yieldFarming={sumFarm}
                vault={totalPersonalVaultValue}
                wallet={sumWallet}
              />
              &nbsp; &nbsp;
              <EyeWrapper onClick={toggleHideBalances}>
                {isDark && !hideBalances && <Image src="images/privacydarkopen.png" width={24} height={24} alt="eye" />}
                {isDark && hideBalances && (
                  <Image src="images/privacydarkclosed.png" width={24} height={24} alt="eye" />
                )}
                {!isDark && !hideBalances && (
                  <Image src="images/privacylightopen.png" width={24} height={24} alt="eye" />
                )}
                {!isDark && hideBalances && (
                  <Image src="images/privacylightclosed.png" width={24} height={24} alt="eye" />
                )}
              </EyeWrapper>
              {!account && (
                <NoAccount>
                  {/* <NoAccountTag variant="failure" outline> */}
                    <ConnectButton color="failure" onClick={() => {
                      connect()
                    }}>Please connect your wallet</ConnectButton>
                  {/* </NoAccountTag> */}
                </NoAccount>
              )}
            </Header>
          ) : (
            <HeaderCol>
              <FlexRowDiv style={{ justifyContent: 'center' }}>
                <Text color="contrast" fontSize="50px">
                  Portfolio
                </Text>
                &nbsp;&nbsp;
                <InfoBox
                  total={sumTotalAssets}
                  yieldFarming={sumFarm}
                  vault={totalPersonalVaultValue}
                  wallet={sumWallet}
                />
                <EyeWrapper onClick={toggleHideBalances}>
                  {isDark && !hideBalances && (
                    <Image src="images/privacydarkopen.png" width={24} height={24} alt="eye" />
                  )}
                  {isDark && hideBalances && (
                    <Image src="images/privacydarkclosed.png" width={24} height={24} alt="eye" />
                  )}
                  {!isDark && !hideBalances && (
                    <Image src="images/privacylightopen.png" width={24} height={24} alt="eye" />
                  )}
                  {!isDark && hideBalances && (
                    <Image src="images/privacylightclosed.png" width={24} height={24} alt="eye" />
                  )}
                </EyeWrapper>
              </FlexRowDiv>

              {!account && (
                <NoAccount>
                    <ConnectButton color="failure" onClick={() => {
                      connect()
                    }}>Please connect your wallet</ConnectButton>
                </NoAccount>
              )}
            </HeaderCol>
          )}

          {hasMinWidth ? <HeaderStatsRow>{stats()}</HeaderStatsRow> : <HeaderStatsCol>{stats()}</HeaderStatsCol>}

          {/* <OptionsRow>
              <Text> Sort by APR</Text>&nbsp;
              <Checkbox checked={sortApy} scale="sm" onChange={() => setSortApy(!sortApy)} />
              <div style={{flex: 1}}/>
          </OptionsRow> */}

          {hasMinWidth ? (
            <Content>
              {leftcol()}
              <VerticalDivider />
              {rightcol()}
            </Content>
          ) : (
            <ContentCol>
              {leftcol()}
              <HorizontalDivider />
              {rightcol()}
            </ContentCol>
          )}
        </MainWrapper>

        <div style={{ height: '100px' }} />
      </WidePage>
    </>
  )
}

export default Portfolio
