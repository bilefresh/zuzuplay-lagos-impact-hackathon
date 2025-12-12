'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import logo from '../../assets/icons/logo.svg'
import Button from '../common/Button'

const LandingScreen = () => {
  const router = useRouter()
  const handleGetStarted = () => {
    console.log('push')
    router.push('/onboarding/step1')
  }
  const handleLogin = () => {
    console.log('push')
    router.push('/login-new')
  }
  const handleThreeJSRacer = () => {
    console.log('push to threejs racer')
    router.push('/game/threejs-racer')
  }
  const handleCarRacing = () => {
    console.log('push to car racing game')
    // Navigate to car racing game with first lesson parameters
    router.push('/game/car-racing?lessonId=1&subjectId=math&lessonName=Car Racing Challenge')
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen p-5 bg-white">
      <Image src={logo} alt={''} />
      <h1 className="text-2xl font-bold text-orange-500 mb-2">Zuzuplay</h1>
      <p className="text-lg text-gray-600 mb-8">
        Unlocking the Magic of Learning
      </p>
      {/* <button
        onClick={handleGetStarted}
        className="mt-16 p-3 w-full max-w-xs bg-orange-500 text-white border-2 border-orange-600 rounded mb-4 hover:bg-orange-600"
      >
        Get Started
      </button> */}
      <button
        onClick={handleLogin}
        className="p-3 w-full max-w-xs text-black border-2 border-black rounded mb-4 hover:bg-gray-800 hover:text-white"
      >
        Log in
      </button>
      {/* <button
        onClick={handleThreeJSRacer}
        className="p-3 w-full max-w-xs bg-purple-500 text-white border-2 border-purple-600 rounded mb-4 hover:bg-purple-600"
      >
        🏎️ Three.js Racing Game
      </button>
      <button
        onClick={handleCarRacing}
        className="p-3 w-full max-w-xs bg-blue-500 text-white border-2 border-blue-600 rounded mb-4 hover:bg-blue-600"
      >
        🚗 Car Racing Challenge
      </button> */}
      {/* <button
        onClick={handleGetStarted}
        className="p-3 w-full max-w-xs bg-orange-500 text-white border-2 border-black rounded hover:bg-orange-600"
      >
        Get Started
      </button> */}
      <Button text={'Get Started'} handleNext={handleGetStarted} />
    </div>
  )
}

export default LandingScreen
