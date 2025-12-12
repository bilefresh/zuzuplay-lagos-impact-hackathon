'use client'
import Image from 'next/image'
import avatar from '../../../assets/icons/avatar.svg'
import cancelIcon from '../../../assets/icons/cancelIcon.svg'
import AskButton from '@/components/AskButton'
import ProgressBar from '@/components/common/ProgressBar'
import Button from '@/components/common/Button'
import PlainButton from '../../common/PlainButton'
const LessonScreen = () => {
  return (
    <div>
      <div className="flex flex-col bg-white">
        {/* Header */}
        <div className="fixed inset-x-0 top-0 border-b border-black space-x-3 px-5 flex items-center justify-between bg-white z-20">
          <Image src={cancelIcon} alt={''} />
          <div className="py-2">
            <AskButton />
          </div>
        </div>
        {/* Main Content */}
        <div className="flex-1">
          <div className="flex items-center flex-col mt-28 z-10">
            <ProgressBar progress={10} height={0} />
            {/* Content */}
            <div className="mt-10">
              <h2 className="text-2xl font-bold">Erosion</h2>
              <p>
                Erosion means washing away of the top soil on the surface of the
                earth by water and wind.
              </p>
            </div>
          </div>
          {/* Buttons */}
          <div className="flex flex-col items-center mt-48">
            <PlainButton
              text={'Go Back'}
              handleClick={function (): void {
                throw new Error('Function not implemented.')
              }}
            />
            <Button
              text={'Continue'}
              handleNext={function (): void {
                throw new Error('Function not implemented.')
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LessonScreen
