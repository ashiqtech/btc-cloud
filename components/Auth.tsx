import React, { useState, useEffect } from 'react';
import { loginUser, registerUser, resetPassword } from '../services/mockBackend';
import { User } from '../types';

interface AuthProps {
  onSuccess: (user: User) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [viewState, setViewState] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  // Forgot Password State
  const [fpStep, setFpStep] = useState(1); // 1: Email, 2: Code+NewPass
  const [fpCode, setFpCode] = useState('');
  const [fpNewPass, setFpNewPass] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 1. Check Standard Query Param (?ref=CODE)
    const params = new URLSearchParams(window.location.search);
    let ref = params.get('ref');

    // 2. Check Hash Path for "free/ref/CODE"
    if (!ref) {
        const hash = window.location.hash;
        // Regex to find /ref/CODE in the hash, case insensitive
        // Matches #/free/ref/CODE, #/cryptominerpro/ref/CODE, etc.
        const match = hash.match(/ref\/([A-Za-z0-9]+)/i);
        if (match && match[1]) {
            ref = match[1];
        }
    }

    if (ref) {
      setReferralCode(ref);
      setViewState('REGISTER');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedPass = password.trim();

      if (viewState === 'REGISTER' && trimmedPass !== confirmPass.trim()) {
        throw new Error("Passwords do not match");
      }

      const user = viewState === 'LOGIN'
        ? await loginUser(trimmedEmail, trimmedPass)
        : await registerUser(trimmedEmail, trimmedPass, referralCode.trim());
      
      onSuccess(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccessMsg(null);
      setLoading(true);

      try {
          if (fpStep === 1) {
              await new Promise(r => setTimeout(r, 1000));
              const code = Math.floor(100000 + Math.random() * 900000).toString();
              setGeneratedCode(code);
              alert(`[SIMULATION] Your verification code is: ${code}`);
              setFpStep(2);
              setSuccessMsg("Code sent to email (Check alert)");
          } else {
              if (fpCode.trim() !== generatedCode) throw new Error("Invalid verification code");
              await resetPassword(email.trim(), fpNewPass.trim());
              setSuccessMsg("Password reset successful! Please login.");
              setTimeout(() => {
                  setViewState('LOGIN');
                  setFpStep(1);
                  setSuccessMsg(null);
                  setPassword('');
              }, 2000);
          }
      } catch (err: any) {
          setError(err.message);
      } finally {
          setLoading(false);
      }
  };

  if (viewState === 'FORGOT') {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
          <div className="w-full max-w-sm bg-dark-900/50 backdrop-blur-sm border border-dark-800 rounded-2xl p-6 shadow-xl">
              <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-white">Reset Password</h2>
                  <p className="text-xs text-gray-400">Step {fpStep} of 2</p>
              </div>

              {error && <div className="bg-red-900/30 text-red-200 text-xs p-3 rounded mb-4">{error}</div>}
              {successMsg && <div className="bg-green-900/30 text-green-200 text-xs p-3 rounded mb-4">{successMsg}</div>}

              <form onSubmit={handleForgotSubmit} className="space-y-4">
                  {fpStep === 1 ? (
                      <div>
                        <label className="text-xs text-gray-400 uppercase font-bold ml-1">Enter Registered Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 transition-all outline-none mt-1"
                            placeholder="name@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                      </div>
                  ) : (
                      <>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold ml-1">Verification Code</label>
                            <input 
                                type="text" 
                                required
                                className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 transition-all outline-none mt-1"
                                placeholder="123456"
                                value={fpCode}
                                onChange={e => setFpCode(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase font-bold ml-1">New Password</label>
                            <input 
                                type="password" 
                                required
                                className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 transition-all outline-none mt-1"
                                placeholder="New Password"
                                value={fpNewPass}
                                onChange={e => setFpNewPass(e.target.value)}
                            />
                        </div>
                      </>
                  )}
                  
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg mt-4"
                  >
                    {loading ? 'Processing...' : (fpStep === 1 ? 'Send Code' : 'Reset Password')}
                  </button>
              </form>
              <button onClick={() => setViewState('LOGIN')} className="w-full text-center text-sm text-gray-500 mt-4 hover:text-white">Cancel</button>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.5)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">CryptoMine Pro</h1>
          <p className="text-gray-400 mt-2">Next Gen Cloud Mining</p>
        </div>

        <div className="bg-dark-900/50 backdrop-blur-sm border border-dark-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-white mb-6 text-center">
            {viewState === 'LOGIN' ? 'Welcome Back' : 'Create Account'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-200 text-xs p-3 rounded font-bold">
                {error}
              </div>
            )}
            
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold ml-1">Email</label>
              <input 
                type="email" 
                required
                className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none mt-1"
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-xs text-gray-400 uppercase font-bold ml-1">Password</label>
              <input 
                type="password" 
                required
                className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none mt-1"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {viewState === 'LOGIN' && (
                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center text-gray-400 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={rememberMe} 
                            onChange={e => setRememberMe(e.target.checked)}
                            className="mr-2 rounded border-dark-700 bg-dark-950 text-brand-500 focus:ring-brand-500" 
                        />
                        Remember Me
                    </label>
                    <button type="button" onClick={() => setViewState('FORGOT')} className="text-brand-400 hover:text-brand-300">
                        Forgot Password?
                    </button>
                </div>
            )}

            {viewState === 'REGISTER' && (
              <>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold ml-1">Confirm Password</label>
                <input 
                  type="password" 
                  required
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none mt-1"
                  placeholder="••••••••"
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold ml-1">Referral Code (Optional)</label>
                <input 
                  type="text" 
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl p-3 text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all outline-none mt-1"
                  placeholder="Referral Code"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value)}
                />
              </div>
              </>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-brand-900/20 transition-all active:scale-95 mt-4"
            >
              {loading ? 'Processing...' : (viewState === 'LOGIN' ? 'Login' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button 
              onClick={() => { setViewState(viewState === 'LOGIN' ? 'REGISTER' : 'LOGIN'); setError(null); }}
              className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
            >
              {viewState === 'LOGIN' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
      
      {/* Help Link */}
      <div className="mt-8">
        <a 
            href="https://t.me/cryptominerpro1234" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-400 transition-colors"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Need Help? Contact Support
        </a>
      </div>
    </div>
  );
};