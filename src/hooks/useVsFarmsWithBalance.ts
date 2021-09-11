import { getWeb3 } from 'utils/web3'
import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { AbiItem } from 'web3-utils'
import { useWallet } from 'use-wallet'
import MultiCallAbi from 'config/abi/Multicall.json'
import multicall from 'utils/multicall'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import masterChefABI from 'config/abi/masterchef.json'
import { farmsConfig } from 'config/constants'
import { FarmConfig } from 'config/constants/types'
import poolConfig from 'config/constants/pools'
import { decodeInt, getFuncData } from 'utils/callHelpers'
import useRefresh from './useRefresh'

const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

export interface VsFarmWithBalance {
  balance: BigNumber
  vaultShareFarmPid?: number
}

const useVsFarmsWithBalance = () => {
  const [farmsWithBalances, setFarmsWithBalances] = useState<VsFarmWithBalance[]>([])
  const { account } = useWallet()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const vs = poolConfig
      .filter((p) => p.vaultShareFarmPid >= 0)
      .map((p) => ({
        vaultShareFarmPid: p.vaultShareFarmPid,
        vaultShareFarmContract: p.vaultShareFarmContract || getMasterChefAddress(),
      }))

    const fetchBalances = async () => {
      const calls = vs.map((p) => [
        p.vaultShareFarmContract,
        getFuncData('pendingKafe(uint256,address)', [p.vaultShareFarmPid, account]),
      ])

      let callResults = await multi.methods.aggregate(calls).call()
      callResults = callResults[1].map(decodeInt)
      const results2 = poolConfig.map((pool, index) => ({ ...pool, balance: new BigNumber(callResults[index]) }))

      setFarmsWithBalances(results2)
    }

    if (account) {
      fetchBalances()
    }
  }, [account, fastRefresh])

  return farmsWithBalances
}

export default useVsFarmsWithBalance
