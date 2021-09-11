import React from 'react'
import { Card, CardBody, Heading, Text } from '@pancakeswap-libs/uikit'
import contracts from 'config/constants/contracts'
import { useWallet } from 'use-wallet'
import BigNumber from 'bignumber.js/bignumber'
import styled from 'styled-components'
import { getBalanceNumber } from 'utils/formatBalance'
import useTokenBalance, { useTotalSupply, useBurnedBalance, useTeamBalance } from 'hooks/useTokenBalance'
import useCakePrice from 'hooks/useCakePrice'
import useI18n from 'hooks/useI18n'
import { getCakeAddress } from 'utils/addressHelpers'
import CardValue from './CardValue'
import { useFarms } from '../../../state/hooks'

const StyledCakeStats = styled(Card)`
  margin-left: auto;
  margin-right: auto;
`

const Row = styled.div`
  align-items: center;
  display: flex;
  font-size: 14px;
  justify-content: space-between;
  margin-bottom: 8px;
`

const CakeStats = () => {
  const TranslateString = useI18n()
  const totalSupply = useTotalSupply()

  const totalMinted = totalSupply // ? totalSupply.multipliedBy(7).dividedBy(8) : new BigNumber(0); // remove dev share
  const burnedBalance = useBurnedBalance(getCakeAddress())
  const devBal = useTeamBalance(contracts.KAFE)
  const { account } = useWallet()
  const farms = useFarms(account)

  const eggPrice = useCakePrice()
  // console.log("devBal",devBal.toString())
  const circSupply = totalMinted ? totalMinted.minus(burnedBalance).minus(devBal) : new BigNumber(0)
  const cakeSupply = getBalanceNumber(circSupply)
  const marketCap = eggPrice.times(circSupply)

  let eggPerBlock = 0
  if (farms && farms[0] && farms[0].eggPerBlock) {
    eggPerBlock = new BigNumber(farms[0].eggPerBlock).div(new BigNumber(10).pow(18)).toNumber()
  }
  let rewardsMultiplier = 1
  if (farms && farms[0] && farms[0].rewardsMultiplier) {
    rewardsMultiplier = farms[0].rewardsMultiplier
  }

  return (
    <StyledCakeStats>
      <CardBody>
        <Heading size="xl" mb="24px">
          {TranslateString(534, 'Egg Stats')}
        </Heading>
        <Row>
          <Text fontSize="14px">Circulating Market Cap</Text>
          <CardValue fontSize="14px" value={getBalanceNumber(marketCap)} decimals={0} prefix="$" />
        </Row>
        <Row>
          <Text fontSize="14px">{TranslateString(536, 'Total Minted')}</Text>
          {totalSupply && <CardValue fontSize="14px" value={getBalanceNumber(totalMinted)} decimals={0} />}
        </Row>
        <Row>
          <Text fontSize="14px">{TranslateString(538, 'Total Burned')}</Text>
          <CardValue fontSize="14px" value={getBalanceNumber(burnedBalance)} decimals={0} />
        </Row>
        <Row>
          <Text fontSize="14px">{TranslateString(10004, 'Circulating Supply')}</Text>
          {cakeSupply && <CardValue fontSize="14px" value={cakeSupply} decimals={0} />}
        </Row>
        <Row>
          <Text fontSize="14px">{TranslateString(540, 'New EGG/block')}</Text>
          <Text bold fontSize="14px">
            {eggPerBlock * rewardsMultiplier}
          </Text>
        </Row>
      </CardBody>
    </StyledCakeStats>
  )
}

export default CakeStats
