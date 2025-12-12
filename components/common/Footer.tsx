"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Importing both regular and active icons
import homeIcon from "../../assets/icons/home.svg";
import homeIconActive from "../../assets/icons/home-active.svg";
import rewardsIcon from "../../assets/icons/rewards.svg";
import rewardsIconActive from "../../assets/icons/rewards-active.svg";
import askIcon from "../../assets/icons/logo.svg";
import analyticsIcon from "../../assets/icons/analytics.svg";
import analyticsIconActive from "../../assets/icons/analytics-active.svg";
import profileIcon from "../../assets/icons/profile.svg";
import profileIconActive from "../../assets/icons/profile-active.svg";

const Footer = () => {
  const pathname = usePathname();

  const linkBase =
    "flex flex-col items-center px-4 py-2 rounded-xl transition-colors";
  const activeStyles = "bg-primary text-white";
  const inactiveStyles = "text-gray-700 hover:bg-primary/10";

  const isProfile =
    pathname === "/profile/view-profile" ||
    pathname === "/profile/edit-profile";

  return (
    <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-md border-t flex justify-around">
      <Link
        href="/learning/dashboard"
        className={`${linkBase} ${
          pathname === "/learning/dashboard" ? activeStyles : inactiveStyles
        }`}
      >
        <Image
          src={pathname === "/learning/dashboard" ? homeIconActive : homeIcon}
          alt="Home"
          width={24}
          height={24}
        />
        <span className="mt-1 text-sm font-medium">Home</span>
      </Link>

      <Link
        href="/rewards"
        className={`${linkBase} ${
          pathname === "/rewards" ? activeStyles : inactiveStyles
        }`}
      >
        <Image
          src={pathname === "/rewards" ? rewardsIconActive : rewardsIcon}
          alt="Rewards"
          width={24}
          height={24}
        />
        <span className="mt-1 text-sm font-medium">Rewards</span>
      </Link>

      <Link
        href="/ask"
        className={`${linkBase} ${
          pathname === "/ask" ? activeStyles : inactiveStyles
        }`}
      >
        <Image src={askIcon} alt="Ask" width={24} height={24} />
        <span className="mt-1 text-sm font-medium">Ask</span>
      </Link>

      <Link
        href="/analytics"
        className={`${linkBase} ${
          pathname === "/analytics" ? activeStyles : inactiveStyles
        }`}
      >
        <Image
          src={pathname === "/analytics" ? analyticsIconActive : analyticsIcon}
          alt="Analytics"
          width={24}
          height={24}
        />
        <span className="mt-1 text-sm font-medium">Analytics</span>
      </Link>

      <Link
        href="/profile/view-profile"
        className={`${linkBase} ${isProfile ? activeStyles : inactiveStyles}`}
      >
        <Image
          src={isProfile ? profileIconActive : profileIcon}
          alt="Profile"
          width={24}
          height={24}
        />
        <span className="mt-1 text-sm font-medium">Profile</span>
      </Link>
    </footer>
  );
};

export default Footer;
