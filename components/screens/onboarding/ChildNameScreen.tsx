'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import useFormData from '@/hooks/useFormData'
import ProgressBar from '@/components/common/ProgressBar'
import BackButton from '@/components/common/BackButton'
import Button from '@/components/common/Button'
const ChildNameScreen = () => {
  const router = useRouter()
  const [childName, setChildName] = useState('')
  const [isDisabled, setIsDisabled] = useState(true)

  const { mutate: updateFormData } = useFormData()
  const [error, setError] = useState<string | null>(null)

  const validateChildName = (name: string): boolean => {
    return name.trim().length > 0
  }

  const handleNext = useCallback(() => {
    if (!validateChildName(childName)) {
      setError('Please enter a valid child name.')
      alert(error)
      return
    }

    updateFormData({ childName })
    router.push('/onboarding/childClass')
  }, [childName, updateFormData, router, error])

  useEffect(() => {
    if (childName === '' || !validateChildName(childName)) {
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [childName])

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
        <ProgressBar progress={80} height={5} />
      </div>
      <h2 className="text-lg font-bold mb-4 text-black">
        What is the child’s name?
      </h2>
      <p className="text-sm text-gray-600 mb-4 max-w-40 text-center font-semibold">
        We are personalizing the experience for them
      </p>
      <input
        type="text"
        value={childName}
        onChange={(e) => setChildName(e.target.value)}
        placeholder="Child's Name"
        className="p-3 mb-4 w-full max-w-xs border border-gray-300 rounded text-black"
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

export default ChildNameScreen
