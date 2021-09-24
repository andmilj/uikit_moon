import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { Contract } from 'web3-eth-contract'
import { ethers } from 'ethers'
import { useDispatch } from 'react-redux'
import { fetchFarmUserDataAsync } from 'state/actions'

import {
  fetchPoolsUserDataAsync,
  updatePrivatePoolInfo,
  updateUserAllowance as updatePoolUserAllowance,
} from 'state/pools'
import { updateUserAllowance as updateGuestUserAllowance } from 'state/guest'

import { approve, approve2, approveCustomChef } from 'utils/callHelpers'
import { useMasterchef, useCake, useSousChef, useLottery } from './useContract'

// Approve a Farm
export const useApprove = (lpContract: Contract, refreshPools = false) => {
  const dispatch = useDispatch()
  const { account }: { account: string } = useWallet()
  const masterChefContract = useMasterchef()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, masterChefContract, account)
      dispatch(fetchFarmUserDataAsync(account))
      if (refreshPools) {
        // dispatch(fetchPoolsUserDataAsync(account))
      }
      return tx
    } catch (e) {
      return false
    }
  }, [account, dispatch, lpContract, masterChefContract, refreshPools])

  return { onApprove: handleApprove }
}
export const useCustomApprove = (lpContract: Contract, masterChefAddress, refreshPools = false) => {
  const dispatch = useDispatch()
  const { account }: { account: string } = useWallet()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approveCustomChef(lpContract, masterChefAddress, account)
      dispatch(fetchFarmUserDataAsync(account))
      if (refreshPools) {
        // dispatch(fetchPoolsUserDataAsync(account))
      }
      return tx
    } catch (e) {
      return false
    }
  }, [account, dispatch, lpContract, masterChefAddress, refreshPools])

  return { onApprove: handleApprove }
}
// Approve a Pool
export const useSousApprove = (lpContract: Contract, sousId) => {
  const dispatch = useDispatch()
  const { account }: { account: string } = useWallet()
  const sousChefContract = useSousChef(sousId)

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(lpContract, sousChefContract, account)
      dispatch(updatePoolUserAllowance(sousId, account))
      dispatch(updateGuestUserAllowance(sousId, account))
      return tx
    } catch (e) {
      return false
    }
  }, [account, dispatch, lpContract, sousChefContract, sousId])

  return { onApprove: handleApprove }
}
export const usePrivateSousApprove = (lpContract: Contract, sousId, chefAddress) => {
  const dispatch = useDispatch()
  const { account }: { account: string } = useWallet()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve2(lpContract, chefAddress, account)
      dispatch(updatePrivatePoolInfo(sousId, account))
      return tx
    } catch (e) {
      return false
    }
  }, [account, dispatch, lpContract, sousId, chefAddress])

  return { onApprove: handleApprove }
}
// Approve the lottery
export const useLotteryApprove = () => {
  const { account }: { account: string } = useWallet()
  const cakeContract = useCake()
  const lotteryContract = useLottery()

  const handleApprove = useCallback(async () => {
    try {
      const tx = await approve(cakeContract, lotteryContract, account)
      return tx
    } catch (e) {
      return false
    }
  }, [account, cakeContract, lotteryContract])

  return { onApprove: handleApprove }
}

// Approve an IFO
export const useIfoApprove = (tokenContract: Contract, spenderAddress: string) => {
  const { account } = useWallet()
  const onApprove = useCallback(async () => {
    try {
      const tx = await tokenContract.methods
        .approve(spenderAddress, ethers.constants.MaxUint256)
        .send({ from: account })
      return tx
    } catch {
      return false
    }
  }, [account, spenderAddress, tokenContract])

  return onApprove
}
