import React from 'react'
import useI18n from 'hooks/useI18n'
import styled from 'styled-components'
import { Text, Flex, Link, LinkExternal } from '@pancakeswap-libs/uikit'
import getLiquidityUrlPathParts from 'utils/getLiquidityUrlPathParts'
import { Address } from 'config/constants/types'
import BigNumber from 'bignumber.js'
import { getBalanceNumberPrecisionFloatFixed } from 'utils/formatBalance'

export interface ExpandableSectionProps {
  isTokenOnly?: boolean
  bscScanAddress?: string
  removed?: boolean
  totalValueFormated?: string
  lpLabel?: string
  quoteTokenAdresses?: Address
  quoteTokenSymbol?: string
  tokenAddresses: Address
  myValue: BigNumber
}

const Wrapper = styled.div`
  margin-top: 24px;
`

const StyledLinkExternal = styled(LinkExternal)`
  text-decoration: none;
  font-weight: normal;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;

  svg {
    padding-left: 4px;
    height: 18px;
    width: auto;
    fill: ${({ theme }) => theme.colors.primary};
  }
`

const DetailsSection: React.FC<ExpandableSectionProps> = ({
  isTokenOnly,
  bscScanAddress,
  removed,
  totalValueFormated,
  lpLabel,
  quoteTokenAdresses,
  quoteTokenSymbol,
  tokenAddresses,
  myValue,
}) => {
  const TranslateString = useI18n()
  let liquidityUrlPathParts = getLiquidityUrlPathParts({ quoteTokenAdresses, quoteTokenSymbol, tokenAddresses })
  if (lpLabel.includes('KUSWAPLP')) {
    liquidityUrlPathParts = liquidityUrlPathParts.replace('ETH', 'KCS')
  }

  // console.log(lpLabel)

  const getLiqSite = () => {
    if (lpLabel.includes('SOLARLP')) {
      return 'solarbeam.io/exchange'
    }
    if (lpLabel.includes('MOONLP')) {
      return 'swap.moonfarm.in/#'
    }
    if (lpLabel.includes('FREELP')) {
      return 'freeriver.exchange/#'
    }
    return ''
  }

  return (
    <Wrapper>
      <Flex justifyContent="space-between">
        <Text>{TranslateString(316, 'Stake')}:</Text>
        <StyledLinkExternal
          href={
            isTokenOnly
              ? `https://${getLiqSite()}/swap/${tokenAddresses[process.env.REACT_APP_CHAIN_ID]}`
              : `https://${getLiqSite()}/add/${liquidityUrlPathParts}`
          }
        >
          {lpLabel}
        </StyledLinkExternal>
      </Flex>
      {!removed && (
        <Flex justifyContent="space-between">
          <Text>{TranslateString(23, 'Total Liquidity')}:</Text>
          <Text>{totalValueFormated}</Text>
        </Flex>
      )}
      {myValue.isGreaterThan(0) ? (
        <Flex justifyContent="space-between">
          <Text>{TranslateString(23, 'Your Stake')}:</Text>
          <Text>${getBalanceNumberPrecisionFloatFixed(myValue, 18, 2)}</Text>
        </Flex>
      ) : (
        ''
      )}
      <Flex justifyContent="flex-start">
        <Link external href={bscScanAddress} bold={false}>
          {TranslateString(356, 'View on KccExplorer')}
        </Link>
      </Flex>
    </Wrapper>
  )
}

export default DetailsSection
