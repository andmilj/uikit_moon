import React from 'react'
import styled from 'styled-components'
import { Tag, Flex, Heading, Image, CommunityIcon } from '@pancakeswap-libs/uikit'
import { CommunityTag, CoreTag, NoFeeTag, RiskTag, PoolTypeTag } from 'components/Tags'
import FarmCountdown from './FarmCountdown'

export interface ExpandableSectionProps {
  lpLabel?: string
  multiplier?: string
  risk?: number
  depositFee?: number
  farmImage?: string
  tokenSymbol?: string
  isToken?: boolean
  farmType?: string
  earnSymbol?: string
  farmStart?: number
  farmEnd?: number
}

const Wrapper = styled(Flex)`
  svg {
    margin-right: 0.25rem;
  }
`

const MultiplierTag = styled(Tag)`
  margin-left: 4px;
`

const CardHeading: React.FC<ExpandableSectionProps> = ({
  lpLabel,
  multiplier,
  risk,
  farmImage,
  tokenSymbol,
  depositFee,
  isToken,
  farmType,
  earnSymbol,
  farmStart,
  farmEnd,
}) => {
  let status
  if (Date.now() / 1000 < farmStart) {
    status = 'coming_soon'
  } else {
    status = 'finish'
  }

  return (
    <Wrapper justifyContent="space-between" alignItems="center" mb="12px">
      <Image src={`./images/farms/${farmImage}.png`} alt={tokenSymbol} width={isToken ? 64 : 100} height={64} />
      <Flex flexDirection="column" alignItems="flex-end">
        <Heading mb="4px">{lpLabel}</Heading>
        <Flex justifyContent="center">
          {depositFee === 0 ? <NoFeeTag /> : null}
          {earnSymbol ? (
            <Tag variant="secondary" outline startIcon={<CommunityIcon />}>
              Earn {earnSymbol}
            </Tag>
          ) : (
            ''
          )}
          {/* <PoolTypeTag type={farmType} /> */}

          {earnSymbol ? '' : <MultiplierTag variant="secondary">{multiplier}</MultiplierTag>}
        </Flex>

        {farmEnd || farmStart ? (
          <FarmCountdown
            status={status}
            secondsUntilStart={farmStart - Date.now() / 1000}
            secondsUntilEnd={farmEnd - Date.now() / 1000}
          />
        ) : (
          ''
        )}
      </Flex>
    </Wrapper>
  )
}

export default CardHeading
