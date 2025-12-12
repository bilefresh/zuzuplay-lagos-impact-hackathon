'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ProgressBar from '@/components/common/ProgressBar'
import BackButton from '@/components/common/BackButton'
import useFormData from '@/hooks/useFormData'
import { useQueryClient } from 'react-query'
import { FormDataType } from '@/hooks/useFormData'
import { apiService } from '@/middleware/apiService'
import { RegisterData } from '@/middleware/apiService'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Button from '@/components/common/Button'

const ClassSelectionScreen = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedClass, setSelectedClass] = useState('primary 1')

  const { mutate: updateFormData } = useFormData()

  const [error, setError] = useState<string | null>(null)

  const formData = queryClient.getQueryData<FormDataType>('formData')

  const handleNext = useCallback(() => {
    if (
      !formData?.parentName ||
      !formData?.childName ||
      !formData?.email ||
      !formData?.password
    ) {
      console.error('Missing required registration data')
      setError('Please fill in all required fields.')
      return
    }

    updateFormData(
      { childClass: selectedClass },
      {
        onSuccess: async () => {
          try {
            if (
              formData?.parentName &&
              formData?.childName &&
              formData?.email &&
              formData?.password
            ) {
              const registerData: RegisterData = {
                first_name: formData.parentName,
                child_name: formData.childName,
                email: formData.email,
                password: formData.password,
                level: selectedClass,
              }
              const response = await apiService.register(registerData)
              if (response.status === 200) {
                toast.success('Login successful')
                router.push('/learning/dashboard')
              } else {
                toast.error('Email or Password Incorrect')
              }
              console.log('Registration Successful:', response)
              router.push('/learning/dashboard')
            }
          } catch (error) {
            console.error('Registration Failed:', error)
            setError('Registration failed, please try again.')
          }
        },
      }
    )
  }, [selectedClass, updateFormData, router, formData])

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
    <div className="flex flex-col items-center">
      <div className="w-full space-x-5 flex items-center justify-center mb-24">
        <BackButton />
        <ProgressBar progress={100} height={5} />
      </div>
      <h2 className="text-2xl font-bold mb-4 text-black">
        What class is {formData?.childName} in?
      </h2>
      <p className="text-sm text-gray-600 mb-4 max-w-56 font-semibold text-center">
        We are making sure they learn at the correct grade level
      </p>
      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        className="p-3 mb-4 w-full max-w-xs border border-gray-300 rounded text-black"
      >
        <option value="primary 1">Primary 1</option>
        <option value="primary 2">Primary 2</option>
        <option value="primary 3">Primary 3</option>
        <option value="primary 4">Primary 4</option>
        <option value="primary 5">Primary 5</option>
        <option value="primary 6">Primary 6</option>
        {/* Add more options as needed */}
      </select>

      <p className="mt-36 text-sm text-gray-600 font-bold max-w-56 text-center">
        By continuing, you agree to our{' '}
        <a href="#" className="underline">
          Terms
        </a>{' '}
        and{' '}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </p>
      {/* <button
        onClick={handleNext}
        className="p-3 w-full max-w-xs bg-[#4fc3f7] text-white rounded hover:bg-orange-600 "
      >
        Continue
      </button> */}
      <div className="w-full flex justify-center mt-7">
        <Button text={'Continue'} handleNext={handleNext} isDisabled={false} />
      </div>
    </div>
  )
}

export default ClassSelectionScreen
