import { useCallback } from 'react'
import masterchefAbi from 'config/abi/masterchef.json'
import { useWallet } from 'use-wallet'
import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from 'state/actions'

import {
  fetchPoolsUserDataAsync,
  updatePrivatePoolInfo,
  updateUserStakedBalance as updatePoolUserStakedBalance,
  updateUserBalance as updatePoolUserBalance,
  fetchPoolsUserDataAsyncSingle,
} from 'state/pools'

import {
  updateUserStakedBalance as updateGuestUserStakedBalance,
  updateUserBalance as updateGuestUserBalance,
  fetchGuestsUserDataAsync,
  updateGuestUserInfoSingle,
  updateGuestUserVsInfoSingle,
} from 'state/guest'

import {
  unstake,
  sousUnstake,
  sousEmegencyUnstake,
  sousExit,
  sousEntry,
  sousClose,
  customUnstake,
} from 'utils/callHelpers'
import { useCustomMasterchef, useMasterchef, usePrivateSousChef, useSousChef, useVaultRegistry } from './useContract'

const useUnstake = (pid: number, refreshPools = false) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useMasterchef()

  const handleUnstake = useCallback(
    async (amount: string) => {
      try {
        const txHash = await unstake(masterChefContract, pid, amount, account)
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

  return { onUnstake: handleUnstake }
}

export const useCustomUnstake = (masterChefAddress, pid: number, refreshPools = false) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useCustomMasterchef(masterChefAddress, masterchefAbi)

  const handleUnstake = useCallback(
    async (amount: string, decimals = 18) => {
      try {
        const txHash = await unstake(masterChefContract, pid, amount, account, decimals)
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

  return { onUnstake: handleUnstake }
}

export const useChefUnstake = (chefAddress, chefAbi, pid, stakingMode) => {
  const { account } = useWallet()
  const masterChefContract = useCustomMasterchef(chefAddress, chefAbi)

  const handleUnstake = useCallback(
    async (amount: string) => {
      try {
        const txHash = await customUnstake(masterChefContract, pid, amount, account, stakingMode)
        console.info(txHash)
      } catch (e) {
        console.error(e)
      }
    },
    [account, masterChefContract, pid, stakingMode],
  )

  return { onUnstake: handleUnstake }
}

const SYRUPIDS = [5, 6, 3, 1, 22, 23]

export const useSousUnstake = (sousId) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const sousChefContract = useSousChef(sousId)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await sousUnstake(sousChefContract, amount, account)
      console.info(txHash)

      dispatch(fetchPoolsUserDataAsyncSingle(sousId, account))

      dispatch(updateGuestUserInfoSingle(sousId, account))
      dispatch(updateGuestUserVsInfoSingle(sousId, account))
      // dispatch(updateUserPendingReward(sousId, account))
    },
    [account, dispatch, sousChefContract, sousId],
  )

  return { onUnstake: handleUnstake }
}
export const usePrivateSousUnstake = (sousId, chefAddress) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const sousChefContract = usePrivateSousChef(chefAddress)

  const handleUnstake = useCallback(
    async (amount: string) => {
      const txHash = await sousUnstake(sousChefContract, amount, account)
      console.info(txHash)

      dispatch(updatePrivatePoolInfo(sousId, account))
    },
    [account, dispatch, sousChefContract, sousId],
  )

  return { onUnstake: handleUnstake }
}

export const usePrivateSousExit = (sousId, chefAddress) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const sousChefContract = usePrivateSousChef(chefAddress)

  const handleExit = useCallback(async () => {
    const txHash = await sousExit(sousChefContract, account)
    console.info(txHash)

    dispatch(updatePrivatePoolInfo(sousId, account))
  }, [account, dispatch, sousChefContract, sousId])

  return { onExit: handleExit }
}
export const usePrivateSousEntry = (sousId, chefAddress) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const sousChefContract = usePrivateSousChef(chefAddress)

  const handleEntry = useCallback(async () => {
    try {
      const txHash = await sousEntry(sousChefContract, account)
      console.info(txHash)
      dispatch(updatePrivatePoolInfo(sousId, account))
      return txHash
    } catch (e) {
      console.error(e)
    }
    return null
  }, [account, sousChefContract, dispatch, sousId])

  return { onEntry: handleEntry }
}

export const usePrivateSousClose = (sousId, chefAddress) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const registry = useVaultRegistry()

  const handleClose = useCallback(async () => {
    const txHash = await sousClose(registry, chefAddress, account)
    console.info(txHash)

    dispatch(updatePrivatePoolInfo(sousId, account))
  }, [account, dispatch, registry, sousId, chefAddress])

  return { onVaultClose: handleClose }
}

export default useUnstake
