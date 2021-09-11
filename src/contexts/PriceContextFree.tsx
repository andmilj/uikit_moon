import usePrice from 'hooks/usePrice'
import React, { useState, useEffect, useRef } from 'react'
import contracts from 'config/constants/contracts'
import BigNumber from 'bignumber.js'
import { getReadOnlyCustomRouter } from 'hooks/useContract'

// context to track price of KCS.

const PriceContextFree = React.createContext(new BigNumber(0))

const PriceContextFreeProvider = ({ children }) => {
  const kcsPrice = usePrice()
  const previousPrice = useRef('')
  const [price, setPrice] = useState(new BigNumber(0))

  useEffect(() => {
    const getPrice = async () => {
      if (kcsPrice && contracts.FREE) {
        const router = getReadOnlyCustomRouter(contracts.freeRouter)
        const amts = await router.methods
          .getAmountsOut('1000000000000', [contracts.FREE, contracts.wbnb[process.env.REACT_APP_CHAIN_ID]])
          .call()

        const tokenPrice = kcsPrice.multipliedBy(new BigNumber(amts[1])).dividedBy(1e12)
        const val = tokenPrice.toFixed(6)
        if (val !== previousPrice.current) {
          previousPrice.current = val
          console.log('freePrice', val)
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

  return <PriceContextFree.Provider value={price}>{children}</PriceContextFree.Provider>
}

export { PriceContextFree, PriceContextFreeProvider }
