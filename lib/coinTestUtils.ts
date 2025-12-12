/**
 * Test utilities for coin system
 * These functions are for development/testing purposes only
 */

import { addCoins, getCoinBalance, resetCoinStorage } from './coinStorage';

/**
 * Add test coins for development
 */
export const addTestCoins = (amount: number = 2000): void => {
  addCoins(amount, 'Test coins added for development');
  console.log(`Added ${amount} test coins. Current balance: ${getCoinBalance()}`);
};

/**
 * Reset coin system to default state
 */
export const resetCoinSystem = (): void => {
  resetCoinStorage();
  console.log('Coin system reset to default state');
};

/**
 * Get current coin balance (for debugging)
 */
export const debugCoinBalance = (): number => {
  const balance = getCoinBalance();
  console.log(`Current coin balance: ${balance}`);
  return balance;
};

// Development helper - add these to window object for easy testing
if (typeof window !== 'undefined') {
  (window as any).addTestCoins = addTestCoins;
  (window as any).resetCoinSystem = resetCoinSystem;
  (window as any).debugCoinBalance = debugCoinBalance;
}
