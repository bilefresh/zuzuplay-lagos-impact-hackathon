'use client'
import Image from 'next/image'
import backArrow from '../../assets/icons/backArrow.svg'
import { useRouter } from 'next/navigation'

const BackButton = () => {
  const router = useRouter()
  const handleBackClick = () => {
    router.back()
  }
  return (
    <button onClick={handleBackClick} aria-label="Go back">
      <Image src={backArrow} alt={'Back'} width={30} height={30} />
    </button>
  )
}

export default BackButton
