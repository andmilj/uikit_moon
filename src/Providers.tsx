import React, { useEffect } from 'react'
import { ModalProvider } from '@pancakeswap-libs/uikit'
// import bsc, { UseWalletProvider } from 'use-wallet'
// import * as bsc from 'use-wallet'
import * as bsc from 'use-wallet'
import { Provider } from 'react-redux'
import getRpcUrl from 'utils/getRpcUrl'
import { LanguageContextProvider } from 'contexts/Localisation/languageContext'
import { ThemeContextProvider } from 'contexts/ThemeContext'
import { BlockContextProvider } from 'contexts/BlockContext'
import { PriceContextProvider } from 'contexts/PriceContext'
import { CakePriceContextProvider } from 'contexts/CakePriceContext'
import { RefreshContextProvider } from 'contexts/RefreshContext'
import store from 'state'
import { PriceContextBnbProvider } from 'contexts/PriceContextBnb'
import { PriceContextEthProvider } from 'contexts/PriceContextEth'
import { PriceContextMoonProvider } from 'contexts/PriceContextMoon'
import { RewardPriceContextProvider } from 'contexts/RewardPriceContext'
import { PriceContextMswapProvider } from 'contexts/PriceContextMswap'
import { PriceContextSolarProvider } from 'contexts/PriceContextSolar'
import { QuotePriceContextProvider } from 'contexts/QuotePriceContext'
import { PriceContextFreeProvider } from 'contexts/PriceContextFree'
import { PriceContextBeansProvider } from 'contexts/PriceContextBeans'

const Providers: React.FC = ({ children }) => {
  const rpcUrl = getRpcUrl()
  const chainId = parseInt(process.env.REACT_APP_CHAIN_ID)


  return (
    <Provider store={store}>
      <ThemeContextProvider>
        <LanguageContextProvider>
          <bsc.UseWalletProvider
            chainId={chainId}
            connectors={
              {
                // walletconnect: { rpcUrl },
                // bsc,
              }
            }
          >
            <BlockContextProvider>
              <PriceContextProvider>
                <PriceContextBnbProvider>
                  <PriceContextEthProvider>
                    <CakePriceContextProvider>
                      <RewardPriceContextProvider>
                        <PriceContextMoonProvider>
                          <PriceContextMswapProvider>
                            <PriceContextSolarProvider>
                              <PriceContextFreeProvider>
                              <PriceContextBeansProvider>
                                <QuotePriceContextProvider>
                                  <RefreshContextProvider>
                                    <ModalProvider>{children}</ModalProvider>
                                  </RefreshContextProvider>
                                </QuotePriceContextProvider>
                              </PriceContextBeansProvider>
                              </PriceContextFreeProvider>
                            </PriceContextSolarProvider>
                          </PriceContextMswapProvider>
                        </PriceContextMoonProvider>
                      </RewardPriceContextProvider>
                    </CakePriceContextProvider>
                  </PriceContextEthProvider>
                </PriceContextBnbProvider>
              </PriceContextProvider>
            </BlockContextProvider>
          </bsc.UseWalletProvider>
        </LanguageContextProvider>
      </ThemeContextProvider>
    </Provider>
  )
}

export default Providers
