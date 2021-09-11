import { toast } from 'react-toastify'
import React from 'react'
import { LinkExternal, Modal, Button, Text } from '@pancakeswap-libs/uikit'
import contracts from 'config/constants/contracts'
import styled from 'styled-components'
import ModalActions from 'components/ModalActions'

interface SourceCodeModalProps {
  data: string
  vaultName: string
  vaultAddress: string
  version: string
  onDismiss?: () => void
}
const copyData = (data) => {
  navigator.clipboard.writeText(data)

  toast.dark('📋 Data copied', {
    // position: "top-center",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  })
}
const SourceCodeModal: React.FC<SourceCodeModalProps> = ({
  data,
  vaultName,
  vaultAddress,
  version,
  onDismiss = null,
}) => {
  /* eslint-disable */
  const kccUrl =  "https://explorer.kcc.io/en/verifyContract?t=Solidity%20%28Single%20file%29&a=" + vaultAddress + "&c=v0.6.12%2Bcommit.27d51765&l=No%20License%20%28None%29" ;
  return (
    <Modal2 title={`Verify source of ${vaultName} - ${vaultAddress}`} onDismiss={() => {
      if (onDismiss){
        onDismiss();
      }
    }}>

      <Text color="success">Prefer to see the source code? As vaults are deployed on demand by users, source code is unverified by default on KccExplorer. </Text>
      <Divider></Divider>
      <Divider></Divider>



      <Text style={{display: 'flex', flexDirection: 'row'}}>Proceed to&nbsp;
        <LinkExternal href={kccUrl}>
          KccExplorer
        </LinkExternal>
      </Text>
      <Divider></Divider>

      <Text>{`Select Optimization 'Yes' (leave the rest at defaults).`}</Text>
      <Divider></Divider>
      <Text style={{display: 'flex', flexDirection: 'row'}}>In the first box, paste the contents of this&nbsp;
        <LinkExternal href={contracts.personalVaultSrc[version].url}>
          file
        </LinkExternal>
      </Text>
      <Divider></Divider>
      <Text>In the second box, paste the following.</Text>
      <CallDataText>
        {data}&nbsp;
        <span  tabIndex={0} onKeyPress={copyData} role = "button" onClick={() => copyData(data)}>📋</span>
      </CallDataText>
      <Divider></Divider>
      <Text>Finish the captcha and submit!</Text>

      <ModalActions>
        <Button fullWidth variant="secondary" onClick={onDismiss}>
          Close
        </Button>
      
      </ModalActions>
    </Modal2>
  )
}

export default SourceCodeModal

const Modal2 = styled(Modal)`
  width: 70% !important;
  max-width: 70% !important;

  ${({ theme }) => theme.mediaQueries.xs} {
    width: auto;
    min-width: 360px;
    max-width: 70%;
  }


`
const CallDataText = styled.div`
  overflow-wrap: break-word;
  color: ${({ theme }) => theme.isDark ? "#ffcb2f" : "#333333"};
`
const Divider = styled.div`
  height: 7px;
`