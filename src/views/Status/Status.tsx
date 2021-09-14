import BigNumber from 'bignumber.js'
import { Helmet } from 'react-helmet'
import guestConfig from 'config/constants/guest'
import React, { useState, useEffect } from 'react'
import useBlock from 'hooks/useBlock'
import { PoolCategory } from 'config/constants/types'
import styled from 'styled-components'
import moment from 'moment'
import groupBy from 'lodash/groupBy'
import useWeb3 from 'hooks/useWeb3'
import { useCurrentTime } from 'hooks/useTimer'
import { useGuestFromProject, usePools } from 'state/hooks'
import useCompoundEvents from 'hooks/useCompoundEvents'
import { ButtonMenu, Heading, ButtonMenuItem, Text, Checkbox } from '@pancakeswap-libs/uikit'
import { useWallet } from 'use-wallet'
import Page from 'components/layout/Page'
import Hero from './components/Hero'
import Divider from './components/Divider'
import PoolStatusCard from './components/PoolStatusCard'
import PoolStatusCardPrivate from './components/PoolStatusCardPrivate'
import PoolTikuStatusCard from './components/PoolTikuStatusCard'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
`
const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
const displayTime = (millis) => {
  const m = moment().local()
  return m.format('h:mm:ss a  MMMM Do YYYY')
}

const Status: React.FC = () => {
  const { account } = useWallet()
  const events = useCompoundEvents()
  const block = useBlock()
  const currentMillis = useCurrentTime()
  const pools = usePools(account)
  const [onlyStaked, setOnlyStaked] = useState(true)
  const tikuPool = useGuestFromProject('Tiku')
  // console.log(events[tikuPool.sousId])
  // useEffect(() => {

  //   const get = async() => {
  //       // get health status for each pool
  const nonZeroSum = (arr) => {
    return arr.reduce((acc, a, i) => acc + new BigNumber(a).toNumber(), 0) > 0
  }

  const hasTikuStake = () => {
    if (tikuPool && tikuPool.userData) {
      const stakedBalance = new BigNumber(tikuPool.userData.stakedBalance || 0)
      return stakedBalance.toNumber() > 0
    }
    return false
  }
  // const hasTiku = guestConfig.find((c) => !c.hidden && c.projectName === 'Tiku' && hasTikuStake())

  const hasStake = (p) => {
    if (p.userData && p.userData.stakedBalance && new BigNumber(p.userData.stakedBalance).isGreaterThan(0)) {
      return true
    }
    if (p.userData && p.userData.privatePoolInfo && p.userData.privatePoolInfo.stakedAmt) {
      return p.userData.privatePoolInfo.stakedAmt.length > 0 && nonZeroSum(p.userData.privatePoolInfo.stakedAmt)
    }
    if (p.userData && p.userData.stakedVsBalance) {
      return new BigNumber(p.userData.stakedVsBalance).isGreaterThan(0)
    }

    return false
  }
  //   }
  //   get();
  //   setInterval(get, 60000);

  // }, [pools])
  const toDisplay = onlyStaked
    ? pools.filter(
        (p) =>
          !p.hidden &&
          p.contractAddress[CHAIN_ID] &&
          (p.poolCategory === PoolCategory.VAULT || p.poolCategory === PoolCategory.SYNTHETIX_VAULT) &&
          hasStake(p),
      )
    : pools.filter(
        (p) =>
          !p.hidden &&
          p.contractAddress[CHAIN_ID] &&
          (p.poolCategory === PoolCategory.VAULT || p.poolCategory === PoolCategory.SYNTHETIX_VAULT),
      )

  const publicGroups = groupBy(toDisplay, (p) => p.projectName)
  const poolKeys = Object.keys(publicGroups)

  poolKeys.sort((p) => (p === 'moonkafe' ? 0 : 1))

  const hasActivePrivateVault = (pool) => {
    if (pool.userData?.privatePoolInfo) {
      const exitModes = pool.userData.privatePoolInfo.exitMode
      const final = exitModes.reduce((acc, e) => {
        return acc + e ? 1 : 1
      }, 0)
      return final > 0
    }
    return false
  }

  const toDisplayPrivate = pools.filter(
    (p) => !p.hidden && p.poolCategory === PoolCategory.PRIVATEVAULT && hasActivePrivateVault(p),
  )

  return (
    <>
      <Helmet>
        <title>Moonkafe Finance</title>
      </Helmet>
      {/* <Hero /> */}
      <Page>
        {/* <Wrapper> */}
        {/* <ButtonMenu activeIndex={activeIndex} onClick={handleClick} size="sm" variant="subtle">
            <ButtonMenuItem>{TranslateString(999, 'Next draw')}</ButtonMenuItem>
            <ButtonMenuItem>{TranslateString(999, 'Past draws')}</ButtonMenuItem>
          </ButtonMenu> */}
        {/* </Wrapper> */}
        <Heading as="h1" size="xxl" mb="16px">
          Compounding Status
        </Heading>

        <div style={{ width: '100%', justifyContent: 'space-between', display: 'flex', flexDirection: 'row' }}>
          <Text color="secondary">Current block: {block}</Text>

          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <Text color="secondary"> Show Only Staked</Text>&nbsp;
            <Checkbox checked={onlyStaked} scale="sm" onChange={() => setOnlyStaked(!onlyStaked)} />
          </div>

          <Text color="secondary">Current time: {displayTime(currentMillis)}</Text>
        </div>

        <Divider />
        {poolKeys.map((k) => (
          <>
            <Heading key={k} style={{ marginBottom: '5px' }} as="h2">
              {capitalizeFirstLetter(k)} Vaults
            </Heading>
            {publicGroups[k].map((p) => (
              <PoolStatusCard key={p.sousId} pool={p} event={events[p.sousId]} />
            ))}
          </>
        ))}

        {/* <Heading style={{ marginBottom: '5px' }} as="h2">
          TIKU Vaults
        </Heading>
        {(!onlyStaked || hasTiku) && tikuPool ? (
          <PoolTikuStatusCard pool={tikuPool} event={events[tikuPool.sousId]} />
        ) : (
          ''
        )} */}

        {/* <Heading as="h2">
          Public Vaults
        </Heading>
        {toDisplay.map((p,i) => (<PoolStatusCard key={p.sousId} pool={p} event={events[p.sousId]}/>))} */}
        {toDisplayPrivate.length > 0 ? <Heading as="h2">Personal Vaults</Heading> : ''}

        {toDisplayPrivate.map((p, i) => (
          <PoolStatusCardPrivate key={p.sousId} pool={p} />
        ))}
        {/* <PastLotteryDataContext.Provider
          value={{ historyError, historyData, mostRecentLotteryNumber, currentLotteryNumber }}
        >
          {activeIndex === 0 ? <NextDrawPage /> : <PastDrawsPage />}
        </PastLotteryDataContext.Provider> */}
      </Page>
    </>
  )
}

export default Status
