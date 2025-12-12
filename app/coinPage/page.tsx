'use client';
import cancelIcon from '../../assets/icons/cancelIcon.svg'
import logo from '../../assets/icons/logo.svg'
import coin from '../../assets/images/coin.png'
import avatar from '../../assets/icons/avatar.svg'
import Image from 'next/image'
import { useEffect, useState } from 'react';
import { apiService } from '@/middleware/apiService';
const CoinPage = () => {
  const [coins, setCoins] = useState(0);
  useEffect(() => {
    apiService.profile().then((res) => {
      setCoins(res.coins);
    });
  }, []);
  return (
    <div className="flex flex-col">
      <button className="" onClick={()=>{window.location.href="/learning/dashboard"}}>
        <Image src={cancelIcon} alt={''} />
      </button>
      <div className="w-full h-24 bg-[#06113C] flex justify-center mx-auto my-5 rounded-xl">
        <Image src={avatar} alt={''} />
        {/* <div className="">
          <p className="text-white ">
            You have{' '}
            <span className="flex items-center text-[#FD6C22] font-bold text-base">
              <span>300</span>
              <Image src={coin} width={50} height={50} alt={''} />
            </span>
          </p>
        </div> */}
        <div className="ml-4 flex items-center">
          <span className="text-white font-semibold">You have</span>
          <span className="text-orange-500 font-bold mx-1">{coins}</span>
          <Image src={coin} width={50} height={50} alt={''} />
        </div>
      </div>
      <div className="mx-auto flex items-center justify-center font-bold text-center text-[#77767A] text-base max-w-36">
        <p className=""> Earn more coins buy completing lessons</p>
      </div>
      <div className="fixed -bottom-20 -left-10">
        <Image src={logo} width={300} height={300} alt={''} />
      </div>
    </div>
  )
}

export default CoinPage
