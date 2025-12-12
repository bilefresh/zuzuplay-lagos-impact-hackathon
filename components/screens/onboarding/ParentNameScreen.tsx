'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useFormData from '@/hooks/useFormData'
import ProgressBar from '@/components/common/ProgressBar'
import BackButton from '@/components/common/BackButton'
import Button from '@/components/common/Button'
const ParentNameScreen = () => {
  const router = useRouter()
  const [parentName, setParentName] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)
  const { mutate: updateFormData } = useFormData()
  const [error, setError] = useState<string | null>(null)

  const validateParentName = (name: string): boolean => {
    return name.trim().length > 0
  }

  const handleNext = useCallback(() => {
    if (!validateParentName(parentName)) {
      setError('Please enter a valid parent name.')
      alert(error)
      return
    }

    updateFormData({ parentName })
    router.push('/onboarding/child-name')
  }, [parentName, updateFormData, router, error])

  useEffect(() => {
    if (parentName === '' || !validateParentName(parentName)) {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [parentName])

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
    <div className="flex flex-col items-center bg-white h-screen">
      <div className="w-full space-x-5 flex items-center justify-center mb-32">
        <BackButton />
        <ProgressBar progress={60} height={5} />
      </div>
      <h2 className="text-lg font-bold mb-4 text-black">Parent’s name?</h2>

      <input
        type="text"
        value={parentName}
        onChange={(e) => setParentName(e.target.value)}
        placeholder="Parent's Name"
        className="p-3 mb-4 w-full max-w-xs border border-gray-300 rounded text-black"
      />
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

export default ParentNameScreen
