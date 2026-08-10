import { useEffect, useState } from 'react'

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const fallback = () => typeof initialValue === 'function' ? initialValue() : initialValue
    try {
      const saved = window.localStorage.getItem(key)
      return saved === null ? fallback() : JSON.parse(saved)
    } catch {
      return fallback()
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.warn(`Could not save ${key} to localStorage`, error)
    }
  }, [key, value])

  return [value, setValue]
}
