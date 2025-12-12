'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Button from '@/components/common/Button'
import Image from 'next/image'
import bearIcon from '../../../../../../assets/icons/ask.svg'

const ContinueLessonClient = ({
  params,
}: {
  params: { subjectId: string; chapterId: string; unitId: string }
}) => {
  const router = useRouter()
  const { subjectId, chapterId, unitId } = params

  // Check if the lesson was already started or completed
  const [lessonStarted, setLessonStarted] = useState(false)

  useEffect(() => {
    // Here you could check localStorage or an API call to check the lesson state
    const started = localStorage.getItem(`lesson_${unitId}_started`)
    if (started) {
      setLessonStarted(true)
    }
  }, [unitId])

  const handleContinue = () => {
    // If the lesson is started, continue from the first lesson page
    if (lessonStarted) {
      router.push(`/learning/${subjectId}/${chapterId}/${unitId}/lesson`)
    } else {
      // Otherwise, start the lesson from the beginning (page 1)
      localStorage.setItem(`lesson_${unitId}_started`, 'true')
      router.push(`/learning/${subjectId}/${chapterId}/${unitId}/lesson`)
    }
  }
  return (
    <div className="flex flex-col justify-center bg-white p-5 mt-28">
      {/* <div className="fixed inset-0 p-5">Hello</div> */}
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
          handleNext={handleContinue} //   handleNext={() => console.log('Continue pressed')}
        />
      </div>
    </div>
  )
}

export default ContinueLessonClient
