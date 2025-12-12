'use client'

import { useEffect, useState } from 'react'
import { Work_Sans } from 'next/font/google'

import Link from 'next/link'
import Image from 'next/image'
import avatar from '../../../assets/images/avatar.jpg'
import edit from '../../../assets/icons/edit.svg'
import userIcon from '../../../assets/icons/user.svg'
import gradeIcon from '../../../assets/icons/grade.svg'
import mailIcon from '../../../assets/icons/calendar.svg'
import subscriptionIcon from '../../../assets/icons/subscription.svg'
import { apiService } from '@/middleware/apiService'
import { getUserInfo } from '@/middleware/general'
import { format, isValid } from 'date-fns'

const workSans = Work_Sans({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-work-sans',
})
const defaultUser = getUserInfo() ? getUserInfo() : {first_name:'--', email:'--', coins:0, level:"--", last_name:'', Children:[{first_name:'--', email:'--', coins:0, level:"--", last_name:''}]};

function safeFormatDate(input: unknown, pattern: string): string {
  if (!input) return '--'
  try {
    const date = input instanceof Date ? input : new Date(String(input))
    if (!isValid(date)) return '--'
    return format(date, pattern)
  } catch {
    return '--'
  }
}
const EditProfileScreen = () => {
  const [grade, setGrade] = useState(defaultUser.Children[0].level)
  const [childName, setChildName] = useState(defaultUser.Children[0].first_name)
  const [parentName, setParentName] = useState(defaultUser.first_name + ' ' + (defaultUser.last_name ? defaultUser.last_name : ''))
  const [email, setEmail] = useState(defaultUser.email)
  const [subscription, setSubscription] = useState(
    safeFormatDate((defaultUser as any).subscription_expires, 'dd/MM/yyyy')
  )

  const handleSave = () => {
    
  }

  useEffect(() => {
    apiService.profile().then((res) => {
      setEmail(res.email);
      setParentName(res.first_name + ' ' + (res.last_name ? res.last_name : ''));
      setGrade(res.Children[0].level);
      setChildName(res.Children[0].first_name);
      setSubscription(safeFormatDate(res.subscription_expires, 'dd/MM/yyyy'));
    });
  }, []);

  return (
    <div
      className={`text-black overflow-scroll pb-20 ${workSans.variable} font-workSans`}
    >
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
          <p className="text-2xl font-bold uppercase">{childName}</p>
        </div>
      </section>
      <h1 className="text-xl font-bold mb-4">Edit Profile</h1>
      <form className="mb-6 space-y-4">
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span>Grade</span>
            <span>
              <Image src={gradeIcon} width={20} height={20} alt="" />
            </span>
          </p>
          {/* <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="block w-full p-3 border rounded"
            placeholder="Grade"
          /> */}
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="p-3 mb-4 w-full border border-gray-300 rounded text-black"
          >
            <option value="primary 1">Primary 1</option>
            <option value="primary 2">Primary 2</option>
            <option value="primary 3">Primary 3</option>
            <option value="primary 4">Primary 4</option>
            <option value="primary 5">Primary 5</option>
            <option value="primary 6">Primary 6</option>
          </select>
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span>Parent Name</span>
            <span>
              <Image src={userIcon} width={20} height={20} alt="" />
            </span>
          </p>
          <input
            type="text"
            value={parentName}
            onChange={(e) => setParentName(e.target.value)}
            className="block w-full p-3 border rounded"
            placeholder="Parent's Name"
          />
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span>Email</span>
            <span>
              <Image src={mailIcon} width={20} height={20} alt="" />
            </span>
          </p>
          <input
            type="email"
            value={email}
            // onChange={(e) => setEmail(e.target.value)}
            className="block w-full p-3 border rounded"
            placeholder="Email"
            disabled
          />
        </div>
        <div className="text-lg font-semibold">
          <p className="text-gray-700 flex items-center space-x-2">
            <span>Subscription</span>
            <span>
              <Image src={subscriptionIcon} width={20} height={20} alt="" />
            </span>
          </p>
          <input
            type="text"
            value={subscription}
            // onChange={(e) => setSubscription(e.target.value)}
            className="block w-full p-3 border rounded"
            placeholder="Subscription"
            disabled
          />
        </div>
        <button
          onClick={handleSave}
          className="block w-full p-3 border-2 border-gray-600 text-gray-600 font-bold rounded text-center"
        >
          Save
        </button>
      </form>
    </div>
  )
}

export default EditProfileScreen
