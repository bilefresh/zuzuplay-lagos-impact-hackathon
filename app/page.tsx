'use client'

import { useEffect, useState } from 'react'
import SplashScreen from '../components/screens/SplashScreen'
import LandingScreen from '../components/screens/LandingScreen'

export default function HomePage() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  return showSplash ? <SplashScreen /> : <LandingScreen />
}
