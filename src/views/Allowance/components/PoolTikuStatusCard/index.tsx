import React from 'react'
import useBlock from 'hooks/useBlock'
import { getBalanceNumberPrecisionFloatFixed, toDollar } from 'utils/formatBalance'
import { toast } from 'react-toastify'
import BigNumber from 'bignumber.js'
import { Guest, Pool } from 'state/types'
import useQuotePrice from 'hooks/useQuotePrice'
import styled from 'styled-components'
import { Card, CardBody, TicketRound, Text, Heading, Flex } from '@pancakeswap-libs/uikit'
import contracts from 'config/constants/contracts'

interface CardProps {
  pool?: Guest
  event?: any
}
const SECS_THRESOLD = 30 * 60

const StyledCard = styled(Card)`
  margin-top: 5px;
  margin-bottom: 5px;
`

const CardHeader = styled.div`
  align-items: center;
  display: flex;
`

const IconWrapper = styled.div`
  margin-right: 16px;
  svg {
    width: 48px;
    height: 48px;
  }
`

const TicketCountWrapper = styled.div`
  display: flex;
  flex-direction: column;
`
const Section = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`
const PoolTikuStatusCard: React.FC<CardProps> = ({ pool, event }) => {
  const block = useBlock()

  const quotePrice = useQuotePrice()

  const latestEvent = event ? event.compoundEvents[event.compoundEvents.length - 1] : null
  const interval = event ? event.desiredCompoundInterval : '?'
  // const toDisplayNumber = (n) => {
  //   if (!n){
  //     return 0
  //   }
  //   return new BigNumber(latestEvent.lpAdded).dividedBy(1e18).precision(4, BigNumber.ROUND_UP).toString()

  // }
  const getBlocksElapsed = () => {
    if (!latestEvent) {
      return '0'
    }
    return new BigNumber(block).minus(latestEvent.blockNumber).toString()
  }
  const getMinsElapsed = () => {
    if (!block) {
      return <Text>?</Text>
    }
    if (!latestEvent) {
      return '0'
    }
    const blocks = new BigNumber(block).minus(latestEvent.blockNumber).toNumber()
    const secs = blocks * 3
    const mins = Math.floor(secs / 60)
    const leftOverSecs = secs % 60
    let f = `${mins}m`
    if (leftOverSecs > 0) {
      f = `${f} ${leftOverSecs}s`
    }

    if (secs > interval * 60) {
      const late = secs - interval * 60
      const latePercentage = late / secs
      if (latePercentage > 0.2) {
        return <Text color="failure">{f}</Text>
      }
      return <Text color="warning">{f}</Text>
    }
    return <Text color="success">{f}</Text>
  }

  const getTvlDollar = () => {
    const totalStaked = toDollar(
      new BigNumber(pool.totalStaked).multipliedBy(pool.stakePriceAsQuoteToken),
      pool.lpBaseTokenAddress.toLowerCase(),
      quotePrice,
    )

    return totalStaked
  }

  const getLpDollar = (amt) => {
    const stakeBalanceDollar = toDollar(
      amt.multipliedBy(pool.stakePriceAsQuoteToken),
      pool.lpBaseTokenAddress.toLowerCase(),
      quotePrice,
    )
    return stakeBalanceDollar
  }
  const butcher = (n) => {
    return `${n.slice(0, 4)}...${n.slice(38)}`
  }
  const copyAddress = () => {
    if (event) {
      navigator.clipboard.writeText(event.strategy)

      toast.dark(`📋 ${pool.tokenName} Vault Strategy copied \n ${butcher(event.strategy)}`, {
        // position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }

  return (
    <StyledCard>
      <CardBody>
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Section style={{ flex: 2, marginLeft: '5px', marginRight: '5px' }}>
            <Text>
              {pool.tokenName}
              <span tabIndex={0} onKeyPress={copyAddress} role="button" onClick={copyAddress}>
                &nbsp;📋
              </span>
            </Text>

            {/* {event ? (<Text fontSize="10px" color="grey">{event.strategy}</Text>):("")} */}
          </Section>

          {/* <Section style={{flex: 1, marginLeft: "5px", marginRight: "5px"}}>
              {latestEvent ? (<Text>{latestEvent.blockNumber}</Text>):("")}
              <Text fontSize="10px" color="grey">Last Compound</Text>
            </Section>

            <Section style={{flex: 1, marginLeft: "5px", marginRight: "5px"}}>
              <Text>{getBlocksElapsed()}</Text>
              <Text fontSize="10px" color="grey">Blocks ago</Text>
            </Section> */}

          <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
            {getMinsElapsed()}
            <Text fontSize="10px" color="grey">
              Since Last Compound
            </Text>
          </Section>

          <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
            <Text>{interval}</Text>
            <Text fontSize="10px" color="grey">
              Target Interval (Mins)
            </Text>
          </Section>

          {latestEvent ? (
            <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
              <Text>
                ${getBalanceNumberPrecisionFloatFixed(getLpDollar(new BigNumber(latestEvent.lpAdded)), 18, 5)}
              </Text>
              <Text fontSize="10px" color="grey">
                Profits Compounded
              </Text>
            </Section>
          ) : (
            ''
          )}

          <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
            <Text>${pool.totalStaked ? getBalanceNumberPrecisionFloatFixed(getTvlDollar(), 18, 2) : '?'}</Text>
            <Text fontSize="10px" color="grey">
              TVL
            </Text>
          </Section>
        </div>
      </CardBody>
    </StyledCard>
  )
}

export default PoolTikuStatusCard
