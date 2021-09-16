import React, { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet'
import styled from 'styled-components'
import moment from 'moment'
import { Heading, LinkExternal } from '@pancakeswap-libs/uikit'
import Page from 'components/layout/Page'

const Wrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
`
const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}
const displayTime = (millis) => {
  const m = moment().local()
  return m.format('h:mm:ss a  MMMM Do YYYY')
}

const Audit: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Moonkafe Finance</title>
      </Helmet>

      {/* <Hero /> */}
      <Page>
        <Heading as="h1" size="xxl" mb="16px">
          Audit coming soon
          <LinkExternal href="https://twitter.com/ObeliskOrg/status/1420809376412192768" />
        </Heading>
      </Page>
    </>
  )
}

export default Audit
