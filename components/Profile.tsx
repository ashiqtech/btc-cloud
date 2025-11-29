import React, { useState } from 'react';
import { User, AppView } from '../types';
import { changePassword, logoutUser } from '../services/mockBackend';

interface ProfileProps {
  user: User;
  setView: (view: AppView) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, setView }) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState<{text: string, type: 'success' | 'error'} | null>(null);
  const [uidCopied, setUidCopied] = useState(false);

  // Strict check for admin visibility
  const isAdmin = user.uid === 'uid3026' && user.email.toLowerCase() === 'cryptodrop077@gmail.com';

  const handleLogout = async () => {
    await logoutUser();
    window.location.reload();
  };

  const copyUid = () => {
    navigator.clipboard.writeText(user.uid);
    setUidCopied(true);
    setTimeout(() => setUidCopied(false), 2000);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
        await changePassword(user.uid, oldPass, newPass);
        setMsg({ text: 'Password updated successfully', type: 'success' });
        setOldPass('');
        setNewPass('');
        setTimeout(() => setShowPasswordChange(false), 2000);
    } catch (err: any) {
        setMsg({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className="p-4 pt-8 pb-20 space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-dark-800 rounded-full mx-auto mb-3 flex items-center justify-center border-2 border-brand-500 relative">
           <span className="text-3xl text-brand-500 font-bold">{user.email.charAt(0).toUpperCase()}</span>
           {isAdmin && (
             <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full border border-dark-900">ADMIN</div>
           )}
        </div>
        <h1 className="text-xl font-bold text-white">{user.email}</h1>
        <div className="flex justify-center items-center gap-2 mt-2">
            <button 
                onClick={copyUid}
                className="flex items-center gap-2 text-xs text-gray-500 bg-dark-900 px-3 py-1.5 rounded-full border border-dark-800 font-mono hover:border-brand-500 hover:text-brand-400 transition-all"
            >
                UID: {user.uid}
                {uidCopied ? (
                    <span className="text-green-400 font-bold">✓</span>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                )}
            </button>
        </div>
      </div>

      <div className="bg-dark-900 border border-dark-800 rounded-xl overflow-hidden">
          <button 
            onClick={() => setShowPasswordChange(!showPasswordChange)}
            className="w-full flex justify-between items-center p-4 hover:bg-dark-800 transition-colors"
          >
              <div className="flex items-center gap-3">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                 <span className="text-sm text-gray-300">Change Password</span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`text-gray-500 transition-transform ${showPasswordChange ? 'rotate-180' : ''}`}><path d="m6 9 6 6 6-6"/></svg>
          </button>
          
          {showPasswordChange && (
              <div className="p-4 bg-dark-950 border-t border-dark-800">
                  <form onSubmit={handleChangePassword} className="space-y-3">
                      {msg && (
                        <div className={`p-2 rounded text-xs ${msg.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                            {msg.text}
                        </div>
                      )}
                      <div>
                          <input 
                            type="password" 
                            placeholder="Current Password" 
                            className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm text-white focus:border-brand-500 outline-none"
                            value={oldPass}
                            onChange={e => setOldPass(e.target.value)}
                            required
                          />
                      </div>
                      <div>
                          <input 
                            type="password" 
                            placeholder="New Password" 
                            className="w-full bg-dark-900 border border-dark-700 rounded p-2 text-sm text-white focus:border-brand-500 outline-none"
                            value={newPass}
                            onChange={e => setNewPass(e.target.value)}
                            required
                          />
                      </div>
                      <button className="w-full bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold py-2 rounded">
                          Update Password
                      </button>
                  </form>
              </div>
          )}

          {/* Contact Support Section */}
          <a 
            href="https://t.me/cryptominerpro1234"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex justify-between items-center p-4 hover:bg-dark-800 transition-colors border-t border-dark-800 group"
          >
             <div className="flex items-center gap-3">
                 <div className="bg-blue-500/10 p-1.5 rounded-lg text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                 </div>
                 <span className="text-sm text-gray-300 group-hover:text-white">Contact Support</span>
             </div>
             <div className="flex items-center gap-2">
                 <span className="text-[10px] text-gray-500 uppercase">Telegram</span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 group-hover:translate-x-1 transition-transform"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
             </div>
          </a>

          <div className="border-t border-dark-800">
             <div className="flex justify-between items-center p-4">
                 <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
                    <span className="text-sm text-gray-300">Account Status</span>
                 </div>
                 <span className={`text-xs px-2 py-1 rounded font-bold ${user.vipLevel > 0 ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                     {user.vipLevel > 0 ? `VIP ${user.vipLevel}` : 'Free Plan'}
                 </span>
             </div>
          </div>
      </div>

      <button 
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-red-900/20 text-red-400 hover:bg-red-900/30 transition-colors border border-red-900/30"
      >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
          Log Out
      </button>

      {/* ADMIN ENTRY BUTTON (Only for verified admin email) */}
      {isAdmin && (
        <div className="pt-4 text-center">
            <button 
                onClick={() => setView(AppView.ADMIN)}
                className="text-xs bg-red-900 text-white px-4 py-2 rounded font-bold hover:bg-red-800 uppercase tracking-widest shadow-lg shadow-red-900/20"
            >
                Super Admin Panel
            </button>
            <p className="text-[10px] text-red-800 mt-2">Secure Access: cryptodrop077@gmail.com</p>
        </div>
      )}

      <div className="text-center pt-4">
          <p className="text-gray-600 text-[10px]">Version 2.0.2 (Production)</p>
      </div>

    </div>
  );
};