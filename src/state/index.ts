import { configureStore } from '@reduxjs/toolkit'
import farmsReducer from './farms'
import poolsReducer from './pools'
import guestReducer from './guest'
import chefsReducer from './chefs'
import configReducer from './config'

export default configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: {
    farms: farmsReducer,
    pools: poolsReducer,
    guests: guestReducer,
    chefs: chefsReducer,
    config: configReducer,
  },
})
