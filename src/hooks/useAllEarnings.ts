import { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import masterChefABI from 'config/abi/masterchef.json'
import MultiCallAbi from 'config/abi/Multicall.json'
import { AbiItem } from 'web3-utils'
import { farmsConfig } from 'config/constants'
import poolConfig from 'config/constants/pools'
import { getWeb3 } from 'utils/web3'
import { decodeInt, getFuncData } from 'utils/callHelpers'
import useRefresh from './useRefresh'

const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

const useAllEarnings = () => {
  const [balances, setBalance] = useState([])
  const { account }: { account: string } = useWallet()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchAllBalances = async () => {
      const vs = poolConfig.filter((p) => !p.vaultShareFarmContract && p.vaultShareFarmPid >= 0).map((p) => p.vaultShareFarmPid)
      const farms = farmsConfig.filter((f) => f.farmType === 'native').map((f) => f.pid)

      const calls = [...farms, ...vs].map((pid) => [
        getMasterChefAddress(),
        getFuncData('pendingKafe(uint256,address)', [pid, account]),
      ])

      let callResults = await multi.methods.aggregate(calls).call()
      callResults = callResults[1].map(decodeInt)

      setBalance(callResults)
    }

    if (account) {
      fetchAllBalances()
    }
  }, [account, fastRefresh])

  return balances
}

export default useAllEarnings
