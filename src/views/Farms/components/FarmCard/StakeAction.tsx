import React from 'react'
import styled from 'styled-components'
import BigNumber from 'bignumber.js'
import { Button, Flex, Heading, IconButton, AddIcon, MinusIcon, useModal } from '@pancakeswap-libs/uikit'
import useI18n from 'hooks/useI18n'
import { useCustomStake } from 'hooks/useStake'
import { useCustomUnstake } from 'hooks/useUnstake'
import { getBalanceNumber, removeTrailingZero } from 'utils/formatBalance'
import DepositModal from '../DepositModal'
import WithdrawModal from '../WithdrawModal'

interface FarmCardActionsProps {
  stakedBalance?: BigNumber
  tokenBalance?: BigNumber
  tokenName?: string
  pid?: number
  depositFeeBP?: number
  masterChefAddress: string
  decimals?: number
}
const IconButtonWrapper = styled.div`
  display: flex;
  svg {
    width: 20px;
  }
`

const StakeAction: React.FC<FarmCardActionsProps> = ({
  masterChefAddress,
  stakedBalance,
  tokenBalance,
  tokenName,
  pid,
  depositFeeBP,
  decimals
}) => {
  const TranslateString = useI18n()
  // const { onStake } = useStake(pid)
  // const { onUnstake } = useUnstake(pid)

  const { onStake } = useCustomStake(masterChefAddress, pid)
  const { onUnstake } = useCustomUnstake(masterChefAddress, pid)

  const rawStakedBalance = getBalanceNumber(stakedBalance, decimals)
  const displayBalance = removeTrailingZero(rawStakedBalance)

  const [onPresentDeposit] = useModal(
    <DepositModal max={tokenBalance} onConfirm={onStake} tokenName={tokenName} depositFeeBP={depositFeeBP} decimals={decimals}/>,
  )
  const [onPresentWithdraw] = useModal(
    <WithdrawModal max={stakedBalance} onConfirm={onUnstake} tokenName={tokenName} decimals={decimals}/>,
  )

  const renderStakingButtons = () => {
    return rawStakedBalance === 0 ? (
      <Button onClick={onPresentDeposit}>{TranslateString(999, 'Stake')}</Button>
    ) : (
      <IconButtonWrapper>
        <IconButton variant="tertiary" onClick={onPresentWithdraw} mr="6px">
          <MinusIcon color="primary" />
        </IconButton>
        <IconButton variant="tertiary" onClick={onPresentDeposit}>
          <AddIcon color="primary" />
        </IconButton>
      </IconButtonWrapper>
    )
  }

  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Heading color={rawStakedBalance === 0 ? 'textDisabled' : 'text'}>{displayBalance}</Heading>
      {renderStakingButtons()}
    </Flex>
  )
}

export default StakeAction
