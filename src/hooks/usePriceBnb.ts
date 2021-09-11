import { useContext } from 'react'
import { PriceContextBnb } from 'contexts/PriceContextBnb'
import BigNumber from 'bignumber.js'

const usePriceBnb = () => {
  return useContext(PriceContextBnb)
}

export default usePriceBnb
