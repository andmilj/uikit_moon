import { useEffect, useState } from 'react'
import { AbiItem } from 'web3-utils'
import { ContractOptions } from 'web3-eth-contract'
import useWeb3 from 'hooks/useWeb3'
import { getMasterChefAddress, getCakeAddress, getLotteryAddress, getLotteryTicketAddress } from 'utils/addressHelpers'
import { poolsConfig } from 'config/constants'
import guestConfig from 'config/constants/guest'

import { PoolCategory } from 'config/constants/types'
import ifo from 'config/abi/ifo.json'
import erc20 from 'config/abi/erc20.json'
import rabbitmintingfarm from 'config/abi/rabbitmintingfarm.json'
import pancakeRabbits from 'config/abi/pancakeRabbits.json'
import lottery from 'config/abi/lottery.json'
import lotteryTicket from 'config/abi/lotteryNft.json'
import masterChef from 'config/abi/masterchef.json'
import sousChef from 'config/abi/sousChef.json'
import sousChefBnb from 'config/abi/sousChefBnb.json'
import vaultAbi from 'config/abi/vault.json'
import privateVaultAbi from 'config/abi/privateVault.json'
import vaultFactoryAbi from 'config/abi/vaultFactory.json'
import vaultRegistryAbi from 'config/abi/vaultRegistry.json'
import routerAbi from 'config/abi/router.json'
import contracts from 'config/constants/contracts'
import { getWeb3 } from 'utils/web3'


const useContract = (abi: AbiItem, address: string, contractOptions?: ContractOptions) => {
  const web3 = useWeb3()
  const [contract, setContract] = useState(new web3.eth.Contract(abi, address, contractOptions))

  useEffect(() => {
    setContract(new web3.eth.Contract(abi, address, contractOptions))
  }, [abi, address, contractOptions, web3])

  return contract
}

/**
 * Helper hooks to get specific contracts (by ABI)
 */

export const useIfoContract = (address: string) => {
  const ifoAbi = ifo as unknown as AbiItem
  return useContract(ifoAbi, address)
}

export const useERC20 = (address: string) => {
  const erc20Abi = erc20 as unknown as AbiItem
  return useContract(erc20Abi, address)
}

export const useCake = () => {
  return useERC20(getCakeAddress())
}

export const useRabbitMintingFarm = (address: string) => {
  const rabbitMintingFarmAbi = rabbitmintingfarm as unknown as AbiItem
  return useContract(rabbitMintingFarmAbi, address)
}

export const usePancakeRabbits = (address: string) => {
  const pancakeRabbitsAbi = pancakeRabbits as unknown as AbiItem
  return useContract(pancakeRabbitsAbi, address)
}

export const useLottery = () => {
  const abi = lottery as unknown as AbiItem
  return useContract(abi, getLotteryAddress())
}

export const useLotteryTicket = () => {
  const abi = lotteryTicket as unknown as AbiItem
  return useContract(abi, getLotteryTicketAddress())
}

export const useMasterchef = () => {
  const abi = masterChef as unknown as AbiItem
  return useContract(abi, getMasterChefAddress())
}

export const useCustomMasterchef = (address, abi) => {
  return useContract(abi, address)
}

export const useSousChef = (id) => {
  const config = poolsConfig.concat(guestConfig).find((pool) => pool.sousId === id)
  const rawAbi = vaultAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  const abi = rawAbi as unknown as AbiItem
  return useContract(abi, config.contractAddress[process.env.REACT_APP_CHAIN_ID])
}
export const usePrivateSousChef = (address) => {
  const rawAbi = privateVaultAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  const abi = rawAbi as unknown as AbiItem
  return useContract(abi, address)
}

export const useRouter = () => {
  const rawAbi = routerAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  const abi = rawAbi as unknown as AbiItem
  return useContract(abi, contracts.router[process.env.REACT_APP_CHAIN_ID])
}
export const useCustomRouter = (address) => {
  const rawAbi = routerAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  const abi = rawAbi as unknown as AbiItem
  return useContract(abi, address)
}
export const getReadOnlyCustomRouter = (address) => {
  const rawAbi = routerAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  const abi = rawAbi as unknown as AbiItem
  const _w = getWeb3();
  return new _w.eth.Contract(abi, address)
}
export const useVaultRegistry = () => {
  const rawAbi = vaultRegistryAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  const abi = rawAbi as unknown as AbiItem
  return useContract(abi, contracts.vaultRegistry)
}

export const useVaultFactory = (address) => {
  const rawAbi = vaultFactoryAbi // config.poolCategory === PoolCategory.BINANCE ? sousChefBnb : sousChef
  const abi = rawAbi as unknown as AbiItem
  return useContract(abi, address)
}

export default useContract
