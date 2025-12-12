import Image from 'next/image'
import logo from '../../assets/icons/logo.svg'
const SplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <Image src={logo} alt={''} />
      <h1 className="text-3xl font-bold text-orange-500">Zuzuplay</h1>
    </div>
  )
}

export default SplashScreen
