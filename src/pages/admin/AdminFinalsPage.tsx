import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { Trophy, Shield, Play, CheckCircle2, AlertTriangle, Sparkles, ArrowRight } from 'lucide-react';
import { LeaderboardRow } from '../../types';
import { getGroupOptions } from '../../utils/groups';

export const AdminFinalsPage: React.FC = () => {
  const { settings, adminToken, fetchLeaderboard, showToast, refreshAll, setActiveTab } = useTournament();

  const [groupPreviews, setGroupPreviews] = useState<Array<{ name: string; rows: LeaderboardRow[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState<number>(8);
  const [matchesCount, setMatchesCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);
  const groupOptions = getGroupOptions(settings?.group_names);

  useEffect(() => {
    Promise.all(groupOptions.map(group => fetchLeaderboard('group', group.id))).then(results => {
      setGroupPreviews(results.map((result, index) => ({
        name: groupOptions[index].name,
        rows: (result.leaderboard || []).slice(0, qualifiersPerGroup)
      })));
      setLoading(false);
    });
  }, [fetchLeaderboard, qualifiersPerGroup, settings?.group_names]);

  const handleGenerateFinals = async () => {
    if (!window.confirm(`Generate Grand Finals for ${qualifiersPerGroup * groupOptions.length} finalists across ${matchesCount} matches? This will update tournament stage to "Finals".`)) {
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch('/api/admin/finals/generate-dynamic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          qualifiersPerGroup,
          matchesCount
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to generate finals', 'error');
        return;
      }

      showToast(`Grand Finals generated with ${data.finalists?.length || 16} finalists!`, 'success');
      refreshAll();
      setActiveTab('finals');
    } catch {
      showToast('Error generating finals', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="font-headline text-3xl text-white tracking-wider">
          GRAND FINALS STAGE GENERATOR
        </h1>
        <p className="text-xs font-mono text-zinc-400 mt-0.5">
          Transition from Group Stage to Grand Finals. Automatically qualifies top-ranking squads based on authoritative point tallies and tie-breakers.
        </p>
      </div>

      {/* Configuration Controls */}
      <div className="bg-[#120726] comic-border-yellow p-6 space-y-4">
        <h3 className="font-headline text-2xl text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ffe600]" /> FINALS STAGE PARAMETERS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
              Qualifiers Per Group (Target: 8 per group = 16 finalists)
            </label>
            <input
              type="number"
              min="2"
              max="16"
              value={qualifiersPerGroup}
              onChange={e => setQualifiersPerGroup(Number(e.target.value))}
              className="w-full bg-[#080313] border border-zinc-700 text-white p-2 text-sm outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-400 uppercase mb-1">
              Grand Finals Match Count (Standard: 5 Matches)
            </label>
            <input
              type="number"
              min="1"
              max="15"
              value={matchesCount}
              onChange={e => setMatchesCount(Number(e.target.value))}
              className="w-full bg-[#080313] border border-zinc-700 text-white p-2 text-sm outline-none"
            />
          </div>
        </div>

        <div className="p-3 bg-[#080313] border border-zinc-800 text-xs font-mono text-zinc-400 flex items-center justify-between">
          <span>PROJECTED TOTAL FINALISTS: <strong className="text-[#ffe600]">{qualifiersPerGroup * groupOptions.length} SQUADS</strong></span>
          <span>MAP ROTATIONS: ERANGEL, MIRAMAR, SANHOK</span>
        </div>
      </div>

      {/* Qualifiers Live Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupPreviews.map((group, groupIndex) => (
        <div key={group.name} className={`bg-[#0b0518] ${groupIndex % 2 === 0 ? 'comic-border-cyan' : 'comic-border'} p-5 space-y-3`}>
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
            <h4 className={`font-headline text-xl ${groupIndex % 2 === 0 ? 'text-[#00f5ff]' : 'text-[#ff007f]'}`}>
              {group.name.toUpperCase()} ADVANCING SQUADS (TOP {qualifiersPerGroup})
            </h4>
            <span className="text-xs font-mono text-zinc-400">SEED 1-{qualifiersPerGroup}</span>
          </div>

          <div className="space-y-1.5 font-display text-sm">
            {group.rows.map(t => (
              <div key={t.team_id} className="p-2 bg-[#120726] border border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`font-headline text-base ${groupIndex % 2 === 0 ? 'text-[#00f5ff]' : 'text-[#ff007f]'}`}>#{t.rank}</span>
                  <span className="text-white font-bold">{t.team_name}</span>
                  <span className="text-xs font-mono text-zinc-400">({t.team_tag})</span>
                </div>
                <div className="font-mono text-xs text-[#ffe600]">
                  {t.total_points} PTS • {t.total_kills} KILLS
                </div>
              </div>
            ))}
          </div>
        </div>
        ))}
      </div>

      {/* Generation Trigger Button */}
      <div className="bg-[#0e071e] p-6 border-2 border-dashed border-[#ffe600]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-headline text-xl text-white">READY TO INITIATE FINALS?</h4>
          <p className="text-xs font-display text-zinc-400">
            This will mark non-advancing squads as Eliminated, create {matchesCount} Grand Finals match rooms, and transition the tournament state.
          </p>
        </div>

        <button
          onClick={handleGenerateFinals}
          disabled={generating}
          className="px-8 py-3.5 bg-[#ffe600] hover:bg-white text-black font-headline text-lg tracking-wider comic-border-sm cursor-pointer disabled:opacity-50 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,230,0,0.4)]"
        >
          {generating ? (
            'COMPUTING ADVANCEMENT...'
          ) : (
            <>
              <Play className="w-5 h-5 fill-black" /> LAUNCH GRAND FINALS
            </>
          )}
        </button>
      </div>
    </div>
  );
};
