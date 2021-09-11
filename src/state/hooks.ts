import useCakePrice from 'hooks/useCakePrice'
import { QuoteToken } from 'config/constants/types'
import contracts from 'config/constants/contracts'
import { toDollar, toDollarQuote } from 'utils/formatBalance'
import { useWallet } from 'use-wallet'
import BigNumber from 'bignumber.js'
import { useEffect, useMemo } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import useRefresh from 'hooks/useRefresh'
import useQuotePrice from 'hooks/useQuotePrice'
import usePrice from 'hooks/usePrice'
import { ChefInfo } from 'config/constants/chefs'
import { fetchFarmsPublicDataAsync, fetchPoolsPublicDataAsync, fetchGuestsPublicDataAsync } from './actions'
import { State, Farm, Pool, Guest, MigrationConfig } from './types'
import { fetchFarmUserDataAsync } from './farms'
import { fetchGuestsUserDataAsync } from './guest'
import { fetchPoolsUserDataAsync } from './pools'
import { fetchChefsPublicDataAsync } from './chefs'

const ZERO = new BigNumber(0)

export const useFetchPublicData = () => {
  const dispatch = useDispatch()
  const { slowRefresh } = useRefresh()
  const { account } = useWallet()
  useEffect(() => {
    console.log('refresh useFetchPublicData')
    // dispatch(fetchFarmsPublicDataAsync())
    dispatch(fetchPoolsPublicDataAsync())
    // dispatch(fetchGuestsPublicDataAsync())
  }, [dispatch, slowRefresh])

  useEffect(() => {
    if (account) {
      console.log('refresh useFetchPublicData account')
      // dispatch(fetchFarmUserDataAsync(account))
      dispatch(fetchPoolsUserDataAsync(account))
      // dispatch(fetchGuestsUserDataAsync(account))
      dispatch(fetchChefsPublicDataAsync(account))
    }
  }, [dispatch, slowRefresh, account])
}

// config
export const useHideBalances = (): boolean => {
  const b = useSelector((state: State) => state.config.data.hideBalances)
  return b
}

export const useRefreshWallet = (): number => {
  const b = useSelector((state: State) => state.config.data.refreshWallet)
  return b
}
export const useMigration = (): MigrationConfig => {
  const b = useSelector((state: State) => state.config.data.migration)
  return b
}

// Farms

export const useFarms = (account): Farm[] => {
  // const { slowRefresh } = useRefresh()
  // const dispatch = useDispatch()
  // useEffect(() => {
  //   if (account) {
  //     dispatch(fetchFarmUserDataAsync(account))
  //   }
  // }, [account, dispatch, slowRefresh])

  const farms = useSelector((state: State) => state.farms.data)
  return farms
}

export const useFarmFromPid = (pid): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.pid === pid))
  return farm
}

export const useFarmFromSymbol = (lpSymbol: string): Farm => {
  const farm = useSelector((state: State) => state.farms.data.find((f) => f.lpSymbol === lpSymbol))
  return farm
}

export const useFarmUser = (pid) => {
  const farm = useFarmFromPid(pid)

  return {
    allowance: farm.userData ? new BigNumber(farm.userData.allowance) : new BigNumber(0),
    tokenBalance: farm.userData ? new BigNumber(farm.userData.tokenBalance) : new BigNumber(0),
    stakedBalance: farm.userData ? new BigNumber(farm.userData.stakedBalance) : new BigNumber(0),
    earnings: farm.userData ? new BigNumber(farm.userData.earnings) : new BigNumber(0),
  }
}

// Pools

export const usePools = (account): Pool[] => {
  // const { slowRefresh } = useRefresh()
  // const dispatch = useDispatch()
  // useEffect(() => {

  //   if (account) {
  //     console.log("Period refresh usePools", account, slowRefresh)
  //     // dispatch(fetchPoolsUserDataAsync(account))
  //   }
  //   // eslint-disable-next-line
  // },[slowRefresh])

  const pools = useSelector((state: State) => state.pools.data)
  return pools
}

export const usePoolFromPid = (sousId): Pool => {
  const pool = useSelector((state: State) => state.pools.data.find((p) => p.sousId === sousId))
  return pool
}

// guest pools

export const useGuests = (account): Guest[] => {
  // const { slowRefresh } = useRefresh()
  // const dispatch = useDispatch()
  // useEffect(() => {
  //   if (account) {
  //     dispatch(fetchGuestsUserDataAsync(account))
  //   }
  // }, [account, dispatch, slowRefresh])

  const guests = useSelector((state: State) => state.guests.data)
  return guests
}

export const useGuestFromPid = (sousId): Guest => {
  const guest = useSelector((state: State) => state.guests.data.find((p) => p.sousId === sousId))
  return guest
}
export const useGuestFromProject = (projectName): Guest => {
  const guest = useSelector((state: State) => state.guests.data.find((p) => p.projectName === projectName))
  return guest
}

// ==================== chefs =====================

export const useChefs = (): ChefInfo[] => {
  const chefs = useSelector((state: State) => state.chefs.data)
  return chefs
}

// Prices

export const usePriceBnbBusd = (): BigNumber => {
  const priceBnb = usePrice()
  return new BigNumber(priceBnb)
  // const pid = 2 // BUSD-BNB LP
  // const farm = useFarmFromPid(pid)
  // return farm.tokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : ZERO
}

// export const usePriceCakeBusd = (): BigNumber => {
//   return ZERO;
//   // const pid = 1 // CAKE-BNB LP
//   // const bnbPriceUSD = usePriceBnbBusd()
//   // const farm = useFarmFromPid(pid)
//   // return farm.tokenPriceVsQuote ? bnbPriceUSD.times(farm.tokenPriceVsQuote) : ZERO
//   const pid = 0; // EGG-BUSD LP
//   const farm = useFarmFromPid(pid);
//   return farm.tokenPriceVsQuote ? new BigNumber(farm.tokenPriceVsQuote) : ZERO;
// }

export const useTotalPersonalValue = ({ includeFarms = true }): BigNumber => {
  const { account } = useWallet()

  const quotePrice = useQuotePrice()
  let value = new BigNumber(0)
  const farms = useFarms(account)

  if (includeFarms) {
    for (let i = 0; i < farms.length; i++) {
      const farm = farms[i]
      if (farm.userData && farm.tokenPriceVsQuote && farm.userData.stakedBalance) {
        if (farm.isTokenOnly) {
          let val = new BigNumber(farm.tokenPriceVsQuote).times(farm.userData.stakedBalance)

          val = toDollarQuote(val, farm.quoteTokenSymbol, quotePrice)

          value = value.plus(val)
        } else if (farm.userData?.stakedBalance && farm.lpTotalInQuoteToken) {
          // get staked lp divided by total staked lp(raw),  times by lpTotalInQuoteToken
          // let val = new BigNumber(farm.tokenAmount).times(2).times(farm.tokenPriceVsQuote);
          // console.log(farm.tokenAmount, farm.tokenPriceVsQuote, val.toString())

          let val = new BigNumber(farm.userData.stakedBalance)
            .multipliedBy(farm.lpTotalInQuoteToken)
            .div(farm.depositedLp)
          val = toDollarQuote(val, farm.quoteTokenSymbol, quotePrice)
          value = value.plus(val.times(1e18))
        }
      }
    }
  }

  const pools: Pool[] = usePools(account).filter((pool) => !pool.hidden)
  // console.log(pools)
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]

    if (pool.stakePriceAsQuoteToken) {
      if (pool.userData && pool.userData.stakedBalance) {
        const stakedBalance = new BigNumber(pool.userData.stakedBalance).multipliedBy(pool.pricePerShare)
        let stakeBalanceDollar

        if (stakedBalance.isNaN() || stakedBalance.isZero()) {
          stakeBalanceDollar = new BigNumber(0)
        } else {
          stakeBalanceDollar = toDollar(
            stakedBalance.multipliedBy(pool.stakePriceAsQuoteToken),
            pool.lpBaseTokenAddress.toLowerCase(),
            quotePrice,
          )
        }

        value = value.plus(stakeBalanceDollar)
      }
      if (pool.userData && pool.userData.stakedVsBalance) {
        const stakedBalance = new BigNumber(pool.userData.stakedVsBalance).multipliedBy(pool.pricePerShare)
        let stakeBalanceDollar

        if (stakedBalance.isNaN() || stakedBalance.isZero()) {
          stakeBalanceDollar = new BigNumber(0)
        } else {
          stakeBalanceDollar = toDollar(
            stakedBalance.multipliedBy(pool.stakePriceAsQuoteToken),
            pool.lpBaseTokenAddress.toLowerCase(),
            quotePrice,
          )
        }

        value = value.plus(stakeBalanceDollar)
      }

      if (
        pool.userData &&
        pool.userData.privatePoolInfo &&
        pool.userData.privatePoolInfo.stakedAmt &&
        pool.userData.privatePoolInfo.stakedAmt.length > 0
      ) {
        const sum = pool.userData.privatePoolInfo.stakedAmt.reduce((acc, a) => {
          return new BigNumber(a).plus(acc)
        }, new BigNumber(0))

        let stakeBalanceDollar
        if (sum.isNaN() || sum.isZero()) {
          stakeBalanceDollar = new BigNumber(0)
        } else {
          stakeBalanceDollar = toDollar(
            sum.multipliedBy(pool.stakePriceAsQuoteToken),
            pool.lpBaseTokenAddress.toLowerCase(),
            quotePrice,
          )
        }
        value = value.plus(stakeBalanceDollar)
      }
    }
  }

  const guests: Guest[] = useGuests(account).filter((g) => !g.hidden)
  for (let i = 0; i < guests.length; i++) {
    const g = guests[i]

    if (
      g.stakePriceAsQuoteToken &&
      g.userData &&
      g.userData.stakedBalance &&
      new BigNumber(g.userData.stakedBalance).isGreaterThan(0)
    ) {
      const temp = toDollar(
        new BigNumber(g.userData.stakedBalance).multipliedBy(g.pricePerShare).multipliedBy(g.stakePriceAsQuoteToken),
        g.lpBaseTokenAddress.toLowerCase(),
        quotePrice,
      )
      value = value.plus(temp)
    }

    const hasVaultShare = g.vaultShareFarmPid >= 0
    if (hasVaultShare) {
      const userStakedVsBalance =
        hasVaultShare && g.userData ? new BigNumber(g.userData.stakedVsBalance) : new BigNumber(0)
      if (userStakedVsBalance.isGreaterThan(0)) {
        const temp = toDollar(
          new BigNumber(userStakedVsBalance).multipliedBy(g.pricePerShare).multipliedBy(g.stakePriceAsQuoteToken),
          g.lpBaseTokenAddress.toLowerCase(),
          quotePrice,
        )
        value = value.plus(temp)
      }
    }
  }

  return value.dividedBy(1e18)
}

export const useTotalValue = (): BigNumber => {
  const { account } = useWallet()
  const farms = useFarms(account)

  const quotePrice = useQuotePrice()

  let value = new BigNumber(0)
  for (let i = 0; i < farms.length; i++) {
    const farm = farms[i]
    if (farm.lpTotalInQuoteToken) {
      const val = toDollarQuote(farm.lpTotalInQuoteToken, farm.quoteTokenSymbol, quotePrice)

      value = value.plus(val)
    }
  }

  const pools: Pool[] = usePools(account).filter((pool) => !pool.hidden)
  // console.log(pools)
  for (let i = 0; i < pools.length; i++) {
    const pool = pools[i]

    if (!pool.excludeFromTvl && pool.totalStakedAsQuoteToken) {
      const temp = toDollar(
        new BigNumber(pool.totalStakedAsQuoteToken),
        pool.lpBaseTokenAddress.toLowerCase(),
        quotePrice,
      )
      value = value.plus(temp.dividedBy(1e18))
    }
  }

  const guests: Guest[] = useGuests(account).filter((g) => !g.hidden)
  // console.log(pools)
  for (let i = 0; i < guests.length; i++) {
    const g = guests[i]

    if (!g.excludeFromTvl && g.totalStaked) {
      const temp = toDollar(
        new BigNumber(g.totalStaked).multipliedBy(g.stakePriceAsQuoteToken),
        g.lpBaseTokenAddress.toLowerCase(),
        quotePrice,
      )
      value = value.plus(temp.dividedBy(1e18))
    }
  }

  // console.log(value, value.toString())
  return value
}
