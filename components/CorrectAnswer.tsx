import Button from './common/Button'
import Image from 'next/image'
import correct from '../assets/icons/correct.svg'

interface Answer {
  handleNext: () => void
}

const CorrectAnswer = ({ handleNext }: Answer) => {
  return (
    <div className="bg-[#F4F4F4] fixed bottom-0 left-0 right-0 p-5 space-y-3">
      <div className="flex items-center justify-between text-[#219653] font-bold ">
        <div className="flex space-x-2">
          <Image src={correct} alt={''} />
          <p>correct</p>
        </div>
        <p className="">+2 coins</p>
      </div>
      <div className="flex justify-center">
        <Button handleNext={handleNext} text={'Continue'} />
      </div>
    </div>
  )
}

export default CorrectAnswer
