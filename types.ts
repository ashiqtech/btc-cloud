export interface User {
  uid: string;
  email: string;
  password?: string; // Optional for security in frontend, but used in mock backend
  usdtBalance: number;
  btcBalance: number;
  vipLevel: number;
  lastMiningTime: number; // Timestamp in ms
  totalEarned: number;
  // Referral System
  referralCode: string;
  referredBy?: string; // UID of the referrer
  referralCount: number;
  referralEarnings: number;
  // Admin Control
  isBlocked?: boolean;
}

export interface VipPlan {
  level: number;
  cost: number;
  dailyReturnPercent: number;
  name: string;
  color: string;
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalEarned: number;
  vipLevel: number;
}

export interface Transaction {
  id: string;
  uid: string;
  userEmail: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: number;
  network: string;
  details: string; // TxHash for deposit, Wallet Addr for withdraw
}

export enum AppView {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  UPGRADE = 'UPGRADE',
  WALLET = 'WALLET',
  LEADERBOARD = 'LEADERBOARD',
  TEAM = 'TEAM',
  SWAP = 'SWAP',
  PROFILE = 'PROFILE',
  ADMIN = 'ADMIN' // Hidden view
}