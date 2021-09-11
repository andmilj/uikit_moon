import { useContext } from 'react'
import { PriceContextMswap } from 'contexts/PriceContextMswap'
import BigNumber from 'bignumber.js'

const usePriceMswap = () => {
  return useContext(PriceContextMswap)
}

export default usePriceMswap
