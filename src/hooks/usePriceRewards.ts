import { useContext } from 'react'
import { RewardPriceContext } from 'contexts/RewardPriceContext'

const usePriceRewards = () => {
  return useContext(RewardPriceContext)
}

export default usePriceRewards
