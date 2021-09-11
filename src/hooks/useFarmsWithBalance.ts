import { getWeb3 } from 'utils/web3'
import { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useWallet } from 'use-wallet'
import MultiCallAbi from 'config/abi/Multicall.json'
import multicall from 'utils/multicall'
import { AbiItem } from 'web3-utils'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import masterChefABI from 'config/abi/masterchef.json'
import { farmsConfig } from 'config/constants'
import { FarmConfig } from 'config/constants/types'
import poolConfig from 'config/constants/pools'
import { decodeInt, getFuncData } from 'utils/callHelpers'
import useRefresh from './useRefresh'

const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

export interface FarmWithBalance extends FarmConfig {
  balance: BigNumber
}

const useFarmsWithBalance = () => {
  const [farmsWithBalances, setFarmsWithBalances] = useState<FarmWithBalance[]>([])
  const { account } = useWallet()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const farms = farmsConfig.filter((f) => f.farmType === 'native').map((f) => f.pid)

    const fetchBalances = async () => {
      const calls = farms.map((pid) => [
        getMasterChefAddress(),
        getFuncData('pendingKafe(uint256,address)', [pid, account]),
      ])

      let callResults = await multi.methods.aggregate(calls).call()
      callResults = callResults[1].map(decodeInt)

      const results1 = farmsConfig.map((farm, index) => ({ ...farm, balance: new BigNumber(callResults[index]) }))

      setFarmsWithBalances(results1)
    }

    if (account) {
      fetchBalances()
    }
  }, [account, fastRefresh])

  return farmsWithBalances
}

export default useFarmsWithBalance
