/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import guestConfig from 'config/constants/guest'
import { fetchGuestsTotalStaking } from './fetchGuest'
import {
  fetchGuestsAllowance,
  fetchGuestsInfo,
  fetchGuestsInfoSingle,
  fetchGuestsVsInfo,
  fetchGuestsVsInfoSingle,
  fetchUserBalances,
  fetchUserPendingVsReward,
  fetchUserStakeBalances,
  fetchUserStakeVsBalances,
  fetchUserVsAllowance,
  fetchUserVsBalances,
  // fetchUserPricePerShare,
  // fetchUserApys,
  // fetchUserPoolStats,
} from './fetchGuestUser'
import { GuestsState, Guest } from '../types'

const initialState: GuestsState = { data: [...guestConfig.filter((g) => !g.hidden)] }

export const GuestsSlice = createSlice({
  name: 'Guests',
  initialState,
  reducers: {
    setGuestsPublicData: (state, action) => {
      const liveGuestsData: Guest[] = action.payload
      state.data = state.data.map((pool) => {
        const liveGuestData = liveGuestsData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, ...liveGuestData }
      })
    },
    setGuestsUserData: (state, action) => {
      const userData = action.payload
      state.data = state.data.map((pool) => {
        const userGuestData = userData.find((entry) => entry.sousId === pool.sousId)
        return { ...pool, userData: userGuestData }
      })
    },

    updateGuestsUserData: (state, action) => {
      const { field, value, sousId } = action.payload
      const index = state.data.findIndex((p) => p.sousId === sousId)
      if (state.data[index]) {
        state.data[index] = { ...state.data[index], userData: { ...state.data[index].userData, [field]: value } }
      }
    },
  },
})

// Actions
export const { setGuestsPublicData, setGuestsUserData, updateGuestsUserData } = GuestsSlice.actions

export const fetchGuestsPublicDataAsync = () => async (dispatch) => {
  // const blockLimits = await fetchPoolsBlockLimits()
  const totalStakings = await fetchGuestsTotalStaking()
  // const poolInfos = await fetchPoolsInfo()

  const liveData = guestConfig.map((pool) => {
    // const blockLimit = blockLimits.find((entry) => entry.sousId === pool.sousId)
    const totalStaking = totalStakings.find((entry) => entry.sousId === pool.sousId)
    // const poolInfo = poolInfos.find((entry) => entry.sousId === pool.sousId)
    return {
      // ...blockLimit,
      // ...poolInfo,
      ...totalStaking,
    }
  })

  dispatch(setGuestsPublicData(liveData))
}

export const fetchGuestsUserDataAsync = (account) => async (dispatch) => {
  // const allowances = await fetchGuestsAllowance(account)
  // const stakingTokenBalances = await fetchUserBalances(account)
  // const stakedBalances = await fetchUserStakeBalances(account)

  const { allowances, stakingTokenBalances, stakedBalances } = await fetchGuestsInfo(account)
  const { stakedVs, pendingVsReward, vsAllowance, vsBal } = await fetchGuestsVsInfo(account)

  const userData = guestConfig
    .filter((p) => !p.hidden)
    .map((pool) => ({
      sousId: pool.sousId,
      allowance: allowances[pool.sousId],
      stakingTokenBalance: stakingTokenBalances[pool.sousId],
      stakedBalance: stakedBalances[pool.sousId],

      stakedVsBalance: stakedVs[pool.sousId],
      pendingVsReward: pendingVsReward[pool.sousId],
      vsAllowance: vsAllowance[pool.sousId],
      vsBal: vsBal[pool.sousId],
    }))
  // console.log("userData",userData)
  dispatch(setGuestsUserData(userData))
}

export const updateUserAllowance = (sousId: string, account: string) => async (dispatch) => {
  const allowances = await fetchGuestsAllowance(account)
  dispatch(updateGuestsUserData({ sousId, field: 'allowance', value: allowances[sousId] }))
}

export const updateUserBalance = (sousId: string, account: string) => async (dispatch) => {
  const tokenBalances = await fetchUserBalances(account)
  dispatch(updateGuestsUserData({ sousId, field: 'stakingTokenBalance', value: tokenBalances[sousId] }))
}

export const updateUserStakedBalance = (sousId: string, account: string) => async (dispatch) => {
  const stakedBalances = await fetchUserStakeBalances(account)
  dispatch(updateGuestsUserData({ sousId, field: 'stakedBalance', value: stakedBalances[sousId] }))
}

export const updateGuestUserVsInfoSingle = (sousId: string, account: string) => async (dispatch) => {
  const { stakedVs, pendingVsReward, vsAllowance, vsBal } = await fetchGuestsVsInfoSingle(account, sousId)

  dispatch(updateGuestsUserData({ sousId, field: 'stakedVsBalance', value: stakedVs[sousId] }))
  dispatch(updateGuestsUserData({ sousId, field: 'pendingVsReward', value: pendingVsReward[sousId] }))
  dispatch(updateGuestsUserData({ sousId, field: 'vsAllowance', value: vsAllowance[sousId] }))
  dispatch(updateGuestsUserData({ sousId, field: 'vsBal', value: vsBal[sousId] }))
}
export const updateGuestUserInfoSingle = (sousId: string, account: string) => async (dispatch) => {
  const { allowances, stakingTokenBalances, stakedBalances } = await fetchGuestsInfoSingle(account, sousId)
  dispatch(updateGuestsUserData({ sousId, field: 'allowance', value: allowances[sousId] }))
  dispatch(updateGuestsUserData({ sousId, field: 'stakingTokenBalance', value: stakingTokenBalances[sousId] }))
  dispatch(updateGuestsUserData({ sousId, field: 'stakedBalance', value: stakedBalances[sousId] }))
}

export default GuestsSlice.reducer
