import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import masterchefAbi from 'config/abi/masterchef.json'
import { useDispatch } from 'react-redux'
import { fetchChefsPublicDataAsync } from 'state/chefs'
import { fetchGuestsUserDataAsync } from 'state/guest'
import { fetchFarmUserDataAsync, fetchPoolsUserDataAsync, updateUserBalance } from 'state/actions'
import { soushHarvest, soushHarvestBnb, harvest, customHarvest } from 'utils/callHelpers'
import contracts from 'config/constants/contracts'
import useContract, { useCustomMasterchef, useMasterchef, useSousChef } from './useContract'

export const useHarvest = (farmPid: number) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useMasterchef()

  const handleHarvest = useCallback(async () => {
    try {
      const txHash = await harvest(masterChefContract, farmPid, account)
      dispatch(fetchFarmUserDataAsync(account))
      dispatch(fetchGuestsUserDataAsync(account))
      return txHash
    } catch (e) {
      console.error(e)
    }
    return null
  }, [account, dispatch, farmPid, masterChefContract])

  return { onReward: handleHarvest }
}
export const useCustomHarvest = (masterChefAddress, farmPid: number) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useCustomMasterchef(masterChefAddress, masterchefAbi)

  const handleHarvest = useCallback(async () => {
    try {
      const txHash = await harvest(masterChefContract, farmPid, account)
      // dispatch(fetchPoolsUserDataAsync(account))
      return txHash
    } catch (e) {
      console.error(e)
    }
    return null
  }, [account, farmPid, masterChefContract])

  return { onReward: handleHarvest }
}

export const useChefHarvest = (chefAddress, chefAbi, pid, referralMode, stakingMode) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useCustomMasterchef(chefAddress, chefAbi)

  const handleHarvest = useCallback(async () => {
    try {
      const txHash = await customHarvest(masterChefContract, pid, account, referralMode, stakingMode)
      // dispatch(fetchChefsPublicDataAsync(account))
      return txHash
    } catch (e) {
      console.error(e)
    }

    return null
  }, [account, pid, referralMode, stakingMode, masterChefContract])

  return { onReward: handleHarvest }
}
export const useSynChefHarvest = (chefAddress, chefAbi) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const masterChefContract = useContract(chefAbi, chefAddress)

  const handleHarvest = useCallback(async () => {
    try {
      const txHash = await masterChefContract.methods
        .getReward()
        .send({ from: account, gas: contracts.GAS_LIMIT })
        .on('transactionHash', (tx) => {
          return tx.transactionHash
        })

      // dispatch(fetchChefsPublicDataAsync(account))
      return txHash
    } catch (e) {
      console.error(e)
    }

    return null
  }, [account, masterChefContract])

  return { onReward: handleHarvest }
}
export const useAllHarvest = (farmPids: number[]) => {
  const { account } = useWallet()
  const masterChefContract = useMasterchef()

  const handleHarvest = useCallback(async () => {
    const harvestPromises = farmPids.reduce((accum, pid) => {
      return [...accum, harvest(masterChefContract, pid, account)]
    }, [])

    return Promise.all(harvestPromises)
  }, [account, farmPids, masterChefContract])

  return { onReward: handleHarvest }
}

export const useSousHarvest = (sousId, isUsingBnb = false) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const sousChefContract = useSousChef(sousId)
  const masterChefContract = useMasterchef()

  const handleHarvest = useCallback(async () => {
    if (sousId === 0) {
      await harvest(masterChefContract, 0, account)
    } else if (isUsingBnb) {
      await soushHarvestBnb(sousChefContract, account)
    } else {
      await soushHarvest(sousChefContract, account)
    }
    // dispatch(updateUserPendingReward(sousId, account))
    dispatch(updateUserBalance(sousId, account))
  }, [account, dispatch, isUsingBnb, masterChefContract, sousChefContract, sousId])

  return { onReward: handleHarvest }
}
