import { useEffect, useState } from 'react'
import { useWallet } from 'use-wallet'

import BigNumber from 'bignumber.js'
import useRefresh from 'hooks/useRefresh'
import { provider } from 'web3-core'
import cakeABI from 'config/abi/cake.json'
import { getContract } from 'utils/web3'
import { getTokenBalance } from 'utils/erc20'
import { getCakeAddress } from 'utils/addressHelpers'
import { useCustomMasterchef } from 'hooks/useContract'
import masterchefAbi from 'config/abi/masterchef.json'

export const useStakeBalance = (chefAddress, pid) => {
  const [balance, setBalance] = useState(new BigNumber(0))
  const { account, ethereum }: { account: string; ethereum: provider } = useWallet()
  const { fastRefresh } = useRefresh()
  const mc = useCustomMasterchef(chefAddress, masterchefAbi)
  useEffect(() => {
    const fetchBalance = async () => {
      if (account && pid >= 0) {
        const res = await mc.methods.userInfo(pid, account).call()
        setBalance(new BigNumber(res.amount.toString()))
      }
    }

    if (account && ethereum) {
      fetchBalance()
    }
  }, [account, ethereum, pid, mc.methods, fastRefresh])

  return balance
}

export default useStakeBalance
