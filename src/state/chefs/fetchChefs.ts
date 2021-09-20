import { decodeAddress, decodeInt, getFuncData } from 'utils/callHelpers'
import MultiCallAbi from 'config/abi/Multicall.json'
import { AbiItem } from 'web3-utils'
import { getWeb3 } from 'utils/web3'
import BigNumber from 'bignumber.js'
import chefConfig, { ChefType } from 'config/constants/chefs'
import { getMulticallAddress } from 'utils/addressHelpers'
import contracts from 'config/constants/contracts'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const web3 = getWeb3()
const multi = new web3.eth.Contract(MultiCallAbi as unknown as AbiItem, getMulticallAddress())

const fetchChefs = async (account) => {
  console.log('do fetch chefs')

  const chefInfo = await _fetchChefs()
  const chefInfoSyn = await _fetchSynChefs()
  const userInfo1 = await _fetchChefsUser(account, chefInfo)
  const userInfo2 = await _fetchSynChefsUser(account, chefInfoSyn)

  const temp1 = Object.keys(chefInfo).map((chefId) => {
    return {
      chefId,
      ...chefInfo[chefId],
      userData: userInfo1[chefId],
    }
  })
  const temp2 = Object.keys(chefInfoSyn).map((chefId) => {
    return {
      chefId,
      ...chefInfoSyn[chefId],
      userData: userInfo2[chefId],
    }
  })
  const results = [...temp1, ...temp2]
  console.log("fetchChefs",results);
  return results;
}
export const _fetchSynChefsUser = async (account: string, chefInfo: any) => {
  if (!account) {
    return chefInfo
  }
  if (!chefInfo) {
    return chefInfo
  }
  // if(!chefInfo[chefConfig[0].chefId]){
  //   return;
  // }
  const _config = chefConfig.filter(c => c.type === ChefType.MASTERCHEF_SYNTHETIX)

  const calls = []
  _config.forEach((cc) => {
    const farmInfo = chefInfo[cc.chefId]
    // allowances
    cc.poolContracts.forEach((pc) => {
      calls.push([
        farmInfo.pools[pc].lpToken,
        getFuncData('allowance(address,address)', [account, pc]),
      ])
      calls.push([farmInfo.pools[pc].lpToken, getFuncData('balanceOf(address)', [account])])
      calls.push([pc, getFuncData('balanceOf(address)', [account])])
      calls.push([pc, getFuncData(cc.pendingRewardsSignature, [account])])
    })
  })

  let callResults = await multi.methods.aggregate(calls).call()
  callResults = callResults[1]
  let crIndex = 0

  const final = {}
  _config.forEach((cc) => {
    final[cc.chefId] = {}
    // const farmInfo = chefInfo[cc.chefId]
    cc.poolContracts.forEach((pc) => {
      const userData: any = {}
      userData.allowance = decodeInt(callResults[crIndex])
      userData.tokenBalance = decodeInt(callResults[crIndex+1])
      userData.stakedBalance = decodeInt(callResults[crIndex+2])
      userData.earnings = decodeInt(callResults[crIndex+3])
      final[cc.chefId][pc] = userData
      crIndex += 4
    })
  })
  return final
}


export const _fetchChefsUser = async (account: string, chefInfo: any) => {
  if (!account) {
    return chefInfo
  }
  if (!chefInfo) {
    return chefInfo
  }
  // if(!chefInfo[chefConfig[0].chefId]){
  //   return;
  // }
  const _config = chefConfig.filter(c => c.type === ChefType.MASTERCHEF)

  const calls = []
  _config.forEach((cc) => {
    const farmInfo = chefInfo[cc.chefId]
    // allowances
    cc.poolIds.forEach((pid) => {
      calls.push([
        farmInfo.pools[pid].lpToken,
        getFuncData('allowance(address,address)', [account, cc.masterchefAddress]),
      ])
      calls.push([farmInfo.pools[pid].lpToken, getFuncData('balanceOf(address)', [account])])
      calls.push([cc.masterchefAddress, getFuncData('userInfo(uint256,address)', [pid, account])])
      calls.push([cc.masterchefAddress, getFuncData(cc.pendingRewardsSignature, [pid, account])])
    })
  })

  let callResults = await multi.methods.aggregate(calls).call()
  callResults = callResults[1]
  let crIndex = 0

  const final = {}
  _config.forEach((cc) => {
    final[cc.chefId] = {}
    // const farmInfo = chefInfo[cc.chefId]
    cc.poolIds.forEach((pid) => {
      const userData: any = {}
      userData.allowance = web3.eth.abi.decodeParameter('uint256', callResults[crIndex])
      userData.tokenBalance = web3.eth.abi.decodeParameter('uint256', callResults[crIndex + 1])
      userData.stakedBalance = web3.eth.abi.decodeParameter('uint256', callResults[crIndex + 2])
      userData.earnings = web3.eth.abi.decodeParameter('uint256', callResults[crIndex + 3])
      final[cc.chefId][pid] = userData
      crIndex += 4
    })
  })
  return final
}



const _fetchSynChefs = async () => {
  
  const results = {}
  const calls = []
  const _config = chefConfig.filter(c => c.type === ChefType.MASTERCHEF_SYNTHETIX)

  // get basic info
  _config.forEach((cc) => {
    
    if (cc.poolContracts){
      cc.poolContracts.forEach(pc => {
        calls.push([pc, getFuncData(cc.perBlockSignature, null)])
        calls.push([pc, getFuncData("stakingToken()", null)])
      })
    }
  })
  let callResults = await multi.methods.aggregate(calls).call()
  callResults = callResults[1]
  let crIndex = 0

  _config.forEach((cc) => {
    if (cc.poolContracts){
      const b: any = {
        pools: {},
      }

      cc.poolContracts.forEach(pc => {
        const pool: any = {
          pid: pc
        }
        pool.perBlock = decodeInt(callResults[crIndex]);
        pool.lpToken = decodeAddress(callResults[crIndex + 1]);
        crIndex += 2
        
        b.pools[pc] = pool;
      })

      results[cc.chefId] = { ...cc, ...b }


    }
  })
  console.log("results", results)
  // resolve lp pairings

  const calls2 = []

  _config.forEach(async (cc) => {
    cc.poolContracts.forEach(async (pc) => {
      const lpAddress = results[cc.chefId].pools[pc].lpToken
      results[cc.chefId].factories.forEach(async (f1) => {
        calls2.push([contracts.HELPER, getFuncData('getLpInfo(address,address)', [lpAddress, f1])])
      })
    })
  })
  // console.log(calls2)
  let callResults2 = await multi.methods.aggregate(calls2).call({ gasLimit: 5000000 })
  callResults2 = callResults2[1]
  crIndex = 0

  _config.forEach((cc) => {
    cc.poolContracts.forEach((pc, i) => {
      const b = results[cc.chefId].pools[pc]

      results[cc.chefId].factories.forEach((fac) => {
        const r = web3.eth.abi.decodeParameters(
          ['bool', 'address', 'address', 'address', 'string', 'string'],
          callResults2[crIndex],
        )
        crIndex += 1

        if (!b.token) {
          // if not assigned yet
          b.isLP = r[0]
          b.token = r[1]
          b.baseToken = r[2]
          b.quoteLp = r[3]
          b.tokString = r[4]
          b.quoteString = r[5]
        } else if (!b.isLP && b.baseToken === contracts.BURNADDRESS) {
          // assigned already, but no base found
          b.baseToken = r[2]
          b.quoteLp = r[3]
          b.tokString = r[4]
          b.quoteString = r[5]
        }
      })
    })
  })


  const calls3 = []

  _config.forEach((cc) => {
    cc.poolContracts.forEach((pc, i) => {
      const isLP = results[cc.chefId].pools[pc].isLP
      const tokAddress = results[cc.chefId].pools[pc].token
      const quoteAddress = results[cc.chefId].pools[pc].baseToken // might not work for all cases
      const lpAddress = results[cc.chefId].pools[pc].lpToken
      const quoteLpAddress = results[cc.chefId].pools[pc].quoteLp

      if (isLP) {
        calls3.push([tokAddress, getFuncData('balanceOf(address)', [lpAddress])])
        calls3.push([quoteAddress, getFuncData('balanceOf(address)', [lpAddress])])
        calls3.push([lpAddress, getFuncData('balanceOf(address)', [pc])])
        calls3.push([lpAddress, getFuncData('totalSupply()')])
        calls3.push([tokAddress, getFuncData('decimals()')])
        calls3.push([quoteAddress, getFuncData('decimals()')])
      } else {
        calls3.push([tokAddress, getFuncData('balanceOf(address)', [quoteLpAddress])])
        calls3.push([quoteAddress, getFuncData('balanceOf(address)', [quoteLpAddress])])
        calls3.push([tokAddress, getFuncData('balanceOf(address)', [pc])])
        calls3.push([quoteLpAddress, getFuncData('totalSupply()')])
        calls3.push([tokAddress, getFuncData('decimals()')])
        calls3.push([quoteAddress, getFuncData('decimals()')])
      }
    })
  })

  let callResults3 = await multi.methods.aggregate(calls3).call()
  callResults3 = callResults3[1]
  crIndex = 0
  _config.forEach((cc) => {
    cc.poolContracts.forEach((pc, i) => {
      const b = results[cc.chefId].pools[pc]
      b.tokenBalanceLP = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex])
      b.quoteTokenBlanceLP = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 1])
      b.lpTokenBalanceMC = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 2])
      b.lpTotalSupply = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 3])
      b.tokenDecimals = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 4])
      b.quoteTokenDecimals = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 5])
      crIndex += 6
    })
  })

  _config.forEach((cc) => {
    cc.poolContracts.forEach((pc, i) => {
      const b = results[cc.chefId].pools[pc]
      const { tokenBalanceLP, quoteTokenBlanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals } =
        b
      // const [info, totalAllocPoint] = [
      //   results[cc.chefId].pools[pc],
      // ]
      const info = b;

      let tokenAmount
      let lpTotalInQuoteToken
      let tokenPriceVsQuote
      let depositedLp

      if (!b.isLP) {
        tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals))
        depositedLp = tokenAmount
        tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(10).pow(quoteTokenDecimals)).div(
          new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)))
        lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote)
      } else {
        // Ratio in % a LP tokens that are in staking, vs the total number in circulation
        const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
        depositedLp = lpTokenBalanceMC
        // console.log("lpTokenRatio",lpTokenRatio.toString())
        // Total value in staking in quote token value
        lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteTokenDecimals))
          .times(new BigNumber(2))
          .times(lpTokenRatio)

        // console.log("lpTotalInQuoteToken",lpTotalInQuoteToken.toString())

        // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
        tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)
        const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteTokenDecimals))
          .times(lpTokenRatio)
        // console.log("tokenAmount",tokenAmount.toString())

        if (tokenAmount.comparedTo(0) > 0) {
          tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount)
          // console.log("tokenPriceVsQuote1",tokenPriceVsQuote.toString())
        } else {
          tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
          // console.log("tokenPriceVsQuote2",tokenPriceVsQuote.toString())
        }
      }


      //   const cakeRewardPerBlock = new BigNumber(results[cc.chefId].perBlock || 1).times(results[cc.chefId].rewardsMultiplier || 1).div(new BigNumber(10).pow(18))
      // const cakeRewardPerYear = cakeRewardPerBlock.times(BLOCKS_PER_YEAR)

      results[cc.chefId].pools[pc] = {
        ...results[cc.chefId].pools[pc],
        tokenAmount: tokenAmount.toJSON(),
        // quoteTokenAmount: quoteTokenAmount,
        lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
        tokenPriceVsQuote: tokenPriceVsQuote.toJSON(),
        depositedLp: new BigNumber(depositedLp).toJSON(),
      }
    })
  })
  return results;
} 

const _fetchChefs = async () => {
  const nowBlock = await web3.eth.getBlockNumber()

  // get info about each chef
  const results = {}
  const calls = []
  const _config = chefConfig.filter(c => c.type === ChefType.MASTERCHEF)
  _config.forEach((cc) => {
    calls.push([cc.masterchefAddress, getFuncData('totalAllocPoint()', null)])
    calls.push([cc.masterchefAddress, getFuncData(cc.perBlockSignature, null)])
    calls.push([cc.masterchefAddress, getFuncData('getMultiplier(uint256,uint256)', [nowBlock, nowBlock + 1])])

    if (cc.depositedCakeSignature) {
      calls.push([cc.masterchefAddress, getFuncData(cc.depositedCakeSignature, null)])
    }

    cc.poolIds.forEach((pid) => {
      calls.push([cc.masterchefAddress, getFuncData('poolInfo(uint256)', [pid])])
    })
    // given lptokens, find out the rest.
  })
  let callResults = await multi.methods.aggregate(calls).call()
  callResults = callResults[1]
  let crIndex = 0

  _config.forEach((cc) => {
    const b: any = {}
    b.totalAllocPoint = web3.eth.abi.decodeParameter('uint256', callResults[crIndex])
    b.perBlock = web3.eth.abi.decodeParameter('uint256', callResults[crIndex + 1])
    b.rewardsMultiplier = web3.eth.abi.decodeParameter('uint256', callResults[crIndex + 2])
    crIndex += 3

    if (cc.depositedCakeSignature) {
      b.depositedCake = web3.eth.abi.decodeParameter('uint256', callResults[crIndex])
      crIndex += 1
    }
    // 02233816198275673
    b.pools = {}
    // console.log(b)
    cc.poolIds.forEach((pid, i) => {
      const temp = cc.hasDepositFee
        ? web3.eth.abi.decodeParameters(
            ['address', 'uint256', 'uint256', 'uint256', 'uint256'],
            callResults[crIndex + i],
          )
        : web3.eth.abi.decodeParameters(['address', 'uint256'], callResults[crIndex + i])
      b.pools[pid] = {
        pid,
        lpToken: temp[0],
        allocPoint: temp[1],
        depositFee: cc.hasDepositFee ? temp[4] / 100 : 0,
      }
    })
    results[cc.chefId] = { ...cc, ...b }
    crIndex += cc.poolIds.length
  })
  // resolve pairings of all the lptokens
  const calls2 = []

  _config.forEach(async (cc) => {
    cc.poolIds.forEach(async (pid) => {
      const lpAddress = results[cc.chefId].pools[pid].lpToken
      results[cc.chefId].factories.forEach(async (f1) => {
        calls2.push([contracts.HELPER, getFuncData('getLpInfo(address,address)', [lpAddress, f1])])
      })
    })
  })
  // console.log(calls2)
  let callResults2 = await multi.methods.aggregate(calls2).call({ gasLimit: 5000000 })
  callResults2 = callResults2[1]
  crIndex = 0

  _config.forEach((cc) => {
    cc.poolIds.forEach((pid, i) => {
      const b = results[cc.chefId].pools[pid]
      results[cc.chefId].factories.forEach((fac) => {
        const r = web3.eth.abi.decodeParameters(
          ['bool', 'address', 'address', 'address', 'string', 'string'],
          callResults2[crIndex],
        )
        crIndex += 1

        if (!b.token) {
          // if not assigned yet
          b.isLP = r[0]
          b.token = r[1]
          b.baseToken = r[2]
          b.quoteLp = r[3]
          b.tokString = r[4]
          b.quoteString = r[5]
        } else if (!b.isLP && b.baseToken === contracts.BURNADDRESS) {
          // assigned already, but no base found
          b.baseToken = r[2]
          b.quoteLp = r[3]
          b.tokString = r[4]
          b.quoteString = r[5]
        }
      })
    })
  })

  const calls3 = []

  _config.forEach((cc) => {
    cc.poolIds.forEach((pid, i) => {
      const isLP = results[cc.chefId].pools[pid].isLP
      const tokAddress = results[cc.chefId].pools[pid].token
      const quoteAddress = results[cc.chefId].pools[pid].baseToken // might not work for all cases
      const lpAddress = results[cc.chefId].pools[pid].lpToken
      const quoteLpAddress = results[cc.chefId].pools[pid].quoteLp

      if (isLP) {
        calls3.push([tokAddress, getFuncData('balanceOf(address)', [lpAddress])])
        calls3.push([quoteAddress, getFuncData('balanceOf(address)', [lpAddress])])
        calls3.push([lpAddress, getFuncData('balanceOf(address)', [cc.masterchefAddress])])
        calls3.push([lpAddress, getFuncData('totalSupply()')])
        calls3.push([tokAddress, getFuncData('decimals()')])
        calls3.push([quoteAddress, getFuncData('decimals()')])
      } else {
        calls3.push([tokAddress, getFuncData('balanceOf(address)', [quoteLpAddress])])
        calls3.push([quoteAddress, getFuncData('balanceOf(address)', [quoteLpAddress])])
        calls3.push([tokAddress, getFuncData('balanceOf(address)', [cc.masterchefAddress])])
        calls3.push([quoteLpAddress, getFuncData('totalSupply()')])
        calls3.push([tokAddress, getFuncData('decimals()')])
        calls3.push([quoteAddress, getFuncData('decimals()')])
      }
    })
  })

  let callResults3 = await multi.methods.aggregate(calls3).call()
  callResults3 = callResults3[1]
  crIndex = 0
  _config.forEach((cc) => {
    cc.poolIds.forEach((pid, i) => {
      const b = results[cc.chefId].pools[pid]
      b.tokenBalanceLP = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex])
      b.quoteTokenBlanceLP = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 1])
      b.lpTokenBalanceMC = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 2])
      b.lpTotalSupply = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 3])
      b.tokenDecimals = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 4])
      b.quoteTokenDecimals = web3.eth.abi.decodeParameter('uint256', callResults3[crIndex + 5])
      crIndex += 6
    })
  })

  _config.forEach((cc) => {
    cc.poolIds.forEach((pid, i) => {
      const b = results[cc.chefId].pools[pid]
      const { tokenBalanceLP, quoteTokenBlanceLP, lpTokenBalanceMC, lpTotalSupply, tokenDecimals, quoteTokenDecimals } =
        b
      const [info, totalAllocPoint, depositedKafe] = [
        results[cc.chefId].pools[pid],
        results[cc.chefId].totalAllocPoint,
        results[cc.chefId].depositedCake,
      ]

      let tokenAmount
      let lpTotalInQuoteToken
      let tokenPriceVsQuote
      let depositedLp

      if (!b.isLP) {
        if (new BigNumber(depositedKafe).isGreaterThan(0) && pid === 0) {
          tokenAmount = new BigNumber(depositedKafe).div(new BigNumber(10).pow(tokenDecimals))
        } else {
          tokenAmount = new BigNumber(lpTokenBalanceMC).div(new BigNumber(10).pow(tokenDecimals))
        }
        depositedLp = tokenAmount
        tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(10).pow(quoteTokenDecimals)).div(
          new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)))
        lpTotalInQuoteToken = tokenAmount.times(tokenPriceVsQuote)
      } else {
        // Ratio in % a LP tokens that are in staking, vs the total number in circulation
        const lpTokenRatio = new BigNumber(lpTokenBalanceMC).div(new BigNumber(lpTotalSupply))
        depositedLp = lpTokenBalanceMC
        // console.log("lpTokenRatio",lpTokenRatio.toString())
        // Total value in staking in quote token value
        lpTotalInQuoteToken = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteTokenDecimals))
          .times(new BigNumber(2))
          .times(lpTokenRatio)

        // console.log("lpTotalInQuoteToken",lpTotalInQuoteToken.toString())

        // Amount of token in the LP that are considered staking (i.e amount of token * lp ratio)
        tokenAmount = new BigNumber(tokenBalanceLP).div(new BigNumber(10).pow(tokenDecimals)).times(lpTokenRatio)
        const quoteTokenAmount = new BigNumber(quoteTokenBlanceLP)
          .div(new BigNumber(10).pow(quoteTokenDecimals))
          .times(lpTokenRatio)
        // console.log("tokenAmount",tokenAmount.toString())

        if (tokenAmount.comparedTo(0) > 0) {
          tokenPriceVsQuote = quoteTokenAmount.div(tokenAmount)
          // console.log("tokenPriceVsQuote1",tokenPriceVsQuote.toString())
        } else {
          tokenPriceVsQuote = new BigNumber(quoteTokenBlanceLP).div(new BigNumber(tokenBalanceLP))
          // console.log("tokenPriceVsQuote2",tokenPriceVsQuote.toString())
        }
      }

      const allocPoint = new BigNumber(info.allocPoint)
      const poolWeight = allocPoint.div(new BigNumber(totalAllocPoint))

      //   const cakeRewardPerBlock = new BigNumber(results[cc.chefId].perBlock || 1).times(results[cc.chefId].rewardsMultiplier || 1).div(new BigNumber(10).pow(18))
      // const cakeRewardPerYear = cakeRewardPerBlock.times(BLOCKS_PER_YEAR)

      results[cc.chefId].pools[pid] = {
        ...results[cc.chefId].pools[pid],
        tokenAmount: tokenAmount.toJSON(),
        // quoteTokenAmount: quoteTokenAmount,
        lpTotalInQuoteToken: lpTotalInQuoteToken.toJSON(),
        tokenPriceVsQuote: tokenPriceVsQuote.toJSON(),
        poolWeight: poolWeight.toNumber(),
        multiplier: `${allocPoint.div(100).toString()}X`,
        depositedLp: new BigNumber(depositedLp).toJSON(),
      }
    })
  }) 
  // console.log(results)
  return results
  // Object.keys(results).map(chefId => {
  //   return {
  //     chefId,
  //     ...results[chefId],
  //   }
  // });
}

export default fetchChefs
