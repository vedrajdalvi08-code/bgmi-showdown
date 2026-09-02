import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Shield, Search, Users, ChevronRight, UserCheck } from 'lucide-react';
import { Team } from '../types';

export const TeamsPage: React.FC = () => {
  const { teams, setSelectedTeamId, setActiveTab } = useTournament();
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<'all' | 'grp_a' | 'grp_b'>('all');

  const filteredTeams = teams.filter(t => {
    if (groupFilter !== 'all' && t.group_id !== groupFilter) return false;
    if (
      search &&
      !t.name.toLowerCase().includes(search.toLowerCase()) &&
      !t.tag.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSelectTeam = (teamId: string) => {
    setSelectedTeamId(teamId);
    setActiveTab('team-detail');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF6FB5] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-headline text-xs uppercase tracking-widest mb-2 font-bold">
          <Shield className="w-4 h-4 text-[#FFD54F]" />
          VERIFIED SQUAD DIRECTORY
        </div>
        <h1 className="font-headline text-4xl sm:text-6xl text-zinc-950 dark:text-white tracking-wider">
          PARTICIPATING TEAMS
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-display mt-1">
          Explore all 48 officially registered BGMI esports organizations, active rosters, and tactical roles.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-[#150A24] p-4 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-headline font-bold text-zinc-600 dark:text-zinc-400">GROUP:</span>
          {(['all', 'grp_a', 'grp_b'] as const).map(g => (
            <button
              key={g}
              onClick={() => setGroupFilter(g)}
              className={`px-3.5 py-1.5 font-headline text-sm tracking-wider cursor-pointer border-2 border-black transition-all ${
                groupFilter === g
                  ? 'bg-[#FF6FB5] text-white shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                  : 'text-zinc-800 dark:text-zinc-300 hover:bg-[#FFD54F] hover:text-black bg-[#FFF5F0] dark:bg-[#1E1136]'
              }`}
            >
              {g === 'all' ? 'ALL SQUADS (48)' : g === 'grp_a' ? 'GROUP A (24)' : 'GROUP B (24)'}
            </button>
          ))}
        </div>

        <div className="relative min-w-65">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search squad name or tag..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#FFF5F0] dark:bg-[#0E061A] border-2 border-black focus:border-[#FF6FB5] pl-9 pr-4 py-2 font-display text-sm text-zinc-950 dark:text-white placeholder-zinc-500 outline-none"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredTeams.length > 0 ? (
          filteredTeams.map(team => (
            <div
              key={team.id}
              onClick={() => handleSelectTeam(team.id)}
              className="p-5 bg-white dark:bg-[#150A24] border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#00E5FF] hover:-translate-y-1 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-[#00E5FF] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                    {team.group_id === 'grp_a' ? 'GROUP A' : team.group_id === 'grp_b' ? 'GROUP B' : 'UNASSIGNED'}
                  </span>
                  <span className="text-xs font-mono text-emerald-600 dark:text-[#00E676] font-bold">
                    {team.status}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#FFD54F] border-2 border-black shadow-[2px_2px_0px_0px_#000] flex items-center justify-center font-headline text-xl text-black">
                    {team.tag.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-headline text-2xl text-zinc-950 dark:text-white group-hover:text-[#FF6FB5] transition-colors line-clamp-1">
                      {team.name}
                    </h3>
                    <div className="text-xs font-mono text-[#FF6FB5] font-bold">
                      TAG: {team.tag}
                    </div>
                  </div>
                </div>

                {/* Players snippet */}
                {team.players && team.players.length > 0 ? (
                  <div className="space-y-1 my-3 bg-[#FFF5F0] dark:bg-[#0E061A] p-2.5 border border-black text-xs">
                    <div className="text-[10px] font-headline font-bold text-zinc-700 dark:text-zinc-400 uppercase flex items-center gap-1 mb-1">
                      <UserCheck className="w-3 h-3 text-[#FF6FB5]" /> ACTIVE ROSTER ({team.players.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 font-display text-zinc-800 dark:text-zinc-200">
                      {team.players.map(p => (
                        <span key={p.id} className="bg-white dark:bg-[#1F1138] px-1.5 py-0.5 text-[11px] border border-black">
                          {p.in_game_name} ({p.role.substring(0, 3)})
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-zinc-500 my-2">
                    Standard 4-Player Lineup
                  </div>
                )}
              </div>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between text-xs font-headline text-black dark:text-[#00E5FF] tracking-wider mt-4 font-bold">
                <span>VIEW SQUAD DOSSIER</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-zinc-500 font-display">
            No squads found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
};
