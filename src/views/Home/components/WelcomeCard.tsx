import React from 'react'
import { Card, CardBody, Heading, Text } from '@pancakeswap-libs/uikit'
import BigNumber from 'bignumber.js/bignumber'
import styled from 'styled-components'
import { Timeline } from 'react-twitter-widgets'
import { getBalanceNumber } from 'utils/formatBalance'
import { useTotalSupply, useBurnedBalance } from 'hooks/useTokenBalance'
import useI18n from 'hooks/useI18n'
import { getCakeAddress } from 'utils/addressHelpers'
import CardValue from './CardValue'
import { useFarms } from '../../../state/hooks'

const StyledWelcomeCard = styled(Card)`
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

const Link = styled.a`
  text-decoration: underline;
  color: white;
  font-size: 20px;
`
const WelcomeCard = () => {
  const TranslateString = useI18n()

  return (
    <StyledWelcomeCard>
      <CardBody>
        <Heading size="xl" mb="24px">
          Welcome!
        </Heading>
        <Text color="textSubtle">This is the prelaunch phase!</Text>
        <Text color="textSubtle">
          Feel free to deposit and autocompound your yields AND get KAFE airdrops when KAFE launches
        </Text>

        <Text color="textSubtle">
          More info in our <Link href="https://kukafe.gitbook.io/kukafe/">gitbook</Link>
        </Text>

        <Text color="primary">Prelaunch phase ends on 28 July</Text>
      </CardBody>
    </StyledWelcomeCard>
  )
}

export default WelcomeCard
