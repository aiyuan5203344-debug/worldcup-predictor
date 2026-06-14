import { useState, useEffect, useRef, useCallback } from 'react'
import api from '../services/api'

const cache = new Map()
const CACHE_TTL = 30000

export function useApi(endpoint, options = {}) {
  const { requireAuth = false, cache: useCache = true, deps = [] } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setLoading(false)
      return
    }

    const cacheKey = `${endpoint}:${requireAuth}`

    if (useCache && cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data)
        setLoading(false)
        return
      }
      cache.delete(cacheKey)
    }

    try {
      setLoading(true)
      setError(null)
      const result = await api.get(endpoint, { requireAuth })

      if (mountedRef.current) {
        setData(result)
        if (useCache) {
          cache.set(cacheKey, { data: result, timestamp: Date.now() })
        }
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err)
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [endpoint, requireAuth, useCache])

  useEffect(() => {
    mountedRef.current = true
    fetchData()
    return () => { mountedRef.current = false }
  }, [fetchData, ...deps])

  return { data, loading, error, refetch: fetchData }
}

export function useParallelApi(endpoints) {
  const [data, setData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    const fetchAll = async () => {
      try {
        setLoading(true)
        const results = await Promise.all(
          endpoints.map(async (ep) => {
            const { endpoint, requireAuth = false } = typeof ep === 'string'
              ? { endpoint: ep }
              : ep
            const cacheKey = `${endpoint}:${requireAuth}`

            if (cache.has(cacheKey)) {
              const cached = cache.get(cacheKey)
              if (Date.now() - cached.timestamp < CACHE_TTL) {
                return { key: endpoint, data: cached.data }
              }
            }

            const result = await api.get(endpoint, { requireAuth })
            cache.set(cacheKey, { data: result, timestamp: Date.now() })
            return { key: endpoint, data: result }
          })
        )

        if (mountedRef.current) {
          const map = {}
          results.forEach(r => { map[r.key] = r.data })
          setData(map)
        }
      } catch (err) {
        if (mountedRef.current) setError(err)
      } finally {
        if (mountedRef.current) setLoading(false)
      }
    }

    fetchAll()
    return () => { mountedRef.current = false }
  }, [])

  return { data, loading, error }
}

export function clearApiCache() {
  cache.clear()
}
