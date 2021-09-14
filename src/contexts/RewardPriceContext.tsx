import { AbiItem } from 'web3-utils'
import usePrice from 'hooks/usePrice'
import MultiCallAbi from 'config/abi/Multicall.json'
import { max, min, uniqBy } from 'lodash'
import { getWeb3 } from 'utils/web3'
import React, { useState, useEffect, useRef } from 'react'
import { getMulticallAddress } from 'utils/addressHelpers'
import { useRouter } from 'hooks/useContract'
import contracts from 'config/constants/contracts'
import BigNumber from 'bignumber.js'
import chefConfigs from 'config/constants/chefs'
import farmConfigs from 'config/constants/farms'

const RewardPriceContext = React.createContext({})
const RewardPriceContextProvider = ({ children }) => {
  const previousPrice = useRef({})
  const [price, setPrice] = useState({})
  const kcsPrice = usePrice()

  useEffect(() => {
    const getPrice = async () => {
      const web3 = getWeb3()

      if (!chefConfigs && !farmConfigs) {
        return
      }
      const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

      let data = [
        ...chefConfigs.map((cc) => ({
          rewardToken: cc.rewardToken.toLowerCase(),
          quoteRouters: cc.quoteRouters,
        })),
      ]

      data.push({
        rewardToken: contracts.KAFE,
        quoteRouters: [contracts.solarRouter],
      })

      farmConfigs
        .filter((c) => c.farmType === 'guest')
        .forEach((c) => {
          const temp = data.find((d) => d.rewardToken.toLowerCase() === c.customRewardToken.toLowerCase())
          if (!temp) {
            data.push({
              rewardToken: c.customRewardToken.toLowerCase(),
              quoteRouters: [c.routerForQuote],
            })
          }
        })

      data = uniqBy(data, (d) => d.rewardToken)

      const calls = []
      data.forEach((d) => {
        if (d.rewardToken.toLowerCase() !== contracts.WMOVR.toLowerCase()) {
          d.quoteRouters.forEach((r) => {
            calls.push([
              r,
              `${web3.utils.soliditySha3('getAmountsOut(uint256,address[])').slice(0, 10)}${web3.eth.abi
                .encodeParameters(['uint256', 'address[]'], ['1000000000000000000', [contracts.WMOVR, d.rewardToken]])
                .slice(2)}`,
            ])
          })
        }
      })
      let results = await multi.methods.aggregate(calls).call()
      results = results[1]

      const finalPrices = { ...price }
      let changed = false
      let resultIndex = 0
      data.forEach((cc) => {
        if (cc.rewardToken.toLowerCase() !== contracts.WMOVR.toLowerCase()) {
          const b = []
          cc.quoteRouters.forEach((r) => {
            b.push(web3.eth.abi.decodeParameters(['uint[]'], results[resultIndex])[0][1])
            resultIndex += 1
          })
          // console.log(cc.rewardToken, "quotes", b)

          const temp = b.map((n) => new BigNumber(n).dividedBy(1e18).toNumber())
          const minQ = min(temp)
          const maxQ = max(temp)

          if ((maxQ - minQ) / minQ > 0.1) {
            console.error('weird quote retrieved', cc)
          }

          const sum = b.reduce((acc, item) => {
            return acc.plus(item)
          }, new BigNumber(0))
          const avg = new BigNumber(1e18).dividedBy(sum.dividedBy(cc.quoteRouters.length))
          const val = avg.multipliedBy(kcsPrice).toFixed(10)

          if (
            !previousPrice.current[cc.rewardToken.toLowerCase()] ||
            previousPrice.current[cc.rewardToken.toLowerCase()] !== val
          ) {
            changed = true
            // console.log("price of ", cc.rewardToken, val)
            previousPrice.current[cc.rewardToken.toLowerCase()] = val
            finalPrices[cc.rewardToken.toLowerCase()] = new BigNumber(val)
          }
        } else {
          const val = kcsPrice.toFixed(10)
          if (
            !previousPrice.current[cc.rewardToken.toLowerCase()] ||
            previousPrice.current[cc.rewardToken.toLowerCase()] !== val
          ) {
            changed = true
            previousPrice.current[cc.rewardToken.toLowerCase()] = val
            finalPrices[cc.rewardToken.toLowerCase()] = new BigNumber(val)
          }
        }
      })

      // Object.keys(finalPrices).forEach((k) => {
      //   console.log(k, finalPrices[k].toString())
      // })
      // console.log(finalPrices)
      if (changed) {
        setPrice(finalPrices)
      }
    }

    getPrice()
    const interval = setInterval(async () => {
      getPrice()
    }, 30000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kcsPrice])

  return <RewardPriceContext.Provider value={price}>{children}</RewardPriceContext.Provider>
}

export { RewardPriceContext, RewardPriceContextProvider }
