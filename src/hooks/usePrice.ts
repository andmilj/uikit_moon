import { useContext } from 'react'
import { PriceContext } from 'contexts/PriceContext'

const usePrice = () => {
  return useContext(PriceContext)
}

export default usePrice
