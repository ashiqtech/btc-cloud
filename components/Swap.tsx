import React, { useState, useEffect } from 'react';
import { User, AppView } from '../types';
import { fetchCryptoPrices } from '../services/cryptoService';
import { swapBtcToUsdt } from '../services/mockBackend';

interface SwapProps {
  user: User;
  refreshUser: () => void;
  setView: (view: AppView) => void;
}

export const Swap: React.FC<SwapProps> = ({ user, refreshUser, setView }) => {
  const [btcPrice, setBtcPrice] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const getPrice = async () => {
      const data = await fetchCryptoPrices();
      const btc = data.find(c => c.id === 'bitcoin');
      if (btc) setBtcPrice(btc.current_price);
    };
    getPrice();
  }, []);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    
    const val = parseFloat(amount);
    
    try {
        if (val <= 0 || isNaN(val)) throw new Error("Enter a valid amount");
        if (val > user.btcBalance) throw new Error("Insufficient BTC Balance");
        
        await swapBtcToUsdt(user.uid, val, btcPrice);
        setMsg({ text: `Swapped ${val} BTC to USDT!`, type: 'success' });
        setAmount('');
        refreshUser();
    } catch (err: any) {
        setMsg({ text: err.message, type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const calculateUsdtValue = () => {
      const val = parseFloat(amount);
      if (!val || !btcPrice) return "0.00";
      return (val * btcPrice).toFixed(2);
  };

  return (
    <div className="p-4 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 bg-dark-800 rounded-lg text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-white">Swap Assets</h1>
      </div>

      {/* Exchange Card */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 relative">
          
          {/* From BTC */}
          <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase font-bold">From (Balance: {user.btcBalance?.toFixed(8)} BTC)</label>
              <div className="flex items-center bg-dark-950 border border-dark-700 rounded-xl p-3 mt-2">
                  <div className="flex items-center gap-2 pr-3 border-r border-dark-700 min-w-[100px]">
                      <img src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png" alt="BTC" className="w-6 h-6 rounded-full" />
                      <span className="font-bold text-white">BTC</span>
                  </div>
                  <input 
                    type="number" 
                    placeholder="0.00000000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-transparent text-white font-mono text-right outline-none pl-3"
                  />
              </div>
          </div>

          {/* Swap Icon */}
          <div className="flex justify-center -my-3 relative z-10">
              <div className="bg-dark-800 p-2 rounded-full border border-dark-700 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="brand-500" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-500"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
              </div>
          </div>

          {/* To USDT */}
          <div className="mt-4">
              <label className="text-xs text-gray-400 uppercase font-bold">To (Estimate)</label>
              <div className="flex items-center bg-dark-950 border border-dark-700 rounded-xl p-3 mt-2">
                   <div className="flex items-center gap-2 pr-3 border-r border-dark-700 min-w-[100px]">
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-[10px] font-bold text-white">$</div>
                      <span className="font-bold text-white">USDT</span>
                  </div>
                  <input 
                    readOnly
                    type="text" 
                    value={calculateUsdtValue()}
                    className="w-full bg-transparent text-gray-400 font-mono text-right outline-none pl-3"
                  />
              </div>
          </div>

          {/* Rate Info */}
          <div className="text-center mt-4 text-xs text-gray-500">
              1 BTC ≈ ${btcPrice.toLocaleString()} USDT
          </div>
      </div>
      
      {msg && (
        <div className={`p-3 rounded-lg text-sm text-center ${msg.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {msg.text}
        </div>
      )}

      <button 
        onClick={handleSwap}
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95"
      >
        {loading ? 'Converting...' : 'Swap BTC to USDT'}
      </button>

      <div className="text-center">
         <p className="text-[10px] text-gray-600">Swap Fee: 0% | BNB Swaps coming soon</p>
      </div>

    </div>
  );
};