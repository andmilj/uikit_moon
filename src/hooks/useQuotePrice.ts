import { useContext } from 'react'
import { QuotePriceContext } from 'contexts/QuotePriceContext'
import { QuotePrices } from 'utils/formatBalance'

const useQuotePrice = (): QuotePrices => {
  return useContext(QuotePriceContext)
}

export default useQuotePrice
