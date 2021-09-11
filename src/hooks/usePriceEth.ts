import { useContext } from 'react'
import { PriceContextEth } from 'contexts/PriceContextEth'
import BigNumber from 'bignumber.js'

const usePriceEth = () => {
  return useContext(PriceContextEth)
}

export default usePriceEth
