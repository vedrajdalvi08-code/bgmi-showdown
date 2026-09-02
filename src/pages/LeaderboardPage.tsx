import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Trophy, Search, HelpCircle, Award, ChevronRight } from 'lucide-react';
import { LeaderboardRow } from '../types';

export const LeaderboardPage: React.FC = () => {
  const { fetchLeaderboard, setSelectedTeamId, setActiveTab } = useTournament();

  const [activeStage, setActiveStage] = useState<'group' | 'finals'>('group');
  const [activeGroup, setActiveGroup] = useState<'grp_a' | 'grp_b'>('grp_a');
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [matches, setMatches] = useState<Array<{ id: string; match_number: number; name: string; map: string }>>([]);
  const [qualifiersCount, setQualifiersCount] = useState(8);
  const [loading, setLoading] = useState(false);
  const [showTieBreakerInfo, setShowTieBreakerInfo] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const data = await fetchLeaderboard(activeStage, activeStage === 'group' ? activeGroup : undefined);
    setRows(data.leaderboard || []);
    setMatches(data.matches || []);
    setQualifiersCount(data.qualifiersCount || 8);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [activeStage, activeGroup]);

  const filteredRows = rows.filter(r =>
    r.team_name.toLowerCase().includes(search.toLowerCase()) ||
    r.team_tag.toLowerCase().includes(search.toLowerCase())
  );

  const handleRowClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setActiveTab('team-detail');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <div className="flex items-center gap-2 font-headline text-xs sm:text-sm text-[#FF6FB5] uppercase tracking-widest font-bold mb-1">
            <Trophy className="w-4 h-4 text-black dark:text-[#00E5FF]" />
            STANDINGS ENGINE // REAL-TIME AUTHORITATIVE DATA
          </div>
          <h1 className="font-headline text-4xl sm:text-6xl text-zinc-950 dark:text-white tracking-wider">
            TOURNAMENT LEADERBOARD
          </h1>
          <p className="text-zinc-700 dark:text-zinc-300 text-sm font-display mt-1">
            Official BGMI points table with chicken dinners (WWCD) and Krafton rulebook tie-breaker adjudication.
          </p>
        </div>

        {/* Tie-breaker Rules Button */}
        <button
          onClick={() => setShowTieBreakerInfo(!showTieBreakerInfo)}
          className="self-start md:self-auto px-4 py-2 bg-white dark:bg-[#1A0F2E] hover:bg-[#FFD54F] dark:hover:bg-[#FFD54F] hover:text-black border-2 border-black shadow-[3px_3px_0px_0px_#000] text-zinc-900 dark:text-zinc-100 font-headline text-sm tracking-wider flex items-center gap-1.5 cursor-pointer transition-all hover:-translate-y-0.5"
        >
          <HelpCircle className="w-4 h-4 text-[#FF6FB5]" />
          TIE-BREAKER LOGIC
        </button>
      </div>

      {/* Tie-breaker popup banner */}
      {showTieBreakerInfo && (
        <div className="bg-[#FFF9C4] dark:bg-[#1E1136] border-3 border-black shadow-[4px_4px_0px_0px_#000] p-5 text-sm space-y-3 relative">
          <div className="flex items-center gap-2 text-zinc-950 dark:text-[#FFD54F] font-headline text-lg tracking-wider font-bold">
            <Award className="w-5 h-5 text-[#FF6FB5]" /> OFFICIAL TIE-BREAKER PROTOCOL
          </div>
          <p className="text-zinc-800 dark:text-zinc-200 font-display text-xs sm:text-sm">
            When two or more squads finish tied on total points, ranks are decided strictly in the following priority order:
          </p>
          <ol className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2 text-xs font-mono font-bold">
            <li className="p-2.5 bg-white dark:bg-black/40 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-zinc-900 dark:text-[#00E5FF]">
              1. HIGHEST TOTAL POINTS
            </li>
            <li className="p-2.5 bg-white dark:bg-black/40 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-[#FF6FB5]">
              2. WWCD (CHICKEN DINNERS)
            </li>
            <li className="p-2.5 bg-white dark:bg-black/40 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-zinc-900 dark:text-white">
              3. TOTAL FINISHES (KILLS)
            </li>
            <li className="p-2.5 bg-white dark:bg-black/40 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-zinc-900 dark:text-[#FFD54F]">
              4. PLACEMENT POINTS
            </li>
            <li className="p-2.5 bg-white dark:bg-black/40 border-2 border-black shadow-[2px_2px_0px_0px_#000] text-[#00E676]">
              5. BEST MATCH PLACEMENT
            </li>
          </ol>
        </div>
      )}

      {/* Stage Selector Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Stage Toggle Tabs */}
        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-[#1A0F2E] p-2 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
          <button
            onClick={() => {
              setActiveStage('group');
              setActiveGroup('grp_a');
            }}
            className={`px-4 py-2 font-headline text-base tracking-wider cursor-pointer border-2 border-black transition-all ${
              activeStage === 'group' && activeGroup === 'grp_a'
                ? 'bg-[#FF6FB5] text-white shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                : 'bg-zinc-100 dark:bg-black/30 text-zinc-800 dark:text-zinc-300 hover:bg-[#FFD54F] hover:text-black'
            }`}
          >
            GROUP A (24 SQUADS)
          </button>

          <button
            onClick={() => {
              setActiveStage('group');
              setActiveGroup('grp_b');
            }}
            className={`px-4 py-2 font-headline text-base tracking-wider cursor-pointer border-2 border-black transition-all ${
              activeStage === 'group' && activeGroup === 'grp_b'
                ? 'bg-[#FF6FB5] text-white shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                : 'bg-zinc-100 dark:bg-black/30 text-zinc-800 dark:text-zinc-300 hover:bg-[#FFD54F] hover:text-black'
            }`}
          >
            GROUP B (24 SQUADS)
          </button>

          <button
            onClick={() => {
              setActiveStage('finals');
            }}
            className={`px-4 py-2 font-headline text-base tracking-wider cursor-pointer border-2 border-black transition-all flex items-center gap-1.5 ${
              activeStage === 'finals'
                ? 'bg-[#FFD54F] text-black shadow-[2px_2px_0px_0px_#000] font-bold -translate-y-0.5'
                : 'bg-zinc-100 dark:bg-black/30 text-zinc-800 dark:text-zinc-300 hover:bg-[#FFD54F] hover:text-black'
            }`}
          >
            <Trophy className="w-4 h-4 text-black dark:text-[#FFD54F]" /> GRAND FINALS
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-65">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search squad name or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#1A0F2E] text-zinc-950 dark:text-white border-2 border-black shadow-[3px_3px_0px_0px_#000] text-sm font-display focus:outline-none focus:bg-[#FFF9C4] dark:focus:bg-[#251540]"
          />
        </div>
      </div>

      {/* Qualification Bar Indicator */}
      {activeStage === 'group' && (
        <div className="bg-[#FFF5F0] dark:bg-[#140B24] border-2 border-black shadow-[3px_3px_0px_0px_#000] px-4 py-2.5 flex items-center justify-between text-xs font-headline font-bold">
          <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
            <span className="w-2.5 h-2.5 bg-[#00E676] border border-black animate-pulse" />
            <span>QUALIFICATION CUTOFF: TOP {qualifiersCount} SQUADS ADVANCE TO GRAND FINALS</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#00E676] border border-black" /> QUALIFIED
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#FFD54F] border border-black" /> ON THE BUBBLE
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 border border-black" /> ELIMINATED
            </span>
          </div>
        </div>
      )}

      {/* LEADERBOARD TABLE (Desktop) */}
      <div className="hidden md:block bg-white dark:bg-[#150A24] border-3 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FFF5F0] dark:bg-[#1A0F2E] border-b-2 border-black text-xs font-headline tracking-widest text-zinc-900 dark:text-[#00E5FF]">
                <th className="py-4 px-4 text-center w-16">#</th>
                <th className="py-4 px-4">SQUAD</th>
                <th className="py-4 px-3 text-center bg-[#FFF9C4] dark:bg-[#251540] text-amber-900 dark:text-[#FFD54F] font-bold">
                  🍗 WWCD
                </th>
                <th className="py-4 px-3 text-center">MATCHES</th>
                <th className="py-4 px-3 text-center">FINISHES (KILLS)</th>
                <th className="py-4 px-3 text-center text-[#FF6FB5]">PLACE PTS</th>
                {/* Dynamic Match breakdown columns */}
                {matches.map(m => (
                  <th key={m.id} className="py-4 px-2.5 text-center text-zinc-700 dark:text-zinc-400 font-mono text-xs" title={`${m.name} (${m.map})`}>
                    M{m.match_number}
                  </th>
                ))}
                <th className="py-4 px-4 text-center text-zinc-950 dark:text-[#FFD54F] font-bold text-sm">TOTAL PTS</th>
                <th className="py-4 px-4 text-center">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-zinc-200 dark:divide-zinc-800 font-display text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9 + matches.length} className="py-16 text-center text-zinc-500">
                    <div className="w-10 h-10 border-4 border-black border-t-[#FF6FB5] rounded-full animate-spin mx-auto mb-3" />
                    COMPUTING STANDINGS & TIE-BREAKERS...
                  </td>
                </tr>
              ) : filteredRows.length > 0 ? (
                filteredRows.map((row, idx) => {
                  const isTopQualifier = row.rank <= qualifiersCount;
                  const isBubble = row.rank === qualifiersCount || row.rank === qualifiersCount + 1;

                  return (
                    <React.Fragment key={row.team_id}>
                      {/* Qualification cutoff dividing line */}
                      {activeStage === 'group' && row.rank === qualifiersCount + 1 && (
                        <tr className="bg-red-500/10 border-y-2 border-dashed border-red-500">
                          <td colSpan={9 + matches.length} className="py-2 text-center text-xs font-headline font-bold text-red-600 dark:text-red-400 tracking-wider">
                            ▲ ADVANCING TO GRAND FINALS (TOP {qualifiersCount}) ▲ | ▼ ELIMINATION ZONE ▼
                          </td>
                        </tr>
                      )}
                      <tr
                        onClick={() => handleRowClick(row.team_id)}
                        className={`hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors cursor-pointer group ${
                          idx === 0
                            ? 'bg-[#FFF9C4]/40 dark:bg-[#FFD54F]/10'
                            : isTopQualifier
                            ? 'bg-emerald-500/5'
                            : ''
                        }`}
                      >
                        {/* Rank */}
                        <td className="py-3.5 px-4 text-center font-headline text-xl">
                          {row.rank === 1 ? (
                            <span className="text-[#FFD54F] drop-shadow-[1px_1px_0px_#000]">🥇 1</span>
                          ) : row.rank === 2 ? (
                            <span className="text-[#00E5FF] drop-shadow-[1px_1px_0px_#000]">🥈 2</span>
                          ) : row.rank === 3 ? (
                            <span className="text-[#FF6FB5] drop-shadow-[1px_1px_0px_#000]">🥉 3</span>
                          ) : (
                            <span className={isTopQualifier ? 'text-zinc-950 dark:text-white font-bold' : 'text-zinc-400 font-bold'}>
                              {row.rank}
                            </span>
                          )}
                        </td>

                        {/* Squad info */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-zinc-100 dark:bg-[#1A0F2E] border-2 border-black flex items-center justify-center text-xs font-headline text-zinc-950 dark:text-white group-hover:bg-[#00E5FF] group-hover:text-black transition-colors shadow-[1px_1px_0px_0px_#000]">
                              {row.team_tag.substring(0, 3)}
                            </div>
                            <div>
                              <div className="font-headline text-lg text-zinc-950 dark:text-white group-hover:text-[#FF6FB5] transition-colors tracking-wide flex items-center gap-1.5">
                                {row.team_name}
                                <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#FF6FB5]" />
                              </div>
                              <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                                TAG: {row.team_tag} • BEST: #{row.best_placement || '-'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Chicken Dinners (WWCD) Count */}
                        <td className="py-3.5 px-3 text-center">
                          <span className="px-2 py-0.5 bg-[#FFF9C4] dark:bg-[#251540] text-amber-900 dark:text-[#FFD54F] border border-black font-headline font-bold text-sm shadow-[1px_1px_0px_0px_#000]">
                            {row.chicken_dinners || 0} 🍗
                          </span>
                        </td>

                        {/* Matches Played */}
                        <td className="py-3.5 px-3 text-center text-zinc-700 dark:text-zinc-300 font-mono">
                          {row.matches_played}
                        </td>

                        {/* Kills */}
                        <td className="py-3.5 px-3 text-center text-zinc-950 dark:text-zinc-200 font-mono font-bold">
                          {row.total_kills}
                        </td>

                        {/* Placement Pts */}
                        <td className="py-3.5 px-3 text-center text-[#FF6FB5] font-mono font-bold">
                          {row.placement_points}
                        </td>

                        {/* Dynamic Match breakdown points */}
                        {matches.map(m => (
                          <td key={m.id} className="py-3.5 px-2.5 text-center font-mono text-xs text-zinc-600 dark:text-zinc-400">
                            {row.match_breakdown?.[m.id] !== undefined ? row.match_breakdown[m.id] : '-'}
                          </td>
                        ))}

                        {/* Total Points */}
                        <td className="py-3.5 px-4 text-center font-headline text-2xl text-zinc-950 dark:text-[#FFD54F] font-bold">
                          {row.total_points}
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4 text-center">
                          {activeStage === 'finals' ? (
                            row.rank === 1 ? (
                              <span className="px-2.5 py-1 bg-[#FFD54F] text-black font-headline text-xs tracking-wider border border-black shadow-[1px_1px_0px_0px_#000] font-bold">
                                CHAMPION 🏆
                              </span>
                            ) : row.rank <= 3 ? (
                              <span className="px-2.5 py-1 bg-[#00E5FF] text-black font-headline text-xs tracking-wider border border-black shadow-[1px_1px_0px_0px_#000] font-bold">
                                PODIUM
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400 text-xs font-mono border border-black">
                                FINALIST
                              </span>
                            )
                          ) : (
                            <span
                              className={`px-2.5 py-0.5 text-[11px] font-headline font-bold tracking-wider uppercase border border-black shadow-[1px_1px_0px_0px_#000] ${
                                isTopQualifier
                                  ? 'bg-[#00E676] text-black'
                                  : isBubble
                                  ? 'bg-[#FFD54F] text-black'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {row.qualification_status}
                            </span>
                          )}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={9 + matches.length} className="py-12 text-center text-zinc-500 font-display">
                    No squads found matching "{search}"
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEDICATED MOBILE LEADERBOARD CARD VIEW */}
      <div className="block md:hidden space-y-3">
        {loading ? (
          <div className="py-12 text-center text-zinc-400">
            <div className="w-8 h-8 border-3 border-black border-t-[#FF6FB5] rounded-full animate-spin mx-auto mb-2" />
            Loading standings...
          </div>
        ) : filteredRows.length > 0 ? (
          filteredRows.map(row => {
            const isTopQualifier = row.rank <= qualifiersCount;
            return (
              <div
                key={row.team_id}
                onClick={() => handleRowClick(row.team_id)}
                className={`p-4 bg-white dark:bg-[#150A24] border-3 border-black cursor-pointer transition-all ${
                  row.rank === 1
                    ? 'shadow-[5px_5px_0px_0px_#FFD54F]'
                    : isTopQualifier
                    ? 'shadow-[4px_4px_0px_0px_#00E5FF]'
                    : 'shadow-[3px_3px_0px_0px_#000]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-headline text-2xl text-[#FF6FB5] font-bold">
                      #{row.rank}
                    </span>
                    <span className="font-headline text-xl text-zinc-950 dark:text-white">
                      {row.team_name}
                    </span>
                    <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-white/10 text-zinc-800 dark:text-zinc-300 text-xs font-mono font-bold border border-black">
                      {row.team_tag}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="font-headline text-2xl text-zinc-950 dark:text-[#FFD54F] font-bold">
                      {row.total_points} PTS
                    </div>
                  </div>
                </div>

                {/* Metrics including Chicken Dinner count */}
                <div className="grid grid-cols-4 gap-2 py-2 border-y-2 border-zinc-200 dark:border-zinc-800 text-xs font-mono">
                  <div>
                    WWCD: <span className="text-amber-800 dark:text-[#FFD54F] font-bold">{row.chicken_dinners || 0} 🍗</span>
                  </div>
                  <div>
                    KILLS: <span className="text-zinc-900 dark:text-white font-bold">{row.total_kills}</span>
                  </div>
                  <div>
                    PLACE: <span className="text-[#FF6FB5] font-bold">{row.placement_points}</span>
                  </div>
                  <div>
                    PLAYED: <span className="text-zinc-700 dark:text-zinc-300">{row.matches_played}</span>
                  </div>
                </div>

                {/* Match scores snippet */}
                {matches.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                    <span className="font-bold">SCORES:</span>
                    {matches.map(m => (
                      <span key={m.id} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-black/40 border border-black">
                        M{m.match_number}: <strong className="text-[#00E5FF]">{row.match_breakdown?.[m.id] ?? 0}</strong>
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-2.5 flex items-center justify-between text-xs">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-headline font-bold uppercase border border-black shadow-[1px_1px_0px_0px_#000] ${
                      isTopQualifier
                        ? 'bg-[#00E676] text-black'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {row.qualification_status}
                  </span>
                  <span className="text-[#FF6FB5] font-headline font-bold flex items-center gap-1">
                    VIEW PROFILE <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-zinc-500 font-display">
            No squads match "{search}"
          </div>
        )}
      </div>
    </div>
  );
};
