'use client'
import { Work_Sans } from 'next/font/google'

import Link from 'next/link'
import Image from 'next/image'
import avatar from '../../../assets/images/avatar.jpg'
import edit from '../../../assets/icons/edit.svg'
import user from '../../../assets/icons/user.svg'
import grade from '../../../assets/icons/grade.svg'
import mail from '../../../assets/icons/mail.svg'
import calendar from '../../../assets/icons/calendar.svg'
import subscription from '../../../assets/icons/subscription.svg'
import { apiService } from '@/middleware/apiService'
import { useState, useEffect } from 'react'
import { getUserInfo } from '@/middleware/general'
import moment from 'moment'

const workSans = Work_Sans({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-work-sans',
})
const defaultUser = getUserInfo();//{first_name:'--', email:'--', coins:0, level:"--", last_name:'', Children: [{first_name:'--', email:'--', coins:0, level:"--", last_name:''}]};
const ViewProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(defaultUser);
  useEffect(() => {
    apiService.profile().then((res) => {
      setUserProfile(res);
      console.log(res);
    });
  }, []);
  return (
    <div className={`text-black ${workSans.variable} font-workSans`}>
      <section className="flex items-center justify-between mb-10">
        <div className="space-x-3 flex items-center justify-center">
          {/* <Image
            src={avatar}
            width={100}
            height={50}
            className="rounded-full"
            alt=""
          /> */}
          <div className="h-16 w-16 bg-slate-500 rounded-full"></div>
          <p className="text-2xl font-bold uppercase">{userProfile ? userProfile.Children[0].first_name + ' ' + (userProfile.Children[0].last_name ? userProfile.Children[0].last_name : '') : ''}</p>
        </div>
        <Link href="/profile/edit-profile">
          <Image src={edit} alt="" width={30} height={30} />
        </Link>
      </section>

      <div className="mb-6 space-y-5">
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span className="font-normal">Grade</span>
            <span>
              <Image src={grade} width={20} height={20} alt="" />
            </span>
          </p>
          <p className="font-bold capitalize">{userProfile ? userProfile.Children[0].level : '--'}</p>
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span className="font-normal">Parent{"'"}s Name</span>
            <span>
              <Image src={user} width={20} height={20} alt="" />
            </span>
          </p>
          <p className="font-bold">{userProfile ? userProfile.first_name + ' ' + (userProfile.last_name ? userProfile.last_name : '') : '--'}</p>
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span className="font-normal">Email</span>
            <span>
              <Image src={mail} width={20} height={20} alt="" />
            </span>
          </p>
          <p className="font-bold">{userProfile ? userProfile.email : '--'}</p>
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span className="font-normal">Subscription</span>
            <span>
              <Image src={subscription} width={20} height={20} alt="" />
            </span>
          </p>
          <p className="font-bold">Free Plan</p>
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span className="font-normal">Joined At (DD/MM/YYYY)</span>
            <span>
              <Image src={calendar} width={20} height={20} alt="" />
            </span>
          </p>
          <p className="font-bold">{userProfile ? moment(userProfile.created_at).format('DD/MM/YYYY') : '--'}</p>
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span className="font-normal">Expires (DD/MM/YYYY)</span>
            <span>
              <Image src={calendar} width={20} height={20} alt="" />
            </span>
          </p>
          <p className="font-bold">{userProfile ? moment(userProfile.subscription_expires).format('DD/MM/YYYY') : '--'}</p>
        </div>
      </div>

      <button className="mt-6 block w-full p-3 border-2 border-red-500 text-red-500 rounded text-center hover:bg-red-600 hover:text-white">
        Log out
      </button>
    </div>
  )
}

export default ViewProfileScreen
