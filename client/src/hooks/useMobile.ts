import { useEffect, useState } from 'react'

export function useMobile(): boolean {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const update = () => setMobile(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return mobile
}

export function useTablet(): boolean {
  const [tablet, setTablet] = useState(() => window.matchMedia('(min-width: 768px) and (max-width: 1024px)').matches)
  const [, setLandscape] = useState(() => window.matchMedia('(orientation: landscape)').matches)

  useEffect(() => {
    const query = window.matchMedia('(min-width: 768px) and (max-width: 1024px)')
    const update = () => {
      setTablet(query.matches)
      setLandscape(window.matchMedia('(orientation: landscape)').matches)
    }
    update()
    query.addEventListener('change', update)
    window.addEventListener('resize', update)
    return () => {
      query.removeEventListener('change', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return tablet
}
