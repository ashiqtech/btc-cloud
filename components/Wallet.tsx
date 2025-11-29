import React, { useState, useEffect } from 'react';
import { User, AppView, Transaction } from '../types';
import { createTransaction, getUserTransactions } from '../services/mockBackend';
import { MOCK_WALLET_ADDRESS, MIN_WITHDRAWAL } from '../constants';

interface WalletProps {
  user: User;
  refreshUser: () => void;
  setView: (view: AppView) => void;
}

export const Wallet: React.FC<WalletProps> = ({ user, refreshUser, setView }) => {
  const [mode, setMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [amount, setAmount] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [txHash, setTxHash] = useState<string>(''); 
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<Transaction[]>([]);

  useEffect(() => {
    // Initial load
    setHistory(getUserTransactions(user.uid));

    // Polling for status updates every 5 seconds
    const interval = setInterval(() => {
        const freshTxs = getUserTransactions(user.uid);
        // Only update if something changed (simple length/status check could be added, but react handles diffing well)
        setHistory(freshTxs);
    }, 5000);

    return () => clearInterval(interval);
  }, [user.uid]); // Removed user.usdtBalance dependency, rely on polling for status updates

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setMsg({ text: 'Please enter a valid amount', type: 'error' });
      setLoading(false);
      return;
    }

    try {
      if (mode === 'deposit') {
        if (!txHash || txHash.length < 5) {
            throw new Error('Please enter a valid Transaction Hash (TxID).');
        }
        // Create Request
        await createTransaction(user.uid, 'deposit', val, 'USDT (BEP-20)', txHash);
        setMsg({ text: `Deposit Request Submitted! Waiting for Admin approval.`, type: 'success' });
        setAmount('');
        setTxHash('');
      } else {
        if (val < MIN_WITHDRAWAL) throw new Error(`Minimum withdrawal is ${MIN_WITHDRAWAL} USDT`);
        if (!address) throw new Error('Please enter a wallet address');
        
        await createTransaction(user.uid, 'withdraw', val, 'USDT (BEP-20)', address);
        setMsg({ text: `Withdrawal Request Submitted! Funds locked pending approval.`, type: 'success' });
        setAmount('');
        setAddress('');
      }
      refreshUser();
      setHistory(getUserTransactions(user.uid));
    } catch (err: any) {
      setMsg({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const copyAddress = () => {
      navigator.clipboard.writeText(MOCK_WALLET_ADDRESS);
      setMsg({ text: 'Address copied to clipboard', type: 'success' });
      setTimeout(() => setMsg(null), 2000);
  }

  // Critical Warning Component
  const NetworkWarning = () => (
    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-3 flex gap-3 items-start">
      <div className="text-red-500 mt-1 flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
      </div>
      <div>
        <h4 className="text-red-400 text-xs font-bold uppercase mb-1">Critical Warning</h4>
        <p className="text-[10px] text-gray-300 leading-relaxed">
          Please ensure you are using the <span className="text-white font-bold">Binance Smart Chain (BEP20)</span> network.
          <br/>
          Sending funds via any other network (TRC20, ERC20, Polygon, etc.) will result in <span className="text-red-400 font-bold underline">PERMANENT LOSS</span> of your assets.
          <br/>
          We are not responsible for lost funds due to incorrect network selection.
        </p>
      </div>
    </div>
  );

  return (
    <div className="p-4 pt-6 space-y-6 pb-24">
      
      {/* Wallet Card */}
      <div className="bg-gradient-to-br from-yellow-600/20 to-black rounded-2xl p-6 border border-yellow-600/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-50%] w-full h-full bg-yellow-500 opacity-5 blur-[80px] rounded-full"></div>
        <div className="relative z-10">
          <p className="text-gray-400 text-sm mb-1">Total Assets</p>
          <h1 className="text-3xl font-bold text-white font-mono tracking-tighter">${user.usdtBalance.toFixed(2)} <span className="text-sm text-gray-500">USDT</span></h1>
          <p className="text-md text-yellow-400 font-mono mt-1">{user.btcBalance?.toFixed(10) || "0.0000000000"} <span className="text-xs text-gray-500">BTC</span></p>
        </div>
      </div>

      {/* Toggle */}
      <div className="flex bg-dark-900 p-1 rounded-xl">
        <button 
          onClick={() => { setMode('deposit'); setMsg(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'deposit' ? 'bg-dark-700 text-white shadow' : 'text-gray-500'}`}
        >
          Deposit
        </button>
        <button 
          onClick={() => { setMode('withdraw'); setMsg(null); }}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'withdraw' ? 'bg-dark-700 text-white shadow' : 'text-gray-500'}`}
        >
          Withdraw
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {msg && (
          <div className={`p-3 rounded-lg text-sm ${msg.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
            {msg.text}
          </div>
        )}

        {mode === 'deposit' && (
          <div className="space-y-4">
            <NetworkWarning />
            
            <div className="p-4 bg-dark-900 border border-dark-700 rounded-xl space-y-3">
              <p className="text-xs text-center text-gray-400">Send USDT/BNB (BEP20) to:</p>
              <div className="flex justify-center my-4">
                  <div className="bg-white p-2 rounded-lg">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${MOCK_WALLET_ADDRESS}`} alt="Deposit QR" className="w-32 h-32" />
                  </div>
              </div>
              <div className="flex items-center gap-2 bg-dark-950 p-3 rounded-lg border border-dashed border-gray-700">
                  <code className="text-[10px] text-gray-300 break-all font-mono">{MOCK_WALLET_ADDRESS}</code>
                  <button type="button" onClick={copyAddress} className="p-2 bg-dark-800 rounded hover:bg-dark-700">
                    Copy
                  </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'withdraw' && <NetworkWarning />}

        <div>
          <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Amount (USDT)</label>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-dark-900 border border-dark-700 text-white p-3 rounded-xl focus:outline-none focus:border-brand-500 font-mono"
          />
        </div>

        {mode === 'deposit' ? (
            <div>
            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Upload Proof (TxID)</label>
            <input 
                type="text" 
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                placeholder="Paste Transaction ID here..."
                className="w-full bg-dark-900 border border-dark-700 text-white p-3 rounded-xl focus:outline-none focus:border-brand-500 font-mono text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">Transaction ID is required for verification.</p>
            </div>
        ) : (
           <div>
             <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wide">Wallet Address (BEP20 ONLY)</label>
             <input 
               type="text" 
               value={address}
               onChange={(e) => setAddress(e.target.value)}
               placeholder="Enter BEP20 Address"
               className="w-full bg-dark-900 border border-dark-700 text-white p-3 rounded-xl focus:outline-none focus:border-brand-500 font-mono text-sm"
             />
             <p className="text-[10px] text-gray-500 mt-1 text-right">Min Withdraw: ${MIN_WITHDRAWAL}</p>
           </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : mode === 'deposit' ? 'Submit Proof' : 'Request Withdrawal'}
        </button>
      </form>

      {/* History */}
      <div className="pt-4">
        <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wide">Transaction History</h3>
        <div className="space-y-2">
            {history.length === 0 && <p className="text-center text-xs text-gray-600 py-4">No transactions yet.</p>}
            {history.map(tx => (
                <div key={tx.id} className="bg-dark-900/50 p-3 rounded-lg border border-dark-800 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs font-bold uppercase px-1.5 rounded ${tx.type === 'deposit' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                                {tx.type}
                            </span>
                            <span className="text-xs text-gray-500">{new Date(tx.date).toLocaleDateString()}</span>
                        </div>
                        <div className="text-[10px] text-gray-500 mt-1 truncate max-w-[150px]">{tx.details}</div>
                    </div>
                    <div className="text-right">
                        <div className="text-white font-mono font-bold">${tx.amount.toFixed(2)}</div>
                        <div className={`text-[10px] uppercase font-bold ${
                            tx.status === 'approved' ? 'text-green-500' : 
                            tx.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                            {tx.status}
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};