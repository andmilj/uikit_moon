import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { PoolCategory } from 'config/constants/types'
import Slider from '@material-ui/core/Slider'
import Dropdown from 'react-dropdown'
import BigNumber from 'bignumber.js'
import contracts from 'config/constants/contracts'
import { getMasterChefAddress } from 'utils/addressHelpers'
import { Pool } from 'state/types'
import ReactTooltip from 'react-tooltip'
import { useWallet } from 'use-wallet'
import { makeStyles } from '@material-ui/core'
import { fetchChefsPublicDataAsync } from 'state/chefs'
import { fetchFarmsPublicDataAsync, fetchFarmUserDataAsync } from 'state/farms'
import { useChefs, useMigration, usePools } from 'state/hooks'
import { fetchPoolsPublicDataAsync, fetchPoolsUserDataAsync } from 'state/pools'
import { fetchGuestsPublicDataAsync, fetchGuestsUserDataAsync } from 'state/guest'
import { triggerRefreshWallet } from 'state/config'
import { useDispatch } from 'react-redux'
import { Button, Modal, Text } from '@pancakeswap-libs/uikit'
import CircularProgress from '@material-ui/core/CircularProgress'
import styled from 'styled-components'
import { getAbiFromChef } from 'config/constants/chefs'
import useTokenBalance from 'hooks/useTokenBalance'
import { useCustomMasterchef, useERC20 } from 'hooks/useContract'
import { usePrivateSousApprove, useSousApprove } from 'hooks/useApprove'
import { usePrivateSousStake, useSousStake } from 'hooks/useStake'
import { useChefUnstake, usePrivateSousEntry } from 'hooks/useUnstake'
import { useCreateVault } from 'hooks/useCreateVault'
import { removeTrailingZero } from 'utils/formatBalance'
import { useAllowance } from 'hooks/useAllowance'
import { useStakeBalance } from '../hooks/useStakeBalance'

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
  padding-left: 8px;
  padding-right: 8px;
`
const Section = styled(FlexRowDiv)`
  width: 100%;
`
const SectionCol = styled(FlexColDiv)`
  align-items: flex-start;

`
const Dropdown2 = styled(Dropdown)`
  // border: 1px solid grey;
  // cursor: pointer;

  // :hover {
  //   border: 1px solid white;
  // }

  background: transparent;
  font-size: 10px;
  .Dropdown-control {
    background: transparent;

    border: 1px solid ${({ theme }) => (theme.isDark ? '#ffcb2f77' : '#555')};
    color: ${({ theme }) => (theme.isDark ? '#ffcb2f' : '#333333')};
  }
`
const DropDownContainer = styled(FlexRowDiv)`
  align-self: flex-start;
  flex-wrap: wrap;
  // justify-content: flex-start;
  // align-items: flex-start;
  // padding-left: 10px;
`

const HorizDiv = styled.div`
  height: 15px;
`
const ActionStep = styled.div`
  width: 30px;
  min-width: 30px;
  height: 30px;
  line-height: 25px;
  text-align: center;
  border: 2px solid;
  border-color: ${(props) => props.theme.colors.primary};
  border-radius: 50%;
  margin-right: 5px;
  color: ${(props) => props.theme.colors.contrast};
`
const Expand = styled.div`
  flex: 1;
  min-width: 50px;
`
const ActionButton = styled(Button)`
  > div {
    color: black !important;
  }
  font-size: 14px;
  height: 32px;
  padding-left: 10px;
  padding-right: 10px;
  color: black !important;
  border-radius: 5px;
`
interface ModalProps {
  onConfirm: (amount: string) => void
  onDismiss?: () => void
}

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const useSliderStyles = makeStyles({
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

const useStyles = makeStyles({
  root: {
    color: '#ffcb2f',
    width: '20px !important',
    height: '20px !important',
    minWidth: '20px !important',
    minHeight: '20px !important',
  },
})
// this modal displays 3 steps. unstake, approve new vault, deposit vault.
const MigrateFromFarmModal: React.FC<ModalProps> = ({ onConfirm, onDismiss }) => {
  const chefs = useChefs()
  const temp = useMigration()
  const { oldChefId, oldChefPoolId, selectedSous, migrateMode } = temp

  // console.log("migration", temp)
  const oldChef = chefs.find((c) => c.chefId === oldChefId)
  const oldPool = oldChef ? oldChef.pools[oldChefPoolId] : null
  const dispatch = useDispatch()
  const { account } = useWallet()
  const classes = useStyles()
  const [unstakePending, setUnstakePending] = useState(false)
  const [allowPending, setAllowPending] = useState(false)
  const [stakePending, setStakePending] = useState(false)
  const [createPending, setCreatePending] = useState(false)
  const [vaultOpenPending, setVaultOpenPending] = useState(false)
  const vaults = usePools(account)
  const [success, setSuccess] = useState(false)
  // const [stage, setStage] = useState(1);
  // const oldMasterChef = useCustomMasterchef(oldChef.masterchefAddress, oldChef.abi);

  const v = selectedSous >= 0 ? vaults.find((p) => p.sousId === selectedSous) : null
  // console.log("selected", oldChef, oldPool, v)
  const validSelection = !!v

  const tokenName = validSelection ? v.image : ''
  const isPrivateVault = validSelection && v.poolCategory === PoolCategory.PRIVATEVAULT

  const { onCreateVault } = useCreateVault(v || vaults[0])

  const commonStyle = useSliderStyles()
  const commonClasses = {
    root: commonStyle.depositedBalanceSliderRoot,
    markLabel: commonStyle.depositedBalanceSliderMarkLabel,
    rail: commonStyle.depositedBalanceSliderRail,
    mark: commonStyle.depositedBalanceSliderMark,
    thumb: commonStyle.thumb,
  }

  const callCreate = async () => {
    try {
      setCreatePending(true)
      await onCreateVault()
    } catch (e) {
      console.error(e)
    }
    setCreatePending(false)
  }

  const defaultChefAddress = getMasterChefAddress()

  // step 1
  const amtInOldChef = useStakeBalance(
    oldChef ? oldChef.masterchefAddress : defaultChefAddress,
    oldPool ? oldPool.pid : 0,
  )

  
  const { onUnstake } = useChefUnstake(
    oldChef ? oldChef.masterchefAddress : defaultChefAddress,
    getAbiFromChef(oldChef),
    oldPool ? oldPool.pid : 0,
    oldChef ? oldChef.stakingMode : false,
  )

  // step 1b - private vault
  const userData = v?.userData
  const hasVault =
    userData &&
    userData.privatePoolInfo &&
    userData.privatePoolInfo.address &&
    userData.privatePoolInfo.address.length > 0
  const privatePoolInfo = userData?.privatePoolInfo
  const [privateVaultIndex, setPrivateVaultIndex] = useState(0)

  const effSousId = v ? v.sousId : vaults[0].sousId

  // step 2
  const stakingTokenContract = useERC20(v ? v.stakingTokenAddress : contracts.WMOVR) // any valid placeholder
  const balanceStakingToken = useTokenBalance(v ? v.stakingTokenAddress : contracts.WMOVR)
  const { onApprove } = useSousApprove(stakingTokenContract, effSousId)

  // step 3
  const { onStake } = useSousStake(effSousId)
  // step 3 - private vault

  const options =
    privatePoolInfo && privatePoolInfo.address
      ? privatePoolInfo.address.map((va, i) => ({ value: `${i}`, label: va }))
      : []
  const vaultType = hasVault ? privatePoolInfo?.vaultType[privateVaultIndex] : '-'
  const isExitMode = hasVault ? privatePoolInfo?.exitMode[privateVaultIndex] : false
  const effPrivateVaultAddress = hasVault ? privatePoolInfo.address[privateVaultIndex] : 0
  const { onApprove: onPrivateVaultApprove } = usePrivateSousApprove(
    stakingTokenContract,
    effSousId,
    effPrivateVaultAddress,
  )
  const { onStake: onPrivateVaultStake } = usePrivateSousStake(effSousId, effPrivateVaultAddress)
  const { onEntry: onPrivateVaultOpen } = usePrivateSousEntry(effSousId, effPrivateVaultAddress)

  const allowance = useAllowance(
    stakingTokenContract,
    v?.contractAddress[CHAIN_ID] || effPrivateVaultAddress || account,
  )

  const [val, setVal] = useState(balanceStakingToken)
  const [finalVal, setFinalVal] = useState(new BigNumber(0))
  useEffect(() => {
    setVal(balanceStakingToken)
  }, [balanceStakingToken])

  const onSliderChange = (e, value) => {
    // prevent rouding errors
    if (value === 100) {
      setVal(balanceStakingToken)
    } else if (value === 0) {
      setVal(new BigNumber(0))
    } else {
      setVal(balanceStakingToken.multipliedBy(value).dividedBy(100))
    }
  }

  const SuccessIcon = () => {
    return <Text>✔️</Text>
  }
  const Spinner = () => {
    return (
      <CircularProgress
        classes={{
          root: classes.root,
        }}
      />
    )
  }
  const doUnstake = async () => {
    setUnstakePending(true)
    await onUnstake(amtInOldChef.dividedBy(1e18).toString())
    setUnstakePending(false)

    setVal(balanceStakingToken.plus(amtInOldChef))
  }
  const unstakeAction = () => {
    if (unstakePending) {
      return Spinner()
    }
    if (amtInOldChef.isZero()) {
      return <SuccessIcon />
    }
    return (
      <ActionButton onClick={doUnstake} disabled={amtInOldChef.isZero()}>
        Unstake
      </ActionButton>
    )
  }
  const doApprove = async () => {
    setAllowPending(true)
    await onApprove()
    setAllowPending(false)
  }

  const handlePrivateApprove = useCallback(async () => {
    setAllowPending(true)
    try {
      const txHash = await onPrivateVaultApprove()
    } catch (e) {
      console.error(e)
    }
    setAllowPending(false)
  }, [onPrivateVaultApprove, setAllowPending])

  const allowAction = () => {
    if (allowPending) {
      return Spinner()
    }
    if (allowance.isGreaterThan(balanceStakingToken.plus(amtInOldChef))) {
      return <SuccessIcon />
    }
    return (
      <ActionButton
        onClick={doApprove}
        disabled={!amtInOldChef.isZero() || allowance.isGreaterThan(balanceStakingToken.plus(amtInOldChef))}
      >
        Approve
      </ActionButton>
    )
  }

  const createVaultAction = () => {
    if (createPending) {
      return Spinner()
    }
    if (hasVault) {
      return <SuccessIcon />
    }
    return (
      <ActionButton onClick={callCreate} disabled={createPending}>
        Create
      </ActionButton>
    )
  }

  const approvePrivateVaultAction = () => {
    if (allowPending) {
      return Spinner()
    }
    if (allowance.isGreaterThan(balanceStakingToken.plus(amtInOldChef))) {
      return <SuccessIcon />
    }
    return (
      <ActionButton onClick={handlePrivateApprove} disabled={allowPending}>
        Approve
      </ActionButton>
    )
  }
  const stakePrivateVaultAction = () => {
    if (stakePending) {
      return Spinner()
    }
    if (success) {
      return <SuccessIcon />
    }

    return (
      <ActionButton
        onClick={doPrivateStake}
        disabled={
          !amtInOldChef.isZero() ||
          isExitMode ||
          balanceStakingToken.isZero() ||
          allowance.isLessThan(balanceStakingToken.plus(amtInOldChef))
        }
      >
        Stake
      </ActionButton>
    )
  }
  const reopenPrivateVaultAction = () => {
    // if (stakePending){
    //   return Spinner();
    // }
    if (!isExitMode) {
      return ''
    }
    if (vaultOpenPending) {
      return Spinner()
    }
    return (
      <ActionButton onClick={doVaultOpen} disabled={vaultOpenPending}>
        Re-open vault
      </ActionButton>
    )
  }
  const doVaultOpen = async () => {
    setVaultOpenPending(true)
    await onPrivateVaultOpen()
    setVaultOpenPending(false)
  }

  const doPrivateStake = async () => {
    setStakePending(true)
    const tx = await onPrivateVaultStake(balanceStakingToken.dividedBy(1e18).toString())

    setStakePending(false)
    if (tx && tx.status) {
      setSuccess(true)
      if (migrateMode === 'farm') {
        dispatch(fetchChefsPublicDataAsync(account))
      } else {
        dispatch(triggerRefreshWallet())
      }
      dispatch(fetchPoolsPublicDataAsync())
      // dispatch(fetchGuestsPublicDataAsync())
      dispatch(fetchPoolsUserDataAsync(account))
      // dispatch(fetchGuestsUserDataAsync(account))
    }
  }
  const doStake = async () => {
    setStakePending(true)
    setFinalVal(val)
    console.log('val', val.toString())
    const tx = await onStake(val.dividedBy(1e18).toString())

    setStakePending(false)
    if (tx && tx.status) {
      setSuccess(true)
      if (migrateMode === 'farm') {
        dispatch(fetchChefsPublicDataAsync(account))
      } else {
        dispatch(triggerRefreshWallet())
      }
      dispatch(fetchPoolsPublicDataAsync())
      // dispatch(fetchGuestsPublicDataAsync())
      dispatch(fetchPoolsUserDataAsync(account))
      // dispatch(fetchGuestsUserDataAsync(account))
    }
  }

  const _onPrivateVaultSelect = (x) => {
    setPrivateVaultIndex(x.value)
  }

  const stakeAction = () => {
    if (stakePending) {
      return Spinner()
    }
    if (success) {
      return <SuccessIcon />
    }
    return (
      <ActionButton
        onClick={doStake}
        disabled={
          !amtInOldChef.isZero() ||
          balanceStakingToken.isZero() ||
          allowance.isLessThan(balanceStakingToken.plus(amtInOldChef))
        }
      >
        Stake
      </ActionButton>
    )
  }
  const stakeComponents = () => {
    if (success) {
      return (
        <Text>
          Staked {removeTrailingZero(finalVal.dividedBy(1e18),2)} {tokenName} in Espresso Vault
        </Text>
      )
    }
    return (
      <SectionCol>
        <Text>
          Stake {removeTrailingZero((stakePending ? finalVal : val).dividedBy(1e18), 2)} {tokenName} in Espresso Vault
        </Text>
        {stakePending ? (
          ''
        ) : (
          <Slider
            style={{ width: '95%' , marginTop: "-8px"}}
            defaultValue={100}
            valueLabelDisplay="off"
            step={1}
            marks
            // marks={marks}
            classes={commonClasses}
            onChange={onSliderChange}
          />
        )}
      </SectionCol>
    )
  }
  const fromFarmContent = () => {
    return (
      <Container>
        <Section>
          <ActionStep>1</ActionStep>
          <Text>
            Unstake {removeTrailingZero(amtInOldChef.dividedBy(1e18),2)} {tokenName} from {oldChef?.name}
          </Text>
          <Expand />
          {unstakeAction()}
        </Section>

        <HorizDiv />

        {isPrivateVault ? (
          <>
            {hasVault ? (
              <SectionCol>
                <Section>
                  <ActionStep>2</ActionStep>
                  <Text data-tip="Choose a private vault you have previously created.">Vault to use</Text>
                  <Expand />
                </Section>

                <DropDownContainer>
                  {/* <Text color={isExitMode?"textSubtle":"secondary"} style={{fontSize: "14px"}}>Vault Address: &nbsp;</Text> */}
                  {/* <TextDropdown color={isExitMode?"subtle":"secondary"} style={{fontSize: "10px"}}>{privatePoolInfo.address[vaultIndex]}</TextDropdown> */}

                  <FlexRowDiv style={{ width: 'auto' }}>
                    {options && options.length > 1 ? (
                      <Dropdown2
                        options={options}
                        onChange={_onPrivateVaultSelect}
                        value={options[0]}
                        placeholder="Vault Address"
                      />
                    ) : (
                      <Text
                        data-tip={`(${contracts.personalVaultSrc.mappings[vaultType]})`}
                        color={isExitMode ? 'textDisabled' : 'contrast'}
                        style={{ fontSize: '14px' }}
                      >
                        {privatePoolInfo.address[privateVaultIndex]}
                      </Text>
                    )}
                  </FlexRowDiv>

                  <ReactTooltip />
                </DropDownContainer>
                {isExitMode ? reopenPrivateVaultAction() : ''}
              </SectionCol>
            ) : (
              <Section>
                <ActionStep>2</ActionStep>
                <Text>Create vault</Text>
                <Expand />
                {createVaultAction()}
              </Section>
            )}
            <HorizDiv />

            <Section>
              <ActionStep>3</ActionStep>
              <Text>Approve {tokenName} for deposit</Text>
              <Expand />
              {approvePrivateVaultAction()}
            </Section>
            <HorizDiv />

            <Section>
              <ActionStep>4</ActionStep>
              {stakeComponents()}
              <Expand />
              {stakePrivateVaultAction()}
            </Section>
            <HorizDiv />
          </>
        ) : (
          <>
            <Section>
              <ActionStep>2</ActionStep>
              <Text>Approve {tokenName} for deposit</Text>
              <Expand />
              {allowAction()}
            </Section>

            <HorizDiv />

            <Section>
              <ActionStep>3</ActionStep>
              {stakeComponents()}
              <Expand />
              {stakeAction()}
            </Section>
          </>
        )}
      </Container>
    )
  }
  const fromWalletContent = () => {
    return (
      <Container>
        {isPrivateVault ? (
          <>
            {hasVault ? (
              <SectionCol>
                <Section>
                  <ActionStep>1</ActionStep>
                  <Text data-tip="Choose a private vault you have previously created.">Vault to use</Text>
                  <Expand />
                </Section>

                <DropDownContainer>
                  {/* <Text color={isExitMode?"textSubtle":"secondary"} style={{fontSize: "14px"}}>Vault Address: &nbsp;</Text> */}
                  {/* <TextDropdown color={isExitMode?"subtle":"secondary"} style={{fontSize: "10px"}}>{privatePoolInfo.address[vaultIndex]}</TextDropdown> */}

                  <FlexRowDiv style={{ width: 'auto' }}>
                    {options && options.length > 1 ? (
                      <Dropdown2
                        options={options}
                        onChange={_onPrivateVaultSelect}
                        value={options[0]}
                        placeholder="Vault Address"
                      />
                    ) : (
                      <Text
                        data-tip={`(${contracts.personalVaultSrc.mappings[vaultType]})`}
                        color={isExitMode ? 'textSubtle' : 'contrast'}
                        style={{ fontSize: '14px' }}
                      >
                        {privatePoolInfo.address[privateVaultIndex]}
                      </Text>
                    )}
                  </FlexRowDiv>

                  <ReactTooltip />
                </DropDownContainer>
                {isExitMode ? reopenPrivateVaultAction() : ''}
              </SectionCol>
            ) : (
              <Section>
                <ActionStep>1</ActionStep>
                <Text>Create vault</Text>
                <Expand />
                {createVaultAction()}
              </Section>
            )}
            <HorizDiv />

            <Section>
              <ActionStep>2</ActionStep>
              <Text>Approve {tokenName} for deposit</Text>
              <Expand />
              {approvePrivateVaultAction()}
            </Section>
            <HorizDiv />

            <Section>
              <ActionStep>3</ActionStep>
              {stakeComponents()}
              <Expand />
              {stakePrivateVaultAction()}
            </Section>
            <HorizDiv />
          </>
        ) : (
          <>
            <Section>
              <ActionStep>1</ActionStep>
              <Text>Approve {tokenName} for deposit</Text>
              <Expand />
              {allowAction()}
            </Section>

            <HorizDiv />

            <Section>
              <ActionStep>2</ActionStep>
              {stakeComponents()}
              <Expand />
              {stakeAction()}
            </Section>
          </>
        )}
      </Container>
    )
  }

  return (
    <Modal
      title={migrateMode === 'farm' ? `Optimize ${tokenName} yield` : `Put your ${tokenName} to work!`}
      onDismiss={onDismiss}
    >
      {migrateMode === 'farm' ? fromFarmContent() : fromWalletContent()}

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

export default MigrateFromFarmModal
