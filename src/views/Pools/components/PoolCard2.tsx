import React, { useCallback, useEffect, useMemo, useState } from 'react'
import contracts from 'config/constants/contracts'
import { Sparklines, SparklinesLine } from 'react-sparklines'
import { AbiItem } from 'web3-utils'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import { FarmWithStakedValue } from 'views/Farms/components/FarmCard/FarmCard'
import BigNumber from 'bignumber.js'
import { findCumulativeSum } from 'utils/callHelpers'
import { findLastIndex, sortBy } from 'lodash'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { useCustomHarvest, useHarvest } from 'hooks/useHarvest'
import { calculateAPY } from 'utils/compoundApyHelpers'
import { getMasterChefAddress } from 'utils/addressHelpers'
import ReactTooltip from 'react-tooltip'
import { useHideBalances } from 'state/hooks'
import styled from 'styled-components'
import {
  Button,
  IconButton,
  useModal,
  AddIcon,
  Image,
  Tag,
  Text,
  MinusIcon,
  LinkExternal,
  Flex,
} from '@pancakeswap-libs/uikit'
import { useWallet } from 'use-wallet'
import { CoreTag, PoolTypeTag } from 'components/Tags'
import { getWeb3 } from 'utils/web3'
import UnlockButton from 'components/UnlockButton'
import lpAbi from 'config/abi/uni_v2_lp.json'
import { provider } from 'web3-core'
import useQuotePrice from 'hooks/useQuotePrice'
import { useERC20, useVaultContract } from 'hooks/useContract'
import { useApprove, useCustomApprove, useSousApprove } from 'hooks/useApprove'
import useI18n from 'hooks/useI18n'
import useStake, { useCustomStake, useSousStake } from 'hooks/useStake'
import useUnstake, { useCustomUnstake, useSousUnstake } from 'hooks/useUnstake'
import {
  getAddressName,
  getBalanceNumber,
  getBalanceNumberPrecision,
  getBalanceNumberPrecisionFloat,
  getBalanceNumberPrecisionFloatFixed,
  getDecimals,
  getLiquidLink,
  removeTrailingZero,
  toDollar,
} from 'utils/formatBalance'
import Balance from 'components/Balance'
import { Farm, Pool } from 'state/types'
import getTimePeriods from 'utils/getTimePeriods'
import useBlock from 'hooks/useBlock'
import DepositModalSlider from './DepositModalSlider'
import CardTitle from './CardTitle'
import Card from './Card'
import CardFooter from './CardFooter'
import CardActionsContainer from '../../Farms/components/FarmCard/CardActionsContainer'
import RedeemModalSlider from './RedeemModalSlider'
import WithdrawModalSlider from './WithdrawModalSlider'

// interface PoolWithApy extends Pool {
//   apy?: string
// }

const web3 = getWeb3()
interface PoolCardProps {
  pool: Pool
}
const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const PoolCard2: React.FC<PoolCardProps> = ({ pool }) => {
  const {
    sousId,
    image,
    tokenName,
    stakingTokenName,
    stakingTokenAddress,
    projectLink,
    projectName,
    // harvest,
    // totalStakedAsQuoteToken,
    stakePriceAsQuoteToken,
    apy,
    vsApy,
    // apyCompound,
    // apyCompoundDay,
    pricePerShare,
    // lpToken,
    // allocPoint,
    // totalAllocPoint,
    // tokenDecimals,
    // poolCategory,
    totalStaked,
    // startBlock,
    // endBlock,
    isFinished,
    // isLP,
    userData,
    lpBaseTokenAddress,
    // contractAddress,
    disclaimer,
    disclaimerPositive,
    disclaimerNegative,
    depositFee,
    contractAddress,

    vaultShareFarmPid,
    vaultShareFarmContract,
    vaultShareRewardToken,

    vStakedBalance,
    vaultShareToken,
    positiveTooltip,
    negativeTooltip,
    boostFinished,
    boostEndBlock,

    stakeBalanceDollar,
    stakeVsBalanceDollar,
    bothTotalStaked,
    bothTotalStakedDollar,

    // stakingLimit,
  } = pool
  // console.log("stakeBalanceDollar",stakeBalanceDollar.toString())
  // console.log("vaultShareFarm",vaultShareFarm)
  // Pools using native BNB behave differently than pools using a token
  // const isBnbPool = poolCategory === PoolCategory.BINANCE
  const hasMinWidth = !useMediaQuery('(max-width:700px)')
  const TranslateString = useI18n()
  const stakingTokenContract = useERC20(stakingTokenAddress)
  const vsTokenContract = useVaultContract(contractAddress[process.env.REACT_APP_CHAIN_ID])
  const { account, ethereum }: { account: string; ethereum: provider } = useWallet()
  const block = useBlock()
  const { onApprove } = useSousApprove(stakingTokenContract, sousId)
  const { onStake } = useSousStake(sousId)
  const { onUnstake } = useSousUnstake(sousId)

  const vsMasterchef = vaultShareFarmContract || getMasterChefAddress()

  const { onApprove: onVsApprove } = useCustomApprove(vsTokenContract, vsMasterchef, true)
  const { onStake: onStakeVs } = useCustomStake(vsMasterchef, vaultShareFarmPid, true)
  const { onUnstake: onUnstakeVs } = useCustomUnstake(vsMasterchef, vaultShareFarmPid, true)
  const { onReward } = useCustomHarvest(vsMasterchef, vaultShareFarmPid)
  const [vaultLiqPath, setVaultLiqPath] = useState('')

  useEffect(() => {
    const get = async () => {
      // console.log('get token pair')
      let tok0
      let tok1

      if (pool.isLP) {
        const lpContract = new web3.eth.Contract(lpAbi as unknown as AbiItem, stakingTokenAddress)
        tok0 = await lpContract.methods.token0().call()
        tok1 = await lpContract.methods.token1().call()
      } else {
        tok0 = stakingTokenAddress
        tok1 = lpBaseTokenAddress
      }
      if (tok0.toLowerCase() === contracts.WMOVR.toLowerCase()) {
        tok0 = 'ETH'
      }
      if (tok1.toLowerCase() === contracts.WMOVR.toLowerCase()) {
        tok1 = 'ETH'
      }
      setVaultLiqPath(`${tok0}/${tok1}`)
    }
    setTimeout(get, Math.floor(1000 * Math.random()))
    // get();
  }, [stakingTokenAddress, lpBaseTokenAddress, pool.isLP])

  const liquidityUrlPathParts = vaultShareToken
    ? getLiquidityUrlPathParts({
        quoteTokenAdresses: vaultShareToken.quoteTokenAdresses,
        quoteTokenSymbol: vaultShareToken.quoteTokenSymbol,
        tokenAddresses: vaultShareToken.tokenAddresses,
      })
    : vaultLiqPath

  const [requestedApproval, setRequestedApproval] = useState(false)
  // const [pendingTx, setPendingTx] = useState(false)

  const allowance = new BigNumber(userData?.allowance || 0)
  const stakingTokenBalance = new BigNumber(userData?.stakingTokenBalance || 0)
  const stakedBalance = new BigNumber(userData?.stakedBalance || 0)
  // const pricePerShare = new BigNumber(userData?.pricePerShare || 0)
  // const earnings = new BigNumber(userData?.pendingReward || 0)
  // console.log("pricePerShare",pricePerShare)
  // const blocksUntilStart = Math.max(startBlock - block, 0)
  // const blocksRemaining = Math.max(endBlock - block, 0)
  // const isOldSyrup = stakingTokenName === QuoteToken.SYRUP
  const accountHasStakedBalance = stakedBalance?.toNumber() > 0
  const needsApproval =
  (!allowance.toNumber() || allowance.isLessThan('0xffffffffffffffffffffffffffffffffffffffff'))
    // !accountHasStakedBalance &&
  const isCardActive = isFinished && accountHasStakedBalance

  const quotePrice = useQuotePrice()

  const [capital, setCapital] = useState(new BigNumber(0))
  const [capitalCum, setCapitalCum] = useState([])
  const [expanded, setExpanded] = useState(false)

  const hasVaultShare = vaultShareFarmPid >= 0
  // vault shares stuff
  const vsTokenBalance = new BigNumber(userData?.vsBal || 0)
  const vsAllowance = new BigNumber(userData?.vsAllowance || 0)
  const stakedVsBalance = hasVaultShare && userData ? new BigNumber(userData.stakedVsBalance) : new BigNumber(0)
  const pendingVsReward = hasVaultShare && userData ? new BigNumber(userData?.pendingVsReward) : new BigNumber(0)
  const accountHasVsStakedBalance = stakedVsBalance?.toNumber() > 0
  const needsVsApproval =
    !accountHasVsStakedBalance &&
    (!vsAllowance.toNumber() || vsAllowance.isLessThan('0xffffffffffffffffffffffffffffffffffffffff'))

  const hideBalances = useHideBalances()

  useEffect(() => {
    if (!accountHasStakedBalance && !accountHasVsStakedBalance) {
      return
    }
    if (!expanded) {
      return
    }

    const fetchEvents = async (myAccount) => {
      // console.log("fetch past events")
      if (!myAccount) {
        return
      }
      const w = getWeb3();
      const blockNumber = await w.eth.getBlockNumber()
      // console.log("blockNumber", blockNumber)
      console.log('Getting past events for', tokenName)
      let zeroEventBlock = new BigNumber(await vsTokenContract.methods.blockAtZeroCapital(myAccount).call()).toNumber();
      // console.log("zeroEventBlock",zeroEventBlock)
      if (zeroEventBlock === 0){
        zeroEventBlock = contracts.globalStartBlock;
      }
      let allEvents = [];
      const fromBlock = zeroEventBlock + 1;
      const toBlock = "latest"
      const vaultAddress = contractAddress[process.env.REACT_APP_CHAIN_ID].toLowerCase();
      let topic0 = contracts.topics.vaultDeposit.toLowerCase();
      const topic1 = `0000000000000000000000000000000000000000000000000000000000000000${myAccount.toLowerCase().slice(2)}`.slice(-64);

      const url =  `https://blockscout.moonriver.moonbeam.network/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${vaultAddress}&topic0=0x${topic0}&topic1=0x${topic1}&topic0_1_opr=and`
      const resp = await fetch(url)
      const j = await resp.json()
      if (j && j.message === 'OK') {
        allEvents = [...allEvents, ...j.result.map(o => ({...o, type: "deposit"}))]
      }
      topic0 = contracts.topics.vaultWithdraw.toLowerCase();
      const url2 =  `https://blockscout.moonriver.moonbeam.network/api?module=logs&action=getLogs&fromBlock=${fromBlock}&toBlock=${toBlock}&address=${vaultAddress}&topic0=0x${topic0}&topic1=0x${topic1}&topic0_1_opr=and`
      const resp2 = await fetch(url2)
      const j2 = await resp2.json()
      if (j2 && j2.message === 'OK') {
        allEvents = [...allEvents, ...j2.result.map(o => ({...o, type: "withdraw"}))]
      }

      const logAbi = [{
          type: 'address',
          name: 'user',
          indexed: true
      },{
          type: 'uint256',
          name: 'amtShares'
      },{
          type: 'uint256',
          name: 'amtTok'
      }]

      allEvents = allEvents.map((l) => {
        const temp = web3.eth.abi.decodeLog(logAbi, l.data, l.topics.slice(1))
        return {
          block: new BigNumber(l.blockNumber).toNumber(),
          type: l.type,
          value: temp.amtTok
        }
      })
      allEvents = sortBy(allEvents, e => e.block);
      console.log("allEvents", allEvents)
      // allEvents = allEvents.map((l) => ({ from: l.returnValues.from, to: l.returnValues.to, value: l.returnValues.value }))
      const arr = []

      allEvents.forEach((event) => {
        if (event.type === "withdraw"){
          arr.push(new BigNumber(event.value).multipliedBy(-1))
        }
        else if (event.type === "deposit"){
          arr.push(new BigNumber(event.value))
        }
      })
      const { sum: total, res: cumSums } = findCumulativeSum(arr)
      console.log(total.toString(), cumSums.map(c => c.toString()))

      setCapital(total)
      setCapitalCum(cumSums)


      // let zeroEventBlock
      // .getPastEvents('CapitalZeroed', {
      //   filter: {user: myAccount},
      //   fromBlock: blockNumber- (4*3600/12),
      //   toBlock: 'latest',
      // })
      // .then(function (events) {
      //   return events.map((l) => ({ block: l.blockNumber }))
      // })
      // console.log("zeroEvents",zeroEvents)
      // const zeroSorted = sortBy(zeroEvents, e => e.block);
      // let searchStart = 0;
      // if (zeroSorted.length > 0 ){
      //   searchStart = zeroSorted[zeroSorted.length - 1].block + 1;
      // }
      // console.log("searchStart",searchStart)

      // const e = await stakingTokenContract
      //   .getPastEvents('Transfer', {
      //     filter: { from: [myAccount, contractAddress[CHAIN_ID]], to: [myAccount, contractAddress[CHAIN_ID]] }, // Using an array means OR: e.g. 20 or 23
      //     fromBlock: searchStart,
      //     toBlock: 'latest',
      //   })
      //   .then(function (events) {
      //     return events.map((l) => ({ from: l.returnValues.from, to: l.returnValues.to, value: l.returnValues.value }))
      //   })

    
    }

    fetchEvents(account)
  }, [
    account,
    expanded,
    accountHasVsStakedBalance,
    accountHasStakedBalance,
    userData?.stakedBalance,
    contractAddress,
    stakingTokenContract,
    tokenName,
    vsTokenContract
  ])

  // console.log(tokenName, "capital", capital.toString())
  const [onPresentDeposit] = useModal(
    <DepositModalSlider
      max={stakingTokenBalance}
      onConfirm={onStake}
      tokenName={stakingTokenName}
      decimals={getDecimals(stakingTokenAddress)}
      pricePerShare={new BigNumber(pricePerShare)}
      startAtMax
    />,
  )

  const [onPresentWithdraw] = useModal(
    <RedeemModalSlider
      pricePerShare={new BigNumber(pricePerShare)}
      max={stakedBalance}
      decimals={getDecimals(stakingTokenAddress)}
      onConfirm={onUnstake}
      redeemName={`Espresso ${stakingTokenName}`}
      tokenName={stakingTokenName}
    />,
  )

  const handleApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      const txHash = await onApprove()
      // user rejected tx or didn't go thru
    } catch (e) {
      console.error(e)
    }
    setRequestedApproval(false)
  }, [onApprove, setRequestedApproval])

  // vault shares

  const [onPresentVsDeposit] = useModal(
    <DepositModalSlider
      max={vsTokenBalance}
      onConfirm={onStakeVs}
      tokenName={`Espresso (${stakingTokenName})`}
      startAtMax
      pricePerShare={null}
    />,
  )

  const [onPresentVsWithdraw] = useModal(
    <WithdrawModalSlider
      max={stakedVsBalance}
      onConfirm={onUnstakeVs}
      tokenName={`Espresso (${stakingTokenName})`}
      startAtMax={false}
    />,
  )

  const handleVsApprove = useCallback(async () => {
    try {
      setRequestedApproval(true)
      const txHash = await onVsApprove()
      // user rejected tx or didn't go thru
    } catch (e) {
      console.error(e)
    }
    setRequestedApproval(false)
  }, [onVsApprove, setRequestedApproval])

  const _getDollarValue = (tokenAmt) => {
    return toDollar(tokenAmt.multipliedBy(stakePriceAsQuoteToken), lpBaseTokenAddress.toLowerCase(), quotePrice)
  }
  const getDollarValue = useCallback(_getDollarValue, [quotePrice, lpBaseTokenAddress, stakePriceAsQuoteToken])

  // const getQuoteDollarValue = (tokenDollarInQuote) => {
  //   switch(lpBaseTokenAddress.toLowerCase()){
  //     case contracts.WMOVR.toLowerCase(): return tokenDollarInQuote.multipliedBy(kcsPrice);
  //     case contracts.ETH.toLowerCase(): return tokenDollarInQuote.multipliedBy(ethPrice);
  //     case contracts.BNB.toLowerCase(): return tokenDollarInQuote.multipliedBy(bnbPrice);
  //     default: return tokenDollarInQuote;
  //   }
  // }

  // const stakeBalanceDollar = getDollarValue(stakedBalance.multipliedBy(pricePerShare));
  // const stakeVsBalanceDollar = getDollarValue(stakedVsBalance.multipliedBy(pricePerShare));

  // const bothTotalStaked = stakedBalance.plus(stakedVsBalance);
  // const bothTotalStakedDollar = stakeBalanceDollar.plus(stakeVsBalanceDollar)

  // let vsApy;
  // let vsStakeBalanceDollar = new BigNumber(0);
  // if (vaultShareFarmPid && vStakedBalance){
  //   vsStakeBalanceDollar = getDollarValue(vStakedBalance.multipliedBy(pricePerShare))
  //   if (vsStakeBalanceDollar.isZero()){
  //     vsStakeBalanceDollar = new BigNumber(3000e18)
  //   }
  //   vsApy = dollarProfitsPerYearVs.dividedBy(vsStakeBalanceDollar).multipliedBy(100)
  // }
  // console.log("dollarProfitsPerYearVs",dollarProfitsPerYearVs.toString())
  const capitalDollar = getDollarValue(capital)
  const overAllVStakedDollar = getDollarValue(vStakedBalance.multipliedBy(pricePerShare))

  // console.log("stakingTokenBalance",stakingTokenBalance.toString(),
  // getDollarValue(stakingTokenBalance).toString(), stakePriceAsQuoteToken)

  const getChange = (a, b) => {
    // console.log(tokenName, a.toString(),b.toString())
    if (a.isLessThan(0)) {
      return (
        <Text fontSize="24px" color="success">
          ∞
        </Text>
      )
    }
    if (b.isGreaterThan(a)) {
      // return <span data-type="success" data-tip={`${b.minus(a).dividedBy(a).multipliedBy(100).toFixed(2)}%`}>📈</span>
      return (
        <>
          <Text fontSize="14px" color="success">{`${b
            .minus(a)
            .dividedBy(a)
            .multipliedBy(100)
            .precision(4, BigNumber.ROUND_UP)}%`}</Text>
        </>
      )
    }
    if (a.isGreaterThan(b)) {
      // return <span data-type="error" data-tip={`-${a.minus(b).dividedBy(a).multipliedBy(100).toFixed(2)}%`}>📉</span>
      return (
        <>
          <Text fontSize="14px" color="failure">{`-${a
            .minus(b)
            .dividedBy(a)
            .multipliedBy(100)
            .precision(4, BigNumber.ROUND_UP)}%`}</Text>
        </>
      )
    }
    return <Text>-</Text>
  }
  
  // const [blocksLeft, setBlocksLeft] = useState(0);
  // useEffect(() => {
  //   if (block && boostEndBlock){
  //     const numBlocksLeft = boostEndBlock - block;
  //     setBlocksLeft(numBlocksLeft);
  //   }

  // }, [block])

  // const getSecsLeft = () => {
  //   const numBlocksLeft = 
  // }
  const getTime = (n) => {
    const secs = n*13;
    const timeUntil = getTimePeriods(secs);
   
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
    return str.join(' ');

  }
  const getCountDown = () => {
      const numBlocksLeft = boostEndBlock - block;
      return `${numBlocksLeft} blocks (~${getTime(numBlocksLeft)})`

  }

  const stepOne = () => {


    return (
      <ActionBox>
        <TextRow>
          {hasVaultShare ? <ActionStep>1</ActionStep> : ''}
          <ActionDesc>Deposit {stakingTokenName}</ActionDesc>
        </TextRow>

        <HorizontalDivider />

        <TextRow style={{ justifyContent: 'space-around', flexWrap: "wrap" }}>
          <TextEle style={{ height: '100%' }}>
            <Text color="grey" fontSize="11px">
              In Wallet
            </Text>

            <div style={{ flex: 2, textAlign: 'center' }}>
              {/* <Balance decimals={4} fontSize="18px" value={getBalanceNumber(stakingTokenBalance, getDecimals(stakingTokenAddress))} />
              <Balance
                decimals={2}
                suffix=")"
                prefix="($"
                fontSize="12px"
                value={getBalanceNumber(getDollarValue(stakingTokenBalance),getDecimals(lpBaseTokenAddress))}
              /> */}


                  <Text fontSize="18px">
                    {removeTrailingZero(getBalanceNumber(stakingTokenBalance, getDecimals(stakingTokenAddress)))}
                  </Text>
                  <Text style={{ marginTop: '-5px' }} fontSize="12px">
                    (${parseFloat(getBalanceNumber(getDollarValue(stakingTokenBalance),getDecimals(lpBaseTokenAddress)).toFixed(2)).toLocaleString()})
                  </Text>



            </div>
            {needsApproval ? (
              <Button disabled={requestedApproval} onClick={handleApprove}>
                {`Approve ${stakingTokenName}`}
              </Button>
            ) : (
              <Button style={{ marginTop: 'auto' }} disabled={stakingTokenBalance.isZero()} onClick={onPresentDeposit}>
                Deposit
              </Button>
            )}
          </TextEle>

          <TextEle>
            <Text color="grey" fontSize="11px">
              Deposited
            </Text>
            <div style={{ flex: 2, textAlign: 'center' }}>
              {/* <Balance
                decimals={4}
                fontSize="18px"
                value={getBalanceNumber(stakedBalance.multipliedBy(pricePerShare),getDecimals(stakingTokenAddress))}
              />
              <Balance
                decimals={2}
                suffix=")"
                prefix="($"
                fontSize="12px"
                value={getBalanceNumber(stakeBalanceDollar,getDecimals(lpBaseTokenAddress))}
              /> */}

                  <Text fontSize="18px">
                    {removeTrailingZero(getBalanceNumber(stakedBalance.multipliedBy(pricePerShare),getDecimals(stakingTokenAddress)))}
                  </Text>
                  <Text style={{ marginTop: '-5px' }} fontSize="12px">
                    (${parseFloat(getBalanceNumber(stakeBalanceDollar,getDecimals(lpBaseTokenAddress)).toFixed(2)).toLocaleString()})
                  </Text>



            </div>
            <Button
              style={{ marginTop: 'auto' }}
              disabled={stakedBalance.eq(new BigNumber(0))}
              onClick={onPresentWithdraw}
            >
              Withdraw
            </Button>
          </TextEle>
        </TextRow>

        <HorizontalDivider />

        <Text color="grey" fontSize="14px">
          You receive
        </Text>
        {/* <TextRow> */}
        {/* </TextRow> */}
        {/* <TextRow> */}
        <Text color="contrast" fontSize="14px">
          1 <Token>Espresso ({stakingTokenName})</Token> = &nbsp;
          <span
            data-multiline="true"
            data-type="success"
            data-tip="Keeps increasing as <br/>autocompound happens"
            style={{ fontSize: '16px', textDecoration: 'underline' }}
          >
            {new BigNumber(pricePerShare).toFixed(3)}
          </span>
          &nbsp;
          <Token>{stakingTokenName}</Token>
        </Text>
        {/* </TextRow> */}

        <TextRow style={{ width: 'auto', marginTop: '2px' }}>
          {/* <ActionStepMini>i</ActionStepMini> */}
          <Text color="grey" fontSize="14px">
            You can redeem them for <Token>{stakingTokenName}</Token> anytime
          </Text>
        </TextRow>

        <TextRow style={{ width: 'auto', marginTop: '2px' }}>
          {/* <ActionStepMini>i</ActionStepMini> */}
          <Text color="grey" fontSize="14px">
            You get{' '}
            <u>
              <b>more</b>
            </u>{' '}
            <Token>{stakingTokenName}</Token> over time
          </Text>
        </TextRow>

        <ReactTooltip />
      </ActionBox>
    )
  }

  const stepTwo = () => {
    return (
      <ActionBox>
        <TextRow>
          <ActionStep>2</ActionStep>
          <ActionDesc>Stake Espresso ({stakingTokenName})</ActionDesc>
        </TextRow>

        <HorizontalDivider />

        <TextRow style={{ justifyContent: 'space-around', flexWrap: "wrap" }}>
          <TextEle>
            <Text color="grey" fontSize="11px">
              In Wallet
            </Text>
            <div style={{ flex: 2, textAlign: 'center' }}>
              {/* <Balance decimals={4} fontSize="18px" value={getBalanceNumber(vsTokenBalance)} /> */}


              <Text fontSize="18px">
                  {removeTrailingZero(getBalanceNumber(vsTokenBalance))}
              </Text>
             

            </div>

            {needsVsApproval ? (
              <Button disabled={requestedApproval} onClick={handleVsApprove}>
                Approve Espresso
              </Button>
            ) : (
              <>
                <Button disabled={vsTokenBalance.isZero()} onClick={onPresentVsDeposit}>
                  Boost
                </Button>
              </>
            )}
          </TextEle>

          <TextEle>
            <Text color="grey" fontSize="11px">
              Boosting
            </Text>
            <div style={{ flex: 2, textAlign: 'center' }}>
              {/* <Balance decimals={4} fontSize="18px" value={getBalanceNumber(stakedVsBalance)} />
              <Balance
                decimals={2}
                suffix=")"
                prefix="($"
                fontSize="12px"
                value={getBalanceNumber(stakeVsBalanceDollar,getDecimals(lpBaseTokenAddress))}
              /> */}

                  <Text fontSize="18px">
                    {removeTrailingZero(getBalanceNumber(stakedVsBalance))}
                  </Text>
                  <Text style={{ marginTop: '-5px' }} fontSize="12px">
                    (${parseFloat(getBalanceNumber(stakeVsBalanceDollar,getDecimals(lpBaseTokenAddress)).toFixed(2)).toLocaleString()})
                  </Text>



            </div>
            <Button
              style={{ marginTop: 'auto' }}
              disabled={stakedVsBalance.eq(new BigNumber(0))}
              onClick={onPresentVsWithdraw}
            >
              Unboost
            </Button>
          </TextEle>
        </TextRow>

        <HorizontalDivider />

        <div
          style={{
            display: 'flex',
            flexDirection: hasMinWidth ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text color="grey" fontSize="14px">
            You receive additional rewards{' '}
          </Text>
          <Text color="success" fontSize="14px">
            &nbsp;({vsApy ? vsApy.toFixed(2) : 0}% APR)&nbsp;
          </Text>
          <Text color="grey" fontSize="14px">
            {' '}
            for staking Espresso
          </Text>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: hasMinWidth ? 'row' : 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text color="grey" fontSize="14px">
            Currently boosting{' '}
          </Text>
          <Text color="success" fontSize="14px">
            &nbsp;${getBalanceNumberPrecisionFloatFixed(overAllVStakedDollar, getDecimals(lpBaseTokenAddress), 2)}&nbsp;
          </Text>
          <Text color="grey" fontSize="14px">
            {' '}
            worth of Espressos with {vaultShareRewardToken ? getAddressName(vaultShareRewardToken) : 'KAFE'}
          </Text>
        </div>

        {hasVaultShare && boostFinished && accountHasVsStakedBalance ? (
          <div
            style={{
              display: 'flex',
              flexDirection: hasMinWidth ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text color="failure" fontSize="20px">
              Boost has ended, please unstake from step 2
            </Text>
          </div>
        ) : (
          ''
        )}

        {!boostFinished && boostEndBlock &&  <div
            style={{
              display: 'flex',
              flexDirection: hasMinWidth ? 'row' : 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text color="grey" fontSize="14px">
              Boost ending in {getCountDown()}
            </Text>
          </div>}


        <HorizontalDivider />

        {stakedVsBalance.isGreaterThan(0) ? (
          <Button style={{ width: 'auto' }} disabled={requestedApproval} onClick={onRewardSequence}>
            {`Claim ${getBalanceNumberPrecisionFloat(pendingVsReward, getDecimals(vaultShareRewardToken||contracts.KAFE), 4)} ${
              vaultShareRewardToken ? getAddressName(vaultShareRewardToken) : 'KAFE'
            }`}
          </Button>
        ) : (
          ''
        )}

        <HorizontalDivider />
      </ActionBox>
    )
  }
  const onRewardSequence = async () => {
    setRequestedApproval(true)
    await onReward()
    setRequestedApproval(false)
  }

  const getEnhancedDayApy = () => {
    return vaultShareFarmPid >= 0 && !boostFinished ? (
      <>
        <MyText fontSize="18px" color="success">
          {new BigNumber(apy).plus(vsApy).dividedBy(365).toFixed(2)}%
        </MyText>
        <MyText fontSize="14px" style={{ textDecoration: 'line-through' }}>
          {new BigNumber(apy).dividedBy(365).toFixed(2)}%
        </MyText>
      </>
    ) : (
      <MyText fontSize="18px">{new BigNumber(apy).dividedBy(365).toFixed(2)}%</MyText>
    )
  }
  // const getEnhancedApy = () => {
  //   return (vaultShareFarmPid) ? (
  //     <>
  //       <MyText fontSize="18px" color="success">{new BigNumber(apy).plus(vsApy).toFixed(2)}%</MyText>
  //       <MyText fontSize="14px" style={{textDecoration: "line-through"}}>{new BigNumber(apy).toFixed(2)}%</MyText>
  //     </>
  //   ):(<MyText fontSize="18px">{new BigNumber(apy).toFixed(2)}%</MyText>)

  // }

  const toDisplayable = (n) => {
    if (n.isGreaterThan(100000)) {
      return n.toPrecision(5)
    }
    return n.toFixed(2)
  }
  const getEnhancedCompoundedApy = () => {
    let a = new BigNumber(apy)
    const oldCompounded = calculateAPY({ compoundPeriodInSecs: 86400, apr: a })
    if (vaultShareFarmPid >= 0 && !boostFinished) {
      a = a.plus(vsApy)

      const compoundedYear = calculateAPY({ compoundPeriodInSecs: 86400, apr: a })
      return (
        <>
          <MyText fontSize="18px" color="success">
            {toDisplayable(compoundedYear)}%
          </MyText>
          <MyText fontSize="14px" style={{ textDecoration: 'line-through' }}>
            {toDisplayable(oldCompounded)}%
          </MyText>
        </>
      )
    }

    return <MyText fontSize="18px">{toDisplayable(oldCompounded)}%</MyText>
  }

  const left = () => {
    return (
      <LeftSection>
        <div style={{ width: 80, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image src={`./images/tokens/${image}.png`} width={pool.isLP ? 80 : 52} height={52} alt={stakingTokenName} />
        </div>

        <VerticalDivider />
        <TextEleLeft style={{ flex: 2 }}>
          <span>
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}>
              <Text color="primary">{stakingTokenName}</Text>
              <LinkExternal href={getLiquidLink(stakingTokenName, liquidityUrlPathParts, projectName)} />
              {disclaimer ? (
                <span style={{ cursor: 'pointer' }} data-multiline="true" data-type="error" data-tip={disclaimer}>
                  ⚠️
                </span>
              ) : (
                ''
              )}
            </div>
            <ReactTooltip />

            {/* {disclaimerPositive ? (<span data-multiline="true" data-type="success" data-tip={disclaimerPositive}>✔️</span>):("")} */}
          </span>
          <FlexRowDiv style={{justifyContent: 'flex-start', alignItems:'flex-end', color: 'grey', fontSize: '15px'}}>
            <div>Uses</div>
            &nbsp;
            <MyLink href={projectLink}>{projectName}</MyLink>

          </FlexRowDiv>
          {/* <Text style={{ marginTop: '-5px' }} color="grey" fontSize="15px">
            Uses <MyLink href={projectLink}>{projectName}</MyLink>
          </Text> */}
          {/* <MultiplierTag variant="secondary">{pool.projectName.toUpperCase()}</MultiplierTag> */}
          <TextRow>
            {depositFee ? <MultiplierTag variant="failure">{depositFee}% Deposit Fee</MultiplierTag> : ''}
            {disclaimerPositive ? (
              <MultiplierTag data-multiline="true" data-type="success" data-tip={positiveTooltip} variant="success">
                {disclaimerPositive}
            <ReactTooltip />
              </MultiplierTag>
            ) : (
              ''
            )}
            {disclaimerNegative ? (
              <MultiplierTag data-multiline="true" data-type="error" data-tip={negativeTooltip} variant="failure">
                {disclaimerNegative}
            <ReactTooltip />
              </MultiplierTag>
            ) : (
              ''
            )}
          </TextRow>
        </TextEleLeft>
      </LeftSection>
    )
  }
  const middle = () => {
    const content = (
      <>
        {pendingVsReward.isGreaterThan(0) ? (
          <TextEle style={{ gridArea: 'claimbutton' }}>
            <Text style={{ textAlign: 'center' }} color="grey" fontSize="12px">
              Claim
            </Text>

            <MyButton
              onClick={(e) => {
                e.stopPropagation()
                onReward()
              }}
            >
              <Balance decimals={getDecimals(vaultShareRewardToken||contracts.KAFE) < 18 ? 0 : 2} fontSize="20px" value={getBalanceNumber(pendingVsReward, getDecimals(vaultShareRewardToken||contracts.KAFE))} />
            </MyButton>

            <Text style={{ textAlign: 'center' }} color="grey" fontSize="12px">
              Pending {vaultShareRewardToken ? getAddressName(vaultShareRewardToken) : 'KAFE'}
            </Text>
          </TextEle>
        ) : (
          ''
        )}

        <TextEle style={{ gridArea: 'left' }}>
          {!bothTotalStaked.isGreaterThan(0) ? (
            <div style={{ textAlign: 'center' }}>
              <Text fontSize="18px">0</Text>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              {/* <Balance decimals={4} fontSize="18px" value={getBalanceNumber(bothTotalStaked.multipliedBy(pricePerShare))} />
              <Balance decimals={2} suffix=")" prefix="($" fontSize="12px" value={getBalanceNumber(bothTotalStakedDollar)} /> */}

              {hideBalances ? (
                <Text fontSize="18px">*****</Text>
              ) : (
                <>
                  <Text fontSize="18px">
                    {removeTrailingZero(getBalanceNumber(bothTotalStaked.multipliedBy(pricePerShare),getDecimals(stakingTokenAddress)))}
                  </Text>
                  <Text style={{ marginTop: '-5px' }} fontSize="12px">
                    (${parseFloat(getBalanceNumber(bothTotalStakedDollar,getDecimals(lpBaseTokenAddress)).toFixed(2)).toLocaleString()})
                  </Text>
                </>
              )}
            </div>
          )}

          <Text color="grey" fontSize="11px">
            Staked
          </Text>
        </TextEle>

        <TextEle style={{ gridArea: 'mid' }}>
          <div style={{ textAlign: 'center' }}>
            {!apy ? <Balance decimals={0} fontSize="18px" value={0} /> : getEnhancedDayApy()}
          </div>
          <Text color="grey" fontSize="11px">
            Daily
          </Text>
        </TextEle>

        <TextEle style={{ gridArea: 'right' }}>
          <div style={{ textAlign: 'center' }}>
            {!apy ? <Balance decimals={0} fontSize="18px" value={0} /> : getEnhancedCompoundedApy()}
          </div>
          <Text color="grey" fontSize="11px">
            Compound APY
          </Text>
        </TextEle>
      </>
    )
    if (hasMinWidth) {
      return <MidSection>{content}</MidSection>
    }
    return <MidSectionMobile>{content}</MidSectionMobile>
  }
  // console.log("right", totalStaked.toString())
  const right = () => {
    const content = (
      <TextEle>
        <div>
          {!apy ? (
            <Balance decimals={0} fontSize="18px" value={0} />
          ) : (
            <Balance
              fontSize="18px"
              isDisabled={isFinished}
              value={getBalanceNumber(totalStaked,getDecimals(lpBaseTokenAddress))}
              decimals={2}
              prefix="$"
            />
          )}
        </div>
        <Text color="grey" fontSize="11px">
          TVL
        </Text>
      </TextEle>
    )

    if (hasMinWidth) {
      return <RightSection>{content}</RightSection>
    }

    return <RightSectionMobile>{content}</RightSectionMobile>
  }
  const toggleExpand = () => {
    setExpanded(!expanded)
  }
  return (
    <Card2>
      {hasVaultShare && boostFinished && accountHasVsStakedBalance ? <Overlay /> : ''}
      {hasMinWidth ? (
        <CardTopRow onClick={toggleExpand}>
          {left()}
          {middle()}
          {right()}
        </CardTopRow>
      ) : (
        <CardTopRowGrid onClick={toggleExpand}>
          {left()}
          {middle()}
          {right()}
        </CardTopRowGrid>
      )}

      {expanded ? (
        <StyledCardActions style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          {!account && <UnlockButton />}
          {account && (
            <ActionRow>
              {stepOne()}
              {!hasMinWidth ? <HorizontalDivider /> : ''}
              {!hasMinWidth ? <LongDivider /> : ''}
              {!hasMinWidth ? <HorizontalDivider /> : ''}

              {hasVaultShare && (!boostFinished || accountHasVsStakedBalance) ? stepTwo() : ''}
            </ActionRow>
          )}

          <LongDivider />

          <FooterRow>
            {accountHasStakedBalance || accountHasVsStakedBalance ? (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <MidText color="secondary">Your {stakingTokenName}</MidText>
                <StyledDetails>
                  <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <div
                      style={{
                        margin: '8px',
                        marginTop: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        Capital
                        <span data-tip="Capital calculation resets upon full withdrawal">&nbsp;*</span>
                        <ReactTooltip />
                      </div>

                      {hideBalances ? (
                        <Text fontSize="14px">*****</Text>
                      ) : (
                        <>
                          {' '}
                          <Text fontSize="14px">{removeTrailingZero(getBalanceNumber(capital,getDecimals(stakingTokenAddress)))}</Text>
                          <Text style={{ marginTop: '-5px' }} fontSize="12px">
                            (${getBalanceNumber(capitalDollar,getDecimals(lpBaseTokenAddress)).toFixed(2)})
                          </Text>
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        margin: '8px',
                        marginTop: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}
                    >
                      Current
                    
                    {hideBalances ? (
                        <Text fontSize="14px">*****</Text>
                      ) : (
                        <>
                          {' '}
                          <Text fontSize="14px">
                            {removeTrailingZero(getBalanceNumber(bothTotalStaked.multipliedBy(pricePerShare),getDecimals(stakingTokenAddress)))}
                          </Text>
                          <Text style={{ marginTop: '-5px' }} fontSize="12px">
                            (${getBalanceNumber(bothTotalStakedDollar,getDecimals(lpBaseTokenAddress)).toFixed(2)})
                          </Text>
                        </>
                      )}
                    </div>

                    <div
                      style={{
                        margin: '8px',
                        marginTop: '0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        Change<span data-tip="% change is in terms of tokens, not price">&nbsp;*</span>
                        <ReactTooltip />
                      </div>
                      {getChange(capital, bothTotalStaked.multipliedBy(pricePerShare))}
                    </div>

                  
                  </div>
                </StyledDetails>
              </div>
            ) : (
              ''
            )}

            {hasMinWidth ? <VerticalDivider /> : ''}
            {/* <SparkBox>
                  <Sparklines data={[5, 10, 5, 20]} margin={5}>
                    <SparklinesLine color="blue" />
                  </Sparklines>
                </SparkBox> */}

            {/* {hasMinWidth ? (<VerticalDivider/>):("")} */}

            <FeeBox>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                }}
              >
                <span>Deposit Fee</span>
                <span>Withdrawal Fee</span>
                <span>Performance Fee</span>
              </div>
              <VerticalDivider />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                <span>{depositFee ? `${depositFee}% on capital` : 'none'}</span>
                <span>0.1% on capital</span>
                <span>3.5% on profits</span>
              </div>
            </FeeBox>
          </FooterRow>
        </StyledCardActions>
      ) : (
        ''
      )}
      {/* {expanded ? (<TokenLink href={projectLink} target="_blank">
            {TranslateString(412, 'View project site')}
          </TokenLink>):("")} */}

      <ReactTooltip />

      {/* <StyledDetails>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
            
            <div style={{marginRight: 'auto'}}>
              Your vault shares: <span data-tip={`Each espresso shot is worth ${new BigNumber(pricePerShare).toFixed(5)} ${tokenName}`}>ℹ️</span>
            </div>

            <Balance fontSize="14px" isDisabled={isFinished} value={getBalanceNumber(stakedBalance)} />

          </div>
        </StyledDetails> */}

      {/* <StyledDetails>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
            <Balance decimals={4} suffix=")" prefix="($" fontSize="12px" isDisabled={isFinished} value={(!stakeBalanceDollar || stakeBalanceDollar.isNaN() || stakeBalanceDollar.isZero()) ? 0: getBalanceNumber(stakeBalanceDollar)} />
          </div>
        </StyledDetails> */}
    </Card2>
  )
}
const FlexRowDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`
const FlexColDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`
const LeftSection = styled(FlexRowDiv)`
  flex: 2;
  height: auto;
  padding-left: 10px;
`
const MidSection = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas: 'claimbutton left mid right';
`
const MidSectionMobile = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  grid-template-areas:
    'left mid right'
    'claimbutton claimbutton claimbutton';
`
const RightSection = styled(FlexRowDiv)`
  height: auto;
  justify-content: flex-end;
  padding-right: 12px;
`
const RightSectionMobile = styled(FlexRowDiv)`
  flex: 1;
  height: auto;
  justify-content: center;
  // margin-right: 10px;
`

const PoolFinishedSash = styled.div`
  background-image: url('./images/pool-finished-sash.svg');
  background-position: top right;
  background-repeat: not-repeat;
  height: 135px;
  position: absolute;
  right: -24px;
  top: -24px;
  width: 135px;
`

const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin: 16px 0;
  width: 100%;
  box-sizing: border-box;
`

// const BalanceAndCompound = styled.div`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   flex-direction: row;
// `

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[4]}px;
`

const StyledDetails = styled.div`
  display: flex;
  font-size: 14px;
`

// const StyledDetailsLight = styled.div`
//   display: flex;
//   font-size: 10px;
//   opacity: 0.5;
// `
// const StyledDetailsLightStrike = styled.div`
//   display: flex;
//   font-size: 10px;
//   opacity: 0.5;
//   text-decoration: line-through
// `
const PositiveTag = styled(Tag)``
const MultiplierTag = styled(Tag)`
  margin-right: 3px;
`
const Overlay = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 7px solid #ed4b4b;
  border-radius: 9px;

  animation: blink 2s ease-in infinite;
  @keyframes blink {
    from,
    to {
      opacity: 1;
    }
    50% {
      opacity: 0.3;
    }
  }
  pointer-events: none;
`

const Card2 = styled(Card)`
  position: relative;
  border-radius: 15px;
  width: 98%;
  max-width: 100% !important;
  margin-bottom: 10px !important;
  margin-left: 0px !important;
  box-shadow: ${({ theme }) => (theme.isDark ? '2px 4px  #f5c42f17' : '2px 4px  #a0410d0f')};
`
const CardTopRow = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;

  // display: flex;
  // flex-direction: row;
  // justify-content: space-between;
  // align-items: center;
  width: 100%;
  // flex-wrap: wrap;

  display: grid;
  grid-template-columns: 3fr 4fr 1.5fr;

  pointer-events: auto;
`
const CardTopRowGrid = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  pointer-events: auto;
`
const CardTopRowCol = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
`

const TextEle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 3px;
  margin-right: 3px;
  // flex: 1;
`
const TextEleLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 2;
`
const HorizontalDivider = styled.div`
  width: 100%;
  height: 10px;
`
const HorizontalDividerFlex = styled.div`
  width: 100%;
  height: 10px;
  flex-grow: 1;
`
const VerticalDivider = styled.div`
  height: 100%;
  width: 10px;
`
const VerticalFillDivider = styled.div`
  height: 100%;
  flex: 1;
`
const ActionRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  width: 100%;
  flex-wrap: wrap;
`

const ActionBox = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
`
const ActionStep = styled.div`
  width: 30px;
  height: 30px;
  line-height: 25px;
  text-align: center;
  border: 2px solid;
  border-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  margin-right: 5px;
`
const ActionStepMini = styled.div`
  width: 20px;
  height: 20px;
  line-height: 16px;
  text-align: center;
  border: 2px solid;
  border-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  margin-right: 5px;
  font-size: 10px;
`
const ActionDesc = styled(Text)`
  font-size: 14px;
  line-height: 2;
`

const ButtonRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  width: 100%;
`
const TokenLink = styled.a`
  font-size: 14px;
  text-decoration: none;
  color: #12aab5;
`

const BalanceWStrike = styled(Balance)`
  font-size: 4em;
  line-height: 1em;
  position: relative;

  ::after {
    border-bottom: 0.125em solid red;
    content: '';
    left: 0;
    margin-top: calc(0.125em / 2 * -1);
    position: absolute;
    right: 0;
    top: 50%;
  }
`

const MyText = styled(Text)``
const Token = styled.span`
  font-weight: bold;
  color: ${(props) => props.theme.colors.primary};
  font-size: 12px;
`

const MyLink = styled.a`
  // text-decoration: underline;
  :hover {
    text-decoration: underline;
  }
`

const TextRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;

  width: 95%;
`
const LongDivider = styled.div`
  width: 100%;
  margin-bottom: 10px;
  margin-top: 10px;
  height: 1px;
  background-color: #54514878;
  // background-color: ${(props) => `${props.theme.colors.primary}77`};
`
const FooterRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  align-content: center;
`

const FeeBox = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  color: grey;
  // margin-right: 10px;
  // margin-left: auto;
`
const MidText = styled(Text)`
  width: 100%;
  text-align: center;
  color: grey;
  font-size: 14px;
`

const MobileRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  width: 100%;
`

const MyButton = styled(Button)`
  > div {
    color: black !important;
  }
  font-size: 12px;
  height: 24px;
  padding-left: 10px;
  padding-right: 10px;
  color: black !important;
  border-radius: 5px;
`

const SparkBox = styled(FlexColDiv)`
  flex: 1;
  height: 100%;
`

export default PoolCard2
