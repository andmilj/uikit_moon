import BigNumber from 'bignumber.js'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Image, Modal, Tag, Text } from '@pancakeswap-libs/uikit'
import ModalActions from 'components/ModalActions'
import styled from 'styled-components'
import { useMigration, usePools } from 'state/hooks'
import { ChefInfo, ChefPoolInfo } from 'config/constants/chefs'
import { PoolConfig } from 'config/constants/types'
// import { useFarms } from 'state/hooks'
import useQuotePrice from 'hooks/useQuotePrice'
import { useWallet } from 'use-wallet'
import { Pool } from 'state/types'
import ReactTooltip from 'react-tooltip'
import { useMediaQuery } from '@material-ui/core'
import { getCakeProfitsPerYearVs, getVsApy } from 'utils/callHelpers'
import { getBalanceNumber, getBalanceNumberPrecisionFloatFixed, toDollar } from 'utils/formatBalance'
import Balance from 'components/Balance'
import { calculateAPY } from 'utils/compoundApyHelpers'
import contracts from 'config/constants/contracts'

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

const Container = styled(FlexColDiv)`
  width: 100%;
`

const ChoiceRow = styled(FlexRowDiv)``
const CardTopRow = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
  min-width: 700px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  // flex-wrap: wrap;
  border-radius: 5px;

  :hover {
    background-color: ${(props) => (props.theme.isDark ? '#444444' : '#eeeeee')};
  }
  cursor: pointer;
  margin-bottom: 5px;
`
const CardTopRowGrid = styled.div`
  padding-top: 5px;
  padding-bottom: 5px;
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
  :hover {
    background-color: ${(props) => (props.theme.isDark ? '#444444' : '#eeeeee')};
  }
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 5px;
`

const HorizDiv = styled.div`
  height: 5px;
`
const VerticalDivider = styled.div`
  height: 100%;
  width: 10px;
`
const TextEleLeft = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  flex: 2;
`
const MyLink = styled.a`
  // text-decoration: underline;
  :hover {
    text-decoration: underline;
  }
`
const MultiplierTag = styled(Tag)`
  margin-right: 3px;
`
const TextRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;

  width: 95%;
`
const TextEle = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-left: 3px;
  margin-right: 3px;
  // flex: 1;
`

const MidSection = styled.div`
  flex: 3;
  height: 100%;
  display: grid;
  grid-template-columns: 1fr 40px 1fr;
  justify-items: center;
  align-items: center;
  // grid-template-rows: auto;
  // grid-template-areas:
  //   "left mid";
`
const MidSectionMobile = styled.div`
  height: 100%;
  display: grid;
  justify-items: center;
  align-items: center;

  grid-template-columns: 1fr 40px 1fr;
  // grid-template-rows: auto;
  // grid-template-areas:
  //   "left mid"
`
const LeftSection = styled(FlexRowDiv)`
  height: auto;
  flex: 3;
`

const RightSection = styled(FlexRowDiv)`
  flex: 1;
  height: auto;
  justify-content: flex-end;
  margin-right: 10px;
`
const RightSectionMobile = styled(FlexRowDiv)`
  flex: 1;
  height: auto;
  justify-content: center;
`

interface ModalProps {
  onConfirm: (val: number) => void
  onDismiss?: () => void
}

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

// this modal displays 3 steps. unstake, approve new vault, deposit vault.
const SelectVaultModal: React.FC<ModalProps> = ({ onConfirm, onDismiss }) => {
  const { account } = useWallet()
  const hasMinWidth = !useMediaQuery('(max-width:700px)')
  const pools = usePools(account)
  const { lpToken } = useMigration()
  const vaults = pools.filter((p) => p.stakingTokenAddress.toLowerCase() === lpToken.toLowerCase())

  // const farms = useFarms(account)

  const quotePrice = useQuotePrice()

  // const farmIdsNeeded = vaults.filter(p => p.vaultShareFarmPid).map(p => p.vaultShareFarmPid);
  // const vFarms = farmIdsNeeded.reduce((acc,neededId) => {
  //   // console.log(farms,neededId)
  //   return {
  //    ...acc,
  //    [neededId]: farms.find(f => `${f.pid}` === `${neededId}`)
  //   }

  // },{})

  const getDollarValue = (quoteTokenAmt, lpBaseTokenAddress) => {
    return toDollar(quoteTokenAmt, lpBaseTokenAddress.toLowerCase(), quotePrice)
  }

  const dollarProfitsPerYearVs = getCakeProfitsPerYearVs(
    vaults.filter((p) => p && !p.hidden && p.vaultShareFarmPid >= 0),
  )
  Object.keys(dollarProfitsPerYearVs).forEach((_sousId) => {
    const _pool = vaults.find((p) => p.sousId === parseInt(_sousId))
    dollarProfitsPerYearVs[_sousId] = getDollarValue(
      dollarProfitsPerYearVs[_sousId],
      _pool.vaultShareRewardToken || contracts.KAFE,
    )
  })

  const vaultsWithApy = vaults.map((v) => {
    if (v.totalStakedAsQuoteToken) {
      // console.log(v)
      const totalStaked = getDollarValue(new BigNumber(v.totalStakedAsQuoteToken), v.lpBaseTokenAddress.toLowerCase())
      const vsApy =
        v.vaultShareFarmPid >= 0 ? getVsApy(v, dollarProfitsPerYearVs[v.sousId], getDollarValue) : new BigNumber(0)
      // console.log(totalStaked.toString(), vsApy.toString())
      return {
        ...v,
        vsApy,
        totalStaked,
        apy: new BigNumber(v.apy),
      }
    }
    return v
  })
  const toDisplayable = (n) => {
    if (n.isGreaterThan(500000)) {
      return n.toFixed(0)
    }
    return n.toFixed(2)
  }
  // const getEnhancedDayApy = (v) => {
  //   return (v.vaultShareFarmPid) ? (
  //     <>
  //       <Text fontSize="18px" color="success">{new BigNumber(v.apy).plus(v.vsApy).dividedBy(365).toFixed(2)}%</Text>
  //       <Text fontSize="14px" style={{textDecoration: "line-through"}}>{new BigNumber(v.apy).dividedBy(365).toFixed(2)}%</Text>
  //     </>
  //   ):(<Text fontSize="18px">{new BigNumber(v.apy).dividedBy(365).toFixed(2)}%</Text>)

  // }
  const getEnhancedCompoundedApy = (v) => {
    let a = new BigNumber(v.apy)
    const oldCompounded = calculateAPY({ compoundPeriodInSecs: 86400, apr: a })
    if (v.vaultShareFarmPid >= 0) {
      a = a.plus(v.vsApy)
    }
    const compoundedYear = calculateAPY({ compoundPeriodInSecs: 86400, apr: a })

    return v.vaultShareFarmPid >= 0 ? (
      <>
        <Text fontSize="18px" color="success">
          {toDisplayable(compoundedYear)}%
        </Text>
        <Text fontSize="14px" style={{ textDecoration: 'line-through' }}>
          {toDisplayable(oldCompounded)}%
        </Text>
      </>
    ) : (
      <Text color="success" fontSize="18px">
        {toDisplayable(oldCompounded)}%
      </Text>
    )
  }
  const left = (v) => {
    return (
      <LeftSection>
        <div style={{ width: 100, height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Image
            src={`./images/tokens/${v.image}.png`}
            width={v.isLP ? 100 : 64}
            height={64}
            alt={v.stakingTokenName}
          />
        </div>

        <VerticalDivider />
        <TextEleLeft style={{ flex: 2 }}>
          <span>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <Text color="primary">{v.stakingTokenName}</Text>
              {v.disclaimer ? (
                <span style={{ cursor: 'pointer' }} data-multiline="true" data-type="error" data-tip={v.disclaimer}>
                  ⚠️
                </span>
              ) : (
                ''
              )}
            </div>
            <ReactTooltip />

            {/* {disclaimerPositive ? (<span data-multiline="true" data-type="success" data-tip={disclaimerPositive}>✔️</span>):("")} */}
          </span>
          <Text style={{ marginTop: '-5px' }} color="grey" fontSize="15px">
            Uses <MyLink href={v.projectLink}>{v.projectName}</MyLink>
          </Text>
          {/* <MultiplierTag variant="secondary">{pool.projectName.toUpperCase()}</MultiplierTag> */}
          <TextRow>
            {v.depositFee ? <MultiplierTag variant="failure">{v.depositFee}% Deposit Fee</MultiplierTag> : ''}
            {v.disclaimerPositive ? (
              <MultiplierTag data-multiline="true" data-type="success" data-tip={v.positiveTooltip} variant="success">
                {v.disclaimerPositive}
              </MultiplierTag>
            ) : (
              ''
            )}
          </TextRow>
        </TextEleLeft>
      </LeftSection>
    )
  }
  const RightArrow = () => {
    return (
      <div style={{ width: '32px', height: '20px' }}>
        <Image src="images/greenarrow.png" width={32} height={20} />
      </div>
    )
  }
  const middle = (v) => {
    const content = (
      <>
        <TextEle>
          <Text fontSize="18px">{v.apy ? v.apy.toFixed(0) : 0}%</Text>
          <Text color="grey" fontSize="11px">
            APR
          </Text>
        </TextEle>

        <RightArrow />

        <TextEle>
          {getEnhancedCompoundedApy(v)}
          <Text color="grey" fontSize="11px">
            Compound APY
          </Text>
        </TextEle>
      </>
    )

    if (hasMinWidth) {
      return <MidSection>{content}</MidSection>
    }
    return <MidSectionMobile>{content}</MidSectionMobile>
  }

  const right = (v) => {
    const content = (
      <TextEle>
        <div>
          {!v.apy ? (
            <Balance decimals={0} fontSize="20px" value={0} />
          ) : (
            <Balance fontSize="20px" value={getBalanceNumber(v.totalStaked)} decimals={0} prefix="$" />
          )}
        </div>
        <Text color="grey" fontSize="12px">
          TVL
        </Text>
      </TextEle>
    )
    if (hasMinWidth) {
      return <RightSection>{content}</RightSection>
    }

    return <RightSectionMobile>{content}</RightSectionMobile>
  }
  console.log(vaultsWithApy.map((v) => v.sousId))
  return (
    <Modal title="Choose your Espresso Fix!" onDismiss={onDismiss}>
      <Container>
        {vaultsWithApy.map((v, i) => {
          if (hasMinWidth) {
            return (
              <CardTopRow
                key={v.sousId}
                onClick={() => {
                  onConfirm(v.sousId)
                  onDismiss()
                }}
              >
                {left(v)}
                {middle(v)}
                {right(v)}
              </CardTopRow>
            )
          }
          return (
            <CardTopRowGrid
              key={v.sousId}
              onClick={() => {
                onConfirm(v.sousId)
                onDismiss()
              }}
            >
              {left(v)}
              {middle(v)}
              {right(v)}
            </CardTopRowGrid>
          )
        })}
      </Container>

      {/* <ModalActions>
        <Button variant="secondary" onClick={onDismiss}>
          {TranslateString(462, 'Cancel')}
        </Button>
        <Button
          disabled={pendingTx}
          onClick={async () => {
            setPendingTx(true)
            await onConfirm(val)
            setPendingTx(false)
            onDismiss()
          }}
        >
          {pendingTx ? TranslateString(488, 'Pending Confirmation') : TranslateString(464, 'Confirm')}
        </Button>
      </ModalActions> */}
    </Modal>
  )
}

export default SelectVaultModal
