import { getFuncData } from 'utils/callHelpers'
import MultiCallAbi from 'config/abi/Multicall.json'
import { AbiItem } from 'web3-utils'
import { getWeb3 } from 'utils/web3'
import BigNumber from 'bignumber.js'
import { getExpDecimals } from 'utils/formatBalance'
import erc20 from 'config/abi/erc20.json'
import masterchefABI from 'config/abi/masterchef.json'
import multicall from 'utils/multicall'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import farmsConfig from 'config/constants/farms'
import { QuoteToken } from '../../config/constants/types'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

const fetchFarms = async () => {
  const nowBlock = await web3.eth.getBlockNumber()
  const calls = []
  farmsConfig.forEach((farmConfig) => {
    const lpAddress = farmConfig.lpAddresses[CHAIN_ID]
    const isGuest = farmConfig.farmType !== 'native'
    const masterChefAddress = isGuest ? farmConfig.customMasterChef : getMasterChefAddress()

    calls.push([farmConfig.tokenAddresses[CHAIN_ID], getFuncData('balanceOf(address)', [lpAddress])])
    calls.push([farmConfig.quoteTokenAdresses[CHAIN_ID], getFuncData('balanceOf(address)', [lpAddress])])
    calls.push([
      farmConfig.isTokenOnly ? farmConfig.tokenAddresses[CHAIN_ID] : lpAddress,
      getFuncData('balanceOf(address)', [masterChefAddress]),
    ])
    calls.push([lpAddress, getFuncData('totalSupply()', [])])
    calls.push([farmConfig.tokenAddresses[CHAIN_ID], getFuncData('decimals()', [])])
    calls.push([farmConfig.quoteTokenAdresses[CHAIN_ID], getFuncData('decimals()', [])])

    calls.push([masterChefAddress, getFuncData('poolInfo(uint256)', [isGuest ? farmConfig.customPid : farmConfig.pid])])
    calls.push([masterChefAddress, getFuncData('totalAllocPoint()', [])])
    calls.push([masterChefAddress, getFuncData('kafePerBlock()', [])])
    calls.push([masterChefAddress, getFuncData('getMultiplier(uint256,uint256)', [nowBlock, nowBlock + 1])])
    calls.push([masterChefAddress, getFuncData('depositedKafe()', [])])
  })
  let callResults = await multi.methods.aggregate(calls).call()
  callResults = callResults[1]
  // console.log(callResults)

  let index = 0

  const data = farmsConfig.map((farmConfig) => {
    const lpAddress = farmConfig.lpAddresses[CHAIN_ID]
    const isGuest = farmConfig.farmType !== 'native'
    const masterChefAddress = isGuest ? farmConfig.customMasterChef : getMasterChefAddress()

    const tokenBalanceLP = web3.eth.abi.decodeParameter('uint256', callResults[index]).toString()
    const quoteTokenBlanceLP = web3.eth.abi.decodeParameter('uint256', callResults[index + 1]).toString()
    const lpTokenBalanceMC = web3.eth.abi.decodeParameter('uint256', callResults[index + 2]).toString()
    const lpTotalSupply = web3.eth.abi.decodeParameter('uint256', callResults[index + 3]).toString()
    const tokenDecimals = web3.eth.abi.decodeParameter('uint256', callResults[index + 4]).toString()
    const quoteTokenDecimals = web3.eth.abi.decodeParameter('uint256', callResults[index + 5]).toString()

    const info = web3.eth.abi.decodeParameters(
      ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
      callResults[index + 6],
    )
    const totalAllocPoint = web3.eth.abi.decodeParameter('uint256', callResults[index + 7]).toString()
    const eggPerBlock = web3.eth.abi.decodeParameter('uint256', callResults[index + 8]).toString()
    const rewardsMultiplier = web3.eth.abi.decodeParameter('uint256', callResults[index + 9]).toString()
    const depositedKafe = web3.eth.abi.decodeParameter('uint256', callResults[index + 10]).toString()
    index += 11

    let tokenAmount
    let lpTotalInQuoteToken
    let tokenPriceVsQuote
    let depositedLp
    if (farmConfig.farmType === 'vaultShare') {
      tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals))
      depositedLp = tokenAmount
      tokenPriceVsQuote = new BigNumber(0)
      lpTotalInQuoteToken = new BigNumber(0)
    } else if (farmConfig.isTokenOnly) {
      if (farmConfig.pid === 0 && !isGuest) {
        tokenAmount = new BigNumber(depositedKafe.toString()).div(new BigNumber(10).pow(tokenDecimals))
      } else {
        tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals))
      }
      depositedLp = tokenAmount
      // console.log("lpTokenBalanceMC",lpTokenBalanceMC.toString(), )
      // console.log("tokenAmount",tokenAmount.toString())
      if (farmConfig.tokenSymbol === QuoteToken.BUSD && farmConfig.quoteTokenSymbol === QuoteToken.BUSD) {
        tokenPriceVsQuote = new BigNumber(1)
      } else {
        tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
        // console.log("quoteTokenBlanceLP",quoteTokenBlanceLP.toString())
        // console.log("tokenBalanceLP",tokenBalanceLP.toString())
        // console.log("tokenPriceVsQuote",tokenPriceVsQuote.toString())
      }

      // tokenAmount 3.86
      // quoteTokenBlanceLP 5671226749169500554665
      // tokenBalanceLP 2255885720792
      // tokenPriceVsQuote 2513968990.93737652359561804102038932695218783203870240245385643793008526210244926432481703

      // 1e6 wei usdc = 2565597762000000 wei movr
    // 3e6
    
    // 0.00992

    // quoteTokenBlanceLP 5734544420763389793068 MOVR
    // tokenBalanceLP 2230768956997 USDC


      lpTotalInQuoteToken = tokenAmount.times(new BigNumber(10).pow(tokenDecimals)).times(tokenPriceVsQuote).dividedBy(new BigNumber(10).pow(quoteTokenDecimals))
      // .times(new BigNumber(10).pow(parseInt(quoteTokenDecimals) - parseInt(tokenDecimals)))
      // console.log("lpTotalInQuoteToken",lpTotalInQuoteToken.toString())
    } else {
      // Ratio in % a LP tokens that are in staking, vs the total number in circulation
      const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
      depositedLp = lpTokenBalanceMC
      // console.log("lpTokenRatio",lpTokenRatio.toString())
      // Total value in staking in quote token value
      lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
        .div(new BigNumber(10).pow(quoteTokenDecimals))
        .times(new BigNumber(2))
        .times(lpTokenRatio)
      // console.log("quoteTokenBlanceLP",quoteTokenBlanceLP.toString())
      // console.log("lpTokenRatio",lpTokenRatio.toString())
      // console.log("lpTotalInQuoteToken",lpTotalInQuoteToken.toString())

      // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
      tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)
      const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
        .div(new BigNumber(10).pow(quoteTokenDecimals))
        .times(lpTokenRatio)
      // console.log("tokenAmount",tokenAmount.toString())

      if (tokenAmount.comparedTo(0) > 0) {
        tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount)
        // console.log("tokenPriceVsQuote1",tokenPriceVsQuote.toString())
      } else {
        tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
        // console.log("tokenPriceVsQuote2",tokenPriceVsQuote.toString())
      }
    }

    // console.log(rewardsMultiplier)
    const allocPoint = new BigNumber(info[1])
    const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint))



    console.log("farmconfig", {
      ...farmConfig,
      tokenAmount: tokenAmount.toJSON(),
      // quoteTokenAmount: quoteTokenAmount,
      lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
      tokenPriceVsQuote: tokenPriceVsQuote.toJSON(),
      poolWeight: poolWeight.toNumber(),
      multiplier: `${allocPoint.div(100).toString()}X`,
      rewardsMultiplier: parseInt(rewardsMultiplier),
      depositFeeBP: info[4],
      eggPerBlock: new BigNumber(eggPerBlock).toNumber(),
      depositedLp: new BigNumber(depositedLp).toJSON(),
      // depositedKafe: new BigNumber(depositedKafe.toString()).toJSON(),
    })
    return {
      ...farmConfig,
      tokenAmount: tokenAmount.toJSON(),
      // quoteTokenAmount: quoteTokenAmount,
      lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
      tokenPriceVsQuote: tokenPriceVsQuote.toJSON(),
      poolWeight: poolWeight.toNumber(),
      multiplier: `${allocPoint.div(100).toString()}X`,
      rewardsMultiplier: parseInt(rewardsMultiplier),
      depositFeeBP: info[4],
      eggPerBlock: new BigNumber(eggPerBlock).toNumber(),
      depositedLp: new BigNumber(depositedLp).toJSON(),
      // depositedKafe: new BigNumber(depositedKafe.toString()).toJSON(),
    }
  })

  return data
}

export default fetchFarms
