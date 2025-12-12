'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from 'react-query'
import ProgressBar from '@/components/common/ProgressBar'
import BackButton from '@/components/common/BackButton'
import useFormData, { FormDataType } from '@/hooks/useFormData'
import Button from '@/components/common/Button'
const EmailScreen = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { mutate: updateFormData } = useFormData()
  const [isDisabled, setIsDisabled] = useState(true)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /\S+@\S+\.\S+/
    return emailRegex.test(email)
  }

  useEffect(() => {
    const formData = queryClient.getQueryData<FormDataType>('formData')
    if (formData?.email) {
      setEmail(formData.email)
    }
  }, [queryClient])

  useEffect(() => {
    if (email === '' || !validateEmail(email)) {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [email])

  const handleNext = useCallback(() => {
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.')
      alert(error)
      return
    }

    updateFormData({ email })
    router.push('/onboarding/password')
  }, [email, updateFormData, router, error])

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
        <ProgressBar progress={25} height={4} />
      </div>

      <h2 className="text-lg font-semibold mb-4 text-black">
        Enter a parent{"'"}s email address
      </h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Parent's email address"
        className="p-3 mb-4 w-full max-w-xs border border-gray-300 rounded"
      />
      {/* <button
        onClick={handleNext}
        className="p-3 w-full max-w-xs bg-[#4fc3f7] text-white rounded hover:bg-orange-600 mt-60"
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

export default EmailScreen
