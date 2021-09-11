import { Pool } from 'state/types'
import { triggerRefreshWallet } from 'state/config'
import { PoolCategory } from 'config/constants/types'
import contracts from 'config/constants/contracts'
import { useWallet } from 'use-wallet'
import Dropdown from 'react-dropdown'
import { makeStyles } from '@material-ui/core'
import BigNumber from 'bignumber.js'
import ReactTooltip from 'react-tooltip'
import { useDispatch } from 'react-redux'
import { fetchPoolsPublicDataAsync, fetchPoolsUserDataAsync } from 'state/pools'
import { fetchChefsPublicDataAsync } from 'state/chefs'
import { fetchGuestsPublicDataAsync, fetchGuestsUserDataAsync } from 'state/guest'
import React, { useCallback, useMemo, useState } from 'react'
import { Button, Modal, Text } from '@pancakeswap-libs/uikit'
import CircularProgress from '@material-ui/core/CircularProgress'
import styled from 'styled-components'
import useTokenBalance from 'hooks/useTokenBalance'
import { useCustomMasterchef, useERC20 } from 'hooks/useContract'
import { usePrivateSousApprove, useSousApprove } from 'hooks/useApprove'
import { usePrivateSousStake, useSousStake } from 'hooks/useStake'
import { useAllowance } from 'hooks/useAllowance'
import { useCreateVault } from 'hooks/useCreateVault'

import { usePrivateSousEntry, usePrivateSousUnstake } from 'hooks/useUnstake'
import { useMigration, usePools } from 'state/hooks'

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
const HorizDiv = styled.div`
  height: 15px;
`
const ActionStep = styled.div`
  width: 30px;
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

const SectionCol = styled(FlexColDiv)``
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

interface ModalProps {
  onConfirm: (amount: string) => void
  onDismiss?: () => void
}

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID

const useStyles = makeStyles({
  root: {
    color: '#ffcb2f',
    width: '20px !important',
    height: '20px !important',
  },
})
// this modal displays 3 steps. unstake, approve new vault, deposit vault.
const MigrateFromWalletModal: React.FC<ModalProps> = ({ onConfirm, onDismiss }) => {
  const { selectedSous } = useMigration()
  const dispatch = useDispatch()
  const { account } = useWallet()
  const classes = useStyles()
  const [allowPending, setAllowPending] = useState(false)
  const [stakePending, setStakePending] = useState(false)
  const [createPending, setCreatePending] = useState(false)
  const [vaultOpenPending, setVaultOpenPending] = useState(false)
  const [success, setSuccess] = useState(false)
  const vaults = usePools(account)

  const v = selectedSous >= 0 ? vaults.find((p) => p.sousId === selectedSous) : null
  const validSelection = !!v

  const tokenName = validSelection ? v.image : ''
  const isPrivateVault = validSelection && v.poolCategory === PoolCategory.PRIVATEVAULT

  const { onCreateVault } = useCreateVault(v)

  const callCreate = async () => {
    try {
      setCreatePending(true)
      await onCreateVault()
    } catch (e) {
      console.error(e)
    }
    setCreatePending(false)
  }

  // step 1b - private vault
  const userData = v?.userData
  const hasVault =
    userData &&
    userData.privatePoolInfo &&
    userData.privatePoolInfo.address &&
    userData.privatePoolInfo.address.length > 0
  const privatePoolInfo = userData?.privatePoolInfo
  const [privateVaultIndex, setPrivateVaultIndex] = useState(0)

  const effSousId = v ? v.sousId : 0
  // step 2
  const stakingTokenContract = useERC20(v ? v.stakingTokenAddress : contracts.WMOVR)
  const balanceStakingToken = useTokenBalance(v ? v.stakingTokenAddress : contracts.WMOVR)
  // const allowance = useAllowance(stakingTokenContract, v.contractAddress[CHAIN_ID])
  const { onApprove } = useSousApprove(stakingTokenContract, effSousId)

  // step 3
  const { onStake } = useSousStake(effSousId)

  const options =
    privatePoolInfo && privatePoolInfo.address
      ? privatePoolInfo.address.map((va, i) => ({ value: `${i}`, label: va }))
      : []
  const vaultType = hasVault ? privatePoolInfo?.vaultType[privateVaultIndex] : '-'
  const isExitMode = hasVault ? privatePoolInfo?.exitMode[privateVaultIndex] : false
  console.log(privatePoolInfo, isExitMode)
  const effPrivateVaultAddress = hasVault ? privatePoolInfo.address[privateVaultIndex] : 0
  const { onApprove: onPrivateVaultApprove } = usePrivateSousApprove(
    stakingTokenContract,
    effSousId,
    effPrivateVaultAddress,
  )
  const { onStake: onPrivateVaultStake } = usePrivateSousStake(effSousId, effPrivateVaultAddress)
  const { onEntry: onPrivateVaultOpen } = usePrivateSousEntry(effSousId, effPrivateVaultAddress)

  const allowance = useAllowance(stakingTokenContract, v.contractAddress[CHAIN_ID] || effPrivateVaultAddress || account)

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
    if (allowance.isGreaterThan(balanceStakingToken)) {
      return <SuccessIcon />
    }
    return (
      <ActionButton onClick={doApprove} disabled={allowance.isGreaterThan(balanceStakingToken)}>
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
    if (allowance.isGreaterThan(balanceStakingToken)) {
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
        disabled={isExitMode || balanceStakingToken.isZero() || allowance.isLessThan(balanceStakingToken)}
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
    return (
      <ActionButton onClick={doVaultOpen} disabled={vaultOpenPending}>
        Re-open vault
      </ActionButton>
    )
  }
  const doVaultOpen = async () => {
    setVaultOpenPending(true)
    const tx = await onPrivateVaultOpen()
    setVaultOpenPending(false)

    if (tx && tx.status) {
      dispatch(fetchPoolsPublicDataAsync())
      // dispatch(fetchPoolsUserDataAsync(account))
    }
  }

  const doPrivateStake = async () => {
    setStakePending(true)
    const tx = await onPrivateVaultStake(balanceStakingToken.dividedBy(1e18).toString())

    setStakePending(false)
    if (tx && tx.status) {
      setSuccess(true)
      dispatch(fetchPoolsPublicDataAsync())
      // dispatch(fetchGuestsPublicDataAsync())
      dispatch(fetchPoolsUserDataAsync(account))
      // dispatch(fetchGuestsUserDataAsync(account))
      dispatch(fetchChefsPublicDataAsync(account))
    }
  }
  const doStake = async () => {
    setStakePending(true)
    const tx = await onStake(balanceStakingToken.dividedBy(1e18).toString())

    setStakePending(false)
    if (tx && tx.status) {
      setSuccess(true)
      dispatch(fetchPoolsPublicDataAsync())
      // dispatch(fetchGuestsPublicDataAsync())
      dispatch(fetchPoolsUserDataAsync(account))
      // dispatch(fetchGuestsUserDataAsync(account))
      dispatch(fetchChefsPublicDataAsync(account))
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
        disabled={balanceStakingToken.isZero() || allowance.isLessThan(balanceStakingToken)}
      >
        Stake
      </ActionButton>
    )
  }
  const fromWalletContent = () => {
    return (
      <Container>
        =
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
              <ActionStep>{isPrivateVault ? 2 : 1}</ActionStep>
              <Text>Approve {tokenName} for deposit</Text>
              <Expand />
              {approvePrivateVaultAction()}
            </Section>
            <HorizDiv />

            <Section>
              <ActionStep>{isPrivateVault ? 3 : 2}</ActionStep>
              <Text>
                Stake {balanceStakingToken.dividedBy(1e18).toFixed(2)} {tokenName} in Moonkafe
              </Text>
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
              <Text>
                Stake {balanceStakingToken.dividedBy(1e18).toFixed(2)} {tokenName} in Moonkafe
              </Text>
              <Expand />
              {stakeAction()}
            </Section>
          </>
        )}
      </Container>
    )
  }

  return (
    <Modal title={`Put your ${tokenName} to work!`} onDismiss={onDismiss}>
      {fromWalletContent()}
      {/*       
      <Container>

        
        <HorizDiv/>

        <Section>
          <ActionStep>1</ActionStep>
          <Text>Approve {tokenName} for deposit</Text>
          <Expand/>
          {allowAction()}
        </Section>

        <HorizDiv/>

        <Section>
          <ActionStep>2</ActionStep>
          <Text>Stake {balanceStakingToken.dividedBy(1e18).toFixed(2)} {tokenName} in Kukafe</Text>
          <Expand/>
          {stakeAction()}
        </Section>
      </Container> */}

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

export default MigrateFromWalletModal
