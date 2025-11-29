import React from 'react';
import { LeaderboardEntry } from '../types';

const MOCK_LEADERS: LeaderboardEntry[] = [
  { rank: 1, userId: 'user_x92...k2', totalEarned: 12450.50, vipLevel: 5 },
  { rank: 2, userId: 'user_m41...p9', totalEarned: 8920.00, vipLevel: 4 },
  { rank: 3, userId: 'user_q77...a1', totalEarned: 5340.25, vipLevel: 4 },
  { rank: 4, userId: 'user_b22...z8', totalEarned: 2100.10, vipLevel: 3 },
  { rank: 5, userId: 'user_t55...r4', totalEarned: 1500.00, vipLevel: 2 },
];

export const Leaderboard: React.FC = () => {
  return (
    <div className="p-4 pt-8">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white">Top Miners</h2>
        <p className="text-gray-400 text-xs">Global ranking by total earnings</p>
      </div>

      <div className="bg-dark-900 rounded-2xl border border-dark-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-3 bg-dark-800 text-xs text-gray-400 font-bold uppercase tracking-wider">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6">User</div>
          <div className="col-span-4 text-right">Earned</div>
        </div>
        
        {MOCK_LEADERS.map((leader, idx) => (
          <div key={idx} className="grid grid-cols-12 gap-2 p-4 border-b border-dark-800 items-center hover:bg-dark-800/50 transition-colors">
            <div className="col-span-2 flex justify-center">
              <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${
                idx === 0 ? 'bg-yellow-500 text-yellow-950' :
                idx === 1 ? 'bg-gray-400 text-gray-900' :
                idx === 2 ? 'bg-orange-600 text-orange-200' :
                'bg-dark-700 text-gray-400'
              }`}>
                {leader.rank}
              </div>
            </div>
            <div className="col-span-6">
              <div className="text-white font-mono text-sm">{leader.userId}</div>
              <div className="text-[10px] text-brand-500">VIP {leader.vipLevel}</div>
            </div>
            <div className="col-span-4 text-right">
              <div className="text-green-400 font-bold text-sm">${leader.totalEarned.toLocaleString()}</div>
            </div>
          </div>
        ))}
        
        <div className="p-4 text-center text-xs text-gray-500">
          Rankings update every 24 hours
        </div>
      </div>
    </div>
  );
};
