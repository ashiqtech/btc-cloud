import React, { useEffect, useState } from 'react';
import { User, CryptoPrice, AppView } from '../types';
import { fetchCryptoPrices } from '../services/cryptoService';
import { collectMiningEarnings } from '../services/mockBackend';
import { VIP_PLANS, FREE_BTC_DAILY_RATE } from '../constants';

interface DashboardProps {
  user: User;
  refreshUser: () => void;
  setView: (view: AppView) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, refreshUser, setView }) => {
  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{msg: string, type: 'success'|'error'} | null>(null);
  const [uidCopied, setUidCopied] = useState(false);

  useEffect(() => {
    const loadPrices = async () => {
      const data = await fetchCryptoPrices();
      setPrices(data);
    };
    loadPrices();
    const interval = setInterval(loadPrices, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  const handleCollect = async () => {
    setIsLoading(true);
    setNotification(null);
    try {
      const result = await collectMiningEarnings(user.uid);
      setNotification({ msg: `Collected ${result.earnedMsg}!`, type: 'success' });
      refreshUser();
    } catch (err: any) {
      setNotification({ msg: err.message, type: 'error' });
    } finally {
      setIsLoading(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 2000);
  };

  const currentPlan = VIP_PLANS.find(p => p.level === user.vipLevel);
  const nextMining = user.lastMiningTime + (24 * 60 * 60 * 1000);
  const canMine = Date.now() >= nextMining || user.lastMiningTime === 0;
  
  // OPTIMIZED TIMER LOGIC (Immediate Calculation)
  const calculateTimeLeft = () => {
    const diff = nextMining - Date.now();
    if (diff <= 0) return 'Ready';
    
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    return `${h}h ${m}m ${s}s`;
  };

  // Initialize with correct time immediately to prevent flash
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    // Update immediately when user/nextMining changes
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [nextMining]);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center pt-2">
        <div>
          <h1 className="text-2xl font-bold text-white">BTC Cloud Miner</h1>
          <button 
            onClick={copyUid}
            className="flex items-center gap-1 text-gray-400 text-xs hover:text-white transition-colors group"
          >
            ID: <span className="text-brand-400 font-mono">{user.uid}</span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </span>
            {uidCopied && <span className="text-green-400 font-bold ml-1">Copied!</span>}
          </button>
        </div>
        <div className="text-right">
             <div className="bg-dark-800 px-3 py-1 rounded-t-lg border-x border-t border-dark-700">
                <span className="text-xs text-gray-400 mr-2">USDT</span>
                <span className="text-white font-mono font-bold">${user.usdtBalance.toFixed(2)}</span>
            </div>
            <div className="bg-dark-900 px-3 py-1 rounded-b-lg border-x border-b border-dark-700">
                <span className="text-xs text-yellow-500 mr-2">BTC</span>
                <span className="text-yellow-400 font-mono font-bold text-xs">{user.btcBalance?.toFixed(10) || "0.0000000000"}</span>
            </div>
        </div>
      </div>

      {/* Crypto Ticker */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Live Markets</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
          {prices.map(coin => (
            <div key={coin.id} className="min-w-[140px] bg-dark-900 border border-dark-800 p-3 rounded-xl shadow-lg flex flex-col">
              <div className="flex items-center space-x-2 mb-2">
                <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full" />
                <span className="font-bold text-sm uppercase">{coin.symbol}</span>
              </div>
              <div className="mt-auto">
                <div className="text-white font-mono text-sm">${coin.current_price.toLocaleString()}</div>
                <div className={`text-xs ${coin.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mining Center */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-900 to-dark-800 border border-dark-700 p-6 text-center shadow-xl">
        <div className="absolute top-0 right-0 p-3 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
        </div>
        
        <div className="relative z-10">
          <h2 className="text-lg font-medium text-gray-300 mb-1">
            {currentPlan ? currentPlan.name : 'Free Mining'}
          </h2>
          <div className="text-sm text-brand-500 mb-6 font-mono">
            {currentPlan 
                ? `Earning ${currentPlan.dailyReturnPercent}% Daily (USDT)` 
                : `Mining ${FREE_BTC_DAILY_RATE.toFixed(10)} BTC Daily`}
          </div>

          <div className="flex justify-center mb-6">
            <div className={`w-32 h-32 rounded-full border-4 flex items-center justify-center relative ${isLoading || !canMine ? 'border-gray-700' : 'border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]'}`}>
              <div className={`absolute inset-0 rounded-full border-t-4 border-yellow-400 ${canMine ? 'animate-spin-slow' : ''} opacity-50`}></div>
              
              {/* BTC Logo in Background of Spinner */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                 <img src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png" alt="BTC" className="w-20 h-20 grayscale" />
              </div>

              <div className="flex flex-col items-center relative z-10">
                 <span className="text-xl font-bold text-white shadow-black drop-shadow-md">
                   {canMine ? 'START' : timeLeft}
                 </span>
                 <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Miner</span>
              </div>
            </div>
          </div>

          {notification && (
            <div className={`mb-4 text-xs p-2 rounded ${notification.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
              {notification.msg}
            </div>
          )}

          <button
            onClick={handleCollect}
            disabled={!canMine || isLoading}
            className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all ${
              !canMine
                ? 'bg-dark-700 text-gray-500 cursor-not-allowed'
                : 'bg-yellow-600 hover:bg-yellow-500 text-white shadow-lg hover:shadow-yellow-500/20 active:scale-95'
            }`}
          >
            {isLoading ? 'Hashing...' : canMine ? 'START MINING' : 'MINING ACTIVE'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Deposit', icon: 'M12 5v14M5 12h14', action: () => setView(AppView.WALLET) },
          { label: 'Withdraw', icon: 'M5 12h14M12 5l7 7-7 7', action: () => setView(AppView.WALLET) },
          { label: 'Team', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', action: () => setView(AppView.TEAM) },
          { label: 'Swap', icon: 'M20 7h-9M14 17H5', action: () => setView(AppView.SWAP) },
        ].map((btn, idx) => (
          <button 
            key={idx} 
            onClick={btn.action}
            className="flex flex-col items-center p-3 bg-dark-900 border border-dark-800 rounded-xl hover:bg-dark-800 transition-colors"
          >
            <div className="bg-dark-800 p-2 rounded-full mb-2 text-brand-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={btn.icon}/></svg>
            </div>
            <span className="text-[10px] text-gray-400">{btn.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};