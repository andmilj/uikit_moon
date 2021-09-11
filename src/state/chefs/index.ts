/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit'
import { chefs, ChefInfo } from 'config/constants/chefs'

import { ChefsState } from '../types'
import fetchChefs from './fetchChefs'

const initialState: ChefsState = { data: [...chefs] }

export const chefsSlice = createSlice({
  name: 'Chefs',
  initialState,
  reducers: {
    setChefsPublicData: (state, action) => {
      console.log(state, action)
      const liveChefsData: ChefInfo[] = action.payload
      // console.log("liveChefsData",liveChefsData)
      state.data = state.data.map((chef) => {
        const liveChefData = liveChefsData.find((c) => c.chefId === chef.chefId)
        // if (chef.name === "kudex"){
        //   console.log("liveChefData",liveChefData)
        // }
        return { ...chef, ...liveChefData }
      })
    },
  },
})

// Actions
export const { setChefsPublicData } = chefsSlice.actions

// Thunks
export const fetchChefsPublicDataAsync = (account) => async (dispatch) => {
  const _chefs = await fetchChefs(account)
  dispatch(setChefsPublicData(_chefs))
}

export default chefsSlice.reducer
