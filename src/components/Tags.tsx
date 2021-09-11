import React from 'react'
import { Tag, VerifiedIcon, CommunityIcon, BinanceIcon } from '@pancakeswap-libs/uikit'

const NoFeeTag = () => (
  <Tag variant="success" outline>
    No Fees
  </Tag>
)

const RiskTag = ({ risk }) => (
  <Tag variant={risk >= 3 ? 'failure' : 'success'} outline startIcon={<VerifiedIcon />}>
    Risk {risk}
  </Tag>
)

const PoolTypeTag = ({ type }) => (
  <Tag variant="success" outline>
    {type.toUpperCase()}
  </Tag>
)

const CoreTag = () => (
  <Tag variant="secondary" outline startIcon={<VerifiedIcon />}>
    Core
  </Tag>
)

const CommunityTag = () => (
  <Tag variant="textSubtle" outline startIcon={<CommunityIcon />}>
    Community
  </Tag>
)

const BinanceTag = () => (
  <Tag variant="binance" outline startIcon={<BinanceIcon />}>
    Binance
  </Tag>
)

export { CoreTag, CommunityTag, BinanceTag, RiskTag, NoFeeTag, PoolTypeTag }
