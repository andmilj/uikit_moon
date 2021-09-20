import contracts from 'config/constants/contracts';
import ReactGA from 'react-ga';
import useWeb3 from 'hooks/useWeb3'
import styled from 'styled-components'
import React, { useEffect, Suspense, lazy } from 'react'
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { Button, ResetCSS } from '@pancakeswap-libs/uikit'
import BigNumber from 'bignumber.js'
import { createHashHistory } from 'history';
import { useFetchPublicData } from 'state/hooks'
import GlobalStyle from './style/Global'
import Menu from './components/Menu'
import PageLoader from './components/PageLoader'
// import NftGlobalNotification from './views/Nft/components/NftGlobalNotification'
// import auth from './auth.ts'; // Sample authentication provider

// const history = createHashHistory();
// history.listen(({location}) => {
  // console.log("location", location)
  // ReactGA.set({ page: (location as any).pathname }); // Update the user's current page
  // ReactGA.pageview((location as any).pathname); // Record a pageview for the given page
// });

// Route-based code splitting
// Only pool is included in the main bundle because of it's the most visited page'
const Home = lazy(() => import('./views/Home'))
const Farms = lazy(() => import('./views/Farms'))
// const Lottery = lazy(() => import('./views/Lottery'))
const Pools = lazy(() => import('./views/Pools'))
// const Ifos = lazy(() => import('./views/Ifos'))
const NotFound = lazy(() => import('./views/NotFound'))
const Status = lazy(() => import('./views/Status'))
const Audit = lazy(() => import('./views/Audit'))
const Portfolio = lazy(() => import('./views/Portfolio'))
// const Nft = lazy(() => import('./views/Nft'))

// This config is required for number formating
BigNumber.config({
  EXPONENTIAL_AT: 1000,
  DECIMAL_PLACES: 80,
})

const App: React.FC = () => {
  const { account, connect } = useWallet()

  



  const web3 = useWeb3()
  useEffect(() => {
    if (!account && window.localStorage.getItem('accountStatus')) {
      connect('injected')
    }
    ReactGA.set({
      userId: account,
      // any data that is relevant to the user session
      // that you would like to track with google analytics
    })
  }, [account, connect])

  useFetchPublicData()

  // useEffect(() => {

  //   async function f() {
  //     const t = await web3.eth.getChainId();
  //     console.log(t)

  //   }
  //   f()
  // });
  const refresh = () => {
    window.location.reload(true);
  }

  return (
    <Router>
      {/* {latestVer !== contracts.VERSION && <HardRefresh onClick={refresh}>
          <Spinner src="images/spinner.png" />
        </HardRefresh>} */}
      <ResetCSS />
      <GlobalStyle />
      <Menu>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            <Route path="/frenchpress">
              <Farms />
            </Route>
            <Route path="/drips">
              <Farms tokenMode />
            </Route>
            <Route path="/espresso">
              <Pools />
            </Route>
            <Route path="/status">
              <Status />
            </Route>
            <Route path="/audit">
              <Audit />
            </Route>
            <Route path="/portfolio">
              <Portfolio />
            </Route>
            {/* <Route path="/lottery"> */}
            {/*  <Lottery /> */}
            {/* </Route> */}
            {/* <Route path="/ifo"> */}
            {/*  <Ifos /> */}
            {/* </Route> */}
            {/* <Route path="/nft"> */}
            {/*  <Nft /> */}
            {/* </Route> */}
            {/* Redirect */}
            {/* <Route path="/staking"> */}
            {/*  <Redirect to="/pools" /> */}
            {/* </Route> */}
            {/* <Route path="/syrup"> */}
            {/*  <Redirect to="/pools" /> */}
            {/* </Route> */}
            {/* 404 */}
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </Menu>
      {/* <NftGlobalNotification /> */}
    </Router>

  )
}

export default React.memo(App)


const HardRefresh = styled.div`
  position: fixed;
  right: 0px;
  top: 80px;
  z-index: 20;


`

const Spinner = styled.img`
cursor: pointer;
  width: 50px;
  height: 50px;
  -webkit-animation: rotating 2s linear infinite;
  -moz-animation: rotating 2s linear infinite;
  -ms-animation: rotating 2s linear infinite;
  -o-animation: rotating 2s linear infinite;
  animation: rotating 2s linear infinite;
  @-webkit-keyframes rotating /* Safari and Chrome */ {
    from {
      -webkit-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -webkit-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }
  
  @keyframes rotating {
    from {
      -ms-transform: rotate(0deg);
      -moz-transform: rotate(0deg);
      -webkit-transform: rotate(0deg);
      -o-transform: rotate(0deg);
      transform: rotate(0deg);
    }
    to {
      -ms-transform: rotate(360deg);
      -moz-transform: rotate(360deg);
      -webkit-transform: rotate(360deg);
      -o-transform: rotate(360deg);
      transform: rotate(360deg);
    }
  }

`