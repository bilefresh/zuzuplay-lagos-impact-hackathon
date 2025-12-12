'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useFormData from '@/hooks/useFormData'
import ProgressBar from '@/components/common/ProgressBar'
import BackButton from '@/components/common/BackButton'
import Button from '@/components/common/Button'

const PasswordScreen = () => {
  const router = useRouter()
  const { mutate: updateFormData } = useFormData()
  const [password, setPassword] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false);
  const validatePassword = (password: string): boolean => {
    // Example validation: password must be at least 8 characters long
    return password.length >= 8
  }

  const handleNext = useCallback(() => {
    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters long.')
      alert(error)
      return
    }

    updateFormData({ password })
    router.push('/onboarding/parent-name')
  }, [password, updateFormData, router, error])

  useEffect(() => {
    if (password === '' || !validatePassword(password)) {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [password])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleNext])

  return (
    <div className="flex flex-col items-center bg-white h-screen text-black">
      <div className="w-full space-x-5 flex items-center justify-center mb-32">
        <BackButton />
        <ProgressBar progress={40} height={5} />
      </div>

      <h2 className="text-lg font-semibold mb-4 text-black">Enter Password</h2>
      <div className="relative w-full max-w-xs">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="p-3 mb-4 w-full border border-gray-300 rounded"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-3 text-gray-500"
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      {/* <button
        onClick={handleNext}
        className="p-3 w-full max-w-xs bg-orange-500 text-white rounded hover:bg-orange-600 mt-60"
      >
        Continue
      </button> */}
      <div className="w-full flex justify-center mt-60">
        <Button
          text={'Continue'}
          handleNext={handleNext}
          isDisabled={isDisabled}
        />
      </div>
    </div>
  )
}

export default PasswordScreen
