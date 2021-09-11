import { getBalanceNumber } from 'utils/formatBalance'
import useCakePrice from './useCakePrice'
import { useTotalRewards } from './useTickets'

const useLotteryTotalPrizesUsd = () => {
  const totalRewards = useTotalRewards()
  const totalCake = getBalanceNumber(totalRewards)
  const cakePriceBusd = useCakePrice()

  return totalCake * cakePriceBusd.toNumber()
}

export default useLotteryTotalPrizesUsd
