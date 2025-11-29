import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
}

const NavItem = ({ 
  active, 
  onClick, 
  icon, 
  label 
}: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string 
}) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
      active ? 'text-brand-500' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    <div className={`mb-1 ${active ? 'scale-110' : ''} transition-transform`}>
      {icon}
    </div>
    <span className="text-[10px] font-medium tracking-wide">{label}</span>
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  if (currentView === AppView.AUTH) return <>{children}</>;

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col max-w-md mx-auto relative shadow-2xl shadow-black overflow-hidden border-x border-dark-800">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 h-20 bg-dark-900/95 backdrop-blur-md border-t border-dark-800 flex justify-around items-center px-2 z-50">
        <NavItem 
          active={currentView === AppView.DASHBOARD}
          onClick={() => setView(AppView.DASHBOARD)}
          label="HOME"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
          }
        />
        <NavItem 
          active={currentView === AppView.UPGRADE}
          onClick={() => setView(AppView.UPGRADE)}
          label="UPGRADE"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          }
        />
        <NavItem 
          active={currentView === AppView.LEADERBOARD}
          onClick={() => setView(AppView.LEADERBOARD)}
          label="RANKING"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
          }
        />
        <NavItem 
          active={currentView === AppView.WALLET}
          onClick={() => setView(AppView.WALLET)}
          label="WALLET"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
          }
        />
        <NavItem 
          active={currentView === AppView.PROFILE}
          onClick={() => setView(AppView.PROFILE)}
          label="PROFILE"
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          }
        />
      </nav>
    </div>
  );
};