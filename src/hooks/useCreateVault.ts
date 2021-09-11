import { PoolConfig } from 'config/constants/types'
import { useCallback } from 'react'
import { useWallet } from 'use-wallet'
import { useDispatch } from 'react-redux'
import { updatePrivatePoolInfo } from 'state/pools'
import { fetchFarmUserDataAsync, updateUserStakedBalance, updateUserBalance } from 'state/actions'
import { stake, sousStake, sousStakeBnb, sousPrivateStake, createVault } from 'utils/callHelpers'
import { useMasterchef, usePrivateSousChef, useSousChef, useVaultFactory } from './useContract'

export const useCreateVault = (poolConfig: PoolConfig) => {
  const dispatch = useDispatch()
  const { account } = useWallet()
  const fac = useVaultFactory(poolConfig.vaultFactory)

  const handleCreate = useCallback(async () => {
    try {
      const txHash = await createVault(fac, poolConfig, account)
      dispatch(updatePrivatePoolInfo(`${poolConfig.sousId}`, account))
      console.info(txHash)
    } catch (e) {
      console.error(e)
    }
  }, [account, dispatch, fac, poolConfig])

  return { onCreateVault: handleCreate }
}

export default useCreateVault
