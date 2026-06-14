import { useState, useCallback, useRef } from 'react'

const cache = new Map()
const CACHE_DURATION = 30000 // 30 seconds

export const useCache = (key, fetcher, options = {}) => {
  const { 
    duration = CACHE_DURATION,
    forceRefresh = false 
  } = options
  
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const lastFetchTime = useRef(0)

  const fetchData = useCallback(async (skipCache = false) => {
    const now = Date.now()
    const cached = cache.get(key)
    
    // Return cached data if valid
    if (!skipCache && !forceRefresh && cached && (now - cached.timestamp) < duration) {
      setData(cached.data)
      return cached.data
    }

    // Prevent too frequent requests
    if (now - lastFetchTime.current < 1000) {
      return data
    }

    setLoading(true)
    setError(null)
    lastFetchTime.current = now

    try {
      const result = await fetcher()
      setData(result)
      cache.set(key, { data: result, timestamp: now })
      return result
    } catch (err) {
      setError(err.message || 'Failed to fetch')
      throw err
    } finally {
      setLoading(false)
    }
  }, [key, fetcher, duration, forceRefresh, data])

  const invalidate = useCallback(() => {
    cache.delete(key)
  }, [key])

  const invalidateAll = useCallback(() => {
    cache.clear()
  }, [])

  return {
    data,
    loading,
    error,
    fetchData,
    invalidate,
    invalidateAll
  }
}

export default useCache
