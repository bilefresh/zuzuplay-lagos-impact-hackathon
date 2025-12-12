import Button from './common/Button'
import Image from 'next/image'
import incorrect from '../assets/icons/incorrect.svg'

interface IncorrectProps {
  correctAnswer: string
  handleNext: () => void
}

const IncorrectAnswer = ({ correctAnswer, handleNext }: IncorrectProps) => {
  return (
    <div className="bg-[#F4F4F4] fixed bottom-0 left-0 right-0 p-5">
      <div className="flex flex-col text-[#EE3434] font-bold space-y-3">
        <div className="flex space-x-2">
          <Image src={incorrect} alt={''} />
          <p>Incorrect</p>
        </div>
        <p className="">Correct answer: {correctAnswer}</p>
        {/* <div className="flex flex-row  w-full ">
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit
            <span className="underline"> {correctAnswer} </span> Corporis
            recusandae dolorum id cumque, labore quis ipsam
          </p>
        </div> */}
        <div className="flex justify-center">
          <Button handleNext={handleNext} text={'Continue'} />
        </div>
      </div>
    </div>
  )
}

export default IncorrectAnswer
