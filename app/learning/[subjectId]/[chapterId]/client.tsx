'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import BackButton from '@/components/common/BackButton'
import { useEffect, useState } from 'react'
import { apiCaller } from '@/middleware/apiService'
import activeStar from '../../../../assets/icons/activeStar.svg'
import Star from '../../../../assets/icons/inactive-star.svg'

// Temporary static old units array, assuming real data will be fetched
const oldunits = [
  { id: 1, name: 'Unit 1: Introduction to Numbers' },
  { id: 2, name: 'Unit 2: Addition and Subtraction' },
]

// Type definition for the Unit
type Unit = {
  id: number
  name: string
  Lessons?: any
  completed?: boolean // Assuming we will have a completed flag
  inProgress?: boolean // To show progress
}

const ChapterScreenClient = ({
  params,
}: {
  params: { subjectId: string; chapterId: string }
}) => {
  const router = useRouter()
  const { subjectId, chapterId } = params

  // States to handle units and chapter data
  const [units, setUnits] = useState<Unit[]>([])
  const [lessonContent, setLessonContents] = useState<Unit[]>([])
  console.log(units, subjectId)

  // Fetching the chapter data with units
  useEffect(() => {
    apiCaller.get(`chapters/${chapterId}`).then((res: any) => {
      setUnits(res.data.data.Units)
      setLessonContents(res.data.data.Units)
    })
  }, [chapterId])

  return (
    <div className="px-4">
      {/* Back button */}
      <BackButton />

      {/* Header Section */}
      <div className="space-y-2 mt-2 font-bold">
        <p className="text-[#291B13]">
          Chapter {chapterId} - Subject {subjectId}
        </p>
        <p className="text-[#58514D]">Units</p>
      </div>

      {/* Units List */}
      <div className="flex flex-col space-y-6 mt-6">
        {
          units.length > 0 ? (
            units.map((unit, index) => (
              <div key={unit.id} className='flex flex-col space-y-6'>
                <div className='flex items-center'>
                  <hr className='border-[#828282] w-full mx-auto rounded-md border-2' />
                  <p className='text-md font-bold text-[#58514D] text-nowrap px-[11px]'>{unit.name}</p>
                  <hr className='border-[#828282] w-full mx-auto rounded-md border-2' />
                </div>
                {unit.Lessons.length > 0 ? (
                  lessonContent.map((unit, index) => (
                    <>

                    <div
                      key={unit.id}
                      className="flex items-center justify-center space-x-4 space-y-2"
                    >
                      {/* Progress Circle */}
                      <Link
                        href={`/learning/${subjectId}/${chapterId}/${unit.id}/continue`}
                        className={`flex items-center justify-center rounded-full `}
                      >
                        <Image
                          src={activeStar}
                          alt={unit.completed ? 'Completed' : 'Not Completed'}
                          width={60}
                          height={60}
                          // className="w-20 h-20"
                        />
                      </Link>

                      {/* Unit Title */}
                      {/* <div className="flex-1">
                        <Link
                          href={`/learning/${subjectId}/${chapterId}/${unit.id}/continue`}
                        >
                          <div className="flex flex-col">
                            <p className="text-md font-extrabold text-[#06113C]">
                              {unit.name}
                            </p>
                          </div>
                        </Link>
                      </div> */}

                      {/* Continue Button */}
                      {/* <div>
                        <Link
                          href={`/learning/${subjectId}/${chapterId}/${unit.id}/continue`}
                        >
                          <button className="p-2 bg-[#1E90FF] text-white rounded-full">
                            ▶
                          </button>
                        </Link>
                      </div> */}
                    </div>
                    </>
                  ))
                ) : (
                  <p>No Lessons Found</p>
                )}

                </div>
            ))
          ) : "()"
        }
        {lessonContent.length > 0 ? (
          lessonContent.map((unit, index) => (
            <>

            <div
              key={unit.id}
              className="flex items-center justify-center space-x-4"
            >
              {/* Progress Circle */}
              <Link
                href={`/learning/${subjectId}/${chapterId}/${unit.id}/continue`}
                className={`flex items-center justify-center rounded-full `}
              >
                <Image
                  src={activeStar}
                  alt={unit.completed ? 'Completed' : 'Not Completed'}
                  width={60}
                  height={60}
                  // className="w-20 h-20"
                />
              </Link>

              {/* Unit Title */}
              {/* <div className="flex-1">
                <Link
                  href={`/learning/${subjectId}/${chapterId}/${unit.id}/continue`}
                >
                  <div className="flex flex-col">
                    <p className="text-md font-extrabold text-[#06113C]">
                              {unit.name}
                            </p>
                          </div>
                        </Link>
                      </div> */}

              {/* Continue Button */}
              {/* <div>
                        <Link
                          href={`/learning/${subjectId}/${chapterId}/${unit.id}/continue`}
                        >
                          <button className="p-2 bg-[#1E90FF] text-white rounded-full">
                            ▶
                          </button>
                        </Link>
                      </div> */}
            </div>
            </>
          ))
        ) : (
          <p>No Lessons Found</p>
        )}
      </div>
    </div>
  )
}

export default ChapterScreenClient
