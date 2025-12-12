import Image from 'next/image'
import ask from '../assets/icons/ask.svg'
import { useRouter } from 'next/navigation'

const AskButton = () => {
  const router = useRouter()
  const handleClick = () => {
    router.push('/ask')
  }
  return (
    <button
      onClick={handleClick}
      className="flex flex-col items-center justify-center bg-[#FFE4D7] rounded-lg p-3 w-24"
    >
      <Image src={ask} alt="" className="w-10 h-10" />
      <p className="font-bold text-[#FD6C22] text-base">Ask Zuzuplay</p>
    </button>
  )
}

export default AskButton
