'use client'

import Button from '@/components/common/Button'
import Image from 'next/image'
import bearIcon from '../../../assets/icons/ask.svg'

const ContinueLesson = () => {
  return (
    <div className="flex flex-col justify-center h-screen bg-white p-5">
      <div className="fixed inset-0 p-5">Hello</div>
      {/* Bear Icon */}
      <div className="mb-4 ml-1">
        <Image src={bearIcon} alt="Bear Icon" className="w-20 h-20" />
      </div>

      {/* Speech Bubble */}
      <div className="relative bg-white border border-gray-400 rounded-lg p-4 max-w-sm text-center shadow-md">
        <p className="text-gray-800 font-bold">
          Complete the lesson and take the test to clear this level and earn
          coins
        </p>
        {/* Speech Bubble Arrow */}
        <div className="absolute top-0 left-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-gray-400 transform -translate-y-2"></div>
        <div className="absolute top-[1px] left-10 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-white transform -translate-y-2"></div>
      </div>

      {/* Continue Button */}
      <div className="mt-32 w-full max-w-xs">
        <Button
          text="Continue lesson"
          handleNext={function (): void {
            throw new Error('Function not implemented.')
          }} //   handleNext={() => console.log('Continue pressed')}
        />
      </div>
    </div>
  )
}

export default ContinueLesson
