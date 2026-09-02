import React, { useState } from 'react';
import { useTournament } from '../context/TournamentContext';
import { Swords, Trophy, Clock, Lock, MapPin, Radio, Sparkles } from 'lucide-react';

export const MatchesPage: React.FC = () => {
  const { matches, setSelectedMatchId, isAdmin, setActiveTab } = useTournament();
  const [stageFilter, setStageFilter] = useState<'all' | 'group' | 'finals'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Scheduled' | 'Completed' | 'Locked'>('all');
  const [mapFilter, setMapFilter] = useState<'all' | 'Erangel' | 'Miramar' | 'Sanhok' | 'Vikendi' | 'Rondo'>('all');

  const filteredMatches = matches.filter(m => {
    if (stageFilter !== 'all' && m.stage !== stageFilter) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'Completed') return m.status === 'Completed' || m.status === 'Locked';
      if (m.status !== statusFilter) return false;
    }
    if (mapFilter !== 'all' && m.map.toLowerCase() !== mapFilter.toLowerCase()) return false;
    return true;
  });

  const getMapBadgeColor = (map: string) => {
    switch (map.toLowerCase()) {
      case 'rondo':
        return 'bg-[#FF6FB5] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'erangel':
        return 'bg-[#00E676] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'miramar':
        return 'bg-[#FFD54F] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'sanhok':
        return 'bg-[#00E5FF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      case 'vikendi':
        return 'bg-[#CBEBFF] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]';
      default:
        return 'bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000]';
    }
  };

  const mapList = [
    {
      id: 'Rondo',
      name: 'RONDO',
      size: '8x8 KM',
      subtitle: 'The Ground of Honor',
      badge: 'NEW MAP',
      color: 'bg-[#FF6FB5]',
      textColor: 'text-white',
      description: 'Neo-classical metropolis meets lush bamboo groves, dual escalators, and sprawling urban compounds.'
    },
    {
      id: 'Erangel',
      name: 'ERANGEL',
      size: '8x8 KM',
      subtitle: 'Military Heartland',
      badge: 'CLASSIC',
      color: 'bg-[#00E676]',
      textColor: 'text-black',
      description: 'The foundation of competitive BGMI. Forest ridges, Pochinki hot drops, and tactical bridge blockades.'
    },
    {
      id: 'Miramar',
      name: 'MIRAMAR',
      size: '8x8 KM',
      subtitle: 'Desert Badlands',
      badge: 'HIGH RIDGE',
      color: 'bg-[#FFD54F]',
      textColor: 'text-black',
      description: 'Vast rolling canyons and rocky crags demanding precise long-range DMR and sniper dominance.'
    },
    {
      id: 'Sanhok',
      name: 'SANHOK',
      size: '4x4 KM',
      subtitle: 'Rainforest CQC',
      badge: 'FAST PACED',
      color: 'bg-[#00E5FF]',
      textColor: 'text-black',
      description: 'Torrential rainfall, Boot Camp slaughterhouse drops, and frantic close-quarters third-party skirmishes.'
    },
    {
      id: 'Vikendi',
      name: 'VIKENDI',
      size: '6x6 KM',
      subtitle: 'Northern Tundra',
      badge: 'FROZEN',
      color: 'bg-[#CBEBFF]',
      textColor: 'text-black',
      description: 'Sub-zero terrain with cosmodrome towers, snowy foothills, and dynamic thermal firefights.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="border-b-4 border-black pb-6">
        <div className="flex items-center gap-2 font-headline text-sm sm:text-base text-[#FF6FB5] uppercase tracking-widest mb-1 font-bold">
          <Swords className="w-4 h-4 text-black dark:text-[#00E5FF]" />
          OFFICIAL MATCH SCHEDULE & TELEMETRY
        </div>
        <h1 className="font-headline text-4xl sm:text-6xl text-zinc-950 dark:text-white tracking-wider">
          TOURNAMENT MATCHES
        </h1>
        <p className="text-zinc-700 dark:text-zinc-300 text-sm font-display mt-1">
          Track customs room lobbies, map rotations (including Rondo), chicken dinners, and full squad point breakdowns.
        </p>
      </div>

      {/* MAP ROTATION SHOWCASE (WITH RONDO FEATURED) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#FF6FB5]" />
            <h2 className="font-headline text-2xl text-zinc-950 dark:text-white tracking-wider">
              OFFICIAL MAP ROTATION
            </h2>
            <span className="px-2 py-0.5 bg-[#FF6FB5] text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] text-xs font-headline font-bold">
              RONDO ADDED
            </span>
          </div>
          {mapFilter !== 'all' && (
            <button
              onClick={() => setMapFilter('all')}
              className="text-xs font-headline tracking-wider text-[#FF6FB5] hover:underline cursor-pointer"
            >
              RESET MAP FILTER (SHOW ALL)
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {mapList.map(m => {
            const isSelected = mapFilter.toLowerCase() === m.id.toLowerCase();
            return (
              <div
                key={m.id}
                onClick={() => setMapFilter(isSelected ? 'all' : (m.id as any))}
                className={`p-4 border-3 border-black cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-black text-white shadow-[6px_6px_0px_0px_#FF6FB5] -translate-y-1'
                    : 'bg-white dark:bg-[#1A0F2E] text-zinc-900 dark:text-white shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2 py-0.5 text-[10px] font-headline font-bold border-2 border-black shadow-[1px_1px_0px_0px_#000] ${m.color} ${m.textColor}`}>
                    {m.badge}
                  </span>
                  <span className="text-xs font-mono font-bold">{m.size}</span>
                </div>

                <div className="font-headline text-2xl tracking-wide flex items-center gap-1.5">
                  {m.name}
                  {m.id === 'Rondo' && (
                    <Sparkles className="w-4 h-4 text-[#FFD54F] animate-spin-slow" />
                  )}
                </div>
                <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mb-2">
                  {m.subtitle}
                </div>
                <p className="text-xs font-display line-clamp-2 text-zinc-600 dark:text-zinc-300">
                  {m.description}
                </p>

                <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-[11px] font-headline">
                  <span className={isSelected ? 'text-[#00E5FF]' : 'text-[#FF6FB5]'}>
                    {isSelected ? 'FILTERED ✓' : 'CLICK TO FILTER'}
                  </span>
                  <span className="font-mono">
                    {matches.filter(match => match.map.toLowerCase() === m.id.toLowerCase()).length} MATCHES
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter Bars */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white dark:bg-[#1A0F2E] p-4 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
        {/* Stage Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-headline font-bold text-zinc-500">STAGE:</span>
          {(['all', 'group', 'finals'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStageFilter(st)}
              className={`px-3 py-1 font-headline text-sm tracking-wider cursor-pointer border-2 border-black transition-all ${
                stageFilter === st
                  ? 'bg-[#FF6FB5] text-white shadow-[2px_2px_0px_0px_#000] -translate-y-0.5'
                  : 'bg-zinc-100 dark:bg-black/30 text-zinc-800 dark:text-zinc-200 hover:bg-[#FFD54F] hover:text-black'
              }`}
            >
              {st === 'all' ? 'ALL STAGES' : st === 'group' ? 'GROUP STAGE' : 'GRAND FINALS'}
            </button>
          ))}
        </div>

        {/* Map Filter */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-headline font-bold text-zinc-500">MAP:</span>
          {(['all', 'Erangel', 'Miramar', 'Sanhok', 'Vikendi', 'Rondo'] as const).map(mp => (
            <button
              key={mp}
              onClick={() => setMapFilter(mp)}
              className={`px-2.5 py-1 font-headline text-xs tracking-wider cursor-pointer border-2 border-black transition-all ${
                mapFilter === mp
                  ? 'bg-[#00E5FF] text-black shadow-[2px_2px_0px_0px_#000] font-bold -translate-y-0.5'
                  : 'bg-zinc-100 dark:bg-black/30 text-zinc-700 dark:text-zinc-300 hover:bg-[#FFD54F] hover:text-black'
              }`}
            >
              {mp.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-headline font-bold text-zinc-500">STATUS:</span>
          {(['all', 'Scheduled', 'Completed'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 font-headline text-sm tracking-wider cursor-pointer border-2 border-black transition-all ${
                statusFilter === st
                  ? 'bg-[#FFD54F] text-black shadow-[2px_2px_0px_0px_#000] font-bold -translate-y-0.5'
                  : 'bg-zinc-100 dark:bg-black/30 text-zinc-800 dark:text-zinc-200 hover:bg-[#FF6FB5] hover:text-white'
              }`}
            >
              {st === 'all' ? 'ALL' : st === 'Scheduled' ? 'UPCOMING' : 'COMPLETED'}
            </button>
          ))}
        </div>
      </div>

      {/* Match Cards List */}
      <div className="space-y-4">
        {filteredMatches.length > 0 ? (
          filteredMatches.map(match => {
            const isCompleted = match.status === 'Completed' || match.status === 'Locked';
            return (
              <div
                key={match.id}
                className="bg-white dark:bg-[#150A24] border-3 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] hover:-translate-y-0.5 transition-all p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left info */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-black text-white font-headline text-xs tracking-wider border-2 border-black">
                        MATCH #{match.match_number}
                      </span>
                      <span className={`px-2.5 py-0.5 text-xs font-headline font-bold uppercase ${getMapBadgeColor(match.map)}`}>
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {match.map}
                      </span>
                      <span className="px-2.5 py-0.5 bg-zinc-100 dark:bg-black/40 text-zinc-900 dark:text-zinc-200 text-xs font-headline tracking-wider border-2 border-black">
                        {match.stage === 'group' ? (match.group_id === 'grp_a' ? 'GROUP A' : 'GROUP B') : 'GRAND FINALS'}
                      </span>
                      {match.is_locked ? (
                        <span className="px-2.5 py-0.5 bg-[#00E676] text-black text-xs font-headline font-bold border-2 border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1">
                          <Lock className="w-3 h-3" /> VERIFIED & LOCKED
                        </span>
                      ) : isCompleted ? (
                        <span className="px-2.5 py-0.5 bg-[#00E5FF] text-black text-xs font-headline font-bold border-2 border-black">
                          COMPLETED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-[#FFD54F] text-black text-xs font-headline font-bold border-2 border-black shadow-[1px_1px_0px_0px_#000] flex items-center gap-1">
                          <Radio className="w-3 h-3 text-red-600 animate-pulse" /> UPCOMING
                        </span>
                      )}
                    </div>

                    <h2 className="font-headline text-2xl sm:text-3xl text-zinc-950 dark:text-white tracking-wide">
                      {match.name}
                    </h2>

                    <div className="flex items-center gap-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#FF6FB5]" />
                        {match.scheduled_time || 'SCHEDULED ROTATION'}
                      </span>
                      <span>•</span>
                      <span>24 SQUADS PER ROOM LOBBY</span>
                    </div>
                  </div>

                  {/* Middle: Winner preview if completed */}
                  {isCompleted && match.winner && (
                    <div className="bg-[#FFF9C4] dark:bg-[#251540] border-2 border-black shadow-[3px_3px_0px_0px_#000] p-3.5 sm:min-w-60">
                      <div className="text-[11px] font-headline text-amber-900 dark:text-[#FFD54F] flex items-center gap-1 mb-1 uppercase tracking-wider font-bold">
                        <Trophy className="w-3.5 h-3.5 text-amber-600 dark:text-[#FFD54F]" /> CHICKEN DINNER (WWCD)
                      </div>
                      <div className="font-headline text-xl text-zinc-950 dark:text-white">
                        {match.winner.team_name}
                      </div>
                      <div className="text-xs font-mono text-zinc-700 dark:text-zinc-300 font-bold">
                        {match.winner.kills} KILLS • {match.winner.total_points} TOTAL PTS
                      </div>
                    </div>
                  )}

                  {/* Right: Actions */}
                  <div className="flex flex-wrap items-center gap-3 self-stretch sm:self-start lg:self-center">
                    {isCompleted ? (
                      <button
                        onClick={() => setSelectedMatchId(match.id)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-[#00E5FF] hover:bg-[#FFD54F] text-black font-headline text-base tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center gap-2 cursor-pointer transition-all hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
                      >
                        <Trophy className="w-4 h-4 text-black" />
                        VIEW ROOM SCORECARD
                      </button>
                    ) : (
                      <div className="text-xs font-headline tracking-wider text-zinc-500 px-3 py-2 border-2 border-dashed border-zinc-400 dark:border-zinc-700 text-center w-full sm:w-auto">
                        ROOM AWAITING START
                      </div>
                    )}

                    {/* Admin edit button strictly on desktop */}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setActiveTab('admin-results');
                        }}
                        className="hidden md:flex px-3 py-2 bg-[#FF6FB5] hover:bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] font-headline text-sm tracking-wider cursor-pointer transition-all items-center gap-1.5"
                        title="Adjudicate / Enter Results in Admin Panel (Desktop)"
                      >
                        EDIT SCORES
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center bg-white dark:bg-[#150A24] border-3 border-dashed border-black p-8 shadow-[4px_4px_0px_0px_#000]">
            <Swords className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <p className="font-headline text-2xl text-zinc-900 dark:text-zinc-200">NO MATCHES FOUND</p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-display mt-1">
              Adjust your stage, map, or status filters above to see scheduled or completed matches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
