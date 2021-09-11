import { AbiItem } from 'web3-utils'
import MultiCallAbi from 'config/abi/Multicall.json'
import strategyAbi from 'config/abi/strategyAbi.json'
import { getWeb3 } from 'utils/web3'
import { getMasterChefAddress, getMulticallAddress } from 'utils/addressHelpers'
import guestPools from 'config/constants/guest'
import BigNumber from 'bignumber.js'
import { BLOCKS_PER_YEAR } from 'config'
import { bucketArray, decodeInt, getFuncData } from 'utils/callHelpers'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

export const getTikuPool = async (tikuConfig) => {
  const calls = []

  // get cost per tiku
  calls.push([
    tikuConfig.routerForQuote,
    `${web3.utils.soliditySha3('getAmountsOut(uint256,address[])').slice(0, 10)}${web3.eth.abi
      .encodeParameters(
        ['uint256', 'address[]'],
        ['1000000000000000000', [tikuConfig.stakingTokenAddress, tikuConfig.lpBaseTokenAddress]],
      )
      .slice(2)}`,
  ])

  // get total staked
  calls.push([tikuConfig.contractAddress[CHAIN_ID], `${web3.utils.soliditySha3('balance()').slice(0, 10)}`])

  // get pending
  calls.push([tikuConfig.strategy, `${web3.utils.soliditySha3('getPendingRewards()').slice(0, 10)}`])

  calls.push([
    tikuConfig.contractAddress[CHAIN_ID],
    `${web3.utils.soliditySha3('getPricePerFullShare()').slice(0, 10)}`,
  ])

  let results = await multi.methods.aggregate(calls).call()
  results = results[1]
  const priceOfTokenInQuote = web3.eth.abi.decodeParameters(['uint[]'], results[0])[0][1]
  const totalStaked = web3.eth.abi.decodeParameters(['uint'], results[1])[0]
  const pending = web3.eth.abi.decodeParameters(['uint'], results[2])[0]
  const pricePerShare = web3.eth.abi.decodeParameters(['uint'], results[3])[0]
  // estimate apy
  const poolStakedInQuote = new BigNumber(totalStaked.toString()).multipliedBy(priceOfTokenInQuote).dividedBy(1e18)
  const blockNumber = await web3.eth.getBlockNumber()

  const strategy = new web3.eth.Contract(strategyAbi as unknown as AbiItem, tikuConfig.strategy)
  const events = await strategy
    .getPastEvents('Compound', {
      fromBlock: blockNumber - (48 * 3600) / 3,
      toBlock: 'latest',
    })
    .then(function (r) {
      return r.map((l) => ({
        transactionHash: l.transactionHash,
        blockNumber: l.blockNumber,
        caller: l.returnValues.caller,
        lpAdded: l.returnValues.lpAdded,
      }))
    })
  // console.log("events",events)
  let apy
  if (events.length < 2) {
    apy = new BigNumber(0)
  } else {
    const blockDiff = events[events.length - 1].blockNumber - events[0].blockNumber
    const amt = events.slice(1).reduce((acc, e) => {
      return acc.plus(e.lpAdded)
    }, new BigNumber(0))

    const rewardAYear = new BigNumber(amt)
      .dividedBy(blockDiff)
      .multipliedBy(BLOCKS_PER_YEAR)
      .multipliedBy(priceOfTokenInQuote)
      .dividedBy(1e18)
    apy = rewardAYear.dividedBy(poolStakedInQuote).multipliedBy(100)
    // console.log(blockDiff, amt, new BigNumber(priceOfTokenInQuote).dividedBy(1e18).toString(), rewardAYear.toString(), poolStakedInQuote.toString(), apy.toString())
  }
  // console.log("apy", apy.toString());

  return {
    ...tikuConfig,
    stakePriceAsQuoteToken: new BigNumber(priceOfTokenInQuote).dividedBy(1e18).toString(),
    apy: apy.toString(),
    totalStaked,
    pending,
    pricePerShare: new BigNumber(pricePerShare).dividedBy(1e18).toString(),
  }
}

export const fetchPoolsVaultShareFarmsInfo = async () => {
  const vaults = guestPools.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
  if (vaults.length === 0) {
    return {}
  }
  const nowBlock = await web3.eth.getBlockNumber()

  const calls = []

  vaults.forEach((v) => {
    calls.push([
      v.contractAddress[CHAIN_ID],
      getFuncData('balanceOf(address)', [v.vaultShareFarmContract || getMasterChefAddress()]),
    ])
  })
  vaults.forEach((v) => {
    calls.push([
      v.vaultShareFarmContract || getMasterChefAddress(),
      getFuncData('poolInfo(uint256)', [v.vaultShareFarmPid]),
    ])
  })
  vaults.forEach((v) => {
    calls.push([v.vaultShareFarmContract || getMasterChefAddress(), getFuncData('totalAllocPoint()', [])])
  })
  vaults.forEach((v) => {
    calls.push([v.vaultShareFarmContract || getMasterChefAddress(), getFuncData('kafePerBlock()', [])])
  })
  vaults.forEach((v) => {
    calls.push([
      v.vaultShareFarmContract || getMasterChefAddress(),
      getFuncData('getMultiplier(uint256,uint256)', [nowBlock, nowBlock + 1]),
    ])
  })

  let results = await multi.methods.aggregate(calls).call()
  results = results[1]

  let [stakedBalancesInFarm, poolInfo, totalAllocPoint, eggPerBlock, rewardsMultiplier] = bucketArray(
    results,
    vaults.length,
  )

  stakedBalancesInFarm = stakedBalancesInFarm.map(decodeInt)
  poolInfo = poolInfo.map((info) => web3.eth.abi.decodeParameters(['address', 'uint256', 'uint256', 'uint256'], info))
  const allocPoints = poolInfo.map((p) => new BigNumber(p[1]))

  totalAllocPoint = totalAllocPoint.map(decodeInt)
  eggPerBlock = eggPerBlock.map(decodeInt)
  rewardsMultiplier = rewardsMultiplier.map(decodeInt)

  return vaults.reduce(
    (acc, pp, index) => ({
      ...acc,
      [pp.sousId]: {
        vStakedBalance: new BigNumber(stakedBalancesInFarm[index].toString()).toJSON(),
        vPoolWeight: allocPoints[index].div(new BigNumber(totalAllocPoint[index].toString())).toJSON(),
        vsEggPerBlock: eggPerBlock[index].toString(),
        vsRewardMultiplier: parseInt(rewardsMultiplier[index].toString()),
      },
    }),
    {},
  )
}
export const fetchGuestsTotalStaking = async () => {
  const vaultShareFarmInfos = await fetchPoolsVaultShareFarmsInfo()
  let final = []
  const tikuConfig = guestPools.find((g) => g.projectName === 'Tiku')
  if (tikuConfig) {
    const tikuPool = await getTikuPool(tikuConfig)
    // console.log('tikuPool',tikuPool)
    const result = [tikuPool]

    const keys = Object.keys(vaultShareFarmInfos).map(parseInt)
    const result2 = result.map((r) => {
      if (keys.includes(r.sousId)) {
        return {
          ...r,
          vStakedBalance: vaultShareFarmInfos[r.sousId].vStakedBalance,
          vPoolWeight: vaultShareFarmInfos[r.sousId].vPoolWeight,
          vsEggPerBlock: vaultShareFarmInfos[r.sousId].vsEggPerBlock,
          vsRewardMultiplier: vaultShareFarmInfos[r.sousId].vsRewardMultiplier,
        }
      }
      return r
    })
    final = final.concat(result2)
  }

  return final
}
