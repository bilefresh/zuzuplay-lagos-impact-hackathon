'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation' // Use usePathname instead of useRouter

// Importing both regular and active icons
import homeIcon from '../../assets/icons/home.svg'
import homeIconActive from '../../assets/icons/home-active.svg'
import rewardsIcon from '../../assets/icons/rewards.svg'
import rewardsIconActive from '../../assets/icons/rewards-active.svg'
import askIcon from '../../assets/icons/ask.svg'
import analyticsIcon from '../../assets/icons/analytics.svg'
import analyticsIconActive from '../../assets/icons/analytics-active.svg'
import profileIcon from '../../assets/icons/profile.svg'
import profileIconActive from '../../assets/icons/profile-active.svg'

const Footer = () => {
  const pathname = usePathname() // Get the current pathname

  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-md border-t flex justify-around">
      <Link href="/learning/dashboard" className="flex flex-col items-center">
        <Image
          src={pathname === '/learning/dashboard' ? homeIconActive : homeIcon}
          alt="Home"
          width={24}
          height={24}
        />
        <span
          className={`mt-1 text-sm ${
            pathname === '/learning/dashboard'
              ? 'text-orange-500'
              : 'text-gray-700 hover:text-orange-500'
          }`}
        >
          Home
        </span>
      </Link>

      <Link href="/rewards" className="flex flex-col items-center">
        <Image
          src={pathname === '/rewards' ? rewardsIconActive : rewardsIcon}
          alt="Rewards"
          width={24}
          height={24}
        />
        <span
          className={`mt-1 text-sm ${
            pathname === '/rewards'
              ? 'text-orange-500'
              : 'text-gray-700 hover:text-orange-500'
          }`}
        >
          Rewards
        </span>
      </Link>

      <Link href="/ask" className="flex flex-col items-center">
        <Image src={askIcon} alt="Ask" width={24} height={24} />
        <span
          className={`mt-1 text-sm ${
            pathname === '/ask'
              ? 'text-orange-500'
              : 'text-gray-700 hover:text-orange-500'
          }`}
        >
          Ask
        </span>
      </Link>

      <Link href="/analytics" className="flex flex-col items-center">
        <Image
          src={pathname === '/analytics' ? analyticsIconActive : analyticsIcon}
          alt="Analytics"
          width={24}
          height={24}
        />
        <span
          className={`mt-1 text-sm ${
            pathname === '/analytics'
              ? 'text-orange-500'
              : 'text-gray-700 hover:text-orange-500'
          }`}
        >
          Analytics
        </span>
      </Link>

      <Link href="/profile/view-profile" className="flex flex-col items-center">
        <Image
          src={
            pathname === '/profile/view-profile' ||
            pathname === '/profile/edit-profile'
              ? profileIconActive
              : profileIcon
          }
          alt="Profile"
          width={24}
          height={24}
        />
        <span
          className={`mt-1 text-sm ${
            pathname === '/profile/view-profile' ||
            pathname === '/profile/edit-profile'
              ? 'text-orange-500'
              : 'text-gray-700 hover:text-orange-500'
          }`}
        >
          Profile
        </span>
      </Link>
    </footer>
  )
}

export default Footer
