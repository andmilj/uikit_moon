import poolsConfig from 'config/constants/pools'
import sousChefABI from 'config/abi/sousChef.json'
import { Interface } from '@ethersproject/abi'
import { AbiItem } from 'web3-utils'
import vaultABI from 'config/abi/vault.json'
import { PoolCategory, QuoteToken } from 'config/constants/types'
import routerABI from 'config/abi/router.json'
import privateVaultAbi from 'config/abi/privateVault.json'
import erc20ABI from 'config/abi/erc20.json'
import masterChefABI from 'config/abi/masterchef.json'
import vaultRegistryAbi from 'config/abi/vaultRegistry.json'
import MultiCallAbi from 'config/abi/Multicall.json'
import multicall from 'utils/multicall'
import { bucketArray, decodeInt, getFuncData } from 'utils/callHelpers'
import { getWeb3 } from 'utils/web3'
import { getMasterChefAddress, getWbnbAddress, getMulticallAddress } from 'utils/addressHelpers'
import BigNumber from 'bignumber.js'
import { BLOCKS_PER_YEAR } from 'config'
import { groupBy, propertyOf } from 'lodash'
import { calculateAPY, calculateAPYday } from 'utils/compoundApyHelpers'
import contracts from 'config/constants/contracts'
import useRefreshJson from 'hooks/useRefreshJson'
import { getDecimals, getExpDecimals, isValidBase } from 'utils/formatBalance'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

export const fetchPoolsBlockLimits = async () => {
  const poolsWithEnd = poolsConfig.filter((p) => p.sousId !== 0)
  const callsStartBlock = poolsWithEnd.map((poolConfig) => {
    return {
      address: poolConfig.contractAddress[CHAIN_ID],
      name: 'startBlock',
    }
  })
  const callsEndBlock = poolsWithEnd.map((poolConfig) => {
    return {
      address: poolConfig.contractAddress[CHAIN_ID],
      name: 'bonusEndBlock',
    }
  })

  const starts = await multicall(sousChefABI, callsStartBlock)
  const ends = await multicall(sousChefABI, callsEndBlock)

  return poolsWithEnd.map((cakePoolConfig, index) => {
    const startBlock = starts[index]
    const endBlock = ends[index]
    return {
      sousId: cakePoolConfig.sousId,
      startBlock: new BigNumber(startBlock).toJSON(),
      endBlock: new BigNumber(endBlock).toJSON(),
    }
  })
}

export const fetchPoolsInfoSynthetix = async () => {
  const pools = poolsConfig.filter((c) => !c.hidden && c.poolCategory === PoolCategory.SYNTHETIX_VAULT)
  if (pools.length === 0){
    return []
  }
  // get reward rate
  // reward duration
  const calls = pools.map((p) => {
    return [p.underlyingMasterChef, web3.utils.soliditySha3(p.rewardRateFunction).slice(0, 10)]
  })
  let results = await multi.methods.aggregate(calls).call()
  results = results[1].map((r) => web3.eth.abi.decodeParameter('uint256', r))

  return results.map((r, i) => {
    return {
      ...pools[i],
      lpToken: pools[i].stakingTokenAddress,
      synRewardRate: r.toString(),
    }
  })
}

export const fetchPoolsInfo = async () => {
  const temp = groupBy(
    poolsConfig.filter((c) => !c.hidden && c.poolCategory !== PoolCategory.SYNTHETIX_VAULT),
    function (p) {
      return p.underlyingMasterChef
    },
  )
  const poolPartitions = Object.values(temp)

  let final = []
  const nowBlock = await web3.eth.getBlockNumber()

  const masterChefsCalls = []
  poolPartitions.forEach((pp) => {
    masterChefsCalls.push([pp[0].underlyingMasterChef, web3.utils.soliditySha3(contracts.TOTALALLOCPOINT).slice(0, 10)])
    masterChefsCalls.push([pp[0].underlyingMasterChef, web3.utils.soliditySha3(pp[0].tokenPerBlockFunc).slice(0, 10)])
    masterChefsCalls.push([
      pp[0].underlyingMasterChef,
      `${web3.utils.soliditySha3('getMultiplier(uint256,uint256)').slice(0, 10)}${web3.eth.abi
        .encodeParameters(['uint256', 'uint256'], [nowBlock, nowBlock + 1])
        .slice(2)}`,
    ])
  })

  poolPartitions.forEach((pp) => {
    pp.forEach((p) => {
      masterChefsCalls.push([
        p.underlyingMasterChef,
        `${web3.utils.soliditySha3('poolInfo(uint256)').slice(0, 10)}${web3.eth.abi
          .encodeParameters(['uint256'], [p.poolId])
          .slice(2)}`,
      ])
    })
  })

  let allCalls = await multi.methods.aggregate(masterChefsCalls).call()
  allCalls = allCalls[1]
  const masterChefCommonResults = allCalls.slice(0, poolPartitions.length * 3)
  const remaining = allCalls.slice(poolPartitions.length * 3)

  const poolInfos = []

  let k = 0
  poolPartitions.forEach((pp, i) => {
    poolInfos.push(remaining.slice(k, k + pp.length))
    k += pp.length
  })

  // const masterChefInt = new Interface(masterChefABI);

  const poolCommonInfo = poolPartitions.map((pp, i) => {
    const base = {
      totalAlloc: web3.eth.abi.decodeParameter('uint256', masterChefCommonResults[3 * i]),
      emissionPerBlock: web3.eth.abi.decodeParameter('uint256', masterChefCommonResults[3 * i + 1]), // just to convert to int
      rewardMultiplier: web3.eth.abi.decodeParameter('uint256', masterChefCommonResults[3 * i + 2]), // just to convert to int
    }
    const pi = poolInfos[i].map((info) =>
      web3.eth.abi.decodeParameters(['address', 'uint256', 'uint256', 'uint256'], info),
    )
    // console.log("pi",pi)
    // console.log("base",base)
    const blockEmission = new BigNumber(base.emissionPerBlock.toString())
      .dividedBy(1e18)
      .multipliedBy(pp[0].tokenPerBlockMultiplier || 1)
    const arr = pp.map((p, index) => {
      // sanity checks
      if (p.stakingTokenAddress.toLowerCase() !== pi[index][0].toLowerCase()) {
        alert(`Error in pool config ${p.stakingTokenName}`)
        console.error('Error in pool config!', p, poolInfos[index])
      }

      return {
        ...p,
        lpToken: pi[index][0],
        allocPoint: new BigNumber(pi[index][1]).toJSON(),
        tokenPerBlock: blockEmission.toJSON(),
        totalAllocPoint: new BigNumber(base.totalAlloc.toString()).toJSON(),
        rewardMultiplier: new BigNumber(base.rewardMultiplier.toString()).toJSON(),
      }
    })
    return arr
  })

  // const promises = poolPartitions.map(async (pp,i) => {

  //   const poolInfos = await multicall(pp[0].masterChefAbi, pp.map((p) => ({
  //     address: p.underlyingMasterChef,
  //     name: 'poolInfo',
  //     params: [p.poolId],
  //   })))
  //   // console.log(poolInfos)

  //   const totalAllocPoint = await web3.eth.call({
  //     to: pp[0].underlyingMasterChef,
  //     data: web3.utils.soliditySha3(contracts.TOTALALLOCPOINT).slice(0,10)
  //   })
  //   const emissionPerBlock = await web3.eth.call({
  //     to: pp[0].underlyingMasterChef,
  //     data: web3.utils.soliditySha3(pp[0].tokenPerBlockFunc).slice(0,10)
  //   })
  //   let rewardMultiplier: any = 1;
  //   if(pp[0].underlyingMasterChef === contracts.masterChef[CHAIN_ID]){

  //     rewardMultiplier = await web3.eth.call({
  //       to: pp[0].underlyingMasterChef,
  //       data: `${web3.utils.soliditySha3("getMultiplier(uint256,uint256)").slice(0,10)}${web3.eth.abi.encodeParameters(
  //         ['uint256', 'uint256'], [nowBlock, nowBlock+1]).slice(2)}`
  //     })
  //     rewardMultiplier = new BigNumber(rewardMultiplier).toNumber()
  //     // console.log("rewardMultiplier",rewardMultiplier)
  //   }

  // const blockEmission = new BigNumber(emissionPerBlock).dividedBy(1e18).multipliedBy(pp[0].tokenPerBlockMultiplier || 1);
  //   // console.log(pp[0].projectName, new BigNumber(totalAllocPoint).toNumber(),
  //   //   new BigNumber(emissionPerBlock).dividedBy(1e18).toNumber(), blockEmission.toString())

  //   const arr = pp.map((p,index) => {
  //     // sanity checks
  //     if (p.stakingTokenAddress.toLowerCase() !== poolInfos[index].lpToken.toLowerCase()){
  //       alert(`Error in pool config ${p.stakingTokenName}`);
  //       console.error("Error in pool config!", p, poolInfos[index])
  //     }

  //     return {
  //       ...p,
  //       lpToken: poolInfos[index].lpToken,
  //       allocPoint: new BigNumber(poolInfos[index].allocPoint._hex).toJSON(),
  //       tokenPerBlock: blockEmission.toJSON(),
  //       totalAllocPoint: new BigNumber(totalAllocPoint).toJSON(),
  //       rewardMultiplier,
  //     }

  //   })

  //   return arr

  // })
  // const allResults = await Promise.all(promises);
  poolCommonInfo.forEach((r) => {
    final = final.concat(r)
  })
  // console.log("final", final)

  return final
}

const fetchPrivatePoolsTotalStakingWithBase = async (lpPrivatePoolsWithBase, sousIdToPrivateStakedBal) => {
  const calls = []

  lpPrivatePoolsWithBase.forEach((p) => {
    calls.push([
      p.lpBaseTokenAddress,
      `${web3.utils.soliditySha3('balanceOf(address)').slice(0, 10)}${web3.eth.abi
        .encodeParameters(['address'], [p.stakingTokenAddress])
        .slice(2)}`,
    ])
  })
  lpPrivatePoolsWithBase.forEach((p) => {
    calls.push([p.stakingTokenAddress, `${web3.utils.soliditySha3('totalSupply()').slice(0, 10)}`])
  })
  lpPrivatePoolsWithBase.forEach((p) => {
    calls.push([
      p.stakingTokenAddress,
      `${web3.utils.soliditySha3('balanceOf(address)').slice(0, 10)}${web3.eth.abi
        .encodeParameters(['address'], [p.underlyingMasterChef])
        .slice(2)}`,
    ])
  })
  // lpPrivatePoolsWithBase.forEach((p) => {
  //   calls.push([p.routerForQuote, `${web3.utils.soliditySha3("getAmountsOut(uint256,address[])").slice(0,10)}${web3.eth.abi.encodeParameters(
  //     ['uint256','address[]'], ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]]).slice(2)}`])
  // })

  const priceRewardCalls = lpPrivatePoolsWithBase
    .map((p) => {
      if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
        return null
      }
    const path = contracts.getQuotePath(p.rewardToken, p.lpBaseTokenAddress)
    return [
        p.routerForQuote,
        getFuncData('getAmountsOut(uint256,address[])', ['1000000000000000000', path]),
      ]
    })
    .filter((n) => n)

  let results = await multi.methods.aggregate([...calls, ...priceRewardCalls]).call()

  results = results[1]
  const l = lpPrivatePoolsWithBase.length
  const amtKCSInLps = results.slice(0, l).map((r) => web3.eth.abi.decodeParameter('uint256', r))
  const totalSupplys = results.slice(l, l * 2).map((r) => web3.eth.abi.decodeParameter('uint256', r))
  const lpInMasterchef = results.slice(l * 2, l * 3).map((r) => web3.eth.abi.decodeParameter('uint256', r))

  let prices_ = results.slice(l * 3).map((r) => web3.eth.abi.decodeParameter('uint256[]', r))
  prices_ = prices_.map(p => new BigNumber(p[p.length - 1]))

  const prices = []
  let pIndex = 0
  lpPrivatePoolsWithBase.forEach((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      prices.push(new BigNumber(1e18))
    } else {
      prices.push(prices_[pIndex])
      pIndex += 1
    }
  })

  // console.log("amtKCSInLps",amtKCSInLps)
  // console.log("totalSupplys",totalSupplys)
  // console.log("lpInMasterchef",lpInMasterchef)
  // console.log("prices",prices)
  // const amtKCSInLps = await multicall(erc20ABI, lpPrivatePoolsWithBase.map((p) => ({
  //   address: p.lpBaseTokenAddress,
  //   name: 'balanceOf',
  //   params: [p.stakingTokenAddress],
  // })))
  // // console.log("amtKCSInLps", amtKCSInLps[0].toString())

  // const totalSupplys = await multicall(erc20ABI, lpPrivatePoolsWithBase.map((p) => ({
  //   address: p.stakingTokenAddress,
  //   name: 'totalSupply',
  //   params: [],
  // })))
  // // console.log("totalSupplys", totalSupplys[0].toString())

  // const lpInMasterchef = await multicall(erc20ABI, lpPrivatePoolsWithBase.map((p) => ({
  //   address: p.stakingTokenAddress,
  //   name: 'balanceOf',
  //   params: [p.underlyingMasterChef],
  // })))
  // // console.log("lpInMasterchef", lpInMasterchef[0].toString())

  //   // find price of reward token
  // const priceOfRewardCalls = lpPrivatePoolsWithBase.map((p) => ({
  //   address: p.routerForQuote,
  //   name: 'getAmountsOut',
  //   params: ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]],
  // }))
  // let prices = await multicall(routerABI, priceOfRewardCalls)

  const lpInVault = lpPrivatePoolsWithBase.map((p) => {
    return new BigNumber(sousIdToPrivateStakedBal[p.sousId] || 0)
  })
  // console.log("lpInVault", sousIdToPrivateStakedBal, lpInVault[0].toString())

  const valueOfLpsInMasterChefInKcs = lpPrivatePoolsWithBase.map((p, i) => {
    return new BigNumber(amtKCSInLps[i].toString())
      .multipliedBy(2)
      .multipliedBy(lpInMasterchef[i].toString())
      .dividedBy(totalSupplys[i].toString())
  })
  // console.log("valueOfLpsInMasterChefInKcs", valueOfLpsInMasterChefInKcs[0].toString())

  const valueOfLpsInVaultInKcs = lpPrivatePoolsWithBase.map((p, i) => {
    return new BigNumber(amtKCSInLps[i].toString())
      .multipliedBy(2)
      .multipliedBy(lpInVault[i].toString())
      .dividedBy(totalSupplys[i].toString())
  })
  // console.log("valueOfLpsInVaultInKcs", valueOfLpsInVaultInKcs[0].toString())

  // console.log(lpInMasterchef[0].toString(), valueOfLpsInMasterChefInKcs[0].toString())

  // console.log("prices",prices)

  // console.log(prices[0].toString(),lpPrivatePoolsWithBase[0].tokenPerBlock , valueOfLpsInMasterChefInKcs[0].toString())

  const apys = lpPrivatePoolsWithBase.map((p, i) => {
    return new BigNumber(prices[i].toString())
      .multipliedBy(p.tokenPerBlock)
      .multipliedBy(p.allocPoint)
      .multipliedBy(p.rewardMultiplier)
      .multipliedBy(BLOCKS_PER_YEAR)
      .multipliedBy(1 - contracts.performanceFee)
      .dividedBy(
        new BigNumber(valueOfLpsInMasterChefInKcs[i].toString()).multipliedBy(
          1 - (p.depositFee ? p.depositFee * 0.01 : 0),
        ),
      )
      .dividedBy(p.totalAllocPoint)
      .multipliedBy(100)
  })
  // const apyscompound = lpPrivatePoolsWithBase.map((p,i) => {
  //   return calculateAPY({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apys[i]
  //   })
  // })
  // const apyscompoundday = lpPrivatePoolsWithBase.map((p,i) => {
  //   return calculateAPYday({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apys[i]
  //   })
  // })
  return [
    ...lpPrivatePoolsWithBase.map((p, index) => ({
      // ident: idents[index],
      sousId: p.sousId,
      totalStakedAsQuoteToken: valueOfLpsInVaultInKcs[index].toJSON(),
      stakePriceAsQuoteToken: valueOfLpsInMasterChefInKcs[index].dividedBy(lpInMasterchef[index]).toJSON(),
      apy: apys[index].toJSON(),
      // apyCompound: apyscompound[index].toJSON(),
      // apyCompoundDay: apyscompoundday[index].toJSON(),
    })),
  ]
}

const fetchPoolsTotalStakingTokenSyn = async (tokenPools) => {
  if (tokenPools.length === 0) {
    return []
  }

  const amtTokInMasterCalls = tokenPools.map((p) => [p.underlyingMasterChef, getFuncData('totalSupply()', [])])
  const amtTokInVaultCalls = tokenPools.map((p) => [p.contractAddress[CHAIN_ID], getFuncData('balance()', [])])
  const pricePerShareCalls = tokenPools.map((p) => [
    p.contractAddress[CHAIN_ID],
    getFuncData('getPricePerFullShare()', []),
  ])

  const priceStakingTokenCall = tokenPools
    .map((p) => {
      if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
        return null
      }
    const path = contracts.getQuotePath(p.lpBaseTokenAddress,p.stakingTokenAddress)
      return [
        p.routerForQuote,
        getFuncData('getAmountsOut(uint256,address[])', [
          '1000000000000000000',
          path,
        ]),
      ]
    })
    .filter((n) => n)

  const priceRewardCall = tokenPools
    .map((p) => {
      if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
        return null
      }
    const path = contracts.getQuotePath(p.rewardToken, p.lpBaseTokenAddress)
    return [
        p.routerForQuote,
        getFuncData('getAmountsOut(uint256,address[])', ['1000000000000000000', path]),
      ]
    })
    .filter((n) => n)

  let results = await multi.methods
    .aggregate([
      ...amtTokInMasterCalls,
      ...amtTokInVaultCalls,
      ...pricePerShareCalls,
      ...priceStakingTokenCall,
      ...priceRewardCall,
    ])
    .call()
  results = results[1]
  // console.log(results)

  let [amtTokInMaster, amtTokInVault, pricePerSharesToken] = bucketArray(
    results.slice(0, tokenPools.length * 3),
    tokenPools.length,
  )
  amtTokInMaster = amtTokInMaster.map(decodeInt)
  amtTokInVault = amtTokInVault.map(decodeInt)
  pricePerSharesToken = pricePerSharesToken.map(decodeInt)

  let pricesResults = results
    .slice(tokenPools.length * 3, tokenPools.length * 3 + priceStakingTokenCall.length + priceRewardCall.length)
    .map((p) => web3.eth.abi.decodeParameter('uint256[]', p))
  pricesResults = pricesResults.map(p => new BigNumber(p[p.length - 1]))
  // const amtTokInMaster = await multicall(erc20ABI, tokenPools.map((p) => ({
  //   address: p.underlyingMasterChef,
  //   name: 'totalSupply',
  //   params: [],
  // })))

  // const amtTokInVaultCalls = tokenPools.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'balance',
  //   params: [],
  // }))
  // const pricePerShareCalls =  tokenPools.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'getPricePerFullShare',
  //   params: [],
  // }))
  // const vaultCalls = await multicall(vaultABI,[...amtTokInVaultCalls,...pricePerShareCalls])
  // const amtTokInVault = vaultCalls.slice(0,tokenPools.length)
  // const pricePerSharesToken = vaultCalls.slice(tokenPools.length,tokenPools.length*2)

  // console.log("amtTokInVault",amtTokInVault[0].toString())
  // console.log("pricePerSharesToken",pricePerSharesToken[0].toString())

  // const priceStakingTokenCall = tokenPools.map((p) => {
  // if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()){
  //   return null;
  // }
  // return {
  //     address: p.routerForQuote,
  //     name: 'getAmountsOut',
  //     params: ["1000000000000000000",[p.stakingTokenAddress, p.lpBaseTokenAddress]],
  //   }
  // }
  // );

  // const priceRewardCall = tokenPools.map((p) => {
  // if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()){
  //   return null;
  // }
  // return {
  //   address: p.routerForQuote,
  //   name: 'getAmountsOut',
  //   params: ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]],
  // }
  // });

  // const routerCalls = await multicall(routerABI, [...priceStakingTokenCall,...priceRewardCall].filter(p=>p))
  // const pricesResults = routerCalls.map(p => p[0][1]);

  const pricesOfStakingToken = []
  const pricesOfReward = []
  let pIndex = 0
  tokenPools.forEach((p) => {
    if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      pricesOfStakingToken.push(new BigNumber(1e18))
    } else {
      pricesOfStakingToken.push(new BigNumber(1e18).dividedBy(pricesResults[pIndex]))
      pIndex += 1
    }
  })

  tokenPools.forEach((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      pricesOfReward.push(new BigNumber(1e18))
    } else {
      pricesOfReward.push(pricesResults[pIndex])
      pIndex += 1
    }
  })

  // console.log("pricesOfStakingToken",pricesOfStakingToken[0].toString())
  // console.log("pricesOfReward",pricesOfReward[0].toString())

  const apysTokenOnly = tokenPools.map((p, i) => {
    const effAmt = new BigNumber(amtTokInMaster[i].toString())
    return new BigNumber(pricesOfReward[i].toString())
      .multipliedBy(p.synRewardRate)
      .multipliedBy(86400 * 365)
      .multipliedBy(1 - contracts.performanceFee)
      .dividedBy(effAmt.multipliedBy(pricesOfStakingToken[i].toString()).dividedBy(1e18))
      .dividedBy(1e18)
      .multipliedBy(100)
  })

  // const apyscompoundTokenOnly = tokenPools.map((p,i) => {
  //   return calculateAPY({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apysTokenOnly[i]
  //   })

  // })
  // const apyscompoundTokenOnlyDay = tokenPools.map((p,i) => {
  //   return calculateAPYday({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apysTokenOnly[i]
  //   })

  // })
  const valueOfTokensInVaultInKcs = tokenPools.map((p, i) => {
    return new BigNumber(amtTokInVault[i].toString())
      .multipliedBy(new BigNumber(pricesOfStakingToken[i].toString()))
      .dividedBy(getDecimals(p.stakingTokenAddress))
  })
  // console.log("amtTokInVault",amtTokInVault[0].toString())
  // console.log("pricesOfStakingToken",pricesOfStakingToken[0].toString())
  // console.log("valueOfTokensInVaultInKcs",valueOfTokensInVaultInKcs[0].toString())

  return [
    ...tokenPools.map((p, index) => ({
      sousId: p.sousId,
      totalStakedAsQuoteToken: valueOfTokensInVaultInKcs[index].toJSON(),
      stakePriceAsQuoteToken: valueOfTokensInVaultInKcs[index].dividedBy(amtTokInVault[index]).toJSON(),
      apy: apysTokenOnly[index].toJSON(),
      // apyCompound: apyscompoundTokenOnly[index].toJSON(),
      // apyCompoundDay: apyscompoundTokenOnlyDay[index].toJSON(),
      pricePerShare: new BigNumber(pricePerSharesToken[index]).dividedBy(1e18).toJSON(),
    })),
  ]
}
const fetchPoolsTotalStakingToken = async (tokenPools) => {
  if (tokenPools.length === 0) {
    return []
  }

  const amtTokInMasterCalls = tokenPools.map((p) => [
    p.stakingTokenAddress,
    getFuncData('balanceOf(address)', [p.underlyingMasterChef]),
  ])
  const amtTokInVaultCalls = tokenPools.map((p) => [p.contractAddress[CHAIN_ID], getFuncData('balance()', [])])
  const pricePerShareCalls = tokenPools.map((p) => [
    p.contractAddress[CHAIN_ID],
    getFuncData('getPricePerFullShare()', []),
  ])

  const priceStakingTokenCall = tokenPools
    .map((p,i) => {
      if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
        return null
      }
      const b = new BigNumber(10).pow(contracts.tokenDecimals[p.lpBaseTokenAddress.toLowerCase()] || 18)
      // console.log("b",b.toString())
    const path = contracts.getQuotePath(p.lpBaseTokenAddress,p.stakingTokenAddress)
    return [
        p.routerForQuote,
        getFuncData('getAmountsOut(uint256,address[])', [
          b.toString(),
          path,
        ]),
      ]
    })
    .filter((n) => n)
  const priceRewardCall = tokenPools
    .map((p) => {
      if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
        return null
      }
      const b = new BigNumber(10).pow(contracts.tokenDecimals[p.lpBaseTokenAddress.toLowerCase()] || 18)
    const path = contracts.getQuotePath(p.lpBaseTokenAddress, p.rewardToken)
    return [
        p.routerForQuote,
        getFuncData('getAmountsOut(uint256,address[])', [b.toString(), path]),
      ]
    })
    .filter((n) => n)

  let optionalCalls;
  if (contracts.hasLaunchedFarm){
    optionalCalls = [[contracts.masterChef[CHAIN_ID], getFuncData('depositedKafe()', [])]]
    const kusPool = tokenPools.find((p) => p.projectName === 'kuswap' && p.poolId === 0)
    if (kusPool) {
      optionalCalls.push([kusPool.underlyingMasterChef, getFuncData('depositedKus()', [])])
    }

  }

  // const t1 = await multi.methods.aggregate(amtTokInMasterCalls).call()
  // const t2 = await multi.methods.aggregate(amtTokInVaultCalls).call()
  // const t3 = await multi.methods.aggregate(pricePerShareCalls).call()
  // const t4 = await multi.methods.aggregate(priceStakingTokenCall).call()
  // const t5 = await multi.methods.aggregate(priceRewardCall).call()
  // console.log(t1,t2,t3,t4,t5)
  let results = await multi.methods
    .aggregate([
      ...amtTokInMasterCalls,
      ...amtTokInVaultCalls,
      ...pricePerShareCalls,
      ...priceStakingTokenCall,
      ...priceRewardCall,
      ...optionalCalls,
    ])
    .call()
  results = results[1]
  // console.log(results)
  let [amtTokInMaster, amtTokInVault, pricePerSharesToken] = bucketArray(
    results.slice(0, tokenPools.length * 3),
    tokenPools.length,
  )
  amtTokInMaster = amtTokInMaster.map(decodeInt)
  amtTokInVault = amtTokInVault.map(decodeInt)
  pricePerSharesToken = pricePerSharesToken.map(decodeInt)

  let pricesResults = results
    .slice(tokenPools.length * 3, tokenPools.length * 3 + priceStakingTokenCall.length + priceRewardCall.length)
    .map((p) => web3.eth.abi.decodeParameter('uint256[]', p))
  pricesResults = pricesResults.map(p => new BigNumber(p[p.length - 1]))
  // const amtTokInMaster = await multicall(erc20ABI, tokenPools.map((p) => ({
  //   address: p.stakingTokenAddress,
  //   name: 'balanceOf',
  //   params: [p.underlyingMasterChef],
  // })))
  let depositedKus = 0
  let depositedKafe = 0
  if (contracts.hasLaunchedFarm){
    if (optionalCalls.length === 2) {
      depositedKus = decodeInt(results[results.length - 1]) as unknown as number
      depositedKafe = decodeInt(results[results.length - 2]) as unknown as number
    } else {
      depositedKafe = decodeInt(results[results.length - 1]) as unknown as number
    }
  }
  
  // kafe
  // const depositedKafe1 = await web3.eth.call({
  //   to: contracts.masterChef[CHAIN_ID], // contract address
  //   data: `${web3.utils.soliditySha3("depositedKafe()").slice(0,10)}`
  // })
  // const depositedKafe = web3.eth.abi.decodeParameter("uint256", depositedKafe1).toString();

  // kus
  //  const kusPool = tokenPools.find(p => p.projectName === "kuswap" && p.poolId === 0)
  //  let depositedKus;
  //  if (kusPool){
  //    const depositedKus1 = await web3.eth.call({
  //      to: kusPool.underlyingMasterChef, // contract address
  //      data: `${web3.utils.soliditySha3("depositedKus()").slice(0,10)}`
  //    })
  //    depositedKus = web3.eth.abi.decodeParameter("uint256", depositedKus1).toString();
  //  }

  // const amtTokInVaultCalls = tokenPools.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'balance',
  //   params: [],
  // }))
  // const pricePerShareCalls =  tokenPools.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'getPricePerFullShare',
  //   params: [],
  // }))
  // const vaultCalls = await multicall(vaultABI,[...amtTokInVaultCalls,...pricePerShareCalls])
  // const amtTokInVault = vaultCalls.slice(0,tokenPools.length)
  // const pricePerSharesToken = vaultCalls.slice(tokenPools.length,tokenPools.length*2)

  // console.log("amtTokInVault",amtTokInVault[0].toString())
  // console.log("pricePerSharesToken",pricePerSharesToken[0].toString())

  // const priceStakingTokenCall = tokenPools.map((p) => {
  // if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()){
  //   return null;
  // }
  // return {
  //     address: p.routerForQuote,
  //     name: 'getAmountsOut',
  //     params: ["1000000000000000000",[p.stakingTokenAddress, p.lpBaseTokenAddress]],
  //   }
  // }
  // );

  // const priceRewardCall = tokenPools.map((p) => {
  // if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()){
  //   return null;
  // }
  // return {
  //   address: p.routerForQuote,
  //   name: 'getAmountsOut',
  //   params: ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]],
  // }
  // });

  // const routerCalls = await multicall(routerABI, [...priceStakingTokenCall,...priceRewardCall].filter(p=>p))
  // const pricesResults = routerCalls.map(p => p[0][1]);

  
  // console.log("pricesResults", pricesResults[0].toString())
  const pricesOfStakingToken = []
  const pricesOfReward = []
  let pIndex = 0
  tokenPools.forEach((p) => {
    if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      pricesOfStakingToken.push(new BigNumber('1'))
    } else {
      const b = new BigNumber(10).pow(contracts.tokenDecimals[p.lpBaseTokenAddress.toLowerCase()] || 18)
      pricesOfStakingToken.push(b.dividedBy(pricesResults[pIndex].toString()))
      pIndex += 1
    }
  })

 
// 1e18 -> 6773e9
// 1e18/6773e9 -> 1

  tokenPools.forEach((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      pricesOfReward.push(new BigNumber('1'))
    } else {
      const b = new BigNumber(10).pow(contracts.tokenDecimals[p.lpBaseTokenAddress.toLowerCase()] || 18)
      pricesOfReward.push(b.dividedBy(pricesResults[pIndex].toString()))
      pIndex += 1
    }
  })

  // console.log("pricesOfStakingToken",pricesOfStakingToken[0].toString())
  // console.log("pricesOfReward",pricesOfReward[0].toString())
  // console.log("amtTokInMaster",amtTokInMaster[0].toString())
 
  const apysTokenOnly = tokenPools.map((p, i) => {
    let effAmt = new BigNumber(amtTokInMaster[i].toString())
    if (p.projectName === 'moonkafe' && p.poolId === 0) {
      effAmt = new BigNumber(depositedKafe)
      // console.log("depositedKafe1", effAmt.toString())
    } else if (p.projectName === 'kuswap' && p.poolId === 0) {
      effAmt = new BigNumber(depositedKus)
      // console.log("depositedKus", effAmt.toString())
    }
    
    // console.log(effAmt.multipliedBy(pricesOfStakingToken[i]).toString(),
    // new BigNumber(pricesOfReward[i].toString()).multipliedBy(1e18)
    //   .multipliedBy(p.tokenPerBlock)
    //   .multipliedBy(p.allocPoint)
    //   .multipliedBy(p.rewardMultiplier)
    //   .multipliedBy(BLOCKS_PER_YEAR)
    //   .multipliedBy(1 - contracts.performanceFee).dividedBy(p.totalAllocPoint).toString()
    // )
    return new BigNumber(pricesOfReward[i].toString())
      .multipliedBy(p.tokenPerBlock).multipliedBy(1e18)
      .multipliedBy(p.allocPoint)
      .multipliedBy(p.rewardMultiplier)
      .multipliedBy(BLOCKS_PER_YEAR)
      .multipliedBy(1 - contracts.performanceFee)
      .dividedBy(effAmt.multipliedBy(pricesOfStakingToken[i].toString()))
      .dividedBy(p.totalAllocPoint)
      .multipliedBy(100)
  })

  // const apyscompoundTokenOnly = tokenPools.map((p,i) => {
  //   return calculateAPY({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apysTokenOnly[i]
  //   })

  // })
  // const apyscompoundTokenOnlyDay = tokenPools.map((p,i) => {
  //   return calculateAPYday({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apysTokenOnly[i]
  //   })

  // })
  const valueOfTokensInVaultInKcs = tokenPools.map((p, i) => {

    return new BigNumber(amtTokInVault[i].toString())
      .multipliedBy(new BigNumber(pricesOfStakingToken[i].toString()))
  })
  // console.log("amtTokInVault",amtTokInVault[0].toString())
  // console.log("pricesOfStakingToken",pricesOfStakingToken[0].toString())
  // console.log("totalStakedAsQuoteToken",valueOfTokensInVaultInKcs[0].toString())
  // console.log("stakePriceAsQuoteToken",valueOfTokensInVaultInKcs[0].dividedBy(amtTokInVault[0]).multipliedBy(
  //   new BigNumber(10).pow(getDecimals(tokenPools[0].lpBaseTokenAddress) - getDecimals(tokenPools[0].stakingTokenAddress))
  // ).toJSON())
  return [
    ...tokenPools.map((p, index) => ({
      sousId: p.sousId,
      totalStakedAsQuoteToken: valueOfTokensInVaultInKcs[index].toJSON(),
      stakePriceAsQuoteToken: valueOfTokensInVaultInKcs[index].dividedBy(amtTokInVault[index]).toJSON(),
      apy: apysTokenOnly[index].toJSON(),
      // apyCompound: apyscompoundTokenOnly[index].toJSON(),
      // apyCompoundDay: apyscompoundTokenOnlyDay[index].toJSON(),
      pricePerShare: new BigNumber(pricePerSharesToken[index]).dividedBy(1e18).toJSON(),
    })),
  ]
}
const fetchPrivatePoolsTotalStakingToken = async (tokenPools, sousIdToPrivateStakedBal) => {
  if (tokenPools.length === 0) {
    return []
  }
  const amtTokInMaster = await multicall(
    erc20ABI,
    tokenPools.map((p) => ({
      address: p.stakingTokenAddress,
      name: 'balanceOf',
      params: [p.underlyingMasterChef],
    })),
  )

  // const tempKud = tokenPools.find(p => p.projectName === "kudex")
  // let depositedKud;
  // if (tempKud){
  //   const opts = {
  //     to: tempKud.underlyingMasterChef, // contract address
  //     data: `${web3.utils.soliditySha3(tempKud.depositedTokenFunc).slice(0,10)}`
  //   }
  //   // console.log(web3.utils.soliditySha3(privatePoolIdentMapping[idents[i]].pendingRewardsFunc),opts)
  //   depositedKud = await web3.eth.call(opts)
  //   depositedKud = web3.eth.abi.decodeParameter("uint256", depositedKud);
  // }

  // console.log("amtTokInMaster",amtTokInMaster[0].toString())
  // const amtTokInVault = await multicall(vaultABI, tokenPools.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'balance',
  //   params: [],
  // })))
  const amtTokInVault = tokenPools.map((p) => {
    return new BigNumber(sousIdToPrivateStakedBal[p.sousId] || 0)
  })
  // console.log("amtTokInVault",amtTokInVault[0].toString())

  const pricesOfStakingTokenCall = tokenPools.map((p) => {
    if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      return null
    }
    const path = contracts.getQuotePath(p.lpBaseTokenAddress,p.stakingTokenAddress)
    return {
      address: p.routerForQuote,
      name: 'getAmountsOut',
      params: ['1000000000000000000', path],
    }
  })

  const pricesOfRewardCall = tokenPools.map((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      return null
    }
    const path = contracts.getQuotePath(p.rewardToken, p.lpBaseTokenAddress)
    return {
      address: p.routerForQuote,
      name: 'getAmountsOut',
      params: ['1000000000000000000', path],
    }
  })

  const routerCalls = await multicall(
    routerABI,
    [...pricesOfStakingTokenCall, ...pricesOfRewardCall].filter((p) => p),
  )
  let pricesResults = routerCalls.map((p) => p[0])
  pricesResults = pricesResults.map((p) => new BigNumber(p[p.length-1]))

  const pricesOfStakingToken = []
  const pricesOfReward = []
  let pIndex = 0
  tokenPools.forEach((p) => {
    if (p.stakingTokenAddress.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      pricesOfStakingToken.push(new BigNumber(1e18))
    } else {
      pricesOfStakingToken.push(new BigNumber(1e18).dividedBy(pricesResults[pIndex]))
      pIndex += 1
    }
  })

  tokenPools.forEach((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      pricesOfReward.push(new BigNumber(1e18))
    } else {
      pricesOfReward.push(pricesResults[pIndex])
      pIndex += 1
    }
  })

  const apysTokenOnly = tokenPools.map((p, i) => {
    const effAmt = new BigNumber(amtTokInMaster[i].toString())
    // if (p.projectName === "kudex" && p.poolId === 0){
    //   effAmt = new BigNumber(depositedKud);
    // }

    return new BigNumber(pricesOfReward[i].toString())
      .multipliedBy(p.tokenPerBlock)
      .multipliedBy(p.allocPoint)
      .multipliedBy(p.rewardMultiplier)
      .multipliedBy(BLOCKS_PER_YEAR)
      .multipliedBy(1 - contracts.performanceFee)
      .dividedBy(
        effAmt
          .multipliedBy(pricesOfStakingToken[i].toString())
          .multipliedBy(1 + (p.depositFee ? p.depositFee * 0.01 : 0))
          .dividedBy(1e18),
      )
      .dividedBy(p.totalAllocPoint)
      .multipliedBy(100)
  })
  // console.log("apysTokenOnly",apysTokenOnly[0].toString())
  // console.log("reward per Year",new BigNumber(pricesOfReward[0].toString())
  // .multipliedBy(1-((tokenPools[0].depositFee) ? (tokenPools[0].depositFee*0.01) : 0))
  // .multipliedBy(tokenPools[0].tokenPerBlock).multipliedBy(tokenPools[0].allocPoint)
  //     .multipliedBy(BLOCKS_PER_YEAR).dividedBy(tokenPools[0].totalAllocPoint).toString())

  // console.log(tokenPools[0].tokenPerBlock,tokenPools[0].allocPoint,amtTokInMaster[0].toString(),pricesOfStakingToken[0].toString(),tokenPools[0].totalAllocPoint)

  // const apyscompoundTokenOnly = tokenPools.map((p,i) => {
  //   return calculateAPY({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apysTokenOnly[i]
  //   })

  // })
  // const apyscompoundTokenOnlyDay = tokenPools.map((p,i) => {
  //   return calculateAPYday({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apysTokenOnly[i]
  //   })

  // })
  const valueOfTokensInVaultInKcs = tokenPools.map((p, i) => {
    return new BigNumber(amtTokInVault[i].toString())
      .multipliedBy(new BigNumber(pricesOfStakingToken[i].toString()))
      .dividedBy(1e18)
  })
  // console.log("valueOfTokensInVaultInKcs",valueOfTokensInVaultInKcs[0].toString())
  // console.log()
  return [
    ...tokenPools.map((p, index) => ({
      sousId: p.sousId,
      totalStakedAsQuoteToken: valueOfTokensInVaultInKcs[index].toJSON(),
      stakePriceAsQuoteToken: valueOfTokensInVaultInKcs[index].dividedBy(amtTokInVault[index]).toJSON(),
      apy: apysTokenOnly[index].toJSON(),
      // apyCompound: apyscompoundTokenOnly[index].toJSON(),
      // apyCompoundDay: apyscompoundTokenOnlyDay[index].toJSON(),
    })),
  ]
}
const fetchPoolsTotalStakingWithBaseSyn = async (lpPoolsWithBase) => {
  if (lpPoolsWithBase.length === 0) {
    return []
  }

  const balanceOfCalls = lpPoolsWithBase.map((p) => [
    p.lpBaseTokenAddress,
    getFuncData('balanceOf(address)', [p.stakingTokenAddress]),
  ])
  const totalSupplyCalls = lpPoolsWithBase.map((p) => [p.stakingTokenAddress, getFuncData('totalSupply()', [])])
  const lpInMasterChefCalls = lpPoolsWithBase.map((p) => [
    p.stakingTokenAddress,
    getFuncData('balanceOf(address)', [p.underlyingMasterChef]),
  ])
  const lpInVaultCalls = lpPoolsWithBase.map((p) => [p.contractAddress[CHAIN_ID], getFuncData('balance()', [])])
  const pricePerShareCalls = lpPoolsWithBase.map((p) => [
    p.contractAddress[CHAIN_ID],
    getFuncData('getPricePerFullShare()', []),
  ])
  const priceOfRewardCalls2 = lpPoolsWithBase.map((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      return null
    }
    const path = contracts.getQuotePath(p.rewardToken, p.lpBaseTokenAddress)
    return [
      p.routerForQuote,
      getFuncData('getAmountsOut(uint256,address[])', ['1000000000000000000', path]),
    ]
  })

  let results = await multi.methods
    .aggregate([
      ...balanceOfCalls,
      ...totalSupplyCalls,
      ...lpInMasterChefCalls,
      ...lpInVaultCalls,
      ...pricePerShareCalls,
      ...priceOfRewardCalls2.filter((b) => b),
    ])
    .call()
  results = results[1]
  // console.log(results)
  let [amtUSDTInLps, totalSupplys2, lpInMasterchef2, lpInVault2, pricePerShares2] = bucketArray(
    results.slice(0, lpPoolsWithBase.length * 5),
    lpPoolsWithBase.length,
  )
  amtUSDTInLps = amtUSDTInLps.map(decodeInt)
  totalSupplys2 = totalSupplys2.map(decodeInt)
  lpInMasterchef2 = lpInMasterchef2.map(decodeInt)
  lpInVault2 = lpInVault2.map(decodeInt)
  pricePerShares2 = pricePerShares2.map(decodeInt)

  // const balanceOfCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.lpBaseTokenAddress,
  //   name: 'balanceOf',
  //   params: [p.stakingTokenAddress],
  // }))
  // const totalSupplyCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.stakingTokenAddress,
  //   name: 'totalSupply',
  //   params: [],
  // }))
  // const lpInMasterChefCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.stakingTokenAddress,
  //   name: 'balanceOf',
  //   params: [p.underlyingMasterChef],
  // }))
  // console.log("start")
  // const resultsOfErc20call = await multicall(erc20ABI, [...balanceOfCalls, ...totalSupplyCalls,...lpInMasterChefCalls])
  // console.log("end")

  // const amtUSDTInLps = resultsOfErc20call.slice(0, lpPoolsWithBase.length);
  // const totalSupplys2 = resultsOfErc20call.slice(lpPoolsWithBase.length, lpPoolsWithBase.length*2);
  // const lpInMasterchef2 = resultsOfErc20call.slice(lpPoolsWithBase.length*2, lpPoolsWithBase.length*3);

  // console.log("amtBaseInLps", amtUSDTInLps[0].toString())
  // console.log("totalSupplys", totalSupplys2[0].toString())
  // console.log("lpInMasterchef", lpInMasterchef2[0].toString())

  // const lpInVaultCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'balance',
  //   params: [],
  // }))

  // const pricePerShareCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'getPricePerFullShare',
  //   params: [],
  // }))
  // const vaultCalls = await multicall(vaultABI, [...lpInVaultCalls,...pricePerShareCalls]);
  // const lpInVault2 = vaultCalls.slice(0, lpPoolsWithBase.length);
  // const pricePerShares2 = vaultCalls.slice(lpPoolsWithBase.length, lpPoolsWithBase.length*2);
  // console.log("lpInVault2", lpInVault2[0].toString())

  const valueOfLpsInMasterChefInUSDT = lpPoolsWithBase.map((p, i) => {
    return new BigNumber(amtUSDTInLps[i].toString())
      .multipliedBy(2)
      .multipliedBy(lpInMasterchef2[i].toString())
      .dividedBy(totalSupplys2[i].toString())
  })
  // console.log("valueOfLpsInMasterChefInBase", valueOfLpsInMasterChefInUSDT[0].toString())

  const valueOfLpsInVaultInUSDT = lpPoolsWithBase.map((p, i) => {
    return new BigNumber(amtUSDTInLps[i].toString())
      .multipliedBy(2)
      .multipliedBy(lpInVault2[i].toString())
      .dividedBy(totalSupplys2[i].toString())
  })
  // console.log("valueOfLpsInVaultInBase", valueOfLpsInVaultInUSDT[0].toString())
  // 2762 // so many kus in the lp
  // 443
  // 2675
  // 891 KUS in vault
  // console.log(lpInMasterchef[0].toString(), valueOfLpsInMasterChefInKcs[0].toString())
  // find price of reward token
  // const priceOfRewardCalls2 = lpPoolsWithBase.map((p) => (
  //   {
  //   address: p.routerForQuote,
  //   name: 'getAmountsOut',
  //   params: ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]],
  // }))
  // let prices2 = await multicall(routerABI, priceOfRewardCalls2)
  // prices2 = prices2.map(p => p[0][1]);

  // const priceOfRewardCalls2 = lpPoolsWithBase.map((p) => {
  //   if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()){
  //     return null;
  //   }
  //   return {
  //     address: p.routerForQuote,
  //     name: 'getAmountsOut',
  //     params: ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]],
  //   }

  // })
  let prices2_ = results.slice(lpPoolsWithBase.length * 5) // await multicall(routerABI, priceOfRewardCalls2.filter(p=>p))
  prices2_ = prices2_.map((p) => web3.eth.abi.decodeParameter('uint256[]', p))
  prices2_ = prices2_.map((p) => new BigNumber(p[p.length-1]))

  const prices2 = []
  let pIndex = 0
  lpPoolsWithBase.forEach((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      prices2.push(new BigNumber(1e18))
    } else {
      prices2.push(prices2_[pIndex])
      pIndex += 1
    }
  })

  // console.log("prices2",new BigNumber(prices2[0].toString()).multipliedBy(10).dividedBy(1e18).toString())
  // apy
  const apys2 = lpPoolsWithBase.map((p, i) => {
    // console.log(prices2[i].toString(), p.allocPoint, p.rewardMultiplier, p.totalAllocPoint)
    return new BigNumber(prices2[i].toString())
      .multipliedBy(p.synRewardRate)
      .multipliedBy(86400 * 365)
      .multipliedBy(1 - contracts.performanceFee)
      .dividedBy(new BigNumber(valueOfLpsInMasterChefInUSDT[i].toString()))
      .dividedBy(1e18)
      .multipliedBy(100)
  })

  // console.log("apys2",apys2[0].toString())
  return lpPoolsWithBase.map((p, index) => ({
    sousId: p.sousId,
    totalStakedAsQuoteToken: valueOfLpsInVaultInUSDT[index].toJSON(),
    stakePriceAsQuoteToken: valueOfLpsInVaultInUSDT[index].dividedBy(lpInVault2[index]).toJSON(),
    apy: apys2[index].toJSON(),
    // apyCompound: apyscompound2[index].toJSON(),
    // apyCompoundDay: apyscompound2Day[index].toJSON(),
    pricePerShare: new BigNumber(pricePerShares2[index]).dividedBy(1e18).toJSON(),
  }))
}

const fetchPoolsTotalStakingWithBase = async (lpPoolsWithBase) => {
  if (lpPoolsWithBase.length === 0) {
    return []
  }

  const balanceOfCalls = lpPoolsWithBase.map((p) => [
    p.lpBaseTokenAddress,
    getFuncData('balanceOf(address)', [p.stakingTokenAddress]),
  ])
  const totalSupplyCalls = lpPoolsWithBase.map((p) => [p.stakingTokenAddress, getFuncData('totalSupply()', [])])
  const lpInMasterChefCalls = lpPoolsWithBase.map((p) => [
    p.stakingTokenAddress,
    getFuncData('balanceOf(address)', [p.underlyingMasterChef]),
  ])
  const lpInVaultCalls = lpPoolsWithBase.map((p) => [p.contractAddress[CHAIN_ID], getFuncData('balance()', [])])
  const pricePerShareCalls = lpPoolsWithBase.map((p) => [
    p.contractAddress[CHAIN_ID],
    getFuncData('getPricePerFullShare()', []),
  ])
  const priceOfRewardCalls2 = lpPoolsWithBase.map((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      return null
    }
    const path = contracts.getQuotePath(p.rewardToken, p.lpBaseTokenAddress)
    return [
      p.routerForQuote,
      getFuncData('getAmountsOut(uint256,address[])', ['1000000000000000000', path]),
    ]
  })

  let results = await multi.methods
    .aggregate([
      ...balanceOfCalls,
      ...totalSupplyCalls,
      ...lpInMasterChefCalls,
      ...lpInVaultCalls,
      ...pricePerShareCalls,
      ...priceOfRewardCalls2.filter((b) => b),
    ])
    .call()
  results = results[1]
  let [amtUSDTInLps, totalSupplys2, lpInMasterchef2, lpInVault2, pricePerShares2] = bucketArray(
    results.slice(0, lpPoolsWithBase.length * 5),
    lpPoolsWithBase.length,
  )
  amtUSDTInLps = amtUSDTInLps.map(decodeInt)
  totalSupplys2 = totalSupplys2.map(decodeInt)
  lpInMasterchef2 = lpInMasterchef2.map(decodeInt)
  lpInVault2 = lpInVault2.map(decodeInt)
  pricePerShares2 = pricePerShares2.map(decodeInt)

  // const balanceOfCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.lpBaseTokenAddress,
  //   name: 'balanceOf',
  //   params: [p.stakingTokenAddress],
  // }))
  // const totalSupplyCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.stakingTokenAddress,
  //   name: 'totalSupply',
  //   params: [],
  // }))
  // const lpInMasterChefCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.stakingTokenAddress,
  //   name: 'balanceOf',
  //   params: [p.underlyingMasterChef],
  // }))
  // console.log("start")
  // const resultsOfErc20call = await multicall(erc20ABI, [...balanceOfCalls, ...totalSupplyCalls,...lpInMasterChefCalls])
  // console.log("end")

  // const amtUSDTInLps = resultsOfErc20call.slice(0, lpPoolsWithBase.length);
  // const totalSupplys2 = resultsOfErc20call.slice(lpPoolsWithBase.length, lpPoolsWithBase.length*2);
  // const lpInMasterchef2 = resultsOfErc20call.slice(lpPoolsWithBase.length*2, lpPoolsWithBase.length*3);
  // console.log('stakingtoken', lpPoolsWithBase[0].stakingTokenAddress)
  // console.log('amtBaseInLps', amtUSDTInLps[0].toString())
  // console.log('totalSupplys', totalSupplys2[0].toString())
  // console.log('lpInMasterchef', lpInMasterchef2[0].toString())

  // const lpInVaultCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'balance',
  //   params: [],
  // }))

  // const pricePerShareCalls = lpPoolsWithBase.map((p) => ({
  //   address: p.contractAddress[CHAIN_ID],
  //   name: 'getPricePerFullShare',
  //   params: [],
  // }))
  // const vaultCalls = await multicall(vaultABI, [...lpInVaultCalls,...pricePerShareCalls]);
  // const lpInVault2 = vaultCalls.slice(0, lpPoolsWithBase.length);
  // const pricePerShares2 = vaultCalls.slice(lpPoolsWithBase.length, lpPoolsWithBase.length*2);
  // console.log('lpInVault2', lpInVault2[0].toString())
  // console.log('pricePerShares2', pricePerShares2[0].toString())

  const valueOfLpsInMasterChefInUSDT = lpPoolsWithBase.map((p, i) => {
    return new BigNumber(amtUSDTInLps[i].toString())
      .multipliedBy(2)
      .multipliedBy(lpInMasterchef2[i].toString())
      .dividedBy(totalSupplys2[i].toString())
  })
  // console.log('valueOfLpsInMasterChefInBase', valueOfLpsInMasterChefInUSDT[0].toString())

  const valueOfLpsInVaultInUSDT = lpPoolsWithBase.map((p, i) => {
    return new BigNumber(amtUSDTInLps[i].toString())
      .multipliedBy(2)
      .multipliedBy(lpInVault2[i].toString())
      .dividedBy(totalSupplys2[i].toString())
  })
  // console.log('valueOfLpsInVaultInBase', valueOfLpsInVaultInUSDT[0].toString())
  // 2762 // so many kus in the lp
  // 443
  // 2675
  // 891 KUS in vault
  // console.log(lpInMasterchef[0].toString(), valueOfLpsInMasterChefInKcs[0].toString())
  // find price of reward token
  // const priceOfRewardCalls2 = lpPoolsWithBase.map((p) => (
  //   {
  //   address: p.routerForQuote,
  //   name: 'getAmountsOut',
  //   params: ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]],
  // }))
  // let prices2 = await multicall(routerABI, priceOfRewardCalls2)
  // prices2 = prices2.map(p => p[0][1]);

  // const priceOfRewardCalls2 = lpPoolsWithBase.map((p) => {
  //   if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()){
  //     return null;
  //   }
  //   return {
  //     address: p.routerForQuote,
  //     name: 'getAmountsOut',
  //     params: ["1000000000000000000",[p.rewardToken, p.lpBaseTokenAddress]],
  //   }

  // })
  let prices2_ = results.slice(lpPoolsWithBase.length * 5) // await multicall(routerABI, priceOfRewardCalls2.filter(p=>p))
  prices2_ = prices2_.map((p) => web3.eth.abi.decodeParameter('uint256[]', p))
  prices2_ = prices2_.map((p) => new BigNumber(p[p.length - 1]))


  const prices2 = []
  let pIndex = 0
  lpPoolsWithBase.forEach((p) => {
    if (p.rewardToken.toLowerCase() === p.lpBaseTokenAddress.toLowerCase()) {
      prices2.push(new BigNumber(1e18))
    } else {
      prices2.push(prices2_[pIndex])
      pIndex += 1
    }
  })

  const apys2 = lpPoolsWithBase.map((p, i) => {
    // console.log(prices2[i].toString(), p.tokenPerBlock, p.allocPoint, p.rewardMultiplier, p.totalAllocPoint)
    return new BigNumber(prices2[i].toString())
      .multipliedBy(p.tokenPerBlock)
      .multipliedBy(p.allocPoint)
      .multipliedBy(p.rewardMultiplier)
      .multipliedBy(BLOCKS_PER_YEAR)
      .multipliedBy(1 - contracts.performanceFee)
      .dividedBy(new BigNumber(valueOfLpsInMasterChefInUSDT[i].toString()))
      .dividedBy(p.totalAllocPoint)
      .multipliedBy(100)
  })
  // 4.94 * 10512000 * 0.21 / 190828
  // console.log("apys2",apys2[0].toString())

  // const apyscompound2 = lpPoolsWithBase.map((p,i) => {
  //   return calculateAPY({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apys2[i]
  //   })

  // })
  // const apyscompound2Day = lpPoolsWithBase.map((p,i) => {
  //   return calculateAPYday({
  //     compoundPeriodInSecs: contracts.compoundPeriodInSecs,
  //     apr: apys2[i]
  //   })

  // })
  // console.log("apyscompound2",apyscompound2[0].toString())
  // console.log("apyscompound2Day",apyscompound2Day[0].toString())

  return [
    ...lpPoolsWithBase.map((p, index) => ({
      sousId: p.sousId,
      totalStakedAsQuoteToken: valueOfLpsInVaultInUSDT[index].toJSON(),
      stakePriceAsQuoteToken: valueOfLpsInMasterChefInUSDT[index].dividedBy(lpInMasterchef2[index]).toJSON(),
      apy: apys2[index].toJSON(),
      // apyCompound: apyscompound2[index].toJSON(),
      // apyCompoundDay: apyscompound2Day[index].toJSON(),
      pricePerShare: new BigNumber(pricePerShares2[index]).dividedBy(1e18).toJSON(),
    })),
  ]
}

export const fetchPoolsVaultShareFarmsInfo = async () => {
  const vaults = poolsConfig.filter((p) => !p.hidden && p.vaultShareFarmPid >= 0)
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
export const getPrivateVaultTVL = async (privatePoolConfigs) => {
  if (privatePoolConfigs.length === 0) {
    return {}
  }
  const idents = privatePoolConfigs.map((p) => {
    return web3.utils.sha3(
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
    )
  })
  // console.log(privatePoolConfigs)
  // console.log(idents)
  // get TVL
  let vaultsPerIndent = await multicall(
    vaultRegistryAbi,
    idents.map((ident, i) => {
      return {
        address: contracts.vaultRegistry,
        name: 'getVaultsByIdent',
        params: [ident],
      }
    }),
  )
  vaultsPerIndent = vaultsPerIndent.map((v) => v[0])
  let calls = []
  vaultsPerIndent.forEach((_vList) => {
    calls = calls.concat(
      _vList.map((_v) => ({
        address: _v,
        name: 'balanceOf',
        params: [],
      })),
    )
  })
  const balancesAcrossIdents = await multicall(privateVaultAbi, calls)
  let j = 0
  const identBalances = vaultsPerIndent.map((_vList) => {
    const balances = balancesAcrossIdents.slice(j, j + _vList.length)
    j += _vList.length

    const final = balances.reduce((acc, b, index) => {
      return acc.plus(new BigNumber(b.toString()))
    }, new BigNumber(0))
    return final
  })
  // console.log(identBalances)
  // const identBalances = await Promise.all(vaultsPerIndent.map(async(_vList, i) => {
  //   // per ident, sum up tvl
  //   const balances = await multicall(privateVaultAbi, _vList.map((_v) => ({
  //     address: _v,
  //     name: 'balanceOf',
  //     params: [],
  //   })))
  //   // console.log(balances.map(b => b.toString()))
  //   const final = balances.reduce( (acc, b, index) => {
  //     return acc.plus(new BigNumber(b.toString()))
  //   }, new BigNumber(0))
  //   return final
  // }));
  // console.log(identBalances.map(b => b.toString()))

  return privatePoolConfigs.reduce(
    (acc, pp, index) => ({
      ...acc,
      [pp.sousId]: identBalances[index].toString(),
    }),
    {},
  )
}

export const fetchPoolsTotalStatking = async () => {
  const t0_ = Date.now()
  // console.log("fetchPoolsTotalStatking")

  const poolInfos = await fetchPoolsInfo()
  const t0 = Date.now()
  const poolInfosSyn = await fetchPoolsInfoSynthetix()
  const t1 = Date.now()
  // console.log("fetchPoolsTotalStatking1")
  const vaultShareFarmInfos = await fetchPoolsVaultShareFarmsInfo()
  // console.log("vaultShareFarmInfos",vaultShareFarmInfos)
  const t2 = Date.now()
  // console.log("fetchPoolsTotalStatking2")

  const lpPoolsWithBase = poolInfos.filter(
    (p) => p.poolCategory === PoolCategory.VAULT && p.isLP && isValidBase(p.lpBaseTokenAddress),
  )
  const temp1 = await fetchPoolsTotalStakingWithBase(lpPoolsWithBase)
  const t3 = Date.now()
  // console.log("fetchPoolsTotalStatking3")

  // const lpPoolsWithKCSBase = poolInfos.filter(p => !p.hidden && p.poolCategory===PoolCategory.VAULT &&  p.isLP && p.lpBaseTokenAddress.toLowerCase()===contracts.WMOVR.toLowerCase());
  // const temp1 = await fetchPoolsTotalStakingKCSBase(lpPoolsWithKCSBase);

  const tokenPools = poolInfos.filter((p) => p.poolCategory === PoolCategory.VAULT && !p.isLP)
  const temp2 = await fetchPoolsTotalStakingToken(tokenPools)
  const t4 = Date.now()
  // console.log("fetchPoolsTotalStatking4")

  // ============================ synethix farming contract
  const lpPoolsWithBaseSyn = poolInfosSyn.filter((p) => p.isLP && isValidBase(p.lpBaseTokenAddress))
  const temp1syn = await fetchPoolsTotalStakingWithBaseSyn(lpPoolsWithBaseSyn)
  const t5 = Date.now()
  // // console.log("fetchPoolsTotalStatking3")

  // // const lpPoolsWithKCSBase = poolInfos.filter(p => !p.hidden && p.poolCategory===PoolCategory.VAULT &&  p.isLP && p.lpBaseTokenAddress.toLowerCase()===contracts.WMOVR.toLowerCase());
  // // const temp1 = await fetchPoolsTotalStakingKCSBase(lpPoolsWithKCSBase);

  const tokenPoolsSyn = poolInfosSyn.filter((p) => !p.isLP)
  const temp2syn = await fetchPoolsTotalStakingTokenSyn(tokenPoolsSyn)
  const t6 = Date.now()
  // // console.log("fetchPoolsTotalStatking4")

  // const lpPoolsWithUSDTBase = poolInfos.filter(p => !p.hidden && p.poolCategory===PoolCategory.VAULT && p.isLP && p.lpBaseTokenAddress.toLowerCase()===contracts.USDT.toLowerCase());
  // const temp3 = await fetchPoolsTotalStakingUSDTBase(lpPoolsWithUSDTBase);

  // const lpPoolsWithUSDCBase = poolInfos.filter(p => !p.hidden && p.poolCategory===PoolCategory.VAULT && p.isLP && p.lpBaseTokenAddress.toLowerCase()===contracts.USDC.toLowerCase());
  // const temp3b = await fetchPoolsTotalStakingUSDCBase(lpPoolsWithUSDCBase);

  // ======================= private pools ======================

  const sousIdToPrivateStakedBal = await getPrivateVaultTVL(
    poolInfos.filter((p) => !p.hidden && p.poolCategory === PoolCategory.PRIVATEVAULT),
  )
  const t7 = Date.now()

  const lpPrivatePoolsWithBase = poolInfos.filter(
    (p) => p.poolCategory === PoolCategory.PRIVATEVAULT && p.isLP && isValidBase(p.lpBaseTokenAddress),
  )
  const temp4 = await fetchPrivatePoolsTotalStakingWithBase(lpPrivatePoolsWithBase, sousIdToPrivateStakedBal)
  const t8 = Date.now()
  // console.log("fetchPoolsTotalStatking5")

  const privateTokenPools = poolInfos.filter(
    (p) => p.poolCategory === PoolCategory.PRIVATEVAULT && !p.isLP && isValidBase(p.lpBaseTokenAddress),
  )
  const temp5 = await fetchPrivatePoolsTotalStakingToken(privateTokenPools, sousIdToPrivateStakedBal)
  const t9 = Date.now()
  // console.log("fetchPoolsTotalStatking6")
  // const lpPrivatePoolsWithKCSBase = poolInfos.filter(p => !p.hidden && p.poolCategory===PoolCategory.PRIVATEVAULT &&  p.isLP && p.lpBaseTokenAddress.toLowerCase()===contracts.WMOVR.toLowerCase());
  // const temp4 = await fetchPrivatePoolsTotalStakingKCSBase(lpPrivatePoolsWithKCSBase,sousIdToPrivateStakedBal);

  // const lpPrivatePoolsWithUSDTBase = poolInfos.filter(p => !p.hidden && p.poolCategory===PoolCategory.PRIVATEVAULT &&  p.isLP && p.lpBaseTokenAddress.toLowerCase()===contracts.USDT.toLowerCase());
  // const temp5 = await fetchPrivatePoolsTotalStakingUSDTBase(lpPrivatePoolsWithUSDTBase,sousIdToPrivateStakedBal);

  // const lpPrivatePoolsWithUSDCBase = poolInfos.filter(p => !p.hidden && p.poolCategory===PoolCategory.PRIVATEVAULT &&  p.isLP && p.lpBaseTokenAddress.toLowerCase()===contracts.USDC.toLowerCase());
  // const temp6 = await fetchPrivatePoolsTotalStakingUSDCBase(lpPrivatePoolsWithUSDCBase,sousIdToPrivateStakedBal);

  // for (let t of temp4){
  //   if (sousIdToStakedBal[t.sousId]){
  //     t.privateStakedBal = sousIdToStakedBal[t.sousId]
  //   }
  // }

  // const tokenPools = poolsConfig.filter(p => !p.hidden && p.poolCategory===PoolCategory.VAULT && !p.isLP);
  // const temp2 = await fetchPoolsTotalStakingToken(tokenPools);

  // const lpPoolsWithUSDTBase = poolsConfig.filter(p => !p.hidden && p.poolCategory===PoolCategory.VAULT && p.isLP && p.lpBaseTokenAddress.toLowerCase()==="0x0039f574ee5cc39bdd162e9a88e3eb1f111baf48".toLowerCase());
  // const temp3 = await fetchPoolsTotalStakingUSDTBase(lpPoolsWithUSDTBase);

  // console.log('t0-t0_', t0 - t0_)
  // console.log('t1-t0', t1 - t0)
  // console.log('t2-t1', t2 - t1)
  // console.log('t3-t2', t3 - t2)
  // console.log('t4-t3', t4 - t3)
  // console.log('t5-t4', t5 - t4)
  // console.log('t6-t5', t6 - t5)
  // console.log('t7-t6', t7 - t6)
  // console.log('t8-t7', t8 - t7)
  // console.log('t9-t8', t9 - t8)
  const result = [...temp1, ...temp2, ...temp4, ...temp5, ...temp1syn, ...temp2syn]

  const keys = Object.keys(vaultShareFarmInfos).map((i) => parseInt(i))
  // console.log("vsKeys", keys)
  // console.log("fetchPoolsTotalStatkingEnd")
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
  // console.log("result2",result2)
  return result2
}
