import usePrice from 'hooks/usePrice'
import React, { useState, useEffect, useRef } from 'react'
import useWeb3 from 'hooks/useWeb3'
import { useRouter } from 'hooks/useContract'
import contracts from 'config/constants/contracts'
import BigNumber from 'bignumber.js'

// context to track price of KCS.

const CakePriceContext = React.createContext(new BigNumber(0))

const CakePriceContextProvider = ({ children }) => {
  const kcsPrice = usePrice()
  const router = useRouter()
  const previousPrice = useRef('')
  const [price, setPrice] = useState(new BigNumber(0))

  useEffect(() => {
    const getPrice = async () => {
      try {
        if (router && kcsPrice && contracts.cake[process.env.REACT_APP_CHAIN_ID]) {
          const amts = await router.methods
            .getAmountsOut('1000000000000', [
              contracts.cake[process.env.REACT_APP_CHAIN_ID],
              contracts.wbnb[process.env.REACT_APP_CHAIN_ID],
            ])
            .call()

          const tokenPrice = kcsPrice.multipliedBy(new BigNumber(amts[1])).dividedBy(1e12)
          const val = tokenPrice.toFixed(3)
          if (val !== previousPrice.current) {
            previousPrice.current = val
            setPrice(new BigNumber(val))
          }

          // console.log("cakeprice",tokenPrice, tokenPrice.toNumber())
        }
      } catch (e) {
        console.error(e)
      }
      // const resp = await fetch(url)
      // const j = await resp.json();
      // if (j && j[id] && j[id].usd){
      //   if (j[id].usd !== previousPrice.current){
      //     previousPrice.current = j[id].usd;
      //     setPrice(j[id].usd);
      //     console.log("price",j[id].usd)
      //   }
      // }
    }

    getPrice()
    const interval = setInterval(async () => {
      getPrice()
    }, 30000)

    return () => clearInterval(interval)
  }, [kcsPrice, router])

  return <CakePriceContext.Provider value={price}>{children}</CakePriceContext.Provider>
}

export { CakePriceContext, CakePriceContextProvider }
