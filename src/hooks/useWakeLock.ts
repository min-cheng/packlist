import { useState, useCallback, useEffect } from 'react'

export function useWakeLock() {
  const [isActive, setIsActive] = useState(false)
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)

  const enable = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      const lock = await navigator.wakeLock.request('screen')
      setWakeLock(lock)
      setIsActive(true)
      lock.addEventListener('release', () => setIsActive(false))
    } catch { /* permission denied or tab hidden */ }
  }, [])

  const disable = useCallback(() => {
    wakeLock?.release()
    setWakeLock(null)
    setIsActive(false)
  }, [wakeLock])

  const toggle = useCallback(() => {
    isActive ? disable() : enable()
  }, [isActive, enable, disable])

  // Re-acquire when page becomes visible again (wake lock releases on hide)
  useEffect(() => {
    if (!isActive) return
    const handleVisible = () => { if (document.visibilityState === 'visible') enable() }
    document.addEventListener('visibilitychange', handleVisible)
    return () => document.removeEventListener('visibilitychange', handleVisible)
  }, [isActive, enable])

  return { isActive, toggle }
}
