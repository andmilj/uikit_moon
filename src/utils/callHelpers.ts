import BigNumber from 'bignumber.js'
import { BLOCKS_PER_YEAR } from 'config'
import contracts from 'config/constants/contracts'
import { ethers } from 'ethers'
import useWeb3 from 'hooks/useWeb3'
import { Pool } from 'state/types'
import { getWeb3 } from './web3'

export const approve = async (lpContract, masterChefContract, account) => {
  return lpContract.methods
    .approve(masterChefContract.options.address, ethers.constants.MaxUint256)
    .send({ from: account })
}
export const approveCustomChef = async (lpContract, masterChefAddress, account) => {
  return lpContract.methods.approve(masterChefAddress, ethers.constants.MaxUint256).send({ from: account })
}
export const approve2 = async (lpContract, address, account) => {
  return lpContract.methods.approve(address, ethers.constants.MaxUint256).send({ from: account })
}
export const createVault = async (factoryContract, poolConfig: Pool, account) => {
  // console.log(poolConfig.stakingTokenAddress,
  //   poolConfig.rewardToken,
  //   poolConfig.isLP ? poolConfig.lpBaseTokenAddress : contracts.BURNADDRESS,
  //   poolConfig.underlyingMasterChef,
  //   poolConfig.poolId,
  //   poolConfig.routerForQuote,
  //   contracts.swapPathRegistry,
  // account,
  //   contracts.feeStrat,
  //   poolConfig.vaultFactoryStakingMode,
  //   poolConfig.vaultFactoryReferralMode,)
  return factoryContract.methods
    .createVault(
      poolConfig.stakingTokenAddress,
      poolConfig.rewardToken,
      poolConfig.isLP ? poolConfig.lpBaseTokenAddress : contracts.BURNADDRESS,
      poolConfig.underlyingMasterChef,
      poolConfig.poolId,
      poolConfig.routerForQuote,
      contracts.swapPathRegistry,
      account,
      contracts.feeStrat,
      poolConfig.vaultFactoryStakingMode,
      poolConfig.vaultFactoryReferralMode,
    )
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}
export const stake = async (masterChefContract, pid, amount, account, decimals=18) => {
  return masterChefContract.methods
    .deposit(pid, new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0))
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const sousStake = async (sousChefContract, amount, account, decimals=18) => {
  return sousChefContract.methods
    .deposit(new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0))
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}
export const sousPrivateStake = async (sousChefContract, amount, account, decimals=18) => {
  return sousChefContract.methods
    .userDeposit(new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0))
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const sousStakeBnb = async (sousChefContract, amount, account) => {
  return sousChefContract.methods
    .deposit()
    .send({ from: account, value: new BigNumber(amount).times(new BigNumber(10).pow(18)).toString() })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const unstake = async (masterChefContract, pid, amount, account, decimals=18) => {
  return masterChefContract.methods
    .withdraw(pid, new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0))
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const sousUnstake = async (sousChefContract, amount, account, decimals=18) => {
  return sousChefContract.methods
    .withdraw(new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0))
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}
export const customUnstake = async (masterChefContract, pid, amount, account, stakingMode, decimals=18) => {
  if (stakingMode && pid === 0) {
    return masterChefContract.methods
      .leaveStaking(new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0))
      .send({ from: account, gas: contracts.GAS_LIMIT })
      .on('transactionHash', (tx) => {
        return tx.transactionHash
      })
  }
  return masterChefContract.methods
    .withdraw(pid, new BigNumber(amount).times(new BigNumber(10).pow(decimals)).toFixed(0))
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const sousExit = async (sousChefContract, account) => {
  return sousChefContract.methods
    .exit()
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}
export const sousEntry = async (sousChefContract, account) => {
  return sousChefContract.methods
    .setExitMode(false)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}
export const sousClose = async (registry, chefAddress, account) => {
  return registry.methods
    .deregisterVault(chefAddress, true)
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}
export const sousEmegencyUnstake = async (sousChefContract, amount, account) => {
  return sousChefContract.methods
    .emergencyWithdraw()
    .send({ from: account })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const harvest = async (masterChefContract, pid, account) => {
  return masterChefContract.methods
    .deposit(pid, '0')
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const customHarvest = async (masterChefContract, pid, account, referralMode, stakingMode) => {
  if (stakingMode && pid === 0) {
    return masterChefContract.methods
      .enterStaking(pid)
      .send({ from: account, gas: contracts.GAS_LIMIT })
      .on('transactionHash', (tx) => {
        return tx.transactionHash
      })
  }
  if (referralMode) {
    return masterChefContract.methods
      .deposit(pid, '0', contracts.BURNADDRESS)
      .send({ from: account, gas: contracts.GAS_LIMIT })
      .on('transactionHash', (tx) => {
        return tx.transactionHash
      })
  }
  return masterChefContract.methods
    .deposit(pid, '0')
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const soushHarvest = async (sousChefContract, account) => {
  return sousChefContract.methods
    .deposit('0')
    .send({ from: account, gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

export const soushHarvestBnb = async (sousChefContract, account) => {
  return sousChefContract.methods
    .deposit()
    .send({ from: account, value: new BigNumber(0), gas: contracts.GAS_LIMIT })
    .on('transactionHash', (tx) => {
      return tx.transactionHash
    })
}

const web3 = getWeb3()

const getParams = (sig) => {
  const i = sig.indexOf('(')
  const j = sig.indexOf(')')
  if (i >= 0 && j >= 0) {
    return sig
      .substring(i + 1, j)
      .split(',')
      .map((s) => s.trim())
  }
  return []
}
export const getFuncData = (methodSig, params = null) => {
  if (params && params.length > 0) {
    const paramTypes = getParams(methodSig)
    return `${web3.utils.soliditySha3(methodSig).slice(0, 10)}${web3.eth.abi
      .encodeParameters(paramTypes, params)
      .slice(2)}`
  }
  return `${web3.utils.soliditySha3(methodSig).slice(0, 10)}`
}

export const decodeAddress = (d) => {
  return web3.eth.abi.decodeParameter('address', d)
}
export const decodeInt = (d) => {
  return web3.eth.abi.decodeParameter('uint256', d)
}
export const decodeBool = (d) => {
  return web3.eth.abi.decodeParameter('bool', d)
}
export const decodeString = (d) => {
  return web3.eth.abi.decodeParameter('string', d)
}
export const bucketArray = (arr, len) => {
  const result = []
  for (let i = 0; i < arr.length; i += len) {
    result.push(arr.slice(i, i + len))
  }
  return result
}

export const getCakeProfitsPerYearVs = (pools) => {
  // console.log(pools)
  return pools
    .filter((p) => p.vaultShareFarmPid >= 0)
    .reduce((acc, p) => {
      // console.log(p.vaultShareFarmPid, p.vPoolWeight)
      if (p.vPoolWeight) {
        // console.log(p.vsEggPerBlock, p.vsRewardMultiplier)
        // console.log(p.vaultShareFarmPid, p.vPoolWeight)
        const cakeRewardPerBlock = new BigNumber(p.vsEggPerBlock || 1e18)
          .dividedBy(1e18)
          .times(new BigNumber(p.vPoolWeight))
          .times(p.vsRewardMultiplier || 1)
        const cakeRewardPerYear = cakeRewardPerBlock.times(BLOCKS_PER_YEAR)
        return { ...acc, [p.sousId]: cakeRewardPerYear }
      }
      return { ...acc, [p.sousId]: new BigNumber(0) }
    }, {})
}
const nonZeroSum = (arr) => {
  return arr.reduce((acc, a, i) => acc + new BigNumber(a).toNumber(), 0) > 0
}
export const hasVaultStake = (p) => {
  if (p.userData && p.userData.stakedBalance && new BigNumber(p.userData.stakedBalance).isGreaterThan(0)) {
    return true
  }
  if (p.userData && p.userData.privatePoolInfo && p.userData.privatePoolInfo.stakedAmt) {
    return (
      p.userData.privatePoolInfo.stakedAmt.length > 0 &&
      (nonZeroSum(p.userData.privatePoolInfo.stakedAmt) || nonZeroSum(p.userData.privatePoolInfo.rewardLockedUp))
    )
  }
  if (p.userData && p.userData.stakedVsBalance) {
    return new BigNumber(p.userData.stakedVsBalance).isGreaterThan(0)
  }

  return false
}

export const getVsApy = (pool, dollarProfitsPerYearVs, getDollarValueFunc) => {
  if (!dollarProfitsPerYearVs) {
    return new BigNumber(0)
  }
  // console.log(pool, dollarProfitsPerYearVs.toString())
  let vsApy = new BigNumber(0)
  const vStakedBalance = new BigNumber(pool.vStakedBalance || 0)
  // console.log("vStakedBalance",vStakedBalance.toString(), pool)
  // console.log("dollarProfitsPerYearVs",dollarProfitsPerYearVs.toString())
  let vsStakeBalanceDollar = new BigNumber(0)
  if (pool.vaultShareFarmPid >= 0 && pool.vPoolWeight) {
    // console.log(vStakedBalance, pool.pricePerShare,pool.stakePriceAsQuoteToken)
    vsStakeBalanceDollar = getDollarValueFunc(
      vStakedBalance.multipliedBy(pool.pricePerShare).multipliedBy(pool.stakePriceAsQuoteToken).dividedBy(1e18),
      pool.lpBaseTokenAddress,
    )
    if (vsStakeBalanceDollar.isZero()) {
      vsStakeBalanceDollar = new BigNumber(3000)
    }
    // console.log("dollarProfitsPerYearVs",dollarProfitsPerYearVs.toString())
    // console.log("vsStakeBalanceDollar",vsStakeBalanceDollar.toString())
    vsApy = dollarProfitsPerYearVs.dividedBy(vsStakeBalanceDollar).multipliedBy(100)
  }
  return vsApy
}

export const hasTikuStake = (tikuPool) => {
  if (tikuPool && tikuPool.userData) {
    const stakedBalance = new BigNumber(tikuPool.userData.stakedBalance || 0)
    if (stakedBalance.isGreaterThan(0)) {
      return true
    }
  }
  if (tikuPool.vaultShareFarmPid >= 0 && tikuPool.userData && tikuPool.userData.stakedVsBalance) {
    if (new BigNumber(tikuPool.userData.stakedVsBalance).isGreaterThan(0)) {
      return true
    }
  }
  return false
}

export const findCumulativeSum = (arr) => {
  const creds = arr.reduce(
    (acc, val) => {
      const res = acc.res
      let sum = acc.sum
      sum = sum.plus(val)
      res.push(sum)
      return { sum, res }
    },
    {
      sum: new BigNumber(0),
      res: [],
    },
  )
  return creds
}

