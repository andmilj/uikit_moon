import contracts from 'config/constants/contracts'
import detectEthereumProvider from '@metamask/detect-provider';
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import { Heading, Text, BaseLayout, IconButton, Button } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import { useWallet } from 'use-wallet'
import Page from 'components/layout/Page'
import { Helmet } from 'react-helmet'
import { switchNetwork } from 'utils/callHelpers'
import { getWeb3 } from 'utils/web3'
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
  const {connect} = useWallet();
  const [currChain, setCurrChain] = useState(parseInt(process.env.REACT_APP_CHAIN_ID))
  useEffect(() => {



    const check = async () => {
      const provider = await detectEthereumProvider()

      if (provider) {
        const chainId = await (provider as any).request({
          method: 'eth_chainId'
        })
        const c = parseInt(chainId)
        
        setCurrChain(c);
      } else {
        // if the provider is not detected, detectEthereumProvider resolves to null
        console.error('Please install MetaMask!')
      }

    }
    check();
  },[])
  const switchN = async() => {

    const provider = await detectEthereumProvider();
    // console.log(window.ethereum)
    await (provider as any).request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: "0x505",
        chainName: 'Moonriver',
        nativeCurrency: {
            name: 'MOVR',
            symbol: 'MOVR',
            decimals: 18
        },
        rpcUrls: ['https://rpc.moonriver.moonbeam.network'],
        blockExplorerUrls: ['https://blockscout.moonriver.moonbeam.network/']
      }]
      
    })
    .catch(error => {
      console.log(error)
    });

    setTimeout(() => {
      window.location.reload()
    }, 1000)

    
  }
  
  const getConnectAssist = () => {
    // console.log("current chainid", chainId);
    if (currChain !== parseFloat(process.env.REACT_APP_CHAIN_ID)){


      return <Button onClick={switchN}>Switch to Moonriver</Button>

     
    }
    return "";
    
  }
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
          {getConnectAssist()}


          <Heading as="h1" size="xl" mb="24px" color="secondary">
            {TranslateString(576, 'Moonkafe Finance')}
          </Heading>
          <Text>{TranslateString(578, 'Top 3 best DEFI app on Kucoin Community Chain.')}</Text>
        </Hero>
        <div>
          <Cards>
            <FarmStakingCard />
            <TwitterCard />
            <CakeStats />
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
