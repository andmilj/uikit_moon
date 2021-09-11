import BigNumber from 'bignumber.js'
import React, { useState } from 'react'
import { withStyles, makeStyles } from '@material-ui/core/styles'
import useTheme from 'hooks/useTheme'
import styled from 'styled-components'
import Tooltip from '@material-ui/core/Tooltip'
import { Text } from '@pancakeswap-libs/uikit'

interface InfoProps {
  total: number
  yieldFarming: BigNumber
  vault: BigNumber
  wallet: BigNumber
}
const HtmlTooltip = withStyles((theme) => ({
  tooltip: {
    backgroundColor: 'transparent',
    // color: 'rgba(0, 0, 0, 0.87)',
    // maxWidth: 220,
    // fontSize: theme.typography.pxToRem(12),
    // border: '1px solid #dadde9',
  },
}))(Tooltip)
const FlexRowDiv = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`
const FlexColDiv = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`
const TooltipContainer = styled(FlexColDiv)`
  border: 2px solid ${(props) => props.theme.colors.primary};
  background-color: ${(props) => (props.theme.isDark ? 'black' : '#FAF9FA')};
  border-radius: 5px;
  padding: 10px;
`
// ${(props) => props.theme.card.background}
const TooltipRow = styled(FlexRowDiv)`
  flex: 1;
  margin-top: 3px;
  margin-bottom: 3px;
`
const TooltipStat = styled(FlexColDiv)``

const InfoBox: React.FC<InfoProps> = ({ total, yieldFarming, vault, wallet }) => {
  const { isDark } = useTheme()
  return (
    <HtmlTooltip
      enterTouchDelay={200}
      placement="right-start"
      title={
        <TooltipContainer>
          <TooltipRow>
            <TooltipStat>
              <Text color={isDark ? 'white' : 'black'} style={{ lineHeight: '1' }} fontSize="20px">
                ${total.toLocaleString()}
              </Text>
              <Text color="grey" fontSize="10px">
                Assets
              </Text>
            </TooltipStat>
          </TooltipRow>

          <TooltipRow>
            <TooltipStat>
              <Text color={isDark ? 'white' : 'black'} style={{ lineHeight: '1' }} fontSize="20px">
                ${parseFloat(yieldFarming.toFixed(2)).toLocaleString()}
              </Text>
              <Text color="grey" fontSize="10px">
                Yield Farming
              </Text>
            </TooltipStat>
          </TooltipRow>

          <TooltipRow>
            <TooltipStat>
              <Text color={isDark ? 'white' : 'black'} style={{ lineHeight: '1' }} fontSize="20px">
                ${parseFloat(vault.toFixed(2)).toLocaleString()}
              </Text>
              <Text color="grey" fontSize="10px">
                Optimized Yield
              </Text>
            </TooltipStat>
          </TooltipRow>

          <TooltipRow>
            <TooltipStat>
              <Text color={isDark ? 'white' : 'black'} style={{ lineHeight: '1' }} fontSize="20px">
                ${parseInt(wallet.toFixed(2)).toLocaleString()}
              </Text>
              <Text color="grey" fontSize="10px">
                Wallet
              </Text>
            </TooltipStat>
          </TooltipRow>
        </TooltipContainer>
      }
    >
      <img
        style={{ cursor: 'pointer' }}
        src={`images/${isDark ? 'portfolio_dark' : 'portfolio'}.svg`}
        width={24}
        height={24}
        alt="pie"
      />
    </HtmlTooltip>
  )
}
export default InfoBox
