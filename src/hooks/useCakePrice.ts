import { useContext } from 'react'
import { CakePriceContext } from 'contexts/CakePriceContext'
import BigNumber from 'bignumber.js'

const useCakePrice = () => {
  return useContext(CakePriceContext)
}

export default useCakePrice
