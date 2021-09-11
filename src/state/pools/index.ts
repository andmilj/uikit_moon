/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import poolsConfig from 'config/constants/pools'
import { fetchPoolsBlockLimits, fetchPoolsInfo, fetchPoolsTotalStatking } from './fetchPools'
import {
  fetchPoolUserInfo,
  fetchPoolsAllowance,
  fetchUserBalances,
  fetchUserStakeBalances,
  fetchUserPrivatePools,
  fetchUserCapitalIn,
  fetchUserStakeVsBalances,
  fetchUserPendingVsReward,
  fetchUserVsAllowance,
  fetchUserVsBalances,
  fetchPoolVsUserInfo,
  fetchPoolUserInfoSingle,
  fetchPoolVsUserInfoSingle,
  // fetchUserPricePerShare,
  // fetchUserApys,
  // fetchUserPoolStats,
} from './fetchPoolsUser'
import { PoolsState, Pool } from '../types'

const initialState: PoolsState = { data: [...poolsConfig.filter((p) => !p.hidden)] }

export const PoolsSlice = createSlice({
  name: 'Pools',
  initialState,
  reducers: {
    setPoolsPublicData: (state, action) => {
      const livePoolsData: Pool[] = action.payload
      console.log('livePoolsData', livePoolsData)
      state.data = state.data.map((pool) => {
        const livePoolData = livePoolsData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, ...livePoolData }
      })
    },
    setPoolsUserData: (state, action) => {
      const userData = action.payload
      state.data = state.data.map((pool) => {
        const userPoolData = userData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, userData: userPoolData }
      })
    },
    updatePoolsUserDataBulk: (state, action) => {
      const { sousId, userData } = action.payload
      const index = state.data.findIndex((p) => p.sousId === sousId)

      if (state.data[index]) {
        state.data[index] = { ...state.data[index], userData }
      }
    },
    updatePoolsUserData: (state, action) => {
      const { field, value, sousId } = action.payload
      const index = state.data.findIndex((p) => p.sousId === sousId)
      if (state.data[index]) {
        // console.log(field, value, sousId, index, state.data[index], state.data[index].userData)
        state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
      }
    },
  },
})

// Actions
export const { setPoolsPublicData, setPoolsUserData, updatePoolsUserData, updatePoolsUserDataBulk } = PoolsSlice.actions

// Thunks
export const fetchPoolsPublicDataAsync = () => async (dispatch) => {
  console.log('fetchPoolsPublicDataAsync')
  // const blockLimits = await fetchPoolsBlockLimits()
  const totalStakings = await fetchPoolsTotalStatking()
  // const poolInfos = await fetchPoolsInfo()

  const liveData = poolsConfig.map((pool) => {
    // const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
    const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
    // const poolInfo = poolInfos.find((entry) => entry.sousId === pool.sousId)
    return {
      // ...blockLimit,
      // ...poolInfo,
      ...totalStaking,
    }
  })

  dispatch(setPoolsPublicData(liveData))
}

export const fetchPoolsUserDataAsync = (account) => async (dispatch) => {
  // const allowances = await fetchPoolsAllowance(account)
  console.log('fetchPoolsUserDataAsync')
  // const stakingTokenBalances = await fetchUserBalances(account)
  // const stakedBalances = await fetchUserStakeBalances(account)
  const { allowances, stakingTokenBalances, stakedBalances } = await fetchPoolUserInfo(account)
  // const capitalIn = await fetchUserCapitalIn(account)
  const privPools = await fetchUserPrivatePools(account)

  const { stakedVs, pendingVsReward, vsAllowance, vsBal } = await fetchPoolVsUserInfo(account)
  // const stakedVs = await fetchUserStakeVsBalances(account)
  // const pendingVsReward = await fetchUserPendingVsReward(account)
  // const vsAllowance = await fetchUserVsAllowance(account)
  // const vsBal = await fetchUserVsBalances(account)

  // const pricePerShares = await fetchUserPricePerShare(account)
  // const apys = await fetchUserApys(account)
  // const poolInfos = await fetchUserPoolStats(account);
  // console.log(allowances, stakingTokenBalances)

  const userData = poolsConfig
    .filter((p) => !p.hidden)
    .map((pool) => ({
      sousId: pool.sousId,
      privatePoolInfo: privPools[pool.sousId],
      allowance: allowances[pool.sousId],
      stakingTokenBalance: stakingTokenBalances[pool.sousId],
      stakedBalance: stakedBalances[pool.sousId],
      stakedVsBalance: stakedVs[pool.sousId],
      pendingVsReward: pendingVsReward[pool.sousId],
      vsAllowance: vsAllowance[pool.sousId],
      vsBal: vsBal[pool.sousId],
      // pricePerShare: pricePerShares[pool.sousId],
      // apy: apys[pool.sousId],
      // poolInfo: poolInfos[pool.sousId]
    }))
  dispatch(setPoolsUserData(userData))
}
export const updatePrivatePoolInfo = (sousId: string, account: string) => async (dispatch) => {
  const privPools = await fetchUserPrivatePools(account)
  // console.log("updatePrivatePoolInfo", privPools, privPools[sousId])
  dispatch(updatePoolsUserData({ sousId, field: 'privatePoolInfo', value: privPools[sousId] }))
}

export const updateUserAllowance = (sousId: string, account: string) => async (dispatch) => {
  const allowances = await fetchPoolsAllowance(account)
  dispatch(updatePoolsUserData({ sousId, field: 'allowance', value: allowances[sousId] }))
}

export const updateUserBalance = (sousId: string, account: string) => async (dispatch) => {
  const tokenBalances = await fetchUserBalances(account)
  dispatch(updatePoolsUserData({ sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }))
}

export const updateUserStakedBalance = (sousId: string, account: string) => async (dispatch) => {
  const stakedBalances = await fetchUserStakeBalances(account)
  dispatch(updatePoolsUserData({ sousId, field: 'stakedBalance', value: stakedBalances[sousId] }))
}

// export const updateUserPricePerShare = (sousId: string, account: string) => async (dispatch) => {
//   const priceShares = await fetchUserPricePerShare(account)
//   dispatch(updatePoolsUserData({ sousId, field: 'pricePerShare', value: priceShares[sousId] }))
// }

// export const updateUserPendingReward = (sousId: string, account: string) => async (dispatch) => {
//   const pendingRewards = await fetchUserPendingRewards(account)
//   dispatch(updatePoolsUserData({ sousId, field: 'pendingReward', value: pendingRewards[sousId] }))
// }

export const fetchPoolsUserDataAsyncSingle = (sousId, account) => async (dispatch) => {
  console.log('fetchPoolsUserDataAsyncSingle')
  const { allowances, stakingTokenBalances, stakedBalances } = await fetchPoolUserInfoSingle(account, sousId)
  const privPools = await fetchUserPrivatePools(account)
  const { stakedVs, pendingVsReward, vsAllowance, vsBal } = await fetchPoolVsUserInfoSingle(account, sousId)

  // const userData = poolsConfig.filter((p) => !p.hidden).map((pool) => ({
  //   sousId: pool.sousId,
  //   privatePoolInfo: privPools[pool.sousId],
  //   allowance: allowances[pool.sousId],
  //   stakingTokenBalance: stakingTokenBalances[pool.sousId],
  //   stakedBalance: stakedBalances[pool.sousId],
  //   stakedVsBalance: stakedVs[pool.sousId],
  //   pendingVsReward: pendingVsReward[pool.sousId],
  //   vsAllowance: vsAllowance[pool.sousId],
  //   vsBal: vsBal[pool.sousId]
  // }))
  dispatch(
    updatePoolsUserDataBulk({
      sousId,
      userData: {
        privatePoolInfo: privPools[sousId],
        allowance: allowances[sousId],
        stakingTokenBalance: stakingTokenBalances[sousId],
        stakedBalance: stakedBalances[sousId],
        stakedVsBalance: stakedVs[sousId],
        pendingVsReward: pendingVsReward[sousId],
        vsAllowance: vsAllowance[sousId],
        vsBal: vsBal[sousId],
      },
    }),
  )
}

export default PoolsSlice.reducer
