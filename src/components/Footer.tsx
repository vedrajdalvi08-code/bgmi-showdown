import React from 'react';
import { useTournament } from '../context/TournamentContext';
import { Shield, Trophy, Flame, Swords, Lock, Heart, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings, setActiveTab, isAdmin } = useTournament();

  const sponsors = [
    { name: 'KRAFTON ESPORTS', tag: 'OFFICIAL RECOGNIZED' },
    { name: 'RED BULL', tag: 'ENERGY PARTNER' },
    { name: 'ROG PHONE', tag: 'OFFICIAL DEVICE' },
    { name: 'HYPERX', tag: 'AUDIO GEAR' },
    { name: 'DISCORD', tag: 'COMMUNITY HUB' }
  ];

  return (
    <footer className="relative mt-24 bg-white dark:bg-[#07040e] border-t-4 border-black pt-12 pb-8 overflow-hidden z-10 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sponsors Bar */}
        <div className="mb-12 pb-10 border-b-2 border-black">
          <p className="text-center font-headline text-xs tracking-widest text-[#FF6FB5] mb-6 uppercase font-bold">
            // OFFICIAL TOURNAMENT BROADCAST & HARDWARE PARTNERS //
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {sponsors.map((sp, idx) => (
              <div
                key={idx}
                className="bg-[#FFF5F0] dark:bg-[#150A24] border-2 border-black shadow-[2px_2px_0px_0px_#000] p-3 text-center transition-all group hover:-translate-y-0.5"
              >
                <div className="font-headline text-lg text-zinc-900 dark:text-white group-hover:text-[#FF6FB5] transition-colors">
                  {sp.name}
                </div>
                <div className="text-[10px] font-mono text-[#00E5FF] dark:text-[#00E5FF] font-bold tracking-wider">
                  {sp.tag}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FF6FB5] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wider">
                {settings?.name || 'BGMI SHOWDOWN'}
              </span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm max-w-md font-display leading-relaxed">
              {settings?.description ||
                'The ultimate Battlegrounds Mobile India showdown. 48 premier squads clash in an authoritative, configuration-driven tournament format.'}
            </p>
            <div className="inline-flex items-center gap-2 text-xs font-mono text-black dark:text-[#FFD54F] font-bold px-2 py-1 bg-[#FFD54F] dark:bg-[#251540] border border-black shadow-[1px_1px_0px_0px_#000]">
              <Award className="w-4 h-4" />
              <span>AUTHENTIC ESPORTS SCORING ENGINE // KRAFTON STANDARD</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-headline text-xl text-[#FF6FB5] tracking-wider mb-4 font-bold">
              TOURNAMENT HUB
            </h4>
            <ul className="space-y-2 text-sm font-display text-zinc-700 dark:text-zinc-300">
              <li>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="hover:text-[#FF6FB5] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#FFD54F]" /> LIVE LEADERBOARD
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('groups')}
                  className="hover:text-[#FF6FB5] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-[#00E5FF]" /> GROUPS & ROSTERS
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="hover:text-[#FF6FB5] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Swords className="w-3.5 h-3.5 text-[#00E676]" /> MATCH SCHEDULE
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('finals')}
                  className="hover:text-[#FF6FB5] transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5 text-[#FFD54F]" /> GRAND FINALS
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('rules')}
                  className="hover:text-[#FF6FB5] transition-colors cursor-pointer"
                >
                  RULEBOOK & SCORING
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Admin & Control - Desktop Only */}
          <div className="hidden md:block">
            <h4 className="font-headline text-xl text-[#00E5FF] dark:text-[#00E5FF] tracking-wider mb-4 font-bold">
              OPERATIONS
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs font-display mb-3">
              DESKTOP ONLY // Restricted control center for tournament referees, room casters, and score adjudicators.
            </p>
            <button
              onClick={() => setActiveTab(isAdmin ? 'admin' : 'admin-login')}
              className="w-full py-2.5 px-3 bg-[#FF6FB5] hover:bg-black text-white font-headline text-base tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all border-2 border-black shadow-[3px_3px_0px_0px_#000]"
            >
              <Lock className="w-4 h-4 text-white" />
              {isAdmin ? 'MISSION CONTROL ACTIVE' : 'ADMIN LOGIN (DESKTOP)'}
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 dark:text-zinc-400 font-mono gap-4">
          <div>
            © {new Date().getFullYear()} {settings?.name || 'BGMI SHOWDOWN'}. ALL ESPORTS RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-1 text-zinc-800 dark:text-zinc-300 font-bold">
            BGMI ESPORTS TOURNAMENT PLATFORM // VICE THEME
          </div>
        </div>
      </div>
    </footer>
  );
};
