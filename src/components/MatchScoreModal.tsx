import React, { useEffect, useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { X, Trophy, Crosshair, Award, Shield } from 'lucide-react';
import { MatchResultItem } from '../types';
import { safeFetchJson } from '../utils/api';

export const MatchScoreModal: React.FC = () => {
  const { selectedMatchId, setSelectedMatchId, matches } = useTournament();
  const [loading, setLoading] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);

  useEffect(() => {
    if (!selectedMatchId) {
      setMatchData(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    safeFetchJson<any>(`/api/matches/${selectedMatchId}`, undefined, 2, 400).then(data => {
      if (isMounted) {
        if (data) {
          setMatchData(data);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedMatchId]);

  if (!selectedMatchId) return null;

  const currentMatch = matches.find(m => m.id === selectedMatchId) || matchData?.match;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#150A24] border-4 border-black shadow-[10px_10px_0px_0px_#000] p-4 sm:p-8 my-4 sm:my-8 text-zinc-950 dark:text-white space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header Close Button */}
        <button
          onClick={() => setSelectedMatchId(null)}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 bg-[#FF6FB5] hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer transition-all"
        >
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Title & Match Metadata */}
        <div className="pr-10">
          <div className="flex items-center gap-2 font-headline text-[#FF6FB5] text-xs sm:text-sm tracking-wider uppercase mb-1 font-bold">
            <span>OFFICIAL BGMI ROOM SCORECARD</span>
            <span>•</span>
            <span className="px-2 py-0.5 bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_0px_#000]">{currentMatch?.map || 'ERANGEL'}</span>
          </div>
          <h2 className="font-headline text-2xl sm:text-4xl tracking-wider text-zinc-950 dark:text-white">
            {currentMatch?.name || 'MATCH SCORECARD'}
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-display mt-1">
            STATUS: <span className="text-[#00E676] bg-black px-2 py-0.5 font-bold">{currentMatch?.status || 'COMPLETED'}</span> • VERIFIED AUTHORITATIVE SCORES
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 border-4 border-black border-t-[#FF6FB5] rounded-full animate-spin mx-auto mb-4" />
            <p className="font-headline text-zinc-600 dark:text-zinc-400">RETRIEVING COMBAT TELEMETRY...</p>
          </div>
        ) : matchData?.results?.length > 0 ? (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Winner Card */}
              {matchData.winner && (
                <div className="bg-[#FFF9C4] dark:bg-[#251540] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4 relative overflow-hidden">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-[#FFD54F] font-headline text-base tracking-wider mb-2 font-bold">
                    <Trophy className="w-5 h-5 text-[#FF6FB5]" /> WINNER WINNER CHICKEN DINNER
                  </div>
                  <div className="text-2xl font-headline text-zinc-950 dark:text-white tracking-wide">
                    {matchData.winner.team_name}
                  </div>
                  <div className="text-sm font-mono font-bold text-zinc-700 dark:text-zinc-300 mt-1">
                    {matchData.winner.kills} KILLS • {matchData.winner.total_points} TOTAL PTS
                  </div>
                </div>
              )}

              {/* Highest Kills Card */}
              <div className="bg-white dark:bg-[#1A0F2E] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4">
                <div className="flex items-center gap-2 text-[#00E5FF] font-headline text-base tracking-wider mb-2 font-bold">
                  <Crosshair className="w-5 h-5 text-[#FF6FB5]" /> MOST FRAGS (MATCH)
                </div>
                <div className="text-2xl font-headline text-zinc-950 dark:text-white tracking-wide">
                  {matchData.stats?.highestKills} KILLS
                </div>
                <div className="text-sm font-mono text-zinc-600 dark:text-zinc-400 mt-1">
                  TOTAL FINISHES: {matchData.stats?.totalMatchKills}
                </div>
              </div>

              {/* Match Score Peak */}
              <div className="bg-white dark:bg-[#1A0F2E] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-4">
                <div className="flex items-center gap-2 text-[#FF6FB5] font-headline text-base tracking-wider mb-2 font-bold">
                  <Award className="w-5 h-5 text-[#FFD54F]" /> TOP MATCH POINTS
                </div>
                <div className="text-2xl font-headline text-zinc-950 dark:text-white tracking-wide">
                  {matchData.stats?.highestScore} PTS
                </div>
                <div className="text-sm font-mono text-zinc-600 dark:text-zinc-400 mt-1">
                  TEAMS RECORDED: {matchData.stats?.participatingTeamsCount}
                </div>
              </div>
            </div>

            {/* Mobile Scorecard List (< md) */}
            <div className="md:hidden space-y-2.5">
              {matchData.results.map((res: MatchResultItem) => (
                <div
                  key={res.id}
                  className={`p-3 border-2 border-black ${
                    res.placement === 1
                      ? 'bg-[#FFF9C4] dark:bg-[#251540] shadow-[3px_3px_0px_0px_#FFD54F]'
                      : 'bg-white dark:bg-[#1A0F2E] shadow-[2px_2px_0px_0px_#000]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-headline text-lg font-bold">
                        {res.placement === 1 ? '👑 #1' : `#${res.placement}`}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-headline text-base text-zinc-950 dark:text-white">
                        {res.team_name}
                      </span>
                      <span className="px-1.5 py-0.2 bg-zinc-200 dark:bg-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-mono font-bold border border-black">
                        {res.team_tag}
                      </span>
                    </div>
                    <div className="font-headline text-xl text-zinc-950 dark:text-[#FFD54F] font-bold">
                      {res.total_points} PTS
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-zinc-600 dark:text-zinc-400 border-t border-black/10 dark:border-white/10 pt-1.5">
                    <span>RANK: #{res.placement} ({res.placement_points} PTS)</span>
                    <span className="text-[#FF6FB5] font-bold">{res.kills} KILLS ({res.kill_points} PTS)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Scorecard Table (>= md) */}
            <div className="hidden md:block border-3 border-black shadow-[4px_4px_0px_0px_#000] bg-white dark:bg-[#0E061A] overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFF5F0] dark:bg-[#1A0F2E] border-b-2 border-black text-xs font-headline tracking-widest text-zinc-900 dark:text-[#00E5FF]">
                    <th className="py-3 px-4 text-center w-16">#</th>
                    <th className="py-3 px-4">SQUAD</th>
                    <th className="py-3 px-4 text-center">PLACEMENT</th>
                    <th className="py-3 px-4 text-center">KILLS</th>
                    <th className="py-3 px-4 text-center text-[#FF6FB5]">PLACE PTS</th>
                    <th className="py-3 px-4 text-center text-[#00E5FF]">KILL PTS</th>
                    <th className="py-3 px-4 text-center text-zinc-950 dark:text-[#FFD54F] font-bold">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800 font-display text-sm">
                  {matchData.results.map((res: MatchResultItem) => (
                    <tr
                      key={res.id}
                      className={`hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors ${
                        res.placement === 1 ? 'bg-[#FFF9C4]/50 dark:bg-[#FFD54F]/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-headline text-lg">
                        {res.placement === 1 ? (
                          <span className="text-[#FFD54F] drop-shadow-[1px_1px_0px_#000]">👑 1</span>
                        ) : res.placement <= 3 ? (
                          <span className="text-[#00E5FF] font-bold">{res.placement}</span>
                        ) : (
                          <span className="text-zinc-400 font-bold">{res.placement}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-headline text-lg text-zinc-950 dark:text-white tracking-wide">
                            {res.team_name}
                          </span>
                          <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-mono font-bold border border-black">
                            {res.team_tag}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-zinc-700 dark:text-zinc-300">
                        #{res.placement}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-950 dark:text-zinc-200 font-mono font-bold">
                        {res.kills}
                      </td>
                      <td className="py-3 px-4 text-center text-[#FF6FB5] font-mono font-bold">
                        {res.placement_points}
                      </td>
                      <td className="py-3 px-4 text-center text-[#00E5FF] font-mono font-bold">
                        {res.kill_points}
                      </td>
                      <td className="py-3 px-4 text-center text-zinc-950 dark:text-[#FFD54F] font-headline text-xl font-bold">
                        {res.total_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="py-12 text-center bg-white dark:bg-[#150A24] border-3 border-dashed border-black p-6">
            <Shield className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <p className="font-headline text-xl text-zinc-900 dark:text-zinc-200">NO RESULTS REGISTERED YET</p>
            <p className="text-xs text-zinc-500 font-display mt-1">
              Match is currently scheduled. Results will appear once room matches conclude and are verified by referees.
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t-2 border-black">
          <button
            onClick={() => setSelectedMatchId(null)}
            className="px-6 py-2.5 bg-[#00E5FF] text-black hover:bg-[#FFD54F] font-headline text-lg tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all hover:-translate-y-0.5"
          >
            CLOSE SCORECARD
          </button>
        </div>
      </div>
    </div>
  );
};
