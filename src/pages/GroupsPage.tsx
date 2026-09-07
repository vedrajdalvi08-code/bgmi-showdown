import React, { useState, useEffect } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Users, Trophy, ChevronRight } from 'lucide-react';
import { Team } from '../types';
import { safeFetchJson } from '../utils/api';

export const GroupsPage: React.FC = () => {
  const { setSelectedTeamId, setActiveTab } = useTournament();
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<string>('grp_a');

  useEffect(() => {
    let isMounted = true;
    safeFetchJson<{ groups: any[] }>('/api/groups', undefined, 2, 400).then(data => {
      if (isMounted) {
        if (data?.groups) {
          setGroups(data.groups);
          if (!data.groups.some(group => group.id === selectedGroup)) {
            setSelectedGroup(data.groups[0]?.id || 'grp_a');
          }
        }
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const currentGroup = groups.find(g => g.id === selectedGroup) || groups[0];

  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setActiveTab('team-detail');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center gap-2 font-headline text-xs sm:text-sm text-[#FF6FB5] uppercase tracking-widest font-bold mb-1">
          <Users className="w-4 h-4 text-black dark:text-[#00E5FF]" />
          TOURNAMENT BRACKETS & SEEDING
        </div>
        <h1 className="font-headline text-4xl sm:text-6xl text-zinc-950 dark:text-white tracking-wider">
          GROUP STAGE BRACKETS
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-display mt-1">
          Squads are automatically balanced into groups with Erangel, Miramar, Sanhok, and Rondo rotations. Top 8 advance to the Grand Finals.
        </p>
      </div>

      {/* Group Selector Pill Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {groups.map(g => (
          <button
            key={g.id}
            onClick={() => setSelectedGroup(g.id)}
            className={`w-full sm:w-auto px-6 py-3 font-headline text-lg sm:text-2xl tracking-wider cursor-pointer border-3 border-black transition-all text-center ${
              selectedGroup === g.id
                ? 'bg-[#FF6FB5] text-white shadow-[4px_4px_0px_0px_#000] -translate-y-0.5'
                : 'bg-white dark:bg-[#1A0F2E] text-zinc-800 dark:text-zinc-300 hover:bg-[#FFD54F] hover:text-black shadow-[3px_3px_0px_0px_#000]'
            }`}
          >
            {g.name} ({g.teams?.length || 0} SQUADS)
          </button>
        ))}
      </div>

      {/* Group Details & Qualification Threshold Notice */}
      <div className="p-4 bg-white dark:bg-[#150A24] border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl text-zinc-950 dark:text-white tracking-wide">
            {currentGroup?.name || 'GROUP A'} // {currentGroup?.teams?.length || 0} COMPETING SQUADS
          </h2>
          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
            MAP ROTATION: ERANGEL, MIRAMAR, SANHOK, RONDO • TOP 8 ADVANCE TO FINALS
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#00E676] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black font-headline text-sm font-bold tracking-wider">
          <Trophy className="w-4 h-4" />
          TOP 8 ADVANCE TO FINALS
        </div>
      </div>

      {/* Team Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-black border-t-[#FF6FB5] rounded-full animate-spin mx-auto mb-3" />
          <p className="font-headline text-zinc-600 dark:text-zinc-400">LOADING SQUAD ROSTERS...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentGroup?.teams?.map((team: Team, idx: number) => {
            const isTopCut = idx < 8;
            return (
              <div
                key={team.id}
                onClick={() => handleTeamClick(team.id)}
                className={`p-4 bg-white dark:bg-[#150A24] border-3 border-black cursor-pointer transition-all hover:-translate-y-1 group relative ${
                  isTopCut
                    ? 'shadow-[4px_4px_0px_0px_#00E676]'
                    : 'shadow-[3px_3px_0px_0px_#000]'
                }`}
              >
                {/* Seed Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-zinc-200 dark:bg-black/40 text-zinc-900 dark:text-zinc-200 border border-black">
                    SEED #{idx + 1}
                  </span>
                  {isTopCut ? (
                    <span className="text-[10px] font-headline font-bold px-2 py-0.5 bg-[#00E676] text-black border border-black shadow-[1px_1px_0px_0px_#000]">
                      ADVANCE ZONE
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-black">
                      ELIM ZONE
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#FF6FB5] text-white border-2 border-black flex items-center justify-center font-headline text-lg group-hover:bg-[#00E5FF] group-hover:text-black transition-colors shadow-[2px_2px_0px_0px_#000]">
                    {team.tag.substring(0, 3)}
                  </div>
                  <div>
                    <h3 className="font-headline text-xl text-zinc-950 dark:text-white group-hover:text-[#FF6FB5] transition-colors line-clamp-1">
                      {team.name}
                    </h3>
                    <div className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                      TAG: {team.tag}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs font-display">
                  <span className="text-zinc-600 dark:text-zinc-400">
                    STATUS: <strong className="text-zinc-900 dark:text-white font-bold">{team.status}</strong>
                  </span>
                  <span className="text-[#FF6FB5] font-headline font-bold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    DOSSIER <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
