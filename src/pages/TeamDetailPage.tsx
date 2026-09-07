import React, { useEffect, useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Shield, Trophy, Crosshair, Award, ArrowLeft, Users, Swords } from 'lucide-react';
import { Player } from '../types';
import { safeFetchJson } from '../utils/api';

export const TeamDetailPage: React.FC = () => {
  const { selectedTeamId, setSelectedTeamId, setActiveTab } = useTournament();
  const [teamData, setTeamData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedTeamId) return;

    let isMounted = true;
    setLoading(true);
    safeFetchJson<any>(`/api/teams/${selectedTeamId}`, undefined, 2, 400).then(data => {
      if (isMounted) {
        if (data) {
          setTeamData(data);
        }
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedTeamId]);

  if (!selectedTeamId) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <p className="font-headline text-2xl text-zinc-600 dark:text-zinc-400">NO SQUAD SELECTED</p>
        <button
          onClick={() => setActiveTab('teams')}
          className="px-6 py-2.5 bg-[#FF6FB5] text-white font-headline text-lg border-2 border-black shadow-[3px_3px_0px_0px_#000]"
        >
          RETURN TO TEAMS DIRECTORY
        </button>
      </div>
    );
  }

  const team = teamData?.team;
  const players: Player[] = teamData?.players || [];
  const matchHistory = teamData?.matchHistory || [];
  const stats = teamData?.stats;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back navigation button */}
      <button
        onClick={() => setActiveTab('teams')}
        className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A0F2E] hover:bg-[#FFD54F] dark:hover:bg-[#FFD54F] text-zinc-950 hover:text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] font-headline text-sm tracking-wider cursor-pointer transition-all hover:-translate-y-0.5"
      >
        <ArrowLeft className="w-4 h-4 text-[#FF6FB5]" />
        BACK TO ALL SQUADS
      </button>

      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-black border-t-[#00E5FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="font-headline tracking-wider text-zinc-600 dark:text-zinc-400">RETRIEVING SQUAD TELEMETRY...</p>
        </div>
      ) : team ? (
        <>
          {/* Main Dossier Banner */}
          <div className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[6px_6px_0px_0px_#000] p-6 sm:p-10 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 bg-[#FF6FB5] border-3 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center font-headline text-4xl text-white">
                  {team.tag.substring(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-[#00E5FF] text-black border border-black text-xs font-headline font-bold">
                      {team.group_name || team.group_id?.replace('grp_', 'GROUP ').toUpperCase() || 'UNASSIGNED'}
                    </span>
                    <span className="px-2.5 py-0.5 bg-[#00E676] text-black border border-black text-xs font-headline font-bold">
                      STATUS: {team.status}
                    </span>
                  </div>
                  <h1 className="font-headline text-4xl sm:text-6xl text-zinc-950 dark:text-white tracking-wide">
                    {team.name}
                  </h1>
                  <p className="text-zinc-600 dark:text-zinc-400 font-mono text-xs sm:text-sm">
                    OFFICIAL ESPORTS TAG: <strong className="text-[#FF6FB5]">{team.tag}</strong>
                  </p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-3 self-stretch md:self-auto">
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="w-full md:w-auto px-6 py-3 bg-[#FF6FB5] hover:bg-[#FF85C0] text-white font-headline text-base tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-all hover:-translate-y-0.5 text-center"
                >
                  VIEW ON LEADERBOARD
                </button>
              </div>
            </div>

            {/* Performance telemetry stats */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-8 border-t-2 border-black">
              <div className="bg-[#FFF5F0] dark:bg-[#0E061A] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="text-[10px] font-headline font-bold text-zinc-500 flex items-center gap-1 mb-1">
                  <Award className="w-3.5 h-3.5 text-[#FF6FB5]" /> TOTAL POINTS
                </div>
                <div className="font-headline text-3xl text-zinc-950 dark:text-[#FFD54F]">
                  {stats?.totalPoints ?? 0} PTS
                </div>
              </div>

              <div className="bg-[#FFF5F0] dark:bg-[#0E061A] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="text-[10px] font-headline font-bold text-zinc-500 flex items-center gap-1 mb-1">
                  <Crosshair className="w-3.5 h-3.5 text-[#FF6FB5]" /> TOTAL FINISHES
                </div>
                <div className="font-headline text-3xl text-zinc-950 dark:text-white">
                  {stats?.totalKills ?? 0} KILLS
                </div>
              </div>

              {/* Chicken Dinners Highlight Card */}
              <div className="bg-[#FFF9C4] dark:bg-[#251540] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#FF6FB5]">
                <div className="text-[10px] font-headline font-bold text-amber-900 dark:text-[#FFD54F] flex items-center gap-1 mb-1">
                  <Trophy className="w-3.5 h-3.5 text-[#FF6FB5]" /> CHICKEN DINNERS (WWCD)
                </div>
                <div className="font-headline text-3xl text-zinc-950 dark:text-[#FFD54F] flex items-center gap-1">
                  {stats?.chickenDinners ?? 0} 🍗
                </div>
              </div>

              <div className="bg-[#FFF5F0] dark:bg-[#0E061A] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                <div className="text-[10px] font-headline font-bold text-zinc-500 flex items-center gap-1 mb-1">
                  <Swords className="w-3.5 h-3.5 text-zinc-400" /> MATCHES
                </div>
                <div className="font-headline text-3xl text-zinc-700 dark:text-zinc-300">
                  {stats?.matchesPlayed ?? 0}
                </div>
              </div>

              <div className="bg-[#FFF5F0] dark:bg-[#0E061A] p-3.5 border-2 border-black shadow-[2px_2px_0px_0px_#000] col-span-2 sm:col-span-1">
                <div className="text-[10px] font-headline font-bold text-zinc-500 flex items-center gap-1 mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#00E676]" /> BEST PLACEMENT
                </div>
                <div className="font-headline text-3xl text-[#00E676]">
                  #{stats?.bestPlacement || '-'}
                </div>
              </div>
            </div>
          </div>

          {/* Active Roster Section */}
          <div className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b-2 border-black pb-4">
              <div>
                <div className="flex items-center gap-2 text-[#FF6FB5] font-headline text-xs uppercase tracking-widest font-bold mb-1">
                  <Users className="w-4 h-4 text-black dark:text-[#00E5FF]" /> OFFICIAL LINEUP
                </div>
                <h2 className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wide">
                  ACTIVE PLAYER ROSTER
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-500">
                VERIFIED BGMI ACCOUNTS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {players.length > 0 ? (
                players.map(player => (
                  <div
                    key={player.id}
                    className="p-4 bg-[#FFF5F0] dark:bg-[#1A0F2E] border-2 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-headline font-bold px-2 py-0.5 bg-black text-white">
                        {player.role}
                      </span>
                      <span className="text-[10px] font-headline font-bold text-[#00E676]">VERIFIED ✓</span>
                    </div>

                    <div className="font-headline text-2xl text-zinc-950 dark:text-white tracking-wide">
                      {player.in_game_name}
                    </div>

                    <div className="text-xs font-display text-zinc-600 dark:text-zinc-400">
                      Real Name: <span className="text-zinc-900 dark:text-zinc-200 font-bold">{player.name}</span>
                    </div>

                    <div className="text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-300 dark:border-zinc-700">
                      UID: {player.in_game_id || '5529402194'}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-6 text-center text-zinc-500 font-display">
                  Squad roster pending official referee check-in.
                </div>
              )}
            </div>
          </div>

          {/* Match Performance History Table */}
          <div className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 sm:p-8 space-y-6">
            <div className="border-b-2 border-black pb-4">
              <h2 className="font-headline text-3xl text-zinc-950 dark:text-white tracking-wide">
                MATCH-BY-MATCH PERFORMANCE HISTORY
              </h2>
              <p className="text-xs font-display text-zinc-600 dark:text-zinc-400">
                Breakdown of squad finishes, kills, and placement points in official tournament rooms.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFF5F0] dark:bg-[#1A0F2E] border-b-2 border-black text-xs font-headline tracking-widest text-zinc-900 dark:text-[#00E5FF]">
                    <th className="py-3 px-4">MATCH</th>
                    <th className="py-3 px-4">MAP</th>
                    <th className="py-3 px-4 text-center">STAGE</th>
                    <th className="py-3 px-4 text-center">PLACEMENT</th>
                    <th className="py-3 px-4 text-center">ELIMINATIONS (KILLS)</th>
                    <th className="py-3 px-4 text-center text-[#FF6FB5]">PLACE PTS</th>
                    <th className="py-3 px-4 text-center text-zinc-950 dark:text-[#FFD54F] font-bold">TOTAL PTS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800 font-display text-sm">
                  {matchHistory.length > 0 ? (
                    matchHistory.map((m: any) => (
                      <tr key={m.id} className="hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 font-headline text-base text-zinc-950 dark:text-white">
                          {m.match_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-zinc-700 dark:text-zinc-300 font-bold">
                          {m.map}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-xs uppercase text-zinc-600 dark:text-zinc-400">
                          {m.stage}
                        </td>
                        <td className="py-3 px-4 text-center font-headline text-lg">
                          {m.placement === 1 ? (
                            <span className="px-2 py-0.5 bg-[#FFF9C4] dark:bg-[#251540] text-amber-900 dark:text-[#FFD54F] border border-black font-bold shadow-[1px_1px_0px_0px_#000]">
                              👑 #1 WWCD
                            </span>
                          ) : (
                            <span className="font-bold">#{m.placement}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center text-zinc-900 dark:text-zinc-200 font-mono font-bold">
                          {m.kills}
                        </td>
                        <td className="py-3 px-4 text-center text-[#FF6FB5] font-mono font-bold">
                          {m.placement_points}
                        </td>
                        <td className="py-3 px-4 text-center font-headline text-xl text-zinc-950 dark:text-[#FFD54F] font-bold">
                          {m.total_points}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500 font-display">
                        No match results recorded yet for this squad.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="py-16 text-center text-zinc-500 font-headline text-xl">
          SQUAD DOSSIER NOT FOUND
        </div>
      )}
    </div>
  );
};
