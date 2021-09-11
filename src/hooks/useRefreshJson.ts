import { useEffect, useState } from 'react'

const useRefreshJson = () => {
  const [json, setJson] = useState({})

  useEffect(() => {
    const fetchFile = async () => {
      const resp = await fetch('./json/refresh.json')
      const _json = await resp.json()
      setJson(_json)
    }
    fetchFile()
  }, [])

  return json as any
}

export default useRefreshJson
