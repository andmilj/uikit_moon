import { useContext } from 'react'
import { RefreshContext } from 'contexts/RefreshContext'

const useRefresh = () => {
  const { fast, slow, slowest } = useContext(RefreshContext)
  return { fastRefresh: fast, slowRefresh: slow, slowestRefresh: slowest }
}

export default useRefresh
