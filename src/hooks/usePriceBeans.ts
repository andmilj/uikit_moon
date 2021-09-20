import { useContext } from 'react'
import { PriceContextBeans } from 'contexts/PriceContextBeans'
import BigNumber from 'bignumber.js'

const usePriceBeans = () => {
  return useContext(PriceContextBeans)
}

export default usePriceBeans
