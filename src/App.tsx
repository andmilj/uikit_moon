import useWeb3 from 'hooks/useWeb3'
import React, { useEffect, Suspense, lazy } from 'react'
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom'
import { useWallet } from 'use-wallet'
import { ResetCSS } from '@pancakeswap-libs/uikit'
import BigNumber from 'bignumber.js'
import { useFetchPublicData } from 'state/hooks'
import GlobalStyle from './style/Global'
import Menu from './components/Menu'
import PageLoader from './components/PageLoader'
// import NftGlobalNotification from './views/Nft/components/NftGlobalNotification'

// Route-based code splitting
// Only pool is included in the main bundle because of it's the most visited page'
const Home = lazy(() => import('./views/Home'))
// const Farms = lazy(() => import('./views/Farms'))
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
  }, [account, connect])

  useFetchPublicData()

  // useEffect(() => {

  //   async function f() {
  //     const t = await web3.eth.getChainId();
  //     console.log(t)

  //   }
  //   f()
  // });

  return (
    <Router>
      <ResetCSS />
      <GlobalStyle />
      <Menu>
        <Suspense fallback={<PageLoader />}>
          <Switch>
            <Route path="/" exact>
              <Home />
            </Route>
            {/* <Route path="/frenchpress">
              <Farms />
            </Route>
            <Route path="/drips">
              <Farms tokenMode />
            </Route> */}
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
