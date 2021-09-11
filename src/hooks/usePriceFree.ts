import { useContext } from 'react'
import { PriceContextFree } from 'contexts/PriceContextFree'
import BigNumber from 'bignumber.js'

const usePriceFree = () => {
  return useContext(PriceContextFree)
}

export default usePriceFree
