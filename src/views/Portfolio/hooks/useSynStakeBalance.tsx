import { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'

import BigNumber from 'bignumber.js'
import useRefresh from 'hooks/useRefresh'
import { provider } from 'web3-core'
import cakeABI from 'config/abi/cake.json'
import { getContract } from 'utils/web3'
import { getTokenBalance } from 'utils/erc20'
import { getCakeAddress } from 'utils/addressHelpers'
import { useCustomMasterchef, useSynChef } from 'hooks/useContract'
import masterchefAbi from 'config/abi/masterchef.json'

export const useSynStakeBalance = (chefAddress) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account, ethereum }: { account: string; ethereum: provider } = useWallet()
  const { fastRefresh } = useRefresh()
  const mc = useSynChef(chefAddress)
  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try{
          const res = await mc.methods.balanceOf(account).call()
          setBalance(new BigNumber(res.toString()))
        }catch (e) {
          console.error(e)
        }
      }
    }

    if (account && ethereum) {
      fetchBalance()
    }
  }, [account, ethereum, mc.methods, fastRefresh])

  return balance
}

export default useSynStakeBalance
