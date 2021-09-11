import contracts from 'config/constants/contracts'
import React from 'react'
import styled from 'styled-components'
import { Heading, Text, BaseLayout, IconButton } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import Page from 'components/layout/Page'
import { Helmet } from 'react-helmet'
import FarmStakingCard from './components/FarmStakingCard'
import CakeStats from './components/CakeStats'
import TotalValueLockedCard from './components/TotalValueLockedCard'
import TotalPersonalValueLockedCard from './components/TotalPersonalValueLockedCard'
import TwitterCard from './components/TwitterCard'

const Hero = styled.div`
  align-items: center;
  background-image: url('./images/egg/3.png');
  background-repeat: no-repeat;
  background-position: top center;
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: auto;
  margin-bottom: 32px;
  padding-top: 116px;
  text-align: center;

  ${({ theme }) => theme.mediaQueries.lg} {
    background-image: url('./images/egg/3.png'), url('./images/egg/3b.png');
    background-position: left center, right center;
    height: 165px;
    padding-top: 0;
  }
`

const Cards = styled(BaseLayout)`
  align-items: stretch;
  justify-content: stretch;
  margin-bottom: 48px;

  & > div {
    grid-column: span 6;
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.sm} {
    & > div {
      grid-column: span 8;
    }
  }

  ${({ theme }) => theme.mediaQueries.lg} {
    & > div {
      grid-column: span 6;
    }
  }
`

const Home: React.FC = () => {
  const TranslateString = useI18n()

  return (
    <>
      <Helmet>
        <title>Moonkafe Finance</title>
      </Helmet>
      <Page>
        <Hero>
          {/* <IconButton variant="text">
          <img src="images/moonriver_big.png" alt="moonriver"/>
          <img src="images/moonriver.png" alt="moonriver"/>

          </IconButton> */}
          <Heading as="h1" size="xl" mb="24px" color="secondary">
            {TranslateString(576, 'Moonkafe Finance')}
          </Heading>
          <Text>{TranslateString(578, 'Top 3 best DEFI app on Kucoin Community Chain.')}</Text>
        </Hero>
        <div>
          <Cards>
            {/* <FarmStakingCard /> */}
            <TwitterCard />
            {/* <CakeStats /> */}
            <TotalValueLockedCard />
            <TotalPersonalValueLockedCard />
          </Cards>
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 5 }}>
          <Text color="primary">Version {contracts.VERSION}</Text>
        </div>
      </Page>
    </>
  )
}

export default Home
