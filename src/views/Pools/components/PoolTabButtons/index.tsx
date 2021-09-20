import React from 'react'
import styled from 'styled-components'
import { useRouteMatch, Link, useLocation } from 'react-router-dom'
import { ButtonMenu, ButtonMenuItem } from '@pancakeswap-libs/uikit'

const PoolTabButtons = () => {
  const { url } = useRouteMatch()
  const location = useLocation()

  const locationToIndex = (_location) => {
    switch (_location.pathname.replace(url, '')) {
      case '/moonkafe':
        return 1
      case '/solarbeam':
        return 2
        case '/moonfarm':
          return 3
        case '/freeriver':
            return 4
  
      default:
        return 0
    }
  }

  return (
    <Wrapper>
      <ButtonMenu2 activeIndex={locationToIndex(location)} size="sm" variant="primary">
        <ButtonMenuItem as={Link} to={`${url}`}>
          My Stake
        </ButtonMenuItem>
        <ButtonMenuItem as={Link} to={`${url}/moonkafe`}>
          Moonkafe
        </ButtonMenuItem>
        <ButtonMenuItem as={Link} to={`${url}/solarbeam`}>
          Solarbeam
        </ButtonMenuItem>
        <ButtonMenuItem as={Link} to={`${url}/moonfarm`}>
          Moonfarm
        </ButtonMenuItem>
        <ButtonMenuItem as={Link} to={`${url}/freeriver`}>
          Freeriver
        </ButtonMenuItem>
      </ButtonMenu2>
    </Wrapper>
  )
}

export default PoolTabButtons

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;
`
const ButtonMenu2 = styled(ButtonMenu)`
  justify-content: center !important;
`
