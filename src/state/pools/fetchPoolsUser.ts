import { AbiItem } from 'web3-utils'
import poolsConfig from 'config/constants/pools'
import vaultABI from 'config/abi/vault.json'
import MultiCallAbi from 'config/abi/Multicall.json'
import erc20ABI from 'config/abi/erc20.json'
import routerABI from 'config/abi/router.json'
import { PoolCategory, QuoteToken } from 'config/constants/types'
import multicall from 'utils/multicall'
import { getWeb3 } from 'utils/web3'
import BigNumber from 'bignumber.js'
import vaultRegistryAbi from 'config/abi/vaultRegistry.json'
import masterChefABI from 'config/abi/masterchef.json'
import vaultFactoryAbi from 'config/abi/vaultFactory.json'
import privateVaultABI from 'config/abi/privateVault.json'
import contracts from 'config/constants/contracts'
import { useERC20, useSousChef } from 'hooks/useContract'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import { bucketArray, decodeBool, decodeInt, decodeString, getFuncData } from 'utils/callHelpers'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

// Pool 0, Cake / Cake is a different kind of contract (master chef)
// BNB pools use the native BNB token (wrapping ? unwrapping is done at the contract level)
// const nonBnbPools = poolsConfig.filter((p) => p.stakingTokenName !== QuoteToken.BNB)
// const bnbPools = poolsConfig.filter((p) => p.stakingTokenName === QuoteToken.BNB)
// const nonMasterPools = poolsConfig.filter((p) => p.sousId !== 0)
// const masterChefContract = new web3.eth.Contract((masterChefABI as unknown) as AbiItem, getMasterChefAddress())
const pools = poolsConfig.filter(
  (p) => !p.hidden && (p.poolCategory === PoolCategory.VAULT || p.poolCategory === PoolCategory.SYNTHETIX_VAULT),
)
const privatePools = poolsConfig.filter((p) => !p.hidden && p.poolCategory === PoolCategory.PRIVATEVAULT)

export const _fetchPoolUserInfo = async (account, _pools) => {
  const allowanceCalls = _pools.map((p) => {
    return [p.stakingTokenAddress, getFuncData('allowance(address,address)', [account, p.contractAddress[CHAIN_ID]])]
  })

  const tokenBalanceCalls = _pools.map((p) => {
    return [p.stakingTokenAddress, getFuncData('balanceOf(address)', [account])]
  })

  const stakedBalanceCalls = _pools.map((p) => {
    return [p.contractAddress[CHAIN_ID], getFuncData('balanceOf(address)', [account])]
  })

  let callResults = await multi.methods
    .aggregate([...allowanceCalls, ...tokenBalanceCalls, ...stakedBalanceCalls])
    .call()
  callResults = callResults[1]
  const len = _pools.length
  const allowances = callResults.slice(0, len).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  const tokenBal = callResults.slice(len, len * 2).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  const stakedBal = callResults.slice(len * 2, len * 3).map((d) => web3.eth.abi.decodeParameter('uint256', d))

  return {
    allowances: _pools.reduce(
      (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }),
      {},
    ),
    stakingTokenBalances: _pools.reduce(
      (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(tokenBal[index]).toJSON() }),
      {},
    ),
    stakedBalances: _pools.reduce(
      (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(stakedBal[index]).toJSON() }),
      {},
    ),
  }
}
export const fetchPoolUserInfoSingle = async (account, sousId) => {
  const temp = pools.filter((p) => p.sousId === sousId)
  return _fetchPoolUserInfo(account, temp)
}
export const fetchPoolUserInfo = async (account) => {
  return _fetchPoolUserInfo(account, pools)
}
export default fetchPoolUserInfo

export const fetchPoolsAllowance = async (account) => {
  // console.log(pools[0], pools[0].stakingTokenAddress, account)
  const calls = pools.map((p) => ({
    address: p.stakingTokenAddress,
    name: 'allowance',
    params: [account, p.contractAddress[CHAIN_ID]],
  }))

  const allowances = await multicall(erc20ABI, calls)
  return pools.reduce((acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(allowances[index]).toJSON() }), {})
}

export const fetchUserBalances = async (account) => {
  const calls = pools.map((p) => ({
    address: p.stakingTokenAddress,
    name: 'balanceOf',
    params: [account],
  }))
  const tokenBalancesRaw = await multicall(erc20ABI, calls)
  const tokenBalances = pools.reduce(
    (acc, pool, index) => ({ ...acc, [pool.sousId]: new BigNumber(tokenBalancesRaw[index]).toJSON() }),
    {},
  )

  return tokenBalances
}

export const fetchUserStakeBalances = async (account) => {
  const calls = pools.map((p) => ({
    address: p.contractAddress[CHAIN_ID],
    name: 'balanceOf',
    params: [account],
  }))
  const userBalances = await multicall(vaultABI, calls)

  return pools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userBalances[index].toString()).toJSON(),
    }),
    {},
  )
}

export const _fetchPoolVsUserInfo = async (account, vaults) => {
  const allowanceCalls = vaults.map((v) => {
    return [
      v.contractAddress[CHAIN_ID],
      getFuncData('allowance(address,address)', [account, v.vaultShareFarmContract || getMasterChefAddress()]),
    ]
  })

  const stakedBalanceCalls = vaults.map((v) => {
    return [
      v.vaultShareFarmContract || getMasterChefAddress(),
      getFuncData('userInfo(uint256,address)', [v.vaultShareFarmPid, account]),
    ]
  })

  const vsBalanceCalls = vaults.map((v) => {
    return [v.contractAddress[process.env.REACT_APP_CHAIN_ID], getFuncData('balanceOf(address)', [account])]
  })

  const pendingCalls = vaults.map((v) => {
    return [
      v.vaultShareFarmContract || getMasterChefAddress(),
      getFuncData('pendingKafe(uint256,address)', [v.vaultShareFarmPid, account]),
    ]
  })
  let callResults = await multi.methods
    .aggregate([...allowanceCalls, ...stakedBalanceCalls, ...vsBalanceCalls, ...pendingCalls])
    .call()
  callResults = callResults[1]
  const len = vaults.length
  const allowances = callResults.slice(0, len).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  const stakedBal = callResults.slice(len, len * 2).map((d) => web3.eth.abi.decodeParameters(['uint256'], d)[0])
  const vsBal = callResults.slice(len * 2, len * 3).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  const pending = callResults.slice(len * 3).map((d) => web3.eth.abi.decodeParameter('uint256', d))
  return {
    vsAllowance: vaults.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.sousId]: new BigNumber(allowances[index].toString()).toJSON(),
      }),
      {},
    ),
    stakedVs: vaults.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.sousId]: new BigNumber(stakedBal[index].toString()).toJSON(),
      }),
      {},
    ),
    vsBal: vaults.reduce(
      (acc, pool, index) => ({
        ...acc,
        [pool.sousId]: new BigNumber(vsBal[index].toString()).toJSON(),
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

export const fetchPoolVsUserInfo = async (account) => {
  const vaults = pools.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
  if (vaults.length === 0) {
    return {
      vsAllowance: {},
      stakedVs: {},
      vsBal: {},
      pendingVsReward: {},
    }
  }
  return _fetchPoolVsUserInfo(account, vaults)
}
export const fetchPoolVsUserInfoSingle = async (account, sousId) => {
  const vaults = pools.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0 && p.sousId === sousId)
  if (vaults.length === 0) {
    return {
      vsAllowance: {},
      stakedVs: {},
      vsBal: {},
      pendingVsReward: {},
    }
  }
  return _fetchPoolVsUserInfo(account, vaults)
}
export const fetchUserVsAllowance = async (account) => {
  const vaults = pools.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
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
  const vaults = pools.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
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
  const vaults = pools.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
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
  const vaults = pools.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
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

export const fetchUserCapitalIn = async (account) => {
  const capitalMovements = await Promise.all(
    pools.map(async (p) => {
      const tok = new web3.eth.Contract(erc20ABI as unknown as AbiItem, p.stakingTokenAddress)

      const e = await tok
        .getPastEvents('Transfer', {
          filter: { from: [account, p.contractAddress[CHAIN_ID]], to: [account, p.contractAddress[CHAIN_ID]] }, // Using an array means OR: e.g. 20 or 23
          fromBlock: 0,
          toBlock: 'latest',
        })
        .then(function (events) {
          // console.log(events) // same results as the optional callback above
          return events.map((l) => ({ from: l.returnValues.from, to: l.returnValues.to, value: l.returnValues.value }))
        })

      return (e as any[]).reduce(
        (acc, log) => {
          if (
            log.from.toLowerCase() === account.toLowerCase() &&
            log.to.toLowerCase() === p.contractAddress[CHAIN_ID].toLowerCase()
          ) {
            // capital in
            acc.in = acc.in.plus(new BigNumber(log.value))
          } else if (
            log.from.toLowerCase() === p.contractAddress[CHAIN_ID].toLowerCase() &&
            log.to.toLowerCase() === account.toLowerCase()
          ) {
            // capital in
            acc.out = acc.out.plus(new BigNumber(log.value))
          }
          return acc
        },
        { in: new BigNumber(0), out: new BigNumber(0) },
      )
    }),
  )
  console.log(capitalMovements)

  const calls = pools.map((p) => ({
    address: p.contractAddress[CHAIN_ID],
    name: 'balanceOf',
    params: [account],
  }))
  const userBalances = await multicall(vaultABI, calls)

  // const shareRatios = pools.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'getPricePerFullShare',
  //   params: [],
  // }))
  // const pricePerShares = await multicall(vaultABI, shareRatios)

  return pools.reduce(
    (acc, pool, index) => ({
      ...acc,
      [pool.sousId]: new BigNumber(userBalances[index]).toJSON(),
    }),
    {},
  )
}

export const fetchUserPrivatePools = async (account) => {
  const privatePoolIdentMapping = privatePools.reduce(
    (acc, p, index) => ({
      ...acc,
      // soliditySha3 didnt work so i use this https://ethereum.stackexchange.com/a/96714
      [web3.utils.sha3(
        web3.eth.abi.encodeParameters(
          ['address', 'address', 'address', 'address', 'address', 'uint256'],
          [
            p.stakingTokenAddress,
            p.rewardToken,
            p.isLP ? p.lpBaseTokenAddress : contracts.BURNADDRESS,
            p.routerForQuote,
            p.underlyingMasterChef,
            p.poolId,
          ],
        ),
      )]: {
        sousId: p.sousId,
        stakingToken: p.stakingTokenAddress,
        underlyingMasterChef: p.underlyingMasterChef,
        pendingRewardsFunc: p.pendingRewardsFunc,
        poolId: p.poolId,
      },
    }),
    {},
  )

  if (Object.keys(privatePoolIdentMapping).length === 0) {
    return {}
  }

  // now get private vaults
  // make sure to acccount for multiple vaults of the same ident
  const vaultRegistry = new web3.eth.Contract(vaultRegistryAbi as unknown as AbiItem, contracts.vaultRegistry)

  let vaults = await vaultRegistry.methods.getUserVaults(account).call()
  if (vaults.length === 0) {
    return {}
  }
  // console.log("uservaults", vaults)
  // let idents = await multicall(privateVaultABI, vaults.map((v) => ({
  //   address: v,
  //   name: 'getFarmIdentifier',
  //   params: [],
  // })))
  // idents = idents.map(a => a[0])
  // // console.log(idents)

  // let deactivated = await multicall(vaultRegistryAbi, vaults.map((v) => ({
  //   address: contracts.vaultRegistry,
  //   name: 'deactivated',
  //   params: [v],
  // })))
  // deactivated = deactivated.map(d => d[0])

  const identCalls = vaults.map((v) => [v, getFuncData('getFarmIdentifier()', [])])
  const deactivatedCalls = vaults.map((v) => [contracts.vaultRegistry, getFuncData('deactivated(address)', [v])])

  let callResults = await multi.methods.aggregate([...identCalls, ...deactivatedCalls]).call()
  callResults = callResults[1]

  let idents = callResults.slice(0, identCalls.length).map((a) => web3.eth.abi.decodeParameter('bytes32', a))
  const deactivated = callResults.slice(identCalls.length).map(decodeBool)

  vaults = vaults.filter((v, i) => !deactivated[i] && idents[i] && privatePoolIdentMapping[idents[i]])
  idents = idents.filter((id, i) => !deactivated[i] && privatePoolIdentMapping[id])

  if (vaults.length === 0) {
    console.log('no private vaults')
    return {}
  }
  // console.log("vaults filtered", vaults)

  // stakedAmts = stakedAmts.filter((id,i) => (idents[i] && privatePoolIdentMapping[idents[i]]))
  // exitModes = exitModes.filter((id,i) => (idents[i] && privatePoolIdentMapping[idents[i]]))
  // amtManualDepositeds = amtManualDepositeds.filter((id,i) => (idents[i] && privatePoolIdentMapping[idents[i]]))
  // rewardStates = rewardStates.filter((id,i) => (idents[i] && privatePoolIdentMapping[idents[i]]))

  // console.log("filtered",vaults)

  const stakedAmtsCalls = vaults.map((v) => [v, getFuncData('balanceOf()', [])])
  const exitModesCalls = vaults.map((v) => [v, getFuncData('exitMode()', [])])
  const amtManualDepositedCalls = vaults.map((v) => [v, getFuncData('amtManualDeposited()', [])])
  const rewardStateCalls = vaults.map((v) => [v, getFuncData('getRewardState()', [])])
  const vaultTypeCalls = vaults.map((v) => [contracts.vaultRegistry, getFuncData('vaultTypes(address)', [v])])
  const allowanceCalls = vaults.map((v, i) => [
    privatePoolIdentMapping[idents[i]].stakingToken,
    getFuncData('allowance(address,address)', [account, v]),
  ])
  const tokenBalCalls = vaults.map((v, i) => [
    privatePoolIdentMapping[idents[i]].stakingToken,
    getFuncData('balanceOf(address)', [account]),
  ])
  const pendingRewardCalls = vaults.map((v, i) => [
    privatePoolIdentMapping[idents[i]].underlyingMasterChef,
    getFuncData(privatePoolIdentMapping[idents[i]].pendingRewardsFunc, [privatePoolIdentMapping[idents[i]].poolId, v]),
  ])
  let callResults2 = await multi.methods
    .aggregate([
      ...stakedAmtsCalls,
      ...exitModesCalls,
      ...amtManualDepositedCalls,
      ...rewardStateCalls,
      ...vaultTypeCalls,
      ...allowanceCalls,
      ...tokenBalCalls,
      ...pendingRewardCalls,
    ])
    .call()
  callResults2 = callResults2[1]

  const len = vaults.length
  let [
    stakedAmts,
    exitModes,
    amtManualDepositeds,
    rewardStates,
    vaultTypes,
    allowances,
    stakingTokenBalances,
    pendingRewards,
  ] = bucketArray(callResults2, len)

  stakedAmts = stakedAmts.map(decodeInt)
  exitModes = exitModes.map(decodeBool)
  amtManualDepositeds = amtManualDepositeds.map(decodeInt)
  rewardStates = rewardStates.map((a) => web3.eth.abi.decodeParameters(['uint256', 'uint256', 'uint256'], a))
  vaultTypes = vaultTypes.map(decodeString)
  allowances = allowances.map(decodeInt)
  stakingTokenBalances = stakingTokenBalances.map(decodeInt)
  pendingRewards = pendingRewards.map(decodeInt)

  const blockNumber = await web3.eth.getBlockNumber()
  const compoundTimes = await Promise.all(
    vaults.map(async (s, i) => {
      const stakingToken = new web3.eth.Contract(
        erc20ABI as unknown as AbiItem,
        privatePoolIdentMapping[idents[i]].stakingToken,
      )
      const e = await stakingToken
        .getPastEvents('Transfer', {
          filter: { from: s, to: privatePoolIdentMapping[idents[i]].underlyingMasterChef },
          fromBlock: blockNumber - (2 * 3600) / 3,
          toBlock: 'latest',
        })
        .then(function (r) {
          // console.log(r) // same results as the optional callback above
          return r.map((l) => ({ blockNumber: l.blockNumber, lpAdded: l.returnValues.value }))
        })
      if (e.length > 0) {
        return e[e.length - 1]
      }
      return null
    }),
  )

  const temp = vaults.reduce((acc, vaultAdd, index) => {
    const sousId = privatePoolIdentMapping[idents[index]].sousId
    if (acc[sousId]) {
      return {
        ...acc,
        [sousId]: {
          address: acc[sousId].address.concat([vaultAdd]),
          ident2: acc[sousId].ident2.concat([idents[index]]),
          stakedAmt: acc[sousId].stakedAmt.concat([stakedAmts[index].toString()]),
          exitMode: acc[sousId].exitMode.concat([exitModes[index]]),
          rewardLockedUp: acc[sousId].rewardLockedUp.concat([rewardStates[index][1].toString()]),
          nextHarvest: acc[sousId].nextHarvest.concat([rewardStates[index][2].toString()]),
          allowance: acc[sousId].allowance.concat([allowances[index].toString()]),
          stakingTokenBalance: acc[sousId].stakingTokenBalance.concat([stakingTokenBalances[index].toString()]),
          capital: acc[sousId].capital.concat([amtManualDepositeds[index].toString()]),
          pendingRewards: acc[sousId].pendingRewards.concat([
            new BigNumber(pendingRewards[index].toString()).toString(),
          ]),
          vaultType: acc[sousId].vaultType.concat([vaultTypes[index]]),
          compoundTime: acc[sousId].compoundTime.concat([compoundTimes[index]]),
        },
      }
    }
    return {
      ...acc,
      [sousId]: {
        address: [vaultAdd],
        ident2: [idents[index]],
        stakedAmt: [stakedAmts[index].toString()],
        exitMode: [exitModes[index]],
        rewardLockedUp: [rewardStates[index][1].toString()],
        nextHarvest: [rewardStates[index][2].toString()],
        allowance: [allowances[index].toString()],
        stakingTokenBalance: [stakingTokenBalances[index].toString()],
        capital: [amtManualDepositeds[index].toString()],
        pendingRewards: [new BigNumber(pendingRewards[index].toString()).toString()],
        vaultType: [vaultTypes[index]],
        compoundTime: [compoundTimes[index]],
      },
    }

    // ...acc,
    // [privatePoolIdentMapping[idents[index]].sousId]: {
    //   address: vaultAdd,
    //   ident2: idents[index][0],
    //   stakedAmt: stakedAmts[index][0].toString(),
    //   exitMode: exitModes[index][0],
    //   // rewardState: rewardStates[index],
    //   rewardLockedUp: rewardStates[index][1].toString(),
    //   nextHarvest: rewardStates[index][2].toString(),
    //   allowance: allowances[index].toString(),
    //   stakingTokenBalance: stakingTokenBalances[index].toString(),
    //   capital: amtManualDepositeds[index].toString(),
    //   pendingRewards: new BigNumber(pendingRewards[index].toString()).toString()
    // }
  }, {})

  // Object.keys(temp).forEach((sousId) => {

  //   // find a default valid vault for each
  //   const v = temp[sousId];
  //   const numVaults = v.address.length;

  //   const active
  // })

  return temp
}
