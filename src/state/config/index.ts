/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import { AppConfigState, MigrationConfig } from '../types'

const initialState: AppConfigState = {
  data: {
    hideBalances: false,
    refreshWallet: 0,
    migration: {},
  },
}

export const configSlice = createSlice({
  name: 'Config',
  initialState,
  reducers: {
    setHideBalances: (state, action) => {
      const newState: boolean = action.payload
      state.data = {
        ...state.data,
        hideBalances: newState,
      }
    },
    setMigrationInfo: (state, action) => {
      const info: MigrationConfig = action.payload
      state.data = {
        ...state.data,
        migration: {
          ...state.data.migration,
          ...info,
        },
      }
    },
    triggerRefreshWallet: (state) => {
      state.data = {
        ...state.data,
        refreshWallet: state.data.refreshWallet + 1,
      }
    },
  },
})

// Actions
export const { setHideBalances, triggerRefreshWallet, setMigrationInfo } = configSlice.actions

export const setHideBalancesAction = (b: boolean) => async (dispatch) => {
  dispatch(setHideBalances(b))
}
export const refreshWallet = () => async (dispatch) => {
  dispatch(triggerRefreshWallet())
}
export const setMigrationInfoAction = (a: MigrationConfig) => async (dispatch) => {
  dispatch(setMigrationInfo(a))
}

export default configSlice.reducer
