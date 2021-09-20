import useWebVersion from 'hooks/useWebVersion'
import React, { useContext } from 'react'
import { useWallet } from 'use-wallet'
import contracts from 'config/constants/contracts'
import { allLanguages } from 'config/localisation/languageCodes'
import { LanguageContext } from 'contexts/Localisation/languageContext'
import useTheme from 'hooks/useTheme'
import useCakePrice from 'hooks/useCakePrice'
import { Menu as UikitMenu } from '@pancakeswap-libs/uikit'
import config from './config'

const Menu = (props) => {
  const { account, connect, reset } = useWallet()
  const { selectedLanguage, setSelectedLanguage } = useContext(LanguageContext)
  const { isDark, toggleTheme } = useTheme()
  const cakePriceUsd = useCakePrice()
  const latestVer = useWebVersion();
  // console.log("latestVer", latestVer)

  return (
    <UikitMenu
      account={account}
      login={connect}
      logout={reset}
      isDark={isDark}
      toggleTheme={toggleTheme}
      currentLang={selectedLanguage && selectedLanguage.code}
      langs={allLanguages}
      setLang={setSelectedLanguage}
      cakePriceUsd={cakePriceUsd.toNumber()}
      // cakePriceUsd={0}
      needRefresh ={latestVer !== contracts.VERSION}
      links={config}
      // priceLink=""
      priceLink={`https://charts.freeriver.exchange/?token=${contracts.cake[process.env.REACT_APP_CHAIN_ID]}`}
      {...props}
    />
  )
}

export default Menu
