'use client'
import { useState, useEffect } from 'react';
import { getUserInfo } from '@/middleware/general';

export const useUserInfo = () => {
  const [user, setUser] = useState<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    const userData = getUserInfo();
    setUser(userData);
    setIsLoading(false);
  }, []);

  return {
    user,
    isClient,
    isLoading,
    coins: isClient && user ? user.coins : "0",
    firstName: isClient && user ? user.first_name : "Student"
  };
};


