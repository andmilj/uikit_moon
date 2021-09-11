import BigNumber from 'bignumber.js'
import * as investmentMath from 'investment-math'

const roundToTwoDp = (number) => Math.round(number * 100) / 100
export const calculateCakeEarnedPerThousandDollars = ({ numberOfDays, farmApy, cakePrice }) => {
  // Everything here is worked out relative to a year, with the asset compounding daily
  const timesCompounded = 365
  //   We use decimal values rather than % in the math for both APY and the number of days being calculates as a proportion of the year
  const apyAsDecimal = farmApy / 100
  const daysAsDecimalOfYear = numberOfDays / timesCompounded
  //   Calculate the starting CAKE balance with a dollar balance of $1000.
  const principal = 1000 / cakePrice

  // This is a translation of the typical mathematical compounding APY formula. Details here: https://www.calculatorsoup.com/calculators/financial/compound-interest-calculator.php
  const finalAmount = principal * (1 + apyAsDecimal / timesCompounded) ** (timesCompounded * daysAsDecimalOfYear)

  // To get the cake earned, deduct the amount after compounding (finalAmount) from the starting CAKE balance (principal)
  const interestEarned = finalAmount - principal
  return roundToTwoDp(interestEarned)
}

export const apyModalRoi = ({ amountEarned, amountInvested }) => {
  const percentage = (amountEarned / amountInvested) * 100
  return percentage.toFixed(2)
}

export const calculateAPY = ({ compoundPeriodInSecs = 360, apr }) => {
  // compound every 6 mins = 360 secs
  // 1 year has 31536000 seconds
  // interestPerPeriod = apr * compoundPeriodInSecs / 31536000

  const rate = new BigNumber(apr).multipliedBy(compoundPeriodInSecs).dividedBy(31536000)
  const time = 31536000 / compoundPeriodInSecs

  // const r = rate.dividedBy(100).plus(1).pow(time).multipliedBy(100)
  const r = investmentMath.futureValue(100, rate.toNumber(), time)

  // console.log(compoundPeriodInSecs, time, apr.toString(), rate.toNumber(), rate.toString(), r)

  // const rate = apr * compoundPeriodInSecs / 31536000
  return new BigNumber(r).minus(100)
}
export const calculateAPYday = ({ compoundPeriodInSecs = 360, apr }) => {
  // compound every 6 mins = 360 secs
  // 1 year has 86400 seconds
  // interestPerPeriod = apr * compoundPeriodInSecs / 31536000

  const rate = new BigNumber(apr).multipliedBy(compoundPeriodInSecs).dividedBy(31536000)
  const time = 86400 / compoundPeriodInSecs
  const r = investmentMath.futureValue(100, rate.toNumber(), time)

  // console.log(compoundPeriodInSecs, time, apr.toString(), rate.toNumber(), rate.toString(), r)

  // const rate = apr * compoundPeriodInSecs / 31536000
  return new BigNumber(r).minus(100)
}
