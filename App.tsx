import React, { useState, useEffect } from 'react';
import { User, AppView } from './types';
import { getCurrentUser } from './services/mockBackend';
import { Layout } from './components/Layout';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Upgrade } from './components/Upgrade';
import { Wallet } from './components/Wallet';
import { Leaderboard } from './components/Leaderboard';
import { Admin } from './components/Admin';
import { Team } from './components/Team';
import { Swap } from './components/Swap';
import { Profile } from './components/Profile';

const App = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.AUTH);
  const [initializing, setInitializing] = useState(true);

  // Initial Load with safe persistence check
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setCurrentView(AppView.DASHBOARD);
        } else {
          setCurrentView(AppView.AUTH);
        }
      } catch (e) {
        console.error("Session load error", e);
        setCurrentView(AppView.AUTH);
      } finally {
        setInitializing(false);
      }
    };
    loadUser();
  }, []);

  const refreshUser = async () => {
    const user = await getCurrentUser();
    if (user) setCurrentUser(user);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentView(AppView.DASHBOARD);
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Not logged in
  if (!currentUser || currentView === AppView.AUTH) {
    return <Auth onSuccess={handleLoginSuccess} />;
  }

  // Admin View Override
  if (currentView === AppView.ADMIN) {
    return <Admin user={currentUser} refreshUser={refreshUser} goBack={() => setCurrentView(AppView.PROFILE)} />;
  }

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {currentView === AppView.DASHBOARD && (
        <Dashboard user={currentUser} refreshUser={refreshUser} setView={setCurrentView} />
      )}
      {currentView === AppView.UPGRADE && (
        <Upgrade user={currentUser} refreshUser={refreshUser} />
      )}
      {currentView === AppView.WALLET && (
        <Wallet user={currentUser} refreshUser={refreshUser} setView={setCurrentView} />
      )}
      {currentView === AppView.LEADERBOARD && (
        <Leaderboard />
      )}
      {currentView === AppView.TEAM && (
        <Team user={currentUser} setView={setCurrentView} refreshUser={refreshUser} />
      )}
      {currentView === AppView.SWAP && (
        <Swap user={currentUser} refreshUser={refreshUser} setView={setCurrentView} />
      )}
      {currentView === AppView.PROFILE && (
        <Profile user={currentUser} setView={setCurrentView} />
      )}
    </Layout>
  );
};

export default App;