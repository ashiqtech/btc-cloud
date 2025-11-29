import React, { useState } from 'react';
import { User } from '../types';
import { VIP_PLANS } from '../constants';
import { upgradeUserVip } from '../services/mockBackend';

interface UpgradeProps {
  user: User;
  refreshUser: () => void;
}

export const Upgrade: React.FC<UpgradeProps> = ({ user, refreshUser }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpgrade = async (level: number) => {
    setLoading(true);
    setError(null);
    try {
      await upgradeUserVip(user.uid, level);
      refreshUser();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 pt-8 pb-24">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-cyan-200">
          Miner Store
        </h2>
        <p className="text-gray-400 text-sm mt-2">Upgrade your hash power to earn more.</p>
        <div className="mt-4 inline-block bg-dark-800 px-4 py-2 rounded-full text-sm">
           Current Balance: <span className="text-brand-400 font-bold">${user.usdtBalance.toFixed(2)}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {VIP_PLANS.map((plan) => {
          const isCurrent = user.vipLevel === plan.level;
          const isLocked = user.vipLevel >= plan.level; // Owned or Current
          
          return (
            <div 
              key={plan.level}
              className={`relative overflow-hidden rounded-2xl p-[1px] ${isCurrent ? 'ring-2 ring-brand-500' : ''}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${plan.color} opacity-20`}></div>
              
              <div className="relative bg-dark-900 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center text-dark-950 font-bold text-xl`}>
                     V{plan.level}
                   </div>
                   <div>
                     <h3 className="font-bold text-lg text-white">{plan.name}</h3>
                     <p className="text-xs text-gray-400">Daily ROI: <span className="text-brand-400 font-bold">{plan.dailyReturnPercent}%</span></p>
                   </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-dark-800 pt-3 md:pt-0">
                   <div className="text-right">
                     <div className="text-sm text-gray-400">Cost</div>
                     <div className="text-xl font-bold text-white">${plan.cost}</div>
                   </div>
                   
                   <button
                     onClick={() => handleUpgrade(plan.level)}
                     disabled={isLocked || loading}
                     className={`px-6 py-2 rounded-lg text-sm font-bold transition-all min-w-[100px]
                       ${isCurrent 
                         ? 'bg-brand-500/20 text-brand-500 cursor-default' 
                         : isLocked 
                           ? 'bg-dark-800 text-gray-600 cursor-not-allowed'
                           : 'bg-gradient-to-r from-brand-600 to-cyan-600 hover:from-brand-500 hover:to-cyan-500 text-white shadow-lg'
                       }
                     `}
                   >
                     {isCurrent ? 'ACTIVE' : isLocked ? 'OWNED' : loading ? '...' : 'BUY'}
                   </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};