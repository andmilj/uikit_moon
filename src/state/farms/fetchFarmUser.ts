import { AbiItem } from 'web3-utils'
import BigNumber from 'bignumber.js'
import erc20ABI from 'config/abi/erc20.json'
import masterchefABI from 'config/abi/masterchef.json'
import MultiCallAbi from 'config/abi/Multicall.json'
import multicall from 'utils/multicall'
import farmsConfig from 'config/constants/farms'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import { getWeb3 } from 'utils/web3'
import { getFuncData } from 'utils/callHelpers'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

// export const fetchFarmUserAllowances = async (account: string) => {

//   const calls = farmsConfig.map((farm) => {
//     const lpContractAddress = farm.isTokenOnly ? farm.tokenAddresses[CHAIN_ID] : farm.lpAddresses[CHAIN_ID]
//     const masterChefAddress = farm.farmType === "native" ? getMasterChefAddress() : farm.customMasterChef
//     return { address: lpContractAddress, name: 'allowance', params: [account, masterChefAddress] }
//   })

//   const rawLpAllowances = await multicall(erc20ABI, calls)
//   const parsedLpAllowances = rawLpAllowances.map((lpBalance) => {
//     return new BigNumber(lpBalance).toJSON()
//   })
//   return parsedLpAllowances
// }

// export const fetchFarmUserTokenBalances = async (account: string) => {
//   const calls = farmsConfig.map((farm) => {
//     const lpContractAddress = farm.isTokenOnly ? farm.tokenAddresses[CHAIN_ID] : farm.lpAddresses[CHAIN_ID]
//     return {
//       address: lpContractAddress,
//       name: 'balanceOf',
//       params: [account],
//     }
//   })

//   const rawTokenBalances = await multicall(erc20ABI, calls)
//   const parsedTokenBalances = rawTokenBalances.map((tokenBalance) => {
//     return new BigNumber(tokenBalance).toJSON()
//   })
//   return parsedTokenBalances
// }

// export const fetchFarmUserStakedBalances = async (account: string) => {

//   const calls = farmsConfig.map((farm) => {
//     const masterChefAddress = farm.farmType === "native" ? getMasterChefAddress() : farm.customMasterChef
//     return {
//       address: masterChefAddress,
//       name: 'userInfo',
//       params: [(farm.farmType === "native") ? farm.pid : farm.pid-1000, account],
//     }
//   })

//   const rawStakedBalances = await multicall(masterchefABI, calls)
//   const parsedStakedBalances = rawStakedBalances.map((stakedBalance) => {
//     return new BigNumber(stakedBalance[0]._hex).toJSON()
//   })
//   return parsedStakedBalances
// }

// export const fetchFarmUserEarnings = async (account: string) => {

//   const calls = farmsConfig.map((farm) => {
//     const masterChefAddress = farm.farmType === "native" ? getMasterChefAddress() : farm.customMasterChef
//     return {
//       address: masterChefAddress,
//       name: 'pendingKafe',
//       params: [(farm.farmType === "native") ? farm.pid : farm.pid-1000, account],
//     }
//   })

//   const rawEarnings = await multicall(masterchefABI, calls)
//   const parsedEarnings = rawEarnings.map((earnings) => {
//     return new BigNumber(earnings).toJSON()
//   })
//   return parsedEarnings
// }
export const fetchFarmUserInfo = async (account: string) => {
  const allowanceCalls = farmsConfig.map((farm) => {
    const lpContractAddress = farm.isTokenOnly ? farm.tokenAddresses[CHAIN_ID] : farm.lpAddresses[CHAIN_ID]
    const masterChefAddress = farm.farmType === 'native' ? getMasterChefAddress() : farm.customMasterChef
    return [lpContractAddress, getFuncData('allowance(address,address)', [account, masterChefAddress])]
  })

  const tokenBalanceCalls = farmsConfig.map((farm) => {
    const lpContractAddress = farm.isTokenOnly ? farm.tokenAddresses[CHAIN_ID] : farm.lpAddresses[CHAIN_ID]
    return [lpContractAddress, getFuncData('balanceOf(address)', [account])]
  })

  const stakedBalanceCalls = farmsConfig.map((farm) => {
    const masterChefAddress = farm.farmType === 'native' ? getMasterChefAddress() : farm.customMasterChef
    return [
      masterChefAddress,
      getFuncData('userInfo(uint256,address)', [farm.farmType === 'native' ? farm.pid : farm.customPid, account]),
    ]
  })

  const earningsCalls = farmsConfig.map((farm) => {
    const masterChefAddress = farm.farmType === 'native' ? getMasterChefAddress() : farm.customMasterChef
    return [
      masterChefAddress,
      getFuncData('pendingKafe(uint256,address)', [farm.farmType === 'native' ? farm.pid : farm.customPid, account]),
    ]
  })

  let callResults = await multi.methods
    .aggregate([...allowanceCalls, ...tokenBalanceCalls, ...stakedBalanceCalls, ...earningsCalls])
    .call()
  callResults = callResults[1]
  const len = farmsConfig.length
  const allowances = callResults.slice(0, len).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  const tokenBal = callResults.slice(len, len * 2).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  const stakedBal = callResults.slice(len * 2, len * 3).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  const earnings = callResults.slice(len * 3).map((d) => web3.eth.abi.decodeParameter('uint256', d))

  return {
    userFarmAllowances: allowances,
    userFarmTokenBalances: tokenBal,
    userStakedBalances: stakedBal,
    userFarmEarnings: earnings,
  }
}
export default fetchFarmUserInfo
