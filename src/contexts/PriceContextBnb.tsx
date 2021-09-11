import BigNumber from 'bignumber.js'
import React, { useState, useEffect, useRef } from 'react'

// context to track price of KCS.

const PriceContextBnb = React.createContext(new BigNumber(0))

const PriceContextBnbProvider = ({ children }) => {
  const previousPrice = useRef(0)
  const [price, setPrice] = useState(new BigNumber(0))

  useEffect(() => {
    // const id = "kucoin-shares";
    const id = 'binancecoin'
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`
    const getPrice = async () => {
      const resp = await fetch(url)
      const j = await resp.json()
      if (j && j[id] && j[id].usd) {
        if (j[id].usd !== previousPrice.current) {
          previousPrice.current = j[id].usd
          setPrice(new BigNumber(j[id].usd))
          console.log('bnb price', j[id].usd)
        }
      }
    }
    getPrice()
    const interval = setInterval(async () => {
      getPrice()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return <PriceContextBnb.Provider value={price}>{children}</PriceContextBnb.Provider>
}

export { PriceContextBnb, PriceContextBnbProvider }
