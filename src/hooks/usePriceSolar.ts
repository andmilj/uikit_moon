import { useContext } from 'react'
import { PriceContextSolar } from 'contexts/PriceContextSolar'
import BigNumber from 'bignumber.js'

const usePriceSolar = () => {
  return useContext(PriceContextSolar)
}

export default usePriceSolar
