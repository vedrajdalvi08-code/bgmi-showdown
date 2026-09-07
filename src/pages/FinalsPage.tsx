import React, { useEffect, useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Sparkles, Shield, Swords, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { LeaderboardRow, Match } from '../types';
import { safeFetchJson } from '../utils/api';

export const FinalsPage: React.FC = () => {
  const { setSelectedTeamId, setSelectedMatchId, setActiveTab } = useTournament();
  const [finalsData, setFinalsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    safeFetchJson<any>('/api/finals', undefined, 2, 400).then(data => {
      if (isMounted) {
        if (data) {
          setFinalsData(data);
          if (data.isFinalsCompleted && data.champion) {
            triggerConfetti();
          }
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const triggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FF6FB5', '#00E5FF', '#FFD54F', '#00E676', '#FFFFFF']
    });
  };

  const champion = finalsData?.champion;
  const leaderboard: LeaderboardRow[] = finalsData?.leaderboard || [];
  const matches: Match[] = finalsData?.matches || [];
  const qualifiedTeams = finalsData?.qualifiedTeams || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Finals Header */}
      <div className="border-b-4 border-black pb-6 text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FF6FB5] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-headline text-xs tracking-widest uppercase font-bold">
          <Trophy className="w-4 h-4 text-[#FFD54F]" /> THE CULMINATION OF VALOR
        </div>
        <h1 className="font-headline text-5xl sm:text-7xl text-zinc-950 dark:text-white tracking-wider">
          GRAND FINALS
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-display leading-relaxed">
          16 elite squads qualified through the Group Stages. 5 decisive custom matches across Erangel, Miramar, Sanhok, and the new Rondo map to crown the National BGMI Champion.
        </p>
      </div>

      {/* CHAMPION SHOWCASE BANNER IF COMPLETED */}
      {champion ? (
        <div className="bg-[#FFF9C4] dark:bg-[#1E1136] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-8 sm:p-12 text-center relative overflow-hidden">
          {/* Confetti button */}
          <button
            onClick={triggerConfetti}
            className="absolute top-4 right-4 px-3 py-1.5 bg-[#FF6FB5] hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer font-headline text-xs tracking-wider flex items-center gap-1 transition-all"
          >
            <Sparkles className="w-4 h-4 text-[#FFD54F]" /> CELEBRATE
          </button>

          <div className="w-20 h-20 bg-[#FFD54F] border-3 border-black mx-auto rounded-full flex items-center justify-center mb-4 shadow-[4px_4px_0px_0px_#000]">
            <Trophy className="w-10 h-10 text-black" />
          </div>

          <p className="font-headline text-sm tracking-widest text-[#FF6FB5] uppercase mb-2 font-bold">
            OFFICIAL TOURNAMENT CHAMPION
          </p>

          <h2 className="font-headline text-5xl sm:text-7xl text-zinc-950 dark:text-white tracking-wider">
            {champion.team_name}
          </h2>

          <div className="inline-block px-4 py-1.5 bg-black text-[#FFD54F] border-2 border-black font-headline font-bold text-sm tracking-widest mt-2 uppercase shadow-[2px_2px_0px_0px_#000]">
            TAG: {champion.team_tag} • WINNER TAKE ALL
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto mt-8 text-left">
            <div className="bg-white dark:bg-[#150A24] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-[10px] font-headline font-bold text-zinc-500 uppercase">TOTAL POINTS</div>
              <div className="font-headline text-3xl text-zinc-950 dark:text-[#FFD54F]">{champion.total_points} PTS</div>
            </div>
            <div className="bg-white dark:bg-[#150A24] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-[10px] font-headline font-bold text-zinc-500 uppercase">CHICKEN DINNERS</div>
              <div className="font-headline text-3xl text-[#FF6FB5]">{champion.chicken_dinners || 1} 🍗</div>
            </div>
            <div className="bg-white dark:bg-[#150A24] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-[10px] font-headline font-bold text-zinc-500 uppercase">TOTAL FINISHES</div>
              <div className="font-headline text-3xl text-zinc-950 dark:text-white">{champion.total_kills} KILLS</div>
            </div>
            <div className="bg-white dark:bg-[#150A24] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              <div className="text-[10px] font-headline font-bold text-zinc-500 uppercase">BEST FINISH</div>
              <div className="font-headline text-3xl text-[#00E676]">#{champion.best_placement}</div>
            </div>
          </div>
        </div>
      ) : null}

      {/* PODIUM PREVIEW (TOP 3) */}
      {leaderboard.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          {/* 2nd Place */}
          <div className="order-2 md:order-1 bg-white dark:bg-[#150A24] border-3 border-black shadow-[5px_5px_0px_0px_#00E5FF] p-6 text-center space-y-2">
            <div className="text-2xl font-headline text-zinc-950 dark:text-[#00E5FF] font-bold">🥈 2ND PLACE (RUNNER UP)</div>
            <div className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wide">
              {leaderboard[1]?.team_name}
            </div>
            <div className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {leaderboard[1]?.total_points} PTS • {leaderboard[1]?.chicken_dinners || 0} 🍗 WWCD • {leaderboard[1]?.total_kills} KILLS
            </div>
          </div>

          {/* 1st Place */}
          <div className="order-1 md:order-2 bg-[#FFF9C4] dark:bg-[#251540] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-8 text-center space-y-3 -translate-y-2">
            <div className="text-3xl font-headline text-amber-900 dark:text-[#FFD54F] font-bold">🥇 1ST PLACE (CHAMPION)</div>
            <div className="font-headline text-4xl text-zinc-950 dark:text-white tracking-wide">
              {leaderboard[0]?.team_name}
            </div>
            <div className="text-base font-mono text-zinc-950 dark:text-[#FFD54F] font-bold">
              {leaderboard[0]?.total_points} PTS • {leaderboard[0]?.chicken_dinners || 0} 🍗 WWCD • {leaderboard[0]?.total_kills} KILLS
            </div>
          </div>

          {/* 3rd Place */}
          <div className="order-3 bg-white dark:bg-[#150A24] border-3 border-black shadow-[5px_5px_0px_0px_#FF6FB5] p-6 text-center space-y-2">
            <div className="text-2xl font-headline text-[#FF6FB5] font-bold">🥉 3RD PLACE (PODIUM)</div>
            <div className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wide">
              {leaderboard[2]?.team_name}
            </div>
            <div className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300">
              {leaderboard[2]?.total_points} PTS • {leaderboard[2]?.chicken_dinners || 0} 🍗 WWCD • {leaderboard[2]?.total_kills} KILLS
            </div>
          </div>
        </div>
      )}

      {/* QUALIFIED 16 FINALISTS GRID */}
      <div className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF6FB5] font-headline text-xs uppercase tracking-widest font-bold mb-1">
              <Shield className="w-4 h-4 text-black dark:text-[#00E5FF]" /> OFFICIAL CONTENDERS
            </div>
            <h2 className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wide">
              16 QUALIFIED FINALIST SQUADS
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500">
            TOP QUALIFIERS FROM EVERY GROUP
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
          {(qualifiedTeams.length > 0 ? qualifiedTeams : leaderboard.slice(0, 16)).map((t: any, idx: number) => (
            <div
              key={t.id || t.team_id}
              onClick={() => {
                setSelectedTeamId(t.id || t.team_id);
                setActiveTab('team-detail');
              }}
              className="p-3 bg-[#FFF5F0] dark:bg-[#1A0F2E] border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 transition-all cursor-pointer text-center group"
            >
              <div className="w-10 h-10 mx-auto bg-[#FF6FB5] text-white border-2 border-black flex items-center justify-center font-headline text-base group-hover:bg-[#00E5FF] group-hover:text-black transition-colors mb-2 shadow-[1px_1px_0px_0px_#000]">
                {t.tag ? t.tag.substring(0, 3) : `#${idx + 1}`}
              </div>
              <div className="font-headline text-sm text-zinc-950 dark:text-white group-hover:text-[#FF6FB5] transition-colors truncate">
                {t.name || t.team_name}
              </div>
              <div className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5 font-bold">
                {t.tag || t.team_tag}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FINALS MATCH SCHEDULE WITH RONDO */}
      <div className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-black pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#FF6FB5] font-headline text-xs uppercase tracking-widest font-bold mb-1">
              <Swords className="w-4 h-4 text-black dark:text-[#00E5FF]" /> BATTLEFIELD SCHEDULE
            </div>
            <h2 className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wide">
              GRAND FINALS MATCH SEQUENCE
            </h2>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-500">
            5 AUTHORITATIVE CUSTOM ROOMS (INC. RONDO)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {matches.map((m, idx) => {
            const isCompleted = m.status === 'Completed' || m.status === 'Locked';
            const isRondo = m.map?.toLowerCase() === 'rondo';
            return (
              <div
                key={m.id}
                className="p-4 bg-[#FFF5F0] dark:bg-[#1A0F2E] border-2 border-black shadow-[3px_3px_0px_0px_#000] transition-all"
              >
                <div className="flex items-center justify-between text-xs font-headline font-bold mb-2">
                  <span className="text-[#FF6FB5]">MATCH {idx + 1}</span>
                  <span className={`px-2 py-0.5 border border-black text-[10px] ${
                    isRondo ? 'bg-[#FF6FB5] text-white' : 'bg-[#00E5FF] text-black'
                  }`}>
                    {m.map}
                  </span>
                </div>
                <h3 className="font-headline text-lg text-zinc-950 dark:text-white mb-2 line-clamp-1">
                  {m.name}
                </h3>
                <div className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mb-3">
                  {m.scheduled_time || 'ROUND 1 // 15:00 IST'}
                </div>

                {isCompleted ? (
                  <button
                    onClick={() => setSelectedMatchId(m.id)}
                    className="w-full py-1.5 bg-[#00E5FF] hover:bg-[#FFD54F] text-black font-headline text-xs tracking-wider border border-black shadow-[1px_1px_0px_0px_#000] cursor-pointer transition-colors"
                  >
                    ROOM SCORECARD
                  </button>
                ) : (
                  <div className="text-center text-[10px] font-headline font-bold text-zinc-500 py-1 bg-zinc-200 dark:bg-black/30 border border-black">
                    SCHEDULED
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
