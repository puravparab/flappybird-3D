'use client'

import { useState, useEffect } from 'react'

export default function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
      const isMobileDevice = mobileRegex.test(userAgent)
      setIsMobile(isMobileDevice)
    }
    checkDevice()
    // window.addEventListener('resize', checkDevice)
    // return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return { isMobile }
}