import { useEffect, useState, useRef } from 'react'
import Web3 from 'web3'
import { HttpProviderOptions } from 'web3-core-helpers'
import { provider as ProviderType } from 'web3-core'
import { useWallet } from 'use-wallet'
import getRpcUrl from 'utils/getRpcUrl'
import { collection, query, where, getDocs } from "firebase/firestore";
import useBlock from './useBlock'
import useDatabase from './useDatabase'

// TODO: Replace the following with your app's Firebase project configuration

/**
 * Provides a web3 instance using the provider provided by useWallet
 * with a fallback of an httpProver
 * Recreate web3 instance only if the ethereum provider change
 */
const useWebVersion = () => {
  const [ver, setVer] = useState("0")
  const block = useBlock();
  const db = useDatabase();

  useEffect(() => {

    const get = async() => {

      const q = query(collection(db, "site"), where("tag", "==", "movr"));

      const querySnapshot = await getDocs(q);
      let f = "";
      querySnapshot.forEach((doc) => {
        // doc.data() is never undefined for query doc snapshots
        // console.log(doc.id, " => ", doc.data());
        f = doc.data().version;

      });

      setVer(`${f}`);

    }
    get()
    const n = setInterval(get, 5000);
    return () => clearInterval(n);

  }, [block, db])
  

  // useEffect(() => {
  //   if (ethereum !== refEth.current) {
  //     setweb3(new Web3(ethereum || httpProvider))
  //     refEth.current = ethereum
  //   }
  // }, [ethereum])

  return ver
}

export default useWebVersion
