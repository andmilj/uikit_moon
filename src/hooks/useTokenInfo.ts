import { useEffect, useState } from 'react'
import { AbiItem } from 'web3-utils'
import contracts from 'config/constants/contracts'
import { PoolCategory } from 'config/constants/types'
import BigNumber from 'bignumber.js'
import { getMulticallAddress } from 'utils/addressHelpers'
import { bucketArray, decodeAddress, decodeInt, getFuncData } from 'utils/callHelpers'
import vaultABI from 'config/abi/vault.json'
import MultiCallAbi from 'config/abi/Multicall.json'
import poolsConfig from 'config/constants/pools'
import { useFarms, usePools, useRefreshWallet } from 'state/hooks'
import tokens, { TokenInfo } from 'config/constants/tokens'
import { useWallet } from 'use-wallet'
import { getWeb3 } from 'utils/web3'
import { getExpDecimals } from 'utils/formatBalance'
import { uniqBy } from 'lodash'
import useRefresh from './useRefresh'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const MOVR_CONFIG = {
  symbol: 'MOVR',
  address: contracts.WMOVR,
  routerForQuote: contracts.solarRouter,
}

const useTokenInfo = () => {
  const { account } = useWallet()
  const [tokenInfo, setTokenInfo] = useState([])
  const { fastRefresh } = useRefresh()
  const refreshWallet = useRefreshWallet()

  useEffect(() => {
    const get = async () => {
      const web3 = getWeb3()

      if (!account) {
        return
      }
      const _tokens = uniqBy(tokens, (e) => {
        return e.address.toLowerCase()
      })

      const nonLpTokens = _tokens.filter((t) => !t.isLP)

      const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())
      const nonWMOVR = nonLpTokens.filter((t) => t.address.toLowerCase() !== contracts.WMOVR.toLowerCase())

      const calls = nonWMOVR.map((t) => {
        const base= t.base || contracts.WMOVR
        const dec = getExpDecimals(base);

        return [
          t.routerForQuote,
          getFuncData('getAmountsOut(uint256,address[])', [
            dec.toString(),
            t.routeVia ? [base, t.routeVia, t.address] : [base, t.address],
          ])
        ]

      })
      
      const calls2 = nonWMOVR.map((t) => [t.address, getFuncData('balanceOf(address)', [account])])
      const decimalCalls = nonWMOVR.map((t) => [t.address, getFuncData('decimals()', [])])
      const wmovrCall = [MOVR_CONFIG.address, getFuncData('balanceOf(address)', [account])]
      const movrBal = await web3.eth.getBalance(account)

      let callResults = await multi.methods.aggregate([...calls, ...calls2, ...decimalCalls, wmovrCall]).call()
      callResults = callResults[1]
      const prices = callResults
        .slice(0, nonWMOVR.length)
        .map((c) => web3.eth.abi.decodeParameter('uint256[]', c))
        .map((a) => a[a.length - 1])
      const tokenBalances = callResults.slice(nonWMOVR.length, nonWMOVR.length * 2).map(decodeInt)
      const decimals = callResults.slice(nonWMOVR.length * 2, nonWMOVR.length * 3).map(decodeInt)
      const wmovrBal = decodeInt(callResults[nonWMOVR.length * 3]).toString()

      // console.log(prices)
      // console.log(tokenBalances)

      const final: TokenInfo[] = nonWMOVR.map((t, i) => {


        const base= t.base || contracts.WMOVR
        const b = getExpDecimals(base);
        return {
          ...t,
          priceVsQuoteToken: b.dividedBy(new BigNumber(prices[i])),
          balance: new BigNumber(tokenBalances[i]),
          decimals: new BigNumber(decimals[i]).toNumber(),
        }
      })
    
      final.push({
        symbol: 'WMOVR',
        address: contracts.WMOVR,
        routerForQuote: contracts.solarRouter,
        priceVsQuoteToken: new BigNumber(1),
        balance: new BigNumber(wmovrBal),
        decimals: 18,
      })

      final.push({
        symbol: 'MOVR',
        address: contracts.WMOVR,
        routerForQuote: contracts.solarRouter,
        priceVsQuoteToken: new BigNumber(1),
        balance: new BigNumber(movrBal),
        decimals: 18,
      })

      // now do the LPs
      const lpTokens = _tokens.filter((t) => t.isLP)
      if (lpTokens.length > 0) {
        // for each token, check amt base in lp, totalsupply, cost of 1 unit.
        const amtBaseCall = lpTokens.map((l) => [l.base, getFuncData('balanceOf(address)', [l.address])])
        const supplyCall = lpTokens.map((l) => [l.address, getFuncData('totalSupply()', [])])
        const balCall = lpTokens.map((l) => [l.address, getFuncData('balanceOf(address)', [account])])
        const token0Call = lpTokens.map((l) => [l.address, getFuncData('token0()', [])])
        const token1Call = lpTokens.map((l) => [l.address, getFuncData('token1()', [])])
        let callResults2 = await multi.methods
          .aggregate([...amtBaseCall, ...supplyCall, ...balCall, ...token0Call, ...token1Call])
          .call()
        callResults2 = callResults2[1]
        let [amtBase, supply, bal] = bucketArray(callResults2.slice(0, lpTokens.length * 3), lpTokens.length)
        let [token0s, token1s] = bucketArray(callResults2.slice(lpTokens.length * 3), lpTokens.length)

        amtBase = amtBase.map(decodeInt)
        supply = supply.map(decodeInt)
        bal = bal.map(decodeInt)
        token0s = token0s.map(decodeAddress)
        token1s = token1s.map(decodeAddress)

        lpTokens.forEach((l, i) => {
          final.push({
            ...l,
            priceVsQuoteToken: new BigNumber(amtBase[i]).times(2).dividedBy(supply[i]),
            balance: new BigNumber(bal[i]),
            token0: token0s[i].toLowerCase().replace(contracts.WMOVR, 'ETH'),
            token1: token1s[i].toLowerCase().replace(contracts.WMOVR, 'ETH'),
            decimals: 18,
          })
        })
      }
      // setTokenInfo(final)
      setTokenInfo(final.filter((b) => b.balance.isGreaterThan(0)))
      // setTokenInfo(final.filter((b) => b.symbol === 'KAFE' || b.balance.isGreaterThan(0)))
    }

    get()
  }, [fastRefresh, account, refreshWallet])

  return tokenInfo
}

export default useTokenInfo
