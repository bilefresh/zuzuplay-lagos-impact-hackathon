'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BackButton from '@/components/common/BackButton'
import { useEffect, useState } from 'react'
import axios from '@/node_modules/axios/index'
import { apiCaller } from '@/middleware/apiService'

const newChapters = [
  {
    id: 1,
    name: 'Numbers',
    status: 'Completed',
    progress: 100,
    href: '',
  },
  {
    id: 2,
    name: 'Digits',
    status: 'In Progress',
    progress: 40,
    href: '',
  },
  {
    id: 3,
    name: 'Fractions',
    status: 'Jump Here',
    progress: 0,
    href: '',
  },
]
type Chapter = {
  id: number
  name: string,
  status: string,
  progress: number,
  href: string,
}
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-[#D6FCE6] text-[#219653]'
    case 'In Progress':
      return 'bg-[#FFF8E4] text-[#F2C94C]'
    // case 'Not Started':
    //   return 'bg-gray-500 text-white'
    default:
      return 'bg-white text-[#06113C]'
  }
}
const SubjectScreenClient = ({ params }: { params: { subjectId: string } }) => {
  const router = useRouter()
  const { subjectId } = params

  const [chapters, SetChapters] = useState<Chapter[]>([])
  useEffect(() => {
    apiCaller.get(`chapters`).then((res:any) => {
      SetChapters(res.data.data)
    })
  }, [])

  console.log(chapters)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-[#D6FCE6] text-[#219653]'
      case 'In Progress':
        return 'bg-[#FFF8E4] text-[#F2C94C]'
      default:
        return 'bg-white text-[#06113C]'
    }
  }

  return (
    <div>
      <BackButton />
      <div className="space-y-2 mt-2 font-bold">
        <p className="text-[#291B13]">Subject: {subjectId}</p>
        <p className="text-[#58514D]">Chapters</p>
      </div>
      <div className="flex flex-col justify-center space-y-5 mt-3">
        {chapters.length > 0 ? chapters.map((item, index) => (
          <div key={item.id}>
            <Link href={`/learning/${subjectId}/${item.id}`}>
              <div className={`flex flex-col rounded-lg p-3 bg-[#06113C]`}>
                <div className="flex items-center justify-between">
                  <p className="uppercase font-bold text-[#3651AB]">
                    chapter {index + 1}
                  </p>
                  <p
                    className={`${getStatusColor(
                      item.status
                    )} py-1 px-2 rounded font-semibold`}
                  >
                    {item.status}
                  </p>
                </div>
                <p className="text-md font-extrabold text-white">{item.name}</p>
                <div className="mt-2">
                  {/* <ProgressBar progress={item.progress} height={2} /> */}
                  <div
                    className={`w-full h-2.5 bg-gray-300 relative rounded-full`}
                  >
                    <div
                      className="h-full flex flex-col bg-orange-500 transition-all duration-300 rounded-full"
                      style={{ width: `${item.progress}%` }}
                    >
                      <span className="h-0.5 rounded-xl bg-[#FEA679] m-0.5 mx-2"></span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )) : <p>No Chapters Found</p>}
      </div>
    </div>
  )
}

export default SubjectScreenClient
