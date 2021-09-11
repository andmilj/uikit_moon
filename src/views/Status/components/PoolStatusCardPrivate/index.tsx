import { ToastContainer, toast } from 'react-toastify'
import React from 'react'
import useBlock from 'hooks/useBlock'
import { getBalanceNumberPrecisionFloatFixed, toDollar } from 'utils/formatBalance'
import BigNumber from 'bignumber.js'
import { Pool } from 'state/types'
import useRefreshJson from 'hooks/useRefreshJson'
import useQuotePrice from 'hooks/useQuotePrice'
import styled from 'styled-components'
import { Card, CardBody, TicketRound, Text, Heading, Flex } from '@pancakeswap-libs/uikit'
import contracts from 'config/constants/contracts'

interface CardProps {
  pool?: Pool
}

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
const VaultRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;
`

const PoolStatusCardPrivate: React.FC<CardProps> = ({ pool }) => {
  const block = useBlock()

  const quotePrice = useQuotePrice()
  const refreshJson = useRefreshJson()
  // console.log(refreshJson)
  // console.log(pool.tokenName, pool)
  // if (!pool.userData || !pool.userData.privatePoolInfo || !pool.userData.privatePoolInfo.address){
  //   return "";
  // }
  // const toDisplayNumber = (n) => {
  //   if (!n){
  //     return 0
  //   }
  //   return new BigNumber(latestEvent.lpAdded).dividedBy(1e18).precision(4, BigNumber.ROUND_UP).toString()

  // }
  // const getBlocksElapsed = () => {
  //   if (!latestEvent){
  //     return "0";
  //   }
  //   return new BigNumber(block).minus(latestEvent.blockNumber).toString();
  // }
  const getMinsElapsed = (lastBlock, interval) => {
    if (!lastBlock) {
      return <Text>?</Text>
    }
    const interval2 = 60
    const blocks = new BigNumber(block).minus(lastBlock).toNumber()
    const secs = blocks * 3
    const mins = Math.floor(secs / 60)
    const leftOverSecs = secs % 60
    let f = `${mins}m`
    if (leftOverSecs > 0) {
      f = `${f} ${leftOverSecs}s`
    }
    return <Text color={secs > interval2 * 60 ? 'failure' : 'success'}>{f}</Text>
  }

  const getLpDollar = (amt) => {
    const stakeBalanceDollar = toDollar(
      amt.multipliedBy(pool.stakePriceAsQuoteToken),
      pool.lpBaseTokenAddress.toLowerCase(),
      quotePrice,
    )

    // console.log(stakeBalanceDollar.dividedBy(1e18).precision(5).toString())
    return stakeBalanceDollar
  }
  const butcher = (n) => {
    return `${n.slice(0, 4)}...${n.slice(38)}`
  }
  const copyAddress = (m) => {
    if (m) {
      navigator.clipboard.writeText(m)

      toast.dark(`📋 ${pool.tokenName} Vault Strategy copied \n ${butcher(m)}`, {
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

  const showVaultRows = () => {
    const info = pool.userData.privatePoolInfo
    // console.log("info",info)
    const vaults = info.address.filter((a, i) => !info.exitMode[i])
    if (!vaults || vaults.length === 0) {
      return <Text>No vaults for {pool.tokenName} yet</Text>
    }

    return vaults.map((v, i) => (
      <VaultRow key={v}>
        <Section style={{ flex: 2, marginLeft: '5px', marginRight: '5px' }}>
          <Text>
            {pool.tokenName}
            <span tabIndex={0} onKeyPress={copyAddress} role="button" onClick={() => copyAddress(v)}>
              &nbsp;📋
            </span>
          </Text>
          {/* <Text fontSize="10px" color="grey">{v}</Text> */}
        </Section>

        <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
          {info.compoundTime[i] && refreshJson && refreshJson.private
            ? getMinsElapsed(info.compoundTime[i].blockNumber, refreshJson.private[pool.stakingTokenAddress])
            : '?'}
          <Text fontSize="10px" color="grey">
            Since Last Compound
          </Text>
        </Section>

        <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
          {/* <Text>{refreshJson && refreshJson.private ? refreshJson.private[pool.stakingTokenAddress] : "?"}</Text> */}
          <Text>60</Text>
          <Text fontSize="10px" color="grey">
            Target Interval (Mins)
          </Text>
        </Section>

        <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
          <Text>
            $
            {info.compoundTime[i]
              ? getBalanceNumberPrecisionFloatFixed(getLpDollar(new BigNumber(info.compoundTime[i].lpAdded)), 18, 5)
              : '?'}
          </Text>
          <Text fontSize="10px" color="grey">
            Profits Compounded
          </Text>
        </Section>

        <Section style={{ flex: 1, marginLeft: '5px', marginRight: '5px' }}>
          <Text>
            $
            {info.stakedAmt[i]
              ? getBalanceNumberPrecisionFloatFixed(getLpDollar(new BigNumber(info.stakedAmt[i])), 18, 2)
              : '?'}
          </Text>
          <Text fontSize="10px" color="grey">
            Your Deposit
          </Text>
        </Section>
      </VaultRow>
    ))
  }

  return (
    <StyledCard>
      <CardBody>{pool && pool.userData && pool.userData.privatePoolInfo ? showVaultRows() : ''}</CardBody>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnHover
      />
    </StyledCard>
  )
}

export default PoolStatusCardPrivate
