import { VipPlan } from './types';

export const VIP_PLANS: VipPlan[] = [
  { level: 1, cost: 10, dailyReturnPercent: 10, name: 'Starter Node', color: 'from-blue-500 to-cyan-500' },
  { level: 2, cost: 15, dailyReturnPercent: 10, name: 'Advanced Rig', color: 'from-cyan-500 to-teal-500' },
  { level: 3, cost: 30, dailyReturnPercent: 10, name: 'Pro Farm', color: 'from-teal-500 to-green-500' },
  { level: 4, cost: 50, dailyReturnPercent: 10, name: 'Enterprise Cluster', color: 'from-green-500 to-yellow-500' },
  { level: 5, cost: 100, dailyReturnPercent: 10, name: 'Quantum Core', color: 'from-yellow-500 to-orange-500' },
];

export const COINGECKO_IDS = ['bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin'];

export const MIN_WITHDRAWAL = 2;
// Updated to user's specific address
export const MOCK_WALLET_ADDRESS = "0x6276807869ff608bf0d2a02e10136969bd4353c4";
export const FREE_BTC_DAILY_RATE = 0.0000000001;