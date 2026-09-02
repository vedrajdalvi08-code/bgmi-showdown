import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  LayoutDashboard,
  Shield,
  Swords,
  ClipboardList,
  Trophy,
  Settings,
  FileText,
  LogOut,
  ExternalLink,
  Lock
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { activeTab, setActiveTab, logoutAdmin } = useTournament();

  const navTabs = [
    { id: 'admin', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'admin-teams', label: 'SQUADS & PLAYERS', icon: Shield },
    { id: 'admin-matches', label: 'MATCH SCHEDULE', icon: Swords },
    { id: 'admin-results', label: 'ENTER RESULTS / CSV', icon: ClipboardList },
    { id: 'admin-finals', label: 'FINALS GENERATOR', icon: Trophy },
    { id: 'admin-rules', label: 'RULES EDITOR', icon: FileText },
    { id: 'admin-settings', label: 'ENGINE SETTINGS', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#06020c] text-white">
      {/* Admin Top Navigation Bar */}
      <div className="bg-[#0e061c] border-b-2 border-[#ff007f] sticky top-0 z-30 shadow-[0_4px_20px_rgba(255,0,127,0.2)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Title */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#210e3d] comic-border-sm flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#ff007f]" />
              </div>
              <div>
                <span className="font-headline text-xl sm:text-2xl text-white tracking-wider">
                  MISSION CONTROL
                </span>
                <span className="hidden sm:inline-block ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono border border-emerald-500/40">
                  ROOT ADJUDICATOR
                </span>
              </div>
            </div>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('home')}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-zinc-700 font-headline text-xs tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                title="View Public Website"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#00f5ff]" />
                PUBLIC PORTAL
              </button>

              <button
                onClick={logoutAdmin}
                className="px-3 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/60 font-headline text-xs tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                LOGOUT
              </button>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none border-t border-zinc-800/80 pt-1">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 font-headline text-sm tracking-wider flex items-center gap-1.5 whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? 'bg-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.4)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
