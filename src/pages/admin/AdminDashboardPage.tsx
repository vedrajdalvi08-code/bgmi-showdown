import React, { useEffect, useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Users,
  Swords,
  Crosshair,
  Trophy,
  Flame,
  Shield,
  Clock,
  ArrowRight,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import { AuditLog } from '../../types';
import { safeFetchJson } from '../../utils/api';
import { getGroupOptions } from '../../utils/groups';

export const AdminDashboardPage: React.FC = () => {
  const { settings, adminToken, fetchLeaderboard, setActiveTab } = useTournament();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [groupLeaders, setGroupLeaders] = useState<Array<{ name: string; leader: any }>>([]);
  const groupOptions = getGroupOptions(settings?.group_names);

  const fetchDashboardData = () => {
    if (!adminToken) return;
    safeFetchJson<any>('/api/admin/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` }
    }, 1, 300)
      .then(resData => {
        if (resData) setData(resData);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [adminToken]);

  useEffect(() => {
    Promise.all(groupOptions.map(group => fetchLeaderboard('group', group.id)))
      .then(results => setGroupLeaders(results.map((result, index) => ({ name: groupOptions[index].name, leader: result.leaderboard[0] || null }))));
  }, [fetchLeaderboard, settings?.group_names]);

  const stats = data?.stats;
  const auditLogs: AuditLog[] = data?.auditLogs || [];

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <h1 className="font-headline text-3xl sm:text-4xl text-white tracking-wider">
            OPERATIONAL COMMAND DASHBOARD
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-1">
            STATUS: <span className="text-[#00f5ff] font-bold">{stats?.tournamentStatus || 'GROUP STAGE'}</span> • SYSTEM TELEMETRY NOMINAL
          </p>
        </div>

        {/* Quick Result Action */}
        <button
          onClick={() => setActiveTab('admin-results')}
          className="px-4 py-2 bg-linear-to-r from-[#ff007f] to-[#b967ff] hover:from-[#ff1a8c] hover:to-[#c67eff] text-white font-headline text-sm tracking-wider comic-border-sm flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(255,0,127,0.3)] transition-all"
        >
          <ClipboardList className="w-4 h-4" /> ENTER MATCH RESULTS
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#110724] comic-border-sm p-4">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between mb-1">
            <span>REGISTERED SQUADS</span>
            <Users className="w-4 h-4 text-[#00f5ff]" />
          </div>
          <div className="font-headline text-3xl sm:text-4xl text-white">
            {stats?.totalTeams || 0}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1">
            {groupOptions.length} AUTOMATIC GROUPS • MAX {settings?.teams_per_group || 25} / GROUP
          </div>
        </div>

        <div className="bg-[#110724] comic-border-sm p-4">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between mb-1">
            <span>MATCHES RUN</span>
            <Swords className="w-4 h-4 text-[#ff007f]" />
          </div>
          <div className="font-headline text-3xl sm:text-4xl text-[#ff007f]">
            {stats?.matchesCompleted || 0}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1">
            {stats?.matchesRemaining || 0} MATCHES REMAINING
          </div>
        </div>

        <div className="bg-[#110724] comic-border-sm p-4">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between mb-1">
            <span>TOTAL ELIMINATIONS</span>
            <Crosshair className="w-4 h-4 text-[#ffe600]" />
          </div>
          <div className="font-headline text-3xl sm:text-4xl text-[#ffe600]">
            {stats?.totalKills || 0}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1">
            FINISH POINTS DISTRIBUTED
          </div>
        </div>

        <div className="bg-[#110724] comic-border-sm p-4">
          <div className="text-xs font-mono text-zinc-400 flex items-center justify-between mb-1">
            <span>FINALS QUALIFIERS</span>
            <Trophy className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-headline text-3xl sm:text-4xl text-emerald-400">
            {stats?.qualifiedCount || 0}
          </div>
          <div className="text-[11px] font-mono text-zinc-500 mt-1">
            TARGET: {(settings?.qualifiers_per_group || 8) * groupOptions.length} SQUADS
          </div>
        </div>
      </div>

      {/* Leaders in Groups */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {groupLeaders.map((group, index) => <div key={group.name} className={`bg-[#120726] ${index % 2 === 0 ? 'comic-border-cyan' : 'comic-border'} p-5 space-y-3`}>
          <div className="flex items-center justify-between">
            <span className={`font-marker text-xs ${index % 2 === 0 ? 'text-[#00f5ff]' : 'text-[#ff007f]'} uppercase tracking-wider`}>
              {group.name.toUpperCase()} // CURRENT SEED #1
            </span>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-mono">
              QUALIFIED
            </span>
          </div>
          {group.leader ? (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-headline text-2xl text-white">
                  {group.leader.team_name}
                </h3>
                <p className="text-xs font-mono text-zinc-400">
                  TAG: {group.leader.team_tag} • {group.leader.total_kills} KILLS
                </p>
              </div>
              <div className="text-right">
                <div className="font-headline text-3xl text-[#ffe600]">
                  {group.leader.total_points} PTS
                </div>
                <div className="text-[10px] font-mono text-zinc-500">
                  MATCHES: {group.leader.matches_played}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs font-display text-zinc-500">No match results yet for {group.name}</p>
          )}
        </div>)}
      </div>

      {/* Quick Ops Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('admin-teams')}
          className="p-5 bg-[#0f0721] border border-zinc-800 hover:border-[#00f5ff] text-left group cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-[#00f5ff]" />
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-headline text-xl text-white">MANAGE SQUADS & ROSTERS</div>
          <p className="text-xs font-display text-zinc-400 mt-1">
            Register new teams, edit players, or assign group pools.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('admin-matches')}
          className="p-5 bg-[#0f0721] border border-zinc-800 hover:border-[#ff007f] text-left group cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <Swords className="w-5 h-5 text-[#ff007f]" />
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-headline text-xl text-white">SCHEDULES & ROOM LOCKS</div>
          <p className="text-xs font-display text-zinc-400 mt-1">
            Create match rooms, set maps, verify and lock finalized scorecards.
          </p>
        </button>

        <button
          onClick={() => setActiveTab('admin-finals')}
          className="p-5 bg-[#0f0721] border border-zinc-800 hover:border-[#ffe600] text-left group cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between mb-2">
            <Trophy className="w-5 h-5 text-[#ffe600]" />
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="font-headline text-xl text-white">GENERATE GRAND FINALS</div>
          <p className="text-xs font-display text-zinc-400 mt-1">
            Auto-compute top qualifiers and generate 5 high-stakes finals matches.
          </p>
        </button>
      </div>

      {/* Real-time Audit Logs */}
      <div className="bg-[#0b0518] comic-border p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2 font-marker text-xs text-[#00f5ff] uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" /> RECENT AUDIT TRAIL
          </div>
          <span className="text-xs font-mono text-zinc-500">
            RECORDED SERVER ACTIONS
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="text-zinc-500 border-b border-zinc-800">
                <th className="py-2 px-3">TIMESTAMP</th>
                <th className="py-2 px-3">ACTION</th>
                <th className="py-2 px-3">OPERATOR</th>
                <th className="py-2 px-3">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-zinc-300">
              {auditLogs.length > 0 ? (
                auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-white/5">
                    <td className="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-[#ff007f] font-bold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400">
                      {log.admin_user}
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 max-w-md truncate">
                      {log.details}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-zinc-600">
                    No recent audit events logged.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
