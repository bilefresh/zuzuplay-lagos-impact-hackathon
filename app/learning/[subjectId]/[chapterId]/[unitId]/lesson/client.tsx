'use client'
import Image from 'next/image'
import avatar from '../../../../../../assets/icons/avatar.svg'
import cancelIcon from '../../../../../../assets/icons/cancelIcon.svg'
import AskButton from '@/components/AskButton'
import ProgressBar from '@/components/common/ProgressBar'
import Button from '@/components/common/Button'
import PlainButton from '@/components/common/PlainButton'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import BackButton from '@/components/common/BackButton'
import Chapter from '@/app/learning/chapters/page'
import { apiCaller } from '@/middleware/apiService'

interface LessonContent {
  title: string
  content: string
}

interface Lesson {
  id: number
  name: string,
  status: string,
  progress: number,
  href: string,
}

const LessonPageClient = ({
  params,
}: {
  params: { subjectId: string; chapterId: string; unitId: string }
}) => {
  const router = useRouter()

  const { subjectId, chapterId, unitId } = params

  console.log(params)

  const [lessonContent, SetLesson] = useState<LessonContent[]>([])
  const [quiz, SetQuiz] = useState<Lesson[]>([])
  useEffect(() => {
    apiCaller.get(`lessons/${unitId}`).then((res:any) => {
      SetLesson(res.data.data.lessonContent)
    })
  }, [unitId])
  console.log(lessonContent)

  // Simulating lesson data
  let oldlessonContent: LessonContent[] = [
    { title: 'Word problems', content: 'lorem ipsum' },
    { title: 'Word problems 2', content: 'lorem ipsum' },
    { title: 'Word problems 3', content: 'lorem ipsum' },
    { title: 'Word problems 3', content: 'lorem ipsum' },
    { title: 'Word problems 3', content: 'lorem ipsum' },
    { title: 'Word problems 3', content: 'lorem ipsum' },
  ]

  const [currentLessonPage, setCurrentLessonPage] = useState(0)

  const handleNextLesson = () => {
    if (currentLessonPage < lessonContent.length - 1) {
      setCurrentLessonPage(currentLessonPage + 1)
    } else {
      // Navigate to quiz after completing all lessons
      router.push(
        `/learning/${subjectId}/${chapterId}/${unitId}/quiz`
      )
    }
  }

  const handlePreviousLesson = () => {
    if (currentLessonPage >= 1) {
      setCurrentLessonPage(currentLessonPage - 1)
    } else {
      // Navigate to quiz after completing all lessons
      router.push(
        `/learning/${subjectId}/${chapterId}`
      )
    }
  }

  return (
    <div className="flex flex-1 flex-col ">
      { lessonContent.length > 0 ?
      <>
      <div className="fixed inset-x-0 top-0 border-b border-black space-x-3 px-5 flex items-center justify-between bg-white z-20">
        <Image src={cancelIcon} alt={''} className="cursor-pointer"  onClick={()=>{window.location.href=`/learning/${subjectId}/${chapterId}/`}}/>
        <div className="py-2">
          <AskButton />
        </div>
      </div>

      <div className="flex w-full flex-col mt-28 z-10">
        <ProgressBar
          progress={((currentLessonPage + 1) / lessonContent.length) * 100}
          height={0}
        />{' '}
        {/* Content */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4 text-black">
            {lessonContent[currentLessonPage].title}
          </h2>
          {<div dangerouslySetInnerHTML={{__html: lessonContent[currentLessonPage].content}} />}

        </div>
      </div>
      {/* Buttons */}
      <div className="flex flex-col items-center mt-48">
        <PlainButton
          text={'Go Back'}
          handleClick={handlePreviousLesson}
        />
        <Button
          text={
            currentLessonPage < lessonContent.length - 1
              ? 'Continue'
              : 'Start Quiz'
          }
          handleNext={handleNextLesson}
        />
      </div>
      </> : <div>No Lessons Found</div>
      }
    </div>
  )
}

export default LessonPageClient
