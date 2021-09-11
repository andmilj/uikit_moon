import BigNumber from 'bignumber.js'
import styled from 'styled-components'
import { makeStyles } from '@material-ui/core/styles'
import Slider from '@material-ui/core/Slider'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Modal, Text } from '@pancakeswap-libs/uikit'
import ModalActions from 'components/ModalActions'
import TokenInput from '../../../components/TokenInput'
import useI18n from '../../../hooks/useI18n'
import { getBalanceNumberPrecisionFloatFixed, getFullDisplayBalance } from '../../../utils/formatBalance'

interface DepositModalProps {
  max: BigNumber
  onConfirm: (amount: any) => void
  onDismiss?: () => void
  tokenName?: string
  pricePerShare?: BigNumber
  startAtMax?: boolean
}
const useStyles = makeStyles({
  depositedBalanceSliderRoot: {
    color: '#ffcb2f',
  },
  depositedBalanceSliderMarkLabel: {
    color: '#ffcb2f',
    fontFamily: "'Kanit', sans-serif",
  },
  depositedBalanceSliderRail: {
    opacity: '1',
    color: '#353848',
  },
  depositedBalanceSliderMark: {
    height: '0',
  },
  thumb: {
    color: '#666666',
  },
})

const DepositModalSlider: React.FC<DepositModalProps> = ({
  max,
  onConfirm,
  onDismiss,
  tokenName = '',
  pricePerShare = null,
  startAtMax = true,
}) => {
  const [val, setVal] = useState(startAtMax ? max : new BigNumber(0))
  const [pendingTx, setPendingTx] = useState(false)
  const TranslateString = useI18n()

  // const fullBalance = useMemo(() => {
  //   return getFullDisplayBalance(max)
  // }, [max])

  // const handleChange = useCallback(
  //   (e: React.FormEvent<HTMLInputElement>) => {
  //     setVal(e.currentTarget.value)
  //   },
  //   [setVal],
  // )

  // const handleSelectMax = useCallback(() => {
  //   setVal(fullBalance)
  // }, [fullBalance, setVal])

  const onChange = (e, value) => {
    // prevent rouding errors
    if (value === 100) {
      setVal(max)
    } else if (value === 0) {
      setVal(new BigNumber(0))
    } else {
      setVal(max.multipliedBy(value).dividedBy(100))
    }
  }

  const commonStyle = useStyles()
  const commonClasses = {
    root: commonStyle.depositedBalanceSliderRoot,
    markLabel: commonStyle.depositedBalanceSliderMarkLabel,
    rail: commonStyle.depositedBalanceSliderRail,
    mark: commonStyle.depositedBalanceSliderMark,
    thumb: commonStyle.thumb,
  }
  return (
    <Modal title={`${TranslateString(316, 'Deposit')} ${tokenName} Tokens`} onDismiss={onDismiss}>
      {/* <TokenInput
        value={val}
        onSelectMax={handleSelectMax}
        onChange={handleChange}
        max={fullBalance}
        symbol={tokenName}
      /> */}

      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <MiniText color="grey">Deposit</MiniText>
        <MiniText color="success">&nbsp;{getBalanceNumberPrecisionFloatFixed(val, 18, 5)}&nbsp;</MiniText>
        <MiniText color="grey">{tokenName}</MiniText>
      </div>

      <Slider
        style={{ width: '95%' }}
        defaultValue={startAtMax ? 100 : 0}
        valueLabelDisplay="auto"
        step={1}
        marks
        // marks={marks}
        classes={commonClasses}
        onChange={onChange}
      />

      {pricePerShare ? (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <MiniText color="grey">Receive</MiniText>
          <MiniText color="success">
            &nbsp;{getBalanceNumberPrecisionFloatFixed(val.dividedBy(pricePerShare), 18, 5)}&nbsp;
          </MiniText>
          <MiniText color="grey">Espresso ({tokenName})</MiniText>
        </div>
      ) : (
        ''
      )}

      <ModalActions>
        <Button fullWidth variant="secondary" onClick={onDismiss}>
          {TranslateString(462, 'Cancel')}
        </Button>
        <Button
          fullWidth
          disabled={pendingTx}
          onClick={async () => {
            try {
              setPendingTx(true)
              await onConfirm(new BigNumber(val.toFixed(0)).dividedBy(1e18))
              setPendingTx(false)
            } catch (e) {
              console.error(e)
            }
            onDismiss()
          }}
        >
          {pendingTx ? TranslateString(488, 'Pending Confirmation') : TranslateString(464, 'Confirm')}
        </Button>
      </ModalActions>
    </Modal>
  )
}

export default DepositModalSlider

const MiniText = styled(Text)`
  font-size: 12px;
`
