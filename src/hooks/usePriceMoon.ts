import { useContext } from 'react'
import { PriceContextMoon } from 'contexts/PriceContextMoon'
import BigNumber from 'bignumber.js'

const usePriceMoon = () => {
  return useContext(PriceContextMoon)
}

export default usePriceMoon
