import { AbiItem } from 'web3-utils'
import usePrice from 'hooks/usePrice'
import usePriceMoon from 'hooks/usePriceMoon'
import usePriceMswap from 'hooks/usePriceMswap'
import usePriceSolar from 'hooks/usePriceSolar'
import usePriceEth from 'hooks/usePriceEth'
import usePriceBnb from 'hooks/usePriceBnb'
import useCakePrice from 'hooks/useCakePrice'

import React, { useState, useEffect } from 'react'
import { QuotePrices } from 'utils/formatBalance'
import useRefresh from 'hooks/useRefresh'
import usePriceFree from 'hooks/usePriceFree'
import BigNumber from 'bignumber.js'

const QuotePriceContext = React.createContext({})
const QuotePriceContextProvider = ({ children }) => {
  const [price, setPrice] = useState<QuotePrices>({
    movr: new BigNumber(0),
    kafe: new BigNumber(0), // cakePrice,
    eth: new BigNumber(0),
    bnb: new BigNumber(0),
    moon: new BigNumber(0),
    mswap: new BigNumber(0),
    solar:  new BigNumber(0),
    free:  new BigNumber(0),
  })
  const movrPrice = usePrice()
  const cakePrice = useCakePrice()
  const bnbPrice = usePriceBnb()
  const ethPrice = usePriceEth()

  const moonPrice = usePriceMoon()
  const mswapPrice = usePriceMswap()
  const solarPrice = usePriceSolar()
  const freePrice = usePriceFree()

  useEffect(() => {
    const getPrice = () => {
      setPrice({
        movr: movrPrice || new BigNumber(0),
        kafe: cakePrice || new BigNumber(0), // cakePrice,
        eth: ethPrice || new BigNumber(0),
        bnb: bnbPrice || new BigNumber(0),
        moon: moonPrice || new BigNumber(0),
        mswap: mswapPrice || new BigNumber(0),
        solar: solarPrice || new BigNumber(0),
        free: freePrice || new BigNumber(0),
      })
      // console.log("Refresh quotePrice",{
      //   kcs: kcsPrice.toString(),
      //   kafe: cakePrice.toString(),
      //   eth: ethPrice.toString(),
      //   bnb: bnbPrice.toString(),
      //   kus: kusPrice.toString(),
      //   kud: kudPrice.toString(),
      //   ksf: ksfPrice.toString(),
      // } )
    }
    getPrice()
  }, [movrPrice, ethPrice, bnbPrice, moonPrice, mswapPrice, cakePrice, solarPrice, freePrice])

  return <QuotePriceContext.Provider value={price}>{children}</QuotePriceContext.Provider>
}

export { QuotePriceContext, QuotePriceContextProvider }
