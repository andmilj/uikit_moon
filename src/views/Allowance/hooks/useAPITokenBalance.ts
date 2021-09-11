import { useWallet } from 'use-wallet'
import { useContext, useEffect, useState } from 'react'
import PastLotteryDataContext from 'contexts/PastLotteryDataContext'
import getLotteryRoundData, { DataResponse } from 'utils/getLotteryRoundData'

const useAPITokenBalance = () => {
  const { account } = useWallet()
  const [data, setData] = useState([])

  useEffect(() => {
    const get = async () => {
      const url = `https://explorer.kcc.io/api/kcs/address/tokenbalance/${account}`
      const r = await fetch(url).then((res) => res.json())

      console.log(r)

      const tokens = r.data.map((d) => ({ token: d.hash, balance: d.balance }))
    }

    if (account > 0) {
      get()
    }
  }, [setData])

  return data
}

export default useAPITokenBalance
