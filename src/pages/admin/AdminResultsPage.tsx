import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { ClipboardList, Upload, CheckCircle2, AlertTriangle, Lock, Unlock, Save, Shield, HelpCircle } from 'lucide-react';
import { Team, Match } from '../../types';
import { safeFetchJson } from '../../utils/api';

export const AdminResultsPage: React.FC = () => {
  const { matches, teams, settings, adminToken, showToast, refreshAll } = useTournament();

  const [selectedMatchId, setSelectedMatchId] = useState<string>(matches[0]?.id || '');
  const [entryMode, setEntryMode] = useState<'manual' | 'csv'>('manual');

  // Manual entry table state: team_id -> { placement, kills }
  const [entries, setEntries] = useState<Record<string, { placement: number; kills: number }>>({});
  const [loadingMatchData, setLoadingMatchData] = useState(false);

  // CSV state
  const [csvText, setCsvText] = useState('');
  const [csvValidation, setCsvValidation] = useState<any>(null);
  const [validatingCsv, setValidatingCsv] = useState(false);

  const selectedMatch = matches.find(m => m.id === selectedMatchId) || matches[0];

  // Eligible teams for this match:
  const eligibleTeams = teams.filter(t => {
    if (!selectedMatch) return false;
    if (selectedMatch.stage === 'group') {
      return t.group_id === selectedMatch.group_id;
    }
    return t.status === 'Qualified' || true;
  });

  // Load existing results when match changes
  useEffect(() => {
    if (!selectedMatchId) return;

    setLoadingMatchData(true);
    safeFetchJson<any>(`/api/matches/${selectedMatchId}`, undefined, 1, 300)
      .then(data => {
        if (!data) return;
        const initialMap: Record<string, { placement: number; kills: number }> = {};
        if (data.results && data.results.length > 0) {
          data.results.forEach((r: any) => {
            initialMap[r.team_id] = {
              placement: r.placement,
              kills: r.kills
            };
          });
        }
        setEntries(initialMap);
      })
      .finally(() => setLoadingMatchData(false));
  }, [selectedMatchId]);

  const placementPoints = settings?.placement_points || {
    1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1
  };
  const killValue = settings?.kill_point_value || 1;

  const calculatePoints = (placement: number, kills: number) => {
    const pPts = (placementPoints as any)[placement] ?? 0;
    const kPts = (kills || 0) * killValue;
    return { pPts, kPts, total: pPts + kPts };
  };

  const handleManualChange = (teamId: string, field: 'placement' | 'kills', value: number) => {
    setEntries(prev => ({
      ...prev,
      [teamId]: {
        placement: field === 'placement' ? value : prev[teamId]?.placement ?? 0,
        kills: field === 'kills' ? value : prev[teamId]?.kills ?? 0
      }
    }));
  };

  const handleQuickSeedResults = () => {
    const newMap: Record<string, { placement: number; kills: number }> = {};
    eligibleTeams.slice(0, 24).forEach((team, idx) => {
      const placement = idx + 1;
      const kills = Math.max(0, Math.floor(Math.random() * 8) + (placement === 1 ? 7 : 0));
      newMap[team.id] = { placement, kills };
    });
    setEntries(newMap);
    showToast('Simulated room placements and finish kills populated', 'info');
  };

  const handleSaveManualResults = async (finalizeAndLock: boolean = false) => {
    if (!selectedMatch) return;
    if (selectedMatch.is_locked) {
      showToast('This match is LOCKED. Please unlock first to edit results.', 'error');
      return;
    }

    const formattedEntries = (Object.entries(entries) as [string, { placement: number; kills: number }][])
      .filter(([_, val]) => val.placement > 0)
      .map(([team_id, val]) => ({
        team_id,
        placement: Number(val.placement),
        kills: Number(val.kills || 0)
      }));

    if (formattedEntries.length === 0) {
      showToast('Please enter placements for at least one squad.', 'error');
      return;
    }

    try {
      const res = await fetch(`/api/admin/matches/${selectedMatch.id}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          entries: formattedEntries,
          finalizeAndLock
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to save results', 'error');
        return;
      }

      showToast(
        finalizeAndLock
          ? 'Match finalized, authoritative points computed, and room LOCKED!'
          : 'Scores saved and standings updated!',
        'success'
      );
      refreshAll();
    } catch {
      showToast('Error saving results', 'error');
    }
  };

  const handleValidateCsv = async () => {
    if (!csvText.trim()) {
      showToast('Please paste CSV data first', 'error');
      return;
    }

    setValidatingCsv(true);
    try {
      const res = await fetch(`/api/admin/matches/${selectedMatch.id}/results/csv-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({ csvText })
      });

      const data = await res.json();
      setCsvValidation(data);
      if (!data.valid) {
        showToast(`Validation found ${data.errors.length} issue(s).`, 'error');
      } else {
        showToast(`Validated ${data.totalRows} squad entries successfully!`, 'success');
      }
    } catch {
      showToast('Error validating CSV', 'error');
    } finally {
      setValidatingCsv(false);
    }
  };

  const handleImportVerifiedCsv = async (finalizeAndLock: boolean = false) => {
    if (!csvValidation || !csvValidation.valid || !csvValidation.parsedRows) {
      showToast('No valid CSV data to import', 'error');
      return;
    }

    const formattedEntries = csvValidation.parsedRows.map((r: any) => ({
      team_id: r.team_id,
      placement: r.placement,
      kills: r.kills
    }));

    try {
      const res = await fetch(`/api/admin/matches/${selectedMatch.id}/results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify({
          entries: formattedEntries,
          finalizeAndLock
        })
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to import CSV', 'error');
        return;
      }

      showToast(`Imported ${formattedEntries.length} verified results!`, 'success');
      setCsvText('');
      setCsvValidation(null);
      refreshAll();
    } catch {
      showToast('Error importing CSV', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-headline text-3xl text-white tracking-wider">
            MATCH RESULT INGESTION & ADJUDICATION
          </h1>
          <p className="text-xs font-mono text-zinc-400 mt-0.5">
            Ingest manual or CSV match data. Standings and tie-breakers are calculated automatically.
          </p>
        </div>

        {/* Match Select Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-mono text-zinc-400 uppercase">SELECT ROOM:</label>
          <select
            value={selectedMatchId}
            onChange={e => setSelectedMatchId(e.target.value)}
            className="bg-[#140b28] border-2 border-[#00f5ff] text-white p-2 font-headline text-sm tracking-wider outline-none"
          >
            {matches.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.map}) {m.is_locked ? '🔒' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lock Notice if applicable */}
      {selectedMatch?.is_locked ? (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono">
            <Lock className="w-5 h-5 shrink-0" />
            <span>
              THIS MATCH SCORECARD IS VERIFIED AND LOCKED. Results are published and immutable. Unlock in Match Schedule to edit.
            </span>
          </div>
        </div>
      ) : null}

      {/* Mode Tabs */}
      <div className="flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEntryMode('manual')}
            className={`px-4 py-2 font-headline text-sm tracking-wider cursor-pointer transition-colors ${
              entryMode === 'manual'
                ? 'bg-[#ff007f] text-white'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <ClipboardList className="w-4 h-4 inline mr-1" /> MANUAL SQUAD GRID
          </button>
          <button
            onClick={() => setEntryMode('csv')}
            className={`px-4 py-2 font-headline text-sm tracking-wider cursor-pointer transition-colors ${
              entryMode === 'csv'
                ? 'bg-[#ff007f] text-white'
                : 'text-zinc-400 hover:text-white bg-white/5'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-1" /> CSV BATCH IMPORT
          </button>
        </div>

        {entryMode === 'manual' && !selectedMatch?.is_locked && (
          <button
            onClick={handleQuickSeedResults}
            className="px-3 py-1 bg-[#1a0f35] hover:bg-[#27144d] text-zinc-300 text-xs font-mono border border-zinc-700 cursor-pointer"
            title="Auto-fills realistic placements and kills for testing"
          >
            ⚡ QUICK AUTO-POPULATE SQUAD RESULTS
          </button>
        )}
      </div>

      {/* MODE 1: MANUAL ENTRY */}
      {entryMode === 'manual' && (
        <div className="space-y-6">
          <div className="bg-[#0b0518] comic-border overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[#140b29] border-b border-zinc-800 text-xs font-headline tracking-widest text-[#00f5ff]">
                  <th className="py-3 px-4">SQUAD</th>
                  <th className="py-3 px-4">TAG</th>
                  <th className="py-3 px-4 w-32">PLACEMENT (#)</th>
                  <th className="py-3 px-4 w-32">KILLS</th>
                  <th className="py-3 px-4 text-center text-[#ff007f]">PLACE PTS</th>
                  <th className="py-3 px-4 text-center text-[#00f5ff]">KILL PTS</th>
                  <th className="py-3 px-4 text-center text-[#ffe600] font-bold">TOTAL PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-display">
                {eligibleTeams.map(team => {
                  const currentEntry = entries[team.id] || { placement: 0, kills: 0 };
                  const pts = calculatePoints(currentEntry.placement, currentEntry.kills);

                  return (
                    <tr
                      key={team.id}
                      className={`hover:bg-white/5 transition-colors ${
                        currentEntry.placement === 1 ? 'bg-[#ffe600]/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-headline text-lg text-white">
                        {team.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[#ff007f]">
                        {team.tag}
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="1"
                          max="24"
                          disabled={selectedMatch?.is_locked === 1}
                          value={currentEntry.placement || ''}
                          onChange={e => handleManualChange(team.id, 'placement', Number(e.target.value))}
                          placeholder="Rank"
                          className="w-24 bg-[#140b28] border border-zinc-700 focus:border-[#00f5ff] text-white p-1.5 text-center font-headline text-base outline-none disabled:opacity-50"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="number"
                          min="0"
                          disabled={selectedMatch?.is_locked === 1}
                          value={currentEntry.kills !== undefined ? currentEntry.kills : ''}
                          onChange={e => handleManualChange(team.id, 'kills', Number(e.target.value))}
                          placeholder="0"
                          className="w-24 bg-[#140b28] border border-zinc-700 focus:border-[#00f5ff] text-white p-1.5 text-center font-headline text-base outline-none disabled:opacity-50"
                        />
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[#ff007f]">
                        {pts.pPts}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-[#00f5ff]">
                        {pts.kPts}
                      </td>
                      <td className="py-3 px-4 text-center font-headline text-xl text-[#ffe600]">
                        {pts.total}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Workflow Buttons */}
          {!selectedMatch?.is_locked && (
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => handleSaveManualResults(false)}
                className="w-full sm:w-auto px-6 py-3 bg-[#190e32] hover:bg-[#28154e] border border-zinc-600 text-white font-headline text-base tracking-wider comic-border-sm cursor-pointer transition-colors"
              >
                <Save className="w-4 h-4 inline mr-1" /> SAVE RESULTS (DRAFT)
              </button>

              <button
                type="button"
                onClick={() => handleSaveManualResults(true)}
                className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-headline text-base tracking-wider comic-border-sm cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
              >
                <Lock className="w-4 h-4 inline mr-1" /> FINALIZE & LOCK MATCH
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: CSV INGESTION & PREVIEW */}
      {entryMode === 'csv' && (
        <div className="space-y-6">
          <div className="bg-[#0b0518] comic-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline text-2xl text-white">PASTE SQUAD RESULTS CSV</h3>
              <span className="text-xs font-mono text-zinc-400">
                Format: <code className="text-[#00f5ff]">Team Name / Tag, Placement, Kills</code>
              </span>
            </div>

            <textarea
              rows={8}
              value={csvText}
              onChange={e => setCsvText(e.target.value)}
              placeholder={`Team Name, Placement, Kills\nGodLike Esports, 1, 14\nTeam Soul, 2, 8\nTeam XSpark, 3, 6\nBlind Esports, 4, 4...`}
              className="w-full bg-[#140b28] border border-zinc-700 focus:border-[#ff007f] text-white p-3 font-mono text-xs outline-none"
            />

            <div className="flex justify-between items-center">
              <span className="text-[11px] font-mono text-zinc-500">
                Matches can also be imported by Squad Tag (e.g. GODL, SOUL, TX, BLIND).
              </span>
              <button
                type="button"
                disabled={validatingCsv || !csvText.trim()}
                onClick={handleValidateCsv}
                className="px-5 py-2 bg-[#00f5ff] hover:bg-[#39f6ff] text-black font-headline text-sm tracking-wider comic-border-sm cursor-pointer disabled:opacity-50"
              >
                {validatingCsv ? 'VALIDATING...' : 'VERIFY & PREVIEW CSV'}
              </button>
            </div>
          </div>

          {/* Validation Report */}
          {csvValidation && (
            <div className="bg-[#0e071e] comic-border-cyan p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  {csvValidation.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  )}
                  <h4 className="font-headline text-xl text-white">
                    {csvValidation.valid ? 'VALIDATION SUCCESSFUL' : 'VALIDATION ISSUES DETECTED'}
                  </h4>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {csvValidation.totalRows} SQUADS IDENTIFIED
                </span>
              </div>

              {/* Errors if any */}
              {csvValidation.errors && csvValidation.errors.length > 0 && (
                <div className="p-3 bg-red-950/40 border border-red-500 text-xs font-mono text-red-200 space-y-1">
                  {csvValidation.errors.map((err: string, i: number) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {/* Preview Table */}
              {csvValidation.parsedRows && csvValidation.parsedRows.length > 0 && (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-[#00f5ff]">
                        <th className="py-2 px-3">PLACE</th>
                        <th className="py-2 px-3">SQUAD</th>
                        <th className="py-2 px-3">KILLS</th>
                        <th className="py-2 px-3">PLACE PTS</th>
                        <th className="py-2 px-3">TOTAL PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900">
                      {csvValidation.parsedRows.map((r: any) => (
                        <tr key={r.team_id} className="hover:bg-white/5">
                          <td className="py-2 px-3 font-bold text-white">#{r.placement}</td>
                          <td className="py-2 px-3 font-bold text-[#00f5ff]">{r.team_name}</td>
                          <td className="py-2 px-3 text-zinc-300">{r.kills}</td>
                          <td className="py-2 px-3 text-[#ff007f]">{r.placement_points}</td>
                          <td className="py-2 px-3 text-[#ffe600] font-bold">{r.total_points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Commit Button */}
              {csvValidation.valid && !selectedMatch?.is_locked && (
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    onClick={() => handleImportVerifiedCsv(false)}
                    className="px-5 py-2.5 bg-[#170c32] hover:bg-[#25134e] text-white font-headline text-sm tracking-wider comic-border-sm cursor-pointer"
                  >
                    IMPORT VERIFIED DATA
                  </button>
                  <button
                    onClick={() => handleImportVerifiedCsv(true)}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-headline text-sm tracking-wider comic-border-sm cursor-pointer"
                  >
                    IMPORT & LOCK MATCH
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
