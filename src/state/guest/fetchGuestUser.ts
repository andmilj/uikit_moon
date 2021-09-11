import vaultABI from 'config/abi/vault.json'
import erc20ABI from 'config/abi/erc20.json'
import { AbiItem } from 'web3-utils'
import masterChefABI from 'config/abi/masterchef.json'
import MultiCallAbi from 'config/abi/Multicall.json'
import { PoolCategory } from 'config/constants/types'
import multicall from 'utils/multicall'
import { getWeb3 } from 'utils/web3'
import BigNumber from 'bignumber.js'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import guestsConfig from 'config/constants/guest'
import { bucketArray, decodeInt, getFuncData } from 'utils/callHelpers'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

// const web3 = getWeb3()
// const masterChefContract = new web3.eth.Contract((masterChefABI as unknown) as AbiItem, getMasterChefAddress())
const guests = guestsConfig.filter((p) => !p.hidden && p.poolCategory === PoolCategory.GUESTVAULT)

const _fetchGuestsInfo = async (account, vaults) => {
  const allowanceCalls = vaults.map((p) => [
    p.stakingTokenAddress,
    getFuncData('allowance(address,address)', [account, p.contractAddress[CHAIN_ID]]),
  ])
  const balanceCalls = vaults.map((p) => [p.stakingTokenAddress, getFuncData('balanceOf(address)', [account])])
  const stakedBalanceCalls = vaults.map((p) => [
    p.contractAddress[CHAIN_ID],
    getFuncData('balanceOf(address)', [account]),
  ])
  let callResults = await multi.methods.aggregate([...allowanceCalls, ...balanceCalls, ...stakedBalanceCalls]).call()
  callResults = callResults[1].map(decodeInt)
  const [allowances, balance, stakedBalance] = bucketArray(callResults, allowanceCalls.length)
  // console.log(balance, stakedBalance)
  return {
    allowances: vaults.reduce(
      (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }),
      {},
    ),
    stakingTokenBalances: vaults.reduce(
      (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(balance[index]).toJSON() }),
      {},
    ),
    stakedBalances: vaults.reduce(
      (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(stakedBalance[index]).toJSON() }),
      {},
    ),
  }
}
export const fetchGuestsInfo = async (account) => {
  if (guests.length === 0) {
    return {
      allowances: {},
      stakingTokenBalances: {},
      stakedBalances: {},
    }
  }
  return _fetchGuestsInfo(account, guests)
}
export const fetchGuestsInfoSingle = async (account, sousId) => {
  const vaults = guests.filter((g) => g.sousId === sousId)
  if (vaults.length === 0) {
    return {
      allowances: {},
      stakingTokenBalances: {},
      stakedBalances: {},
    }
  }
  return _fetchGuestsInfo(account, vaults)
}

export const fetchGuestsVsInfoSingle = async (account, sousId) => {
  const vaults = guests.filter((g) => g.sousId === sousId)
  if (vaults.length === 0) {
    return {
      vsAllowance: {},
      vsBal: {},
      stakedVs: {},
      pendingVsReward: {},
    }
  }
  return _fetchGuestsVsInfo(account, vaults)
}
const _fetchGuestsVsInfo = async (account, vaults) => {
  const allowanceCalls = vaults.map((v) => [
    v.contractAddress[CHAIN_ID],
    getFuncData('allowance(address,address)', [account, v.vaultShareFarmContract || getMasterChefAddress()]),
  ])
  const stakedBalanceCalls = vaults.map((v) => [
    v.vaultShareFarmContract || getMasterChefAddress(),
    getFuncData('userInfo(uint256,address)', [v.vaultShareFarmPid, account]),
  ])
  const balanceCalls = vaults.map((v) => [
    v.contractAddress[process.env.REACT_APP_CHAIN_ID],
    getFuncData('balanceOf(address)', [account]),
  ])
  const pendingCalls = vaults.map((v) => [
    v.vaultShareFarmContract || getMasterChefAddress(),
    getFuncData('pendingKafe(uint256,address)', [v.vaultShareFarmPid, account]),
  ])

  let callResults = await multi.methods
    .aggregate([...allowanceCalls, ...stakedBalanceCalls, ...balanceCalls, ...pendingCalls])
    .call()
  callResults = callResults[1]

  let [allowances, stakedBalances, balances, pending] = bucketArray(callResults, allowanceCalls.length)
  allowances = allowances.map(decodeInt)
  stakedBalances = stakedBalances.map((a) => web3.eth.abi.decodeParameters(['uint256'], a)[0])
  balances = balances.map(decodeInt)
  pending = pending.map(decodeInt)

  return {
    vsAllowance: vaults.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.sousId]: new BigNumber(allowances[index].toString()).toJSON(),
      }),
      {},
    ),
    vsBal: vaults.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.sousId]: new BigNumber(balances[index].toString()).toJSON(),
      }),
      {},
    ),
    stakedVs: vaults.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.sousId]: new BigNumber(stakedBalances[index].toString()).toJSON(),
      }),
      {},
    ),
    pendingVsReward: vaults.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.sousId]: new BigNumber(pending[index].toString()).toJSON(),
      }),
      {},
    ),
  }
}
export const fetchGuestsVsInfo = async (account) => {
  const vaults = guests.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
  if (vaults.length === 0) {
    return {
      vsAllowance: {},
      vsBal: {},
      stakedVs: {},
      pendingVsReward: {},
    }
  }
  return _fetchGuestsVsInfo(account, vaults)
}

export const fetchGuestsAllowance = async (account) => {
  // console.log(pools[0], pools[0].stakingTokenAddress, account)
  const calls = guests.map((p) => ({
    address: p.stakingTokenAddress,
    name: 'allowance',
    params: [account, p.contractAddress[CHAIN_ID]],
  }))

  const allowances = await multicall(erc20ABI, calls)
  return guests.reduce((acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }), {})
}

export const fetchUserBalances = async (account) => {
  const calls = guests.map((p) => ({
    address: p.stakingTokenAddress,
    name: 'balanceOf',
    params: [account],
  }))
  const tokenBalancesRaw = await multicall(erc20ABI, calls)
  const tokenBalances = guests.reduce(
    (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(tokenBalancesRaw[index]).toJSON() }),
    {},
  )

  return tokenBalances
}

export const fetchUserStakeBalances = async (account) => {
  const calls = guests.map((p) => ({
    address: p.contractAddress[CHAIN_ID],
    name: 'balanceOf',
    params: [account],
  }))
  const userBalances = await multicall(vaultABI, calls)

  return guests.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userBalances[index].toString()).toJSON(),
    }),
    {},
  )
}

export const fetchUserVsAllowance = async (account) => {
  const vaults = guestsConfig.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
  if (vaults.length === 0) {
    return {}
  }

  const allowances = await multicall(
    erc20ABI,
    vaults.map((v, i) => {
      return {
        address: v.contractAddress[CHAIN_ID],
        name: 'allowance',
        params: [account, v.vaultShareFarmContract || getMasterChefAddress()],
      }
    }),
  )

  return vaults.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(allowances[index].toString()).toJSON(),
    }),
    {},
  )
}

export const fetchUserStakeVsBalances = async (account) => {
  const vaults = guestsConfig.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
  if (vaults.length === 0) {
    return {}
  }

  let userStakedVsBalancesInFarm = await multicall(
    masterChefABI,
    vaults.map((v, i) => {
      return {
        address: v.vaultShareFarmContract || getMasterChefAddress(),
        name: 'userInfo',
        params: [v.vaultShareFarmPid, account],
      }
    }),
  )
  userStakedVsBalancesInFarm = userStakedVsBalancesInFarm.map((userInfo) => userInfo.amount)
  // console.log("userStakedVsBalancesInFarm",userStakedVsBalancesInFarm)

  return vaults.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userStakedVsBalancesInFarm[index].toString()).toJSON(),
    }),
    {},
  )
}

export const fetchUserVsBalances = async (account) => {
  const vaults = guestsConfig.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
  if (vaults.length === 0) {
    return {}
  }
  let userBal = await multicall(
    erc20ABI,
    vaults.map((v, i) => {
      return {
        address: v.contractAddress[process.env.REACT_APP_CHAIN_ID],
        name: 'balanceOf',
        params: [account],
      }
    }),
  )
  userBal = userBal.map((u) => u[0])

  // console.log("fetchUserVsBalances", userBal)

  return vaults.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userBal[index].toString()).toJSON(),
    }),
    {},
  )
}

export const fetchUserPendingVsReward = async (account) => {
  const vaults = guestsConfig.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
  if (vaults.length === 0) {
    return {}
  }

  let userPendingKafe = await multicall(
    masterChefABI,
    vaults.map((v, i) => {
      return {
        address: v.vaultShareFarmContract || getMasterChefAddress(),
        name: 'pendingKafe',
        params: [v.vaultShareFarmPid, account],
      }
    }),
  )
  userPendingKafe = userPendingKafe.map((u) => u[0])
  // console.log("userPendingKafe",userPendingKafe)

  return vaults.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userPendingKafe[index].toString()).toJSON(),
    }),
    {},
  )
}
