/**
 * Coin storage utility for managing user coins in browser localStorage
 */

const COIN_STORAGE_KEY = 'zuzuplay_user_coins';
const DEFAULT_COINS = 1000; // Starting coins for new users

export interface CoinTransaction {
  id: string;
  type: 'earn' | 'spend';
  amount: number;
  reason: string;
  timestamp: number;
}

export interface CoinStorage {
  balance: number;
  transactions: CoinTransaction[];
}

/**
 * Get current coin balance from localStorage
 */
export const getCoinBalance = (): number => {
  if (typeof window === 'undefined') return DEFAULT_COINS;
  
  try {
    const stored = localStorage.getItem(COIN_STORAGE_KEY);
    if (!stored) {
      // Initialize with default coins for new users
      setCoinBalance(DEFAULT_COINS);
      return DEFAULT_COINS;
    }
    
    const data: CoinStorage = JSON.parse(stored);
    return data.balance;
  } catch (error) {
    console.error('Error reading coin balance:', error);
    return DEFAULT_COINS;
  }
};

/**
 * Set coin balance in localStorage
 */
export const setCoinBalance = (balance: number): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = localStorage.getItem(COIN_STORAGE_KEY);
    const data: CoinStorage = existing ? JSON.parse(existing) : { balance: 0, transactions: [] };
    
    data.balance = Math.max(0, balance); // Ensure balance is never negative
    localStorage.setItem(COIN_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error setting coin balance:', error);
  }
};

/**
 * Add coins to user's balance
 */
export const addCoins = (amount: number, reason: string = 'Earned coins'): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const existing = localStorage.getItem(COIN_STORAGE_KEY);
    const data: CoinStorage = existing ? JSON.parse(existing) : { balance: 0, transactions: [] };
    
    data.balance += amount;
    
    // Add transaction record
    const transaction: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'earn',
      amount,
      reason,
      timestamp: Date.now()
    };
    
    data.transactions.push(transaction);
    
    // Keep only last 50 transactions to prevent storage bloat
    if (data.transactions.length > 50) {
      data.transactions = data.transactions.slice(-50);
    }
    
    localStorage.setItem(COIN_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error adding coins:', error);
  }
};

/**
 * Spend coins from user's balance
 */
export const spendCoins = (amount: number, reason: string = 'Spent coins'): boolean => {
  if (typeof window === 'undefined') return false;
  
  try {
    const currentBalance = getCoinBalance();
    
    if (currentBalance < amount) {
      return false; // Insufficient funds
    }
    
    const existing = localStorage.getItem(COIN_STORAGE_KEY);
    const data: CoinStorage = existing ? JSON.parse(existing) : { balance: 0, transactions: [] };
    
    data.balance -= amount;
    
    // Add transaction record
    const transaction: CoinTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'spend',
      amount,
      reason,
      timestamp: Date.now()
    };
    
    data.transactions.push(transaction);
    
    // Keep only last 50 transactions to prevent storage bloat
    if (data.transactions.length > 50) {
      data.transactions = data.transactions.slice(-50);
    }
    
    localStorage.setItem(COIN_STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error spending coins:', error);
    return false;
  }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = (): CoinTransaction[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(COIN_STORAGE_KEY);
    if (!stored) return [];
    
    const data: CoinStorage = JSON.parse(stored);
    return data.transactions.sort((a, b) => b.timestamp - a.timestamp); // Most recent first
  } catch (error) {
    console.error('Error reading transaction history:', error);
    return [];
  }
};

/**
 * Reset coin storage (for testing or admin purposes)
 */
export const resetCoinStorage = (): void => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(COIN_STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting coin storage:', error);
  }
};
