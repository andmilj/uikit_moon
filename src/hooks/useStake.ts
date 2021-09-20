import ReactGA from 'react-ga';
import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { useDispatch } from 'react-redux'

import { fetchFarmUserDataAsync } from 'state/actions'
import masterchefAbi from 'config/abi/masterchef.json'
import {
  fetchPoolsUserDataAsync,
  updatePrivatePoolInfo,
  updateUserStakedBalance as updatePoolUserStakedBalance,
  updateUserBalance as updatePoolUserBalance,
  fetchPoolsUserDataAsyncSingle,
} from 'state/pools'

import {
  fetchGuestsUserDataAsync,
  updateGuestUserInfoSingle,
  updateGuestUserVsInfoSingle,
  updateUserBalance as updateGuestUserBalance,
  updateUserStakedBalance as updateGuestUserStakedBalance,
} from 'state/guest'

import { stake, sousStake, sousStakeBnb, sousPrivateStake } from 'utils/callHelpers'
import { useCustomMasterchef, useMasterchef, usePrivateSousChef, useSousChef } from './useContract'

const useStake = (pid: number, refreshPools = false) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useMasterchef()

  const handleStake = useCallback(
    async (amount: string) => {
      try {
        ReactGA.event({
          category: "Stake Espresso",
          action: `pid ${pid}`,
        });
        const txHash = await stake(masterChefContract, pid, amount, account)
        console.info(txHash)
        dispatch(fetchFarmUserDataAsync(account))
        dispatch(fetchGuestsUserDataAsync(account))
        if (refreshPools) {
          dispatch(fetchPoolsUserDataAsync(account))
        }
      } catch (e) {
        console.error(e)
      }
    },
    [account, dispatch, masterChefContract, pid, refreshPools],
  )

  return { onStake: handleStake }
}

export const useCustomStake = (masterChefAddress, pid: number, refreshPools = false) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useCustomMasterchef(masterChefAddress, masterchefAbi)

  const handleStake = useCallback(
    async (amount: string, decimals = 18) => {
      try {
        ReactGA.event({
          category: "Stake Espresso",
          action: `id ${pid}`,
        });
        const txHash = await stake(masterChefContract, pid, amount, account, decimals)
        console.info(txHash)
        dispatch(fetchFarmUserDataAsync(account))
        if (refreshPools) {
          dispatch(fetchPoolsUserDataAsync(account))
        }
      } catch (e) {
        console.error(e)
      }
    },
    [account, dispatch, masterChefContract, pid, refreshPools],
  )

  return { onStake: handleStake }
}

export const useSousStake = (sousId) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  // const masterChefContract = useMasterchef()
  const sousChefContract = useSousChef(sousId)

  const handleStake = useCallback(
    async (amount: string) => {
      try {
        ReactGA.event({
          category: "Stake Espresso",
          action: `${sousId}`,
        });

        const tx = await sousStake(sousChefContract, amount, account)
        dispatch(fetchPoolsUserDataAsyncSingle(sousId, account))

        dispatch(updateGuestUserInfoSingle(sousId, account))
        dispatch(updateGuestUserVsInfoSingle(sousId, account))

        return tx
      } catch (e) {
        console.error(e)
      }
      return null
    },
    [account, dispatch, sousChefContract, sousId],
  )

  return { onStake: handleStake }
}

export const usePrivateSousStake = (sousId, chefAddress) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  // const masterChefContract = useMasterchef()
  const sousChefContract = usePrivateSousChef(chefAddress)

  const handleStake = useCallback(
    async (amount: string) => {
      try {
        const tx = await sousPrivateStake(sousChefContract, amount, account)
        dispatch(updatePrivatePoolInfo(sousId, account))
        return tx
      } catch (e) {
        console.error(e)
      }
      return null
    },
    [account, sousChefContract, dispatch, sousId],
  )

  return { onStake: handleStake }
}
export default useStake
