import { useEffect, useState } from 'react'
import { AbiItem } from 'web3-utils'
import { PoolCategory } from 'config/constants/types'
import vaultABI from 'config/abi/vault.json'
import poolsConfig from 'config/constants/pools'
import guestsConfig from 'config/constants/guest'
import { usePools } from 'state/hooks'
import { useWallet } from 'use-wallet'
import multicall from 'utils/multicall'
import strategyAbi from 'config/abi/strategyAbi.json'
import useRefresh from './useRefresh'
import useWeb3 from './useWeb3'
import useBlock from './useBlock'
import useRefreshJson from './useRefreshJson'

const CHAIN_ID = process.env.REACT_APP_CHAIN_ID
const useCompoundEvents = () => {
  const [events, setEvents] = useState({})
  const { account } = useWallet()
  const web3 = useWeb3()
  const { slowestRefresh } = useRefresh()
  const pools = poolsConfig
  const guest = guestsConfig
  const json = useRefreshJson()
  useEffect(() => {
    const get = async () => {
      console.log('get public vaults compound events')

      if (pools && pools.length) {
        // get strategy vault and check last compounded time.
        // const temp = pools.filter( p => !p.hidden && p.contractAddress[CHAIN_ID]);
        // console.log("pools",temp)
        const blockNumber = await web3.eth.getBlockNumber()

        const poolsActive = pools.filter(
          (p) =>
            !p.hidden &&
            p.contractAddress[CHAIN_ID] &&
            (p.poolCategory === PoolCategory.VAULT || p.poolCategory === PoolCategory.SYNTHETIX_VAULT),
        )
        const vaults1 = poolsActive.map((t) => t.contractAddress[CHAIN_ID])

        const guestActive = guest.filter((p) => !p.hidden)
        const vaults2 = guestActive.map((g) => g.contractAddress[CHAIN_ID])
        const vaults = [...vaults1, ...vaults2]

        const stratNames = [
          ...vaults.map((v) => ({
            address: v,
            name: 'strategy',
            params: [],
          })),
          ...vaults.map((v) => ({
            address: v,
            name: 'name',
            params: [],
          })),
        ]
        // console.log("stratNames",stratNames)
        const results = await multicall(vaultABI, stratNames)
        const strategies = results.slice(0, vaults.length).map((s) => s[0])
        const names = results.slice(vaults.length).map((s) => s[0])

        const desiredCompoundIntervals = vaults.map((v, i) => {
          return json[names[i]]
        })

        const compoundTimes = await Promise.all(
          strategies.map(async (s, i) => {
            const hoursBack = names[i].includes('TIKU') ? 24 : 4
            const sc = new web3.eth.Contract(strategyAbi as unknown as AbiItem, s)
            const e = await sc
              .getPastEvents('Compound', {
                fromBlock: blockNumber - (hoursBack * 3600) / 3,
                toBlock: 'latest',
              })
              .then(function (r) {
                // console.log(r) // same results as the optional callback above
                return r.map((l) => ({
                  blockNumber: l.blockNumber,
                  caller: l.returnValues.caller,
                  lpAdded: l.returnValues.lpAdded,
                }))
              })
            return e
          }),
        )
        const final = [...poolsActive, ...guestActive].reduce((acc, p, i) => {
          return {
            ...acc,
            [p.sousId]: {
              strategy: strategies[i],
              desiredCompoundInterval: desiredCompoundIntervals[i],
              compoundEvents: compoundTimes[i],
            },
          }
        }, {})

        setEvents(final)
      }
    }

    if (web3 && pools) {
      get()
    }
  }, [web3, pools, slowestRefresh, json, guest])

  return events
}

export default useCompoundEvents
