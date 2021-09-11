import usePrice from 'hooks/usePrice'
import React, { useState, useEffect, useRef } from 'react'
import contracts from 'config/constants/contracts'
import BigNumber from 'bignumber.js'
import { getReadOnlyCustomRouter } from 'hooks/useContract'

// context to track price of KCS.

const PriceContextMoon = React.createContext(new BigNumber(0))

const PriceContextMoonProvider = ({ children }) => {
  const kcsPrice = usePrice()
  const previousPrice = useRef('')
  const [price, setPrice] = useState(new BigNumber(0))

  // const rawAbi = routerAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  // const abi = rawAbi as unknown as AbiItem
  // return useContract(abi, address)

  useEffect(() => {
    const getPrice = async () => {
      if (kcsPrice && contracts.MOON) {
        const router = getReadOnlyCustomRouter(contracts.moonRouter)
        const amts = await router.methods
          .getAmountsOut('1000000000000', [contracts.MOON, contracts.wbnb[process.env.REACT_APP_CHAIN_ID]])
          .call()

        const tokenPrice = kcsPrice.multipliedBy(new BigNumber(amts[1])).dividedBy(1e12)
        const val = tokenPrice.toFixed(6)
        if (val !== previousPrice.current) {
          previousPrice.current = val
          console.log('moonPrice', val)
          setPrice(new BigNumber(val))
        }
      }
    
    }

    getPrice()
    const interval = setInterval(async () => {
      getPrice()
    }, 30000)

    return () => clearInterval(interval)
  }, [kcsPrice])

  return <PriceContextMoon.Provider value={price}>{children}</PriceContextMoon.Provider>
}

export { PriceContextMoon, PriceContextMoonProvider }
