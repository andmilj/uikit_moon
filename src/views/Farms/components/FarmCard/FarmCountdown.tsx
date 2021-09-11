import React from 'react'
import styled from 'styled-components'
import { Link, Text } from '@pancakeswap-libs/uikit'
import getTimePeriods from 'utils/getTimePeriods'

export interface FarmCountdownProps {
  status: string
  secondsUntilStart: number
  secondsUntilEnd: number
}

const Details = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-bottom: -2px;
`

const Countdown = styled.div`
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 12px;
  font-weight: 400;
  text-align: center;
`

const FarmCountdown: React.FC<FarmCountdownProps> = ({ status, secondsUntilStart, secondsUntilEnd }) => {
  const countdownToUse = status === 'coming_soon' ? secondsUntilStart : secondsUntilEnd
  const timeUntil = getTimePeriods(countdownToUse)
  const suffix = status === 'coming_soon' ? 'start' : 'finish'

  if (countdownToUse <= 0) {
    return (
      <Details>
        <Text bold>Finished</Text>
      </Details>
    )
  }
  const str = []
  if (timeUntil.days > 0) {
    str.push(`${timeUntil.days}d,`)
  }
  if (timeUntil.hours > 0 || timeUntil.days > 0) {
    str.push(`${timeUntil.hours}h,`)
  }
  if (timeUntil.minutes > 0 || timeUntil.hours > 0 || timeUntil.days > 0) {
    str.push(`${timeUntil.minutes}m`)
  }
  str.push(`until ${suffix}`)
  return (
    <Details>
      <Countdown>{str.join(' ')}</Countdown>
    </Details>
  )
}

export default FarmCountdown
