import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Shield, Trophy, Users, Swords, Flame, FileText, Lock, Menu, X, Radio, Sun, Moon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { settings, activeTab, setActiveTab, isAdmin, logoutAdmin, theme, toggleTheme } = useTournament();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
      const next = prev + 1;
      if (next >= 3) {
        setActiveTab(isAdmin ? 'admin' : 'admin-login');
        return 0;
      }
      return next;
    });
    setActiveTab('home');
  };

  const navItems = [
    { id: 'home', label: 'HOME', icon: Flame },
    { id: 'leaderboard', label: 'LEADERBOARD', icon: Trophy },
    { id: 'groups', label: 'GROUPS', icon: Users },
    { id: 'matches', label: 'MATCHES', icon: Swords },
    { id: 'finals', label: 'FINALS', icon: Trophy },
    { id: 'teams', label: 'TEAMS', icon: Shield },
    { id: 'rules', label: 'RULES', icon: FileText }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FFF5F0]/95 dark:bg-[#0D0714]/95 backdrop-blur-md border-b-4 border-black shadow-[0_4px_0px_0px_#000] transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Tournament Logo & Title */}
          <div
            id="nav-logo"
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer group select-none"
            title="Click to go Home (Triple click for Admin Root)"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#FF6FB5] border-3 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center shrink-0 group-hover:bg-[#00E5FF] group-hover:-translate-y-0.5 transition-all">
              <span className="font-headline text-xl sm:text-2xl text-white group-hover:text-black transition-colors font-bold">
                BS
              </span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-headline text-lg sm:text-2xl md:text-3xl text-zinc-950 dark:text-white tracking-wider group-hover:text-[#FF6FB5] transition-colors truncate">
                  {settings?.name || 'BGMI SHOWDOWN'}
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] text-[10px] font-headline tracking-widest uppercase font-bold shrink-0">
                  ESPORTS
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E676] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#00E676] border border-black"></span>
                </span>
                <span className="text-[12px] font-headline text-emerald-600 dark:text-[#00E676] tracking-wider uppercase font-bold">
                  {settings?.status || 'GROUP STAGE'} // LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3.5 py-1.5 font-headline text-lg tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF6FB5] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] -translate-y-0.5'
                      : 'bg-white/80 dark:bg-[#1A0F2E] text-zinc-800 dark:text-zinc-200 border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD54F] hover:text-black hover:-translate-y-0.5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-600 dark:text-zinc-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Dark/Light Mode Toggle & Match Hub / Admin */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Global Dark / Light Mode Toggle Button - Visible across all screens */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className={`px-2.5 sm:px-3 py-1.5 font-headline text-xs sm:text-sm tracking-wider flex items-center gap-1.5 cursor-pointer border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all select-none ${
                theme === 'dark'
                  ? 'bg-[#FFD54F] text-black hover:bg-[#00E5FF]'
                  : 'bg-[#00E5FF] text-black hover:bg-[#FFD54F]'
              }`}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle light and dark mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-900 fill-amber-500 animate-spin-slow" />
                  <span>LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-950 fill-indigo-900" />
                  <span>DARK</span>
                </>
              )}
            </button>

            {/* Admin Panel Access - Desktop Workstations Only */}
            {isAdmin ? (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  id="nav-admin-dashboard"
                  onClick={() => setActiveTab('admin')}
                  className={`px-3 py-1.5 font-headline text-sm tracking-wider flex items-center gap-1.5 cursor-pointer border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all ${
                    activeTab.startsWith('admin')
                      ? 'bg-[#FF6FB5] text-white'
                      : 'bg-white dark:bg-[#1A0F2E] text-black dark:text-[#00E5FF] hover:bg-[#FFD54F] hover:text-black'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5 text-[#FF6FB5]" />
                  ADMIN
                </button>
                <button
                  id="nav-admin-logout"
                  onClick={logoutAdmin}
                  className="px-2.5 py-1.5 font-display text-xs text-zinc-700 dark:text-zinc-300 hover:text-red-500 bg-white dark:bg-black/30 border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer"
                >
                  LOGOUT
                </button>
              </div>
            ) : (
              <button
                id="nav-admin-login-btn"
                onClick={() => setActiveTab('admin-login')}
                className="hidden lg:flex px-3 py-1.5 font-headline text-sm tracking-wider items-center gap-1.5 cursor-pointer bg-white dark:bg-[#1A0F2E] border-2 border-black shadow-[3px_3px_0px_0px_#000] text-black dark:text-white hover:bg-[#FFD54F] hover:text-black transition-all"
                title="Referee & Admin operations (Desktop only)"
              >
                <Lock className="w-3.5 h-3.5 text-[#FF6FB5]" />
                ADMIN
              </button>
            )}

            <button
              onClick={() => setActiveTab('matches')}
              className="hidden md:flex px-3.5 py-1.5 font-headline text-sm tracking-wider items-center gap-1.5 cursor-pointer bg-[#FF6FB5] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:bg-black hover:text-white hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Radio className="w-4 h-4 text-[#FFD54F] animate-pulse" />
              MATCH HUB
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              id="nav-mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 bg-white dark:bg-[#1A0F2E] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black dark:text-white cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FFF5F0] dark:bg-[#0D0714] border-b-4 border-black px-4 pt-3 pb-6 space-y-2">
          {/* Quick theme toggle in mobile menu */}
          <button
            onClick={() => {
              toggleTheme();
            }}
            className={`w-full py-2.5 mb-3 font-headline text-base tracking-wider flex items-center justify-center gap-2 border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer ${
              theme === 'dark' ? 'bg-[#FFD54F] text-black' : 'bg-[#00E5FF] text-black'
            }`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 fill-amber-500" /> : <Moon className="w-4 h-4 fill-indigo-900" />}
            <span>THEME: {theme === 'dark' ? 'DARK (CLICK FOR LIGHT)' : 'LIGHT (CLICK FOR DARK)'}</span>
          </button>
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 font-headline text-xl tracking-wider flex items-center gap-3 text-left transition-all border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
                  isActive
                    ? 'bg-[#FF6FB5] text-white -translate-y-0.5'
                    : 'bg-white dark:bg-[#1A0F2E] text-zinc-900 dark:text-zinc-200 hover:bg-[#FFD54F] hover:text-black'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#FF6FB5]'}`} />
                {item.label}
              </button>
            );
          })}

          {/* Quick Public Action on Mobile: No Admin access on mobile */}
          <div className="pt-3 border-t-2 border-black">
            <button
              onClick={() => {
                setActiveTab('matches');
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 bg-[#FF6FB5] text-white font-headline text-center text-lg tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer hover:bg-black transition-colors"
            >
              <Radio className="w-4 h-4 text-[#FFD54F] animate-pulse" />
              LIVE MATCH HUB & SCHEDULE
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
