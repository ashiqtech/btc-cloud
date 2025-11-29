import React, { useState, useEffect } from 'react';
import { User, AppView } from '../types';
import { getReferrals } from '../services/mockBackend';

interface TeamProps {
  user: User;
  setView: (view: AppView) => void;
  refreshUser: () => void;
}

export const Team: React.FC<TeamProps> = ({ user, setView, refreshUser }) => {
  const [copyMsg, setCopyMsg] = useState('');
  const [referrals, setReferrals] = useState<any[]>([]);
  
  // Use 'free/ref' as requested
  const referralLink = `${window.location.origin}/#/free/ref/${user.referralCode}`;

  useEffect(() => {
    // CRITICAL FIX: Refresh user data immediately when entering Team view
    // This ensures 'user.referralCount' and 'user.referralEarnings' are up to date
    refreshUser();
    setReferrals(getReferrals(user.uid));
  }, [user.uid]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopyMsg('Copied!');
    setTimeout(() => setCopyMsg(''), 2000);
  };

  return (
    <div className="p-4 pt-6 space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <button onClick={() => setView(AppView.DASHBOARD)} className="p-2 bg-dark-800 rounded-lg text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <h1 className="text-xl font-bold text-white">My Team</h1>
      </div>

      {/* Stats Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 rounded-2xl p-6 border border-indigo-800 shadow-xl">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider">Total Referrals</p>
            <p className="text-3xl font-mono text-white font-bold mt-1">{user.referralCount || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-indigo-200 text-xs uppercase font-bold tracking-wider">Commission</p>
            <p className="text-3xl font-mono text-green-400 font-bold mt-1">${(user.referralEarnings || 0).toFixed(2)}</p>
            <p className="text-[10px] text-gray-400">USDT Earned</p>
          </div>
        </div>
      </div>

      {/* Link Sharing Section */}
      <div className="bg-dark-900 rounded-xl p-5 border border-dark-800">
        <h3 className="text-sm font-bold text-white mb-2">Invite Friends</h3>
        <p className="text-xs text-gray-400 mb-4">Share your link and earn <span className="text-brand-400 font-bold">5% commission</span> on every deposit your team members make.</p>
        
        <div className="flex flex-col gap-2">
            <label className="text-[10px] text-gray-500 uppercase">Your Referral Link</label>
            <div className="flex bg-dark-950 border border-dark-700 rounded-lg p-2 items-center">
                <div className="flex-1 overflow-hidden">
                    <p className="text-xs text-gray-300 font-mono truncate">{referralLink}</p>
                </div>
                <button 
                    onClick={copyToClipboard}
                    className="bg-brand-600 hover:bg-brand-500 text-white text-xs px-3 py-1.5 rounded transition-colors ml-2 flex-shrink-0"
                >
                    {copyMsg || 'Copy Link'}
                </button>
            </div>
             <div className="mt-2 text-center">
                 <span className="text-[10px] text-gray-500">OR SHARE CODE: </span>
                 <span className="text-brand-400 font-mono font-bold">{user.referralCode}</span>
            </div>
        </div>
      </div>

      {/* Team Member List */}
      <div className="bg-dark-900 rounded-xl border border-dark-800 overflow-hidden">
          <div className="p-4 border-b border-dark-800">
              <h3 className="text-sm font-bold text-white">Member List (Tier 1)</h3>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
              {referrals.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-xs">
                      No team members yet.
                  </div>
              ) : (
                  <div className="divide-y divide-dark-800">
                      {referrals.map((member: any) => (
                          <div key={member.uid} className="p-3 flex justify-between items-center hover:bg-dark-800/50">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-dark-700 flex items-center justify-center text-xs font-bold text-gray-300">
                                      {member.email.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                      <p className="text-xs text-white font-mono">{member.uid}</p>
                                      <p className="text-[10px] text-gray-500">Joined: {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}</p>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${member.vipLevel > 0 ? 'bg-brand-900 text-brand-400' : 'bg-gray-800 text-gray-400'}`}>
                                      {member.vipLevel > 0 ? `VIP ${member.vipLevel}` : 'Free'}
                                  </span>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

    </div>
  );
};