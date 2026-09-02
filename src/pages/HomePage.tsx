import React, { useEffect, useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Crosshair, Flame, Swords, Users, Radio, ChevronRight, Clock, Award, Sparkles } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { settings, stats, nextMatch, recentMatch, leaderboard, setActiveTab, setSelectedMatchId } = useTournament();

  // Countdown timer to next match
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 2,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const topFive = leaderboard.slice(0, 5);

  return (
    <div className="space-y-12 py-6">
      {/* HERO SECTION - GTA VICE NEO-BRUTALIST */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-10">
        <div className="max-w-6xl mx-auto text-center space-y-6 relative z-10">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FF6FB5] text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] select-none">
            <Radio className="w-4 h-4 text-[#FFD54F] animate-pulse" />
            <span className="font-headline text-xs sm:text-sm tracking-widest uppercase font-bold">
              BGMI ESPORTS NATIONAL CHAMPIONSHIP 2026
            </span>
          </div>

          {/* Main Massive Title */}
          <h1 className="font-headline text-5xl sm:text-7xl md:text-8xl tracking-wider text-zinc-950 dark:text-white uppercase leading-none">
            <span className="block drop-shadow-[2px_2px_0px_#00E5FF]">
              {settings?.name || 'BGMI SHOWDOWN'}
            </span>
            <span className="inline-block mt-3 px-4 py-1 bg-[#FFD54F] text-black border-3 border-black shadow-[4px_4px_0px_0px_#000] text-2xl sm:text-4xl md:text-5xl font-headline tracking-wider">
              {settings?.tagline || 'DROP. SURVIVE. DOMINATE.'}
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-zinc-700 dark:text-zinc-300 text-sm sm:text-base font-display leading-relaxed">
            {settings?.description ||
              '48 elite squads battle through grueling group stages into the Grand Finals. Featuring official Rondo map rotations, live chicken dinner counters, and Krafton-compliant tie-breakers.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 pt-2 max-w-md sm:max-w-none mx-auto">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#FF6FB5] hover:bg-[#FF85C0] text-white font-headline text-lg sm:text-xl tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Trophy className="w-5 h-5 text-[#FFD54F]" />
              VIEW LIVE LEADERBOARD
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#00E5FF] hover:bg-[#3BF6FF] text-black font-headline text-lg sm:text-xl tracking-wider border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Swords className="w-5 h-5 text-black" />
              MATCHES & MAP ROTATION
            </button>
          </div>
        </div>
      </section>

      {/* METRICS & CHICKEN DINNER STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Active Squads */}
          <div className="bg-white dark:bg-[#1A0F2E] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5 relative">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-headline font-bold mb-1">
              <span>ACTIVE SQUADS</span>
              <Users className="w-4 h-4 text-[#FF6FB5]" />
            </div>
            <div className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-wider">
              {stats?.totalTeams || 48}
            </div>
            <div className="text-[11px] font-mono text-[#00E5FF] font-bold mt-1">
              GROUPS A & B
            </div>
          </div>

          {/* Chicken Dinners Count (Prominently Highlighted!) */}
          <div className="bg-[#FFF9C4] dark:bg-[#251540] border-3 border-black shadow-[4px_4px_0px_0px_#FF6FB5] p-4 sm:p-5 relative transform hover:-translate-y-0.5 transition-transform">
            <div className="flex items-center justify-between text-amber-900 dark:text-[#FFD54F] text-xs font-headline font-bold mb-1">
              <span>CHICKEN DINNERS</span>
              <Trophy className="w-4 h-4 text-[#FF6FB5]" />
            </div>
            <div className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-[#FFD54F] tracking-wider flex items-baseline gap-1.5">
              <span>{stats?.totalChickenDinners ?? 3}</span>
              <span className="text-xl">🍗</span>
            </div>
            <div className="text-[11px] font-headline font-bold text-[#FF6FB5] mt-1 uppercase">
              WWCDs CLAIMED
            </div>
          </div>

          {/* Total Eliminations */}
          <div className="bg-white dark:bg-[#1A0F2E] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5 relative">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-headline font-bold mb-1">
              <span>ELIMINATIONS</span>
              <Crosshair className="w-4 h-4 text-[#FF6FB5]" />
            </div>
            <div className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-wider">
              {stats?.totalKills || 0}
            </div>
            <div className="text-[11px] font-mono text-[#00E676] font-bold mt-1">
              FINISH PTS TOTAL
            </div>
          </div>

          {/* Completed Matches */}
          <div className="bg-white dark:bg-[#1A0F2E] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5 relative">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-headline font-bold mb-1">
              <span>MATCHES</span>
              <Flame className="w-4 h-4 text-[#00E5FF]" />
            </div>
            <div className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-wider">
              {stats?.completedMatches || 0} <span className="text-xl text-zinc-500">/ {stats?.totalMatches || 12}</span>
            </div>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
              {stats?.remainingMatches || 0} REMAINING
            </div>
          </div>

          {/* Prize Pool */}
          <div className="bg-white dark:bg-[#1A0F2E] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4 sm:p-5 relative col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400 text-xs font-headline font-bold mb-1">
              <span>PRIZE POOL</span>
              <Award className="w-4 h-4 text-[#FFD54F]" />
            </div>
            <div className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-[#FFD54F] tracking-wider">
              ₹50L
            </div>
            <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-1">
              + MVP BONUSES
            </div>
          </div>
        </div>
      </section>

      {/* NEXT MATCH RADAR & RECENT CHICKEN DINNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Next Match Card */}
          <div className="lg:col-span-7 bg-white dark:bg-[#150A24] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 sm:p-8 relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-[#00E5FF] border border-black animate-ping" />
                <span className="font-headline text-xs sm:text-sm text-[#FF6FB5] tracking-widest uppercase font-bold">
                  UP NEXT ON BATTLEGROUNDS
                </span>
              </div>
              <span className="px-3 py-1 bg-[#00E5FF] text-black font-headline text-xs font-bold border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                {nextMatch?.map || 'ERANGEL'}
              </span>
            </div>

            <h2 className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-wide mb-2">
              {nextMatch?.name || 'GROUP A // MATCH 2 — ERANGEL'}
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm font-display mb-6">
              Official custom room lobby opens shortly. Spectator relays and anti-cheat telemetry active.
            </p>

            {/* Countdown timer display */}
            <div className="bg-[#FFF5F0] dark:bg-[#0B0416] p-4 border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-300 font-headline text-sm font-bold">
                <Clock className="w-4 h-4 text-[#FF6FB5]" />
                <span>DROP COUNTDOWN:</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 font-headline text-2xl sm:text-3xl text-zinc-950 dark:text-[#FFD54F] tracking-widest font-bold">
                <span>{String(timeLeft.hours).padStart(2, '0')}H</span>
                <span className="text-zinc-400">:</span>
                <span>{String(timeLeft.minutes).padStart(2, '0')}M</span>
                <span className="text-zinc-400">:</span>
                <span>{String(timeLeft.seconds).padStart(2, '0')}S</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-headline font-bold text-zinc-500">
                ROOM STATUS: AWAITING PASSWORDS
              </span>
              <button
                onClick={() => setActiveTab('matches')}
                className="px-4 py-2 bg-[#00E5FF] hover:bg-[#FFD54F] text-black font-headline text-base tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all hover:-translate-y-0.5"
              >
                VIEW FULL SCHEDULE
              </button>
            </div>
          </div>

          {/* Recent Chicken Dinner Winner */}
          <div className="lg:col-span-5 bg-[#FFF9C4] dark:bg-[#251540] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-900 dark:text-[#FFD54F] font-headline text-xs sm:text-sm tracking-widest uppercase font-bold mb-3">
                <Trophy className="w-4 h-4 text-[#FF6FB5]" />
                LATEST CHICKEN DINNER (WWCD)
              </div>

              <div className="font-headline text-3xl sm:text-4xl text-zinc-950 dark:text-white tracking-wide">
                {recentMatch?.name || 'MATCH 1 — ERANGEL'}
              </div>

              <div className="mt-4 p-4 bg-white dark:bg-[#150A24] border-2 border-black shadow-[3px_3px_0px_0px_#000] space-y-2">
                <div className="text-xs font-headline font-bold text-zinc-500">WINNING SQUAD:</div>
                <div className="font-headline text-2xl text-zinc-950 dark:text-[#FFD54F] tracking-wider flex items-center gap-2">
                  <span>{recentMatch?.winner?.team_name || 'GODLIKE ESPORTS'}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#FF6FB5] text-white border border-black">
                    WINNER
                  </span>
                </div>
                <div className="text-xs font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  {recentMatch?.winner?.kills || 14} FINISHES • {recentMatch?.winner?.total_points || 24} TOTAL POINTS
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t-2 border-black/20 flex justify-between items-center">
              <span className="text-xs font-headline font-bold text-[#00E676] bg-black px-2 py-0.5">
                VERIFIED RESULT
              </span>
              {recentMatch?.id && (
                <button
                  onClick={() => setSelectedMatchId(recentMatch.id)}
                  className="text-xs font-headline font-bold text-[#FF6FB5] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  VIEW ROOM SCORECARD <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* LEADERBOARD PREVIEW WIDGET WITH CHICKEN DINNER COLUMN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b-2 border-black">
            <div>
              <div className="flex items-center gap-2 text-[#FF6FB5] font-headline text-xs uppercase tracking-widest font-bold mb-1">
                <Trophy className="w-4 h-4 text-black dark:text-[#00E5FF]" />
                STANDINGS TELEMETRY
              </div>
              <h2 className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wider">
                TOP RANKED SQUADS
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className="self-start sm:self-auto px-4 py-2 bg-[#FF6FB5] hover:bg-[#FF85C0] text-white font-headline text-base tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5"
            >
              FULL STANDINGS & TIE-BREAKERS <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Card List View (< md) */}
          <div className="md:hidden space-y-3">
            {topFive.length > 0 ? (
              topFive.map((row, idx) => (
                <div
                  key={row.team_id}
                  onClick={() => setActiveTab('leaderboard')}
                  className="p-4 bg-white dark:bg-[#1A0F2E] border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-lg font-bold">
                        {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${row.rank}`}
                      </span>
                      <span className="font-headline text-lg text-zinc-950 dark:text-white truncate max-w-37.5">
                        {row.team_name}
                      </span>
                      <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-white/10 text-xs font-mono font-bold border border-black">
                        {row.team_tag}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-headline text-xl text-[#FF6FB5] dark:text-[#FFD54F] font-bold">
                        {row.total_points} PTS
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400 border-t border-black/10 dark:border-white/10 pt-2">
                    <span className="px-2 py-0.5 bg-[#FFF9C4] dark:bg-[#251540] text-amber-900 dark:text-[#FFD54F] font-bold border border-black">
                      {row.chicken_dinners || 0} 🍗 WWCD
                    </span>
                    <span>{row.matches_played} MATCHES</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-200">{row.total_kills} KILLS</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-zinc-500 font-display">
                Loading tournament standings...
              </div>
            )}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFF5F0] dark:bg-[#1A0F2E] border-b-2 border-black text-xs font-headline tracking-widest text-zinc-900 dark:text-[#00E5FF]">
                  <th className="py-3 px-4 text-center w-16">RANK</th>
                  <th className="py-3 px-4">SQUAD</th>
                  <th className="py-3 px-4 text-center bg-[#FFF9C4] dark:bg-[#251540] text-amber-900 dark:text-[#FFD54F] font-bold">
                    🍗 WWCD (WINS)
                  </th>
                  <th className="py-3 px-4 text-center">MATCHES</th>
                  <th className="py-3 px-4 text-center">FINISHES</th>
                  <th className="py-3 px-4 text-center text-[#FF6FB5]">PLACE PTS</th>
                  <th className="py-3 px-4 text-center text-zinc-900 dark:text-[#FFD54F] font-bold">TOTAL PTS</th>
                  <th className="py-3 px-4 text-center">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800 font-display text-sm">
                {topFive.length > 0 ? (
                  topFive.map((row, idx) => (
                    <tr
                      key={row.team_id}
                      className="hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setActiveTab('leaderboard')}
                    >
                      <td className="py-3 px-4 text-center font-headline text-xl">
                        {idx === 0 ? (
                          <span className="text-[#FFD54F] drop-shadow-[1px_1px_0px_#000]">🥇 1</span>
                        ) : idx === 1 ? (
                          <span className="text-[#00E5FF] drop-shadow-[1px_1px_0px_#000]">🥈 2</span>
                        ) : idx === 2 ? (
                          <span className="text-[#FF6FB5] drop-shadow-[1px_1px_0px_#000]">🥉 3</span>
                        ) : (
                          <span className="text-zinc-500 font-bold">{row.rank}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-lg text-zinc-900 dark:text-white tracking-wide">
                            {row.team_name}
                          </span>
                          <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-mono font-bold border border-black">
                            {row.team_tag}
                          </span>
                        </div>
                      </td>
                      {/* WWCD (Chicken Dinners Count) */}
                      <td className="py-3 px-4 text-center font-headline text-base">
                        <span className="px-2.5 py-0.5 bg-[#FFF9C4] dark:bg-[#251540] text-amber-900 dark:text-[#FFD54F] border border-black font-bold shadow-[1px_1px_0px_0px_#000]">
                          {row.chicken_dinners || 0} 🍗
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-700 dark:text-zinc-300 font-mono">
                        {row.matches_played}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-900 dark:text-zinc-200 font-mono font-bold">
                        {row.total_kills}
                      </td>
                      <td className="py-3 px-4 text-center text-[#FF6FB5] font-mono font-bold">
                        {row.placement_points}
                      </td>
                      <td className="py-3 px-4 text-center font-headline text-xl text-zinc-950 dark:text-[#FFD54F]">
                        {row.total_points}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 bg-[#00E676] text-black border border-black text-xs font-headline font-bold tracking-wider shadow-[1px_1px_0px_0px_#000]">
                          QUALIFIED
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-zinc-500 font-display">
                      Loading tournament standings...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
