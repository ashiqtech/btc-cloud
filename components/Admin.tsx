import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { 
    getAllTransactionsAdmin, 
    processTransaction, 
    getAllUsersAdmin,
    adminToggleBlockUser,
    adminUpdateFunds,
    adminSetPlan,
    adminDeleteUser,
    adminResetUserBalance,
    adminManualLinkReferrer
} from '../services/mockBackend';
import { VIP_PLANS } from '../constants';

interface AdminProps {
  user: User;
  refreshUser: () => void;
  goBack: () => void;
}

export const Admin: React.FC<AdminProps> = ({ user, refreshUser, goBack }) => {
  const [tab, setTab] = useState<'requests' | 'history' | 'users'>('requests');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Editing State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [fundAmount, setFundAmount] = useState<string>('');
  const [fundType, setFundType] = useState<'USDT' | 'BTC'>('USDT');
  const [manualRefCode, setManualRefCode] = useState('');

  // Security Check: STRICT
  const isAdmin = user.uid === 'uid3026' && user.email.toLowerCase() === 'cryptodrop077@gmail.com';

  if (!isAdmin) {
    return (
      <div className="h-screen flex items-center justify-center flex-col bg-black text-red-500">
        <h1 className="text-2xl font-bold">ACCESS DENIED</h1>
        <p className="text-sm">You are not authorized. This attempt has been logged.</p>
        <button onClick={goBack} className="mt-4 text-white underline">Go Back</button>
      </div>
    );
  }

  const loadData = () => {
    setTransactions(getAllTransactionsAdmin());
    const usersMap = getAllUsersAdmin();
    setAllUsers(Object.values(usersMap));
  };

  useEffect(() => {
    loadData();
  }, [tab]);

  // --- Request Actions ---
  const handleTxAction = async (txId: string, action: 'approve' | 'reject') => {
    // Optimistic Update: Remove immediately from UI to prevent double clicks
    setTransactions(prev => prev.map(tx => {
        if (tx.id === txId) {
            return { ...tx, status: action === 'approve' ? 'approved' : 'rejected' };
        }
        return tx;
    }));

    try {
      await processTransaction(user.uid, txId, action);
      // Data is already updated visually, silent refresh in background
      setTimeout(loadData, 500);
    } catch (e: any) {
      alert(`Error: ${e.message}`);
      // Revert on error
      loadData();
    }
  };

  // --- User Actions ---
  const handleBlockToggle = async (targetUid: string) => {
      // Optimistic
      if(editingUser) {
          setEditingUser({...editingUser, isBlocked: !editingUser.isBlocked});
      }
      try {
          await adminToggleBlockUser(targetUid);
          loadData();
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleUpdateFunds = async () => {
      if(!editingUser) return;
      const amt = parseFloat(fundAmount);
      if(isNaN(amt) || amt === 0) return alert("Invalid amount");
      
      try {
          await adminUpdateFunds(editingUser.uid, fundType, amt);
          alert("Funds updated successfully");
          setFundAmount('');
          loadData();
          // Update local editing user state
          setEditingUser(prev => {
              if(!prev) return null;
              return {
                  ...prev,
                  usdtBalance: fundType === 'USDT' ? prev.usdtBalance + amt : prev.usdtBalance,
                  btcBalance: fundType === 'BTC' ? prev.btcBalance + amt : prev.btcBalance
              };
          });
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleSetPlan = async (level: number) => {
      if(!editingUser) return;
      try {
          await adminSetPlan(editingUser.uid, level);
          loadData();
          setEditingUser(prev => prev ? {...prev, vipLevel: level} : null);
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleResetData = async () => {
      if(!editingUser) return;
      if(!confirm("Are you sure? This will set Balance, Earned, and Earnings to 0.")) return;
      try {
          await adminResetUserBalance(editingUser.uid);
          loadData();
          setEditingUser(prev => prev ? {...prev, usdtBalance: 0, btcBalance: 0, totalEarned: 0} : null);
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleDeleteUser = async () => {
      if(!editingUser) return;
      if(!confirm("⚠️ PERMANENT DELETE WARNING ⚠️\n\nThis will remove the user account completely. They will lose all data and cannot login again.\n\nAre you sure?")) return;
      try {
          await adminDeleteUser(editingUser.uid);
          setEditingUser(null);
          loadData();
          alert("User Deleted.");
      } catch (e: any) {
          alert(e.message);
      }
  };

  const handleLinkReferrer = async () => {
      if(!editingUser) return;
      if(!manualRefCode) return alert("Enter a code");
      try {
          await adminManualLinkReferrer(editingUser.uid, manualRefCode);
          alert("Referrer Linked Successfully!");
          setManualRefCode('');
          loadData();
          // Force update local view
          const updatedUsers = getAllUsersAdmin();
          setEditingUser(updatedUsers[editingUser.uid]);
      } catch (e: any) {
          alert(e.message);
      }
  }

  const pendingTxs = transactions.filter(t => t.status === 'pending');
  const historyTxs = transactions.filter(t => t.status !== 'pending');
  
  const filteredUsers = allUsers.filter(u => 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.uid.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-950 text-gray-200 pb-20 relative overflow-y-auto">
      <div className="bg-red-900/20 border-b border-red-900 p-4 flex justify-between items-center sticky top-0 z-50 backdrop-blur-md">
        <div>
            <h1 className="font-bold text-red-400">SUPER ADMIN</h1>
            <p className="text-[10px] text-red-800">Secure Panel • UID: 3026</p>
        </div>
        <button onClick={goBack} className="text-xs bg-dark-800 px-3 py-1 rounded hover:bg-dark-700">Exit</button>
      </div>

      <div className="flex p-2 gap-2 bg-dark-900 sticky top-14 z-40 overflow-x-auto shadow-md">
        <button 
            onClick={() => { setTab('requests'); setEditingUser(null); }} 
            className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase rounded whitespace-nowrap px-2 ${tab === 'requests' ? 'bg-brand-600 text-white' : 'text-gray-500 bg-dark-800'}`}
        >
            Requests ({pendingTxs.length})
        </button>
        <button 
            onClick={() => { setTab('history'); setEditingUser(null); }} 
            className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase rounded whitespace-nowrap px-2 ${tab === 'history' ? 'bg-brand-600 text-white' : 'text-gray-500 bg-dark-800'}`}
        >
            History
        </button>
        <button 
            onClick={() => setTab('users')} 
            className={`flex-1 py-3 text-[10px] md:text-xs font-bold uppercase rounded whitespace-nowrap px-2 ${tab === 'users' ? 'bg-brand-600 text-white' : 'text-gray-500 bg-dark-800'}`}
        >
            Users ({allUsers.length})
        </button>
      </div>

      <div className="p-2 pb-24">
        {/* REQUESTS TAB */}
        {tab === 'requests' && (
            <div className="space-y-3">
                {pendingTxs.length === 0 && <p className="text-center text-gray-500 py-10">No pending requests.</p>}
                
                {pendingTxs.map(tx => (
                    <div key={tx.id} className="bg-dark-900 border border-dark-700 rounded-lg p-3 shadow-lg">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${tx.type === 'deposit' ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>{tx.type}</span>
                                <span className="text-xs text-gray-400 ml-2">{new Date(tx.date).toLocaleString()}</span>
                            </div>
                            <span className="font-mono font-bold text-white text-lg">${tx.amount}</span>
                        </div>
                        
                        <div className="text-xs text-gray-400 space-y-1 mb-3 bg-dark-950 p-2 rounded">
                            <p>User: <span className="text-gray-200">{tx.userEmail}</span> ({tx.uid})</p>
                            <p>Info: <span className="text-yellow-500 break-all select-all">{tx.details}</span></p>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => handleTxAction(tx.id, 'approve')}
                                className="flex-1 bg-green-700 hover:bg-green-600 text-white py-3 rounded-lg text-xs font-bold shadow active:scale-95 transition-transform"
                            >
                                APPROVE
                            </button>
                            <button 
                                onClick={() => handleTxAction(tx.id, 'reject')}
                                className="flex-1 bg-red-700 hover:bg-red-600 text-white py-3 rounded-lg text-xs font-bold shadow active:scale-95 transition-transform"
                            >
                                REJECT
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
            <div className="space-y-2">
                {historyTxs.length === 0 && <p className="text-center text-gray-500 py-10">No history available.</p>}
                {historyTxs.map(tx => (
                    <div key={tx.id} className="bg-dark-900 border border-dark-800 rounded p-2 flex justify-between items-center opacity-75 hover:opacity-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</span>
                                <span className={`text-[10px] px-1 rounded uppercase ${tx.status === 'approved' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{tx.status}</span>
                            </div>
                            <div className="text-[10px] text-gray-500">{tx.userEmail}</div>
                        </div>
                        <div className="text-right">
                            <div className="font-mono text-sm">${tx.amount}</div>
                            <div className="text-[10px] text-gray-600">{new Date(tx.date).toLocaleDateString()}</div>
                        </div>
                    </div>
                ))}
            </div>
        )}

        {/* USERS TAB */}
        {tab === 'users' && !editingUser && (
            <div>
                <input 
                    type="text" 
                    placeholder="Search UID or Email..." 
                    className="w-full bg-dark-800 p-3 rounded-lg text-sm mb-3 text-white border border-dark-700 outline-none focus:border-brand-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <div className="space-y-2">
                    {filteredUsers.map(u => (
                        <div key={u.uid} className={`bg-dark-900 p-3 rounded-lg border ${u.isBlocked ? 'border-red-600 bg-red-900/10' : 'border-dark-800'} flex justify-between items-center text-xs`}>
                            <div onClick={() => setEditingUser(u)} className="cursor-pointer flex-1">
                                <div className="font-bold text-white flex items-center gap-2">
                                    {u.email}
                                    {u.isBlocked && <span className="text-[10px] bg-red-600 px-1 rounded text-white">BLOCKED</span>}
                                </div>
                                <div className="text-gray-500">{u.uid} | Ref: <span className="text-brand-400">{u.referralCode}</span></div>
                            </div>
                            <div className="text-right">
                                 <div className="text-brand-400 font-mono">${u.usdtBalance.toFixed(2)}</div>
                                 <button onClick={() => setEditingUser(u)} className="mt-1 bg-dark-800 text-gray-300 px-3 py-1.5 rounded hover:bg-brand-600 hover:text-white transition-colors">
                                     Manage
                                 </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* EDIT USER VIEW */}
        {tab === 'users' && editingUser && (
            <div className="bg-dark-900 rounded-lg p-4 border border-dark-700 min-h-[50vh] shadow-xl">
                <button onClick={() => setEditingUser(null)} className="mb-4 text-xs text-brand-400 flex items-center gap-1 font-bold p-2 bg-dark-800 rounded-lg">
                    ← Back to List
                </button>
                
                <div className="space-y-4">
                    {/* Info Header */}
                    <div className="border-b border-dark-800 pb-4">
                        <h2 className="text-xl font-bold text-white">{editingUser.email}</h2>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-400 font-mono select-all">{editingUser.uid}</span>
                            <span className="text-xs text-gray-400">Ref Code: <span className="text-white select-all font-bold">{editingUser.referralCode}</span></span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500 break-all">
                             Password: <span className="text-red-400 font-mono select-all">{editingUser.password}</span>
                        </div>
                    </div>

                    {/* Block Controls */}
                    <div className="flex justify-between items-center bg-dark-950 p-3 rounded border border-dark-800">
                        <span className="text-sm font-bold text-white">Account Status</span>
                        <button 
                            onClick={() => handleBlockToggle(editingUser.uid)}
                            className={`px-3 py-1.5 rounded text-xs font-bold ${editingUser.isBlocked ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                        >
                            {editingUser.isBlocked ? 'UNBLOCK USER' : 'BLOCK USER'}
                        </button>
                    </div>

                    {/* Balances */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-dark-950 p-3 rounded border border-dark-800">
                            <div className="text-xs text-gray-500">USDT Balance</div>
                            <div className="text-lg font-bold text-brand-400">${editingUser.usdtBalance.toFixed(2)}</div>
                        </div>
                        <div className="bg-dark-950 p-3 rounded border border-dark-800">
                            <div className="text-xs text-gray-500">BTC Balance</div>
                            <div className="text-lg font-bold text-yellow-500">{editingUser.btcBalance?.toFixed(8)}</div>
                        </div>
                    </div>

                    {/* Fund Management */}
                    <div className="bg-dark-950 p-3 rounded border border-dark-800">
                        <h3 className="text-xs font-bold text-gray-300 mb-2 uppercase">Manage Funds</h3>
                        <div className="flex gap-2 mb-2">
                             <select 
                                value={fundType} 
                                onChange={(e: any) => setFundType(e.target.value)}
                                className="bg-dark-900 text-white text-xs p-2 rounded outline-none border border-dark-700"
                             >
                                 <option value="USDT">USDT</option>
                                 <option value="BTC">BTC</option>
                             </select>
                             <input 
                                type="number" 
                                placeholder="Amount (+/-)" 
                                value={fundAmount}
                                onChange={(e) => setFundAmount(e.target.value)}
                                className="flex-1 bg-dark-900 text-white text-xs p-2 rounded outline-none border border-dark-700"
                             />
                        </div>
                        <button 
                            onClick={handleUpdateFunds}
                            className="w-full bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold py-3 rounded"
                        >
                            UPDATE BALANCE
                        </button>
                        <p className="text-[10px] text-gray-500 mt-1 text-center">Use negative values to deduct funds.</p>
                    </div>
                    
                    {/* Manual Referrer Link */}
                    <div className="bg-dark-950 p-3 rounded border border-dark-800">
                        <h3 className="text-xs font-bold text-brand-400 mb-2 uppercase">Manually Link Referrer</h3>
                        <div className="flex gap-2 mb-2">
                             <input 
                                type="text" 
                                placeholder="Enter Parent Referral Code" 
                                value={manualRefCode}
                                onChange={(e) => setManualRefCode(e.target.value)}
                                className="flex-1 bg-dark-900 text-white text-xs p-2 rounded outline-none border border-dark-700"
                             />
                             <button 
                                onClick={handleLinkReferrer}
                                className="bg-brand-700 hover:bg-brand-600 text-white text-xs font-bold px-3 py-2 rounded"
                            >
                                LINK
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-500">Current Referrer: <span className="text-white">{editingUser.referredBy || 'None'}</span></p>
                    </div>

                    {/* Plan Management - Force Update */}
                    <div className="bg-dark-950 p-3 rounded border border-dark-800">
                        <h3 className="text-xs font-bold text-gray-300 mb-2 uppercase">Force Update VIP Plan</h3>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={() => handleSetPlan(0)}
                                className={`px-3 py-2 rounded text-xs border transition-all ${editingUser.vipLevel === 0 ? 'bg-white text-black font-bold scale-105' : 'border-gray-600 text-gray-400 hover:border-gray-400'}`}
                            >
                                Free
                            </button>
                            {VIP_PLANS.map(p => (
                                <button
                                    key={p.level}
                                    onClick={() => handleSetPlan(p.level)}
                                    className={`px-3 py-2 rounded text-xs border transition-all ${editingUser.vipLevel === p.level ? 'bg-brand-500 text-white font-bold border-brand-500 scale-105 shadow-lg shadow-brand-500/20' : 'border-gray-600 text-gray-400 hover:border-brand-500 hover:text-white'}`}
                                >
                                    VIP {p.level}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-900/10 p-3 rounded border border-red-900/30 mt-4">
                        <h3 className="text-xs font-bold text-red-500 mb-2 uppercase">Danger Zone</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={handleResetData}
                                className="bg-red-900/30 hover:bg-red-900/50 text-red-200 text-xs py-2 rounded border border-red-900/50"
                            >
                                Reset Balance
                            </button>
                            <button 
                                onClick={handleDeleteUser}
                                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded shadow"
                            >
                                DELETE USER
                            </button>
                        </div>
                    </div>

                    {/* Team Info */}
                    <div className="text-xs text-gray-400 pt-2 border-t border-dark-800">
                        <p>Total Referrals: <span className="text-white">{editingUser.referralCount}</span></p>
                        <p>Total Earned: <span className="text-white">${editingUser.totalEarned.toFixed(2)}</span></p>
                        <p>Join Date: <span className="text-white">{editingUser.joinDate ? new Date(editingUser.joinDate).toLocaleString() : 'N/A'}</span></p>
                    </div>

                </div>
            </div>
        )}
      </div>
    </div>
  );
};