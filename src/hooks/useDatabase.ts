import { useState } from 'react'
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Replace the following with your app's Firebase project configuration

const firebaseApp = initializeApp({
  apiKey: "AIzaSyCDccKhNfnJ-rPy274s5fDkTVSpYuqTCKk",
  authDomain: "kukafe.firebaseapp.com",
  projectId: "kukafe",
  storageBucket: "kukafe.appspot.com",
  messagingSenderId: "214718155477",
  appId: "1:214718155477:web:7d49b3af1e6a886ba2705c"
});
const _db = getFirestore();
/**
 * Provides a web3 instance using the provider provided by useWallet
 * with a fallback of an httpProver
 * Recreate web3 instance only if the ethereum provider change
 */
const useDatabase = () => {
  const [db, setDb] = useState(_db)

  return db
}

export default useDatabase
