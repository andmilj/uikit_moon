import { useEffect, useState } from 'react'
import MultiCallAbi from 'config/abi/Multicall.json'
import { getMulticallAddress, getCakeAddress } from 'utils/addressHelpers'
import { getWeb3, getContract } from 'utils/web3'
import { useWallet } from 'use-wallet'

import { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import { bucketArray, decodeInt, getFuncData } from 'utils/callHelpers'
import { provider } from 'web3-core'
import { usePools } from 'state/hooks'
import cakeABI from 'config/abi/cake.json'
import contracts from 'config/constants/contracts'
import { getTokenBalance } from 'utils/erc20'
import useRefresh from './useRefresh'

const web3 = getWeb3()

const useTokenBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account, ethereum }: { account: string; ethereum: provider } = useWallet()
  const { fastRefresh } = useRefresh()

  useEffect(() => {
    const fetchBalance = async () => {
      const res = await getTokenBalance(ethereum, tokenAddress, account)
      setBalance(new BigNumber(res))
    }

    if (account && ethereum) {
      fetchBalance()
    }
  }, [account, ethereum, tokenAddress, fastRefresh])

  return balance
}

export const useTotalSupply = () => {
  const { slowRefresh } = useRefresh()
  const [totalSupply, setTotalSupply] = useState<BigNumber>()

  useEffect(() => {
    async function fetchTotalSupply() {
      const cakeContract = getContract(cakeABI, getCakeAddress())
      const supply = await cakeContract.methods.totalSupply().call()
      setTotalSupply(new BigNumber(supply))
    }

    fetchTotalSupply()
  }, [slowRefresh])

  return totalSupply
}

export const useTeamBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { slowRefresh } = useRefresh()
  const pools = usePools(null)
  // const espressoPool = pools.find((p) => p.sousId === contracts.kafeEspresso)
  useEffect(() => {
    const fetchBalance = async () => {
      // if (espressoPool) {
        const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

        // numbeer kafe
        const calls = contracts.teamWallets.map((w) => [tokenAddress, getFuncData('balanceOf(address)', [w])])

        // // number espresso
        // contracts.teamWallets.forEach((w) => {
        //   calls.push([
        //     espressoPool.contractAddress[process.env.REACT_APP_CHAIN_ID],
        //     getFuncData('balanceOf(address)', [w]),
        //   ])
        // })

        // calls.push([
        //   espressoPool.contractAddress[process.env.REACT_APP_CHAIN_ID],
        //   getFuncData('getPricePerFullShare()', []),
        // ])
        console.log(calls)

        let results = await multi.methods.aggregate(calls).call()
        results = results[1]

        let [kafeBal] = bucketArray(results, contracts.teamWallets.length)

        kafeBal = kafeBal.map(decodeInt)
        // espressoBal = espressoBal.map(decodeInt)
        const pricePerShare = `${decodeInt(results[results.length - 1])}`

        let final = new BigNumber(0)

        contracts.teamWallets.forEach((w, i) => {
          final = final.plus(kafeBal[i])
          // final = final.plus(kafeBal[i]).plus(new BigNumber(espressoBal[i]).multipliedBy(pricePerShare).dividedBy(1e18))
        })

        setBalance(new BigNumber(final))
      // }
    }

    fetchBalance()
  }, [tokenAddress, slowRefresh])

  return balance
}

export const useBurnedBalance = (tokenAddress: string) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { slowRefresh } = useRefresh()

  useEffect(() => {
    const fetchBalance = async () => {
      const cakeContract = getContract(cakeABI, getCakeAddress())
      const bal = await cakeContract.methods.balanceOf('0x000000000000000000000000000000000000dEaD').call()
      setBalance(new BigNumber(bal))
    }

    fetchBalance()
  }, [tokenAddress, slowRefresh])

  return balance
}

export default useTokenBalance
