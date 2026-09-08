import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  ClipboardList,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Save,
} from 'lucide-react';
import { safeFetchJson } from '../../utils/api';

export const AdminResultsPage: React.FC = () => {
  const {
    matches,
    teams,
    settings,
    adminToken,
    showToast,
    refreshAll,
  } = useTournament();

  const [selectedMatchId, setSelectedMatchId] =
    useState<string>(matches[0]?.id || '');

  const [entryMode, setEntryMode] =
    useState<'manual' | 'csv'>('manual');

  // Manual entry table state
  const [entries, setEntries] = useState<
    Record<
      string,
      {
        placement: number;
        kills: number;
      }
    >
  >({});

  const [loadingMatchData, setLoadingMatchData] =
    useState(false);

  // CSV state
  const [csvText, setCsvText] = useState('');
  const [csvValidation, setCsvValidation] =
    useState<any>(null);

  const [validatingCsv, setValidatingCsv] =
    useState(false);

  const selectedMatch =
    matches.find(
      (m) => m.id === selectedMatchId
    ) || matches[0];

  // =========================================================
  // ELIGIBLE TEAMS
  // =========================================================

  const eligibleTeams = teams.filter((team) => {
    if (!selectedMatch) {
      return false;
    }

    if (selectedMatch.stage === 'group') {
      return (
        team.group_id ===
        selectedMatch.group_id
      );
    }

    return team.status === 'Qualified' || true;
  });

  // =========================================================
  // LOAD EXISTING RESULTS
  // =========================================================

  useEffect(() => {
    if (!selectedMatchId) {
      return;
    }

    setLoadingMatchData(true);

    safeFetchJson<any>(
      `/api/matches/${selectedMatchId}`,
      undefined,
      1,
      300
    )
      .then((data) => {
        if (!data) {
          return;
        }

        const initialMap: Record<
          string,
          {
            placement: number;
            kills: number;
          }
        > = {};

        if (
          data.results &&
          data.results.length > 0
        ) {
          data.results.forEach((result: any) => {
            initialMap[result.team_id] = {
              placement: result.placement,
              kills: result.kills,
            };
          });
        }

        setEntries(initialMap);
      })
      .finally(() => {
        setLoadingMatchData(false);
      });
  }, [selectedMatchId]);

  // =========================================================
  // POINT CALCULATION
  // =========================================================

  const placementPoints =
    settings?.placement_points || {
      1: 10,
      2: 6,
      3: 5,
      4: 4,
      5: 3,
      6: 2,
      7: 1,
      8: 1,
    };

  const killValue =
    settings?.kill_point_value || 1;

  const calculatePoints = (
    placement: number,
    kills: number
  ) => {
    const pPts =
      (placementPoints as any)[placement] ?? 0;

    const kPts =
      (kills || 0) * killValue;

    return {
      pPts,
      kPts,
      total: pPts + kPts,
    };
  };

  // =========================================================
  // MANUAL ENTRY
  // =========================================================

  const handleManualChange = (
    teamId: string,
    field: 'placement' | 'kills',
    value: number
  ) => {
    setEntries((previous) => ({
      ...previous,

      [teamId]: {
        placement:
          field === 'placement'
            ? value
            : previous[teamId]?.placement ?? 0,

        kills:
          field === 'kills'
            ? value
            : previous[teamId]?.kills ?? 0,
      },
    }));
  };

  // =========================================================
  // QUICK AUTO POPULATE
  // =========================================================

  const handleQuickSeedResults = () => {
    const newMap: Record<
      string,
      {
        placement: number;
        kills: number;
      }
    > = {};

    eligibleTeams
      .slice(
        0,
        settings?.teams_per_group || 25
      )
      .forEach((team, index) => {
        const placement = index + 1;

        const kills = Math.max(
          0,
          Math.floor(Math.random() * 8) +
            (placement === 1 ? 7 : 0)
        );

        newMap[team.id] = {
          placement,
          kills,
        };
      });

    setEntries(newMap);

    showToast(
      'Simulated room placements and finish kills populated',
      'info'
    );
  };

  // =========================================================
  // SAVE MANUAL RESULTS
  // =========================================================

  const handleSaveManualResults = async (
    finalizeAndLock: boolean = false
  ) => {
    if (!selectedMatch) {
      return;
    }

    if (selectedMatch.is_locked) {
      showToast(
        'This match is LOCKED. Please unlock first to edit results.',
        'error'
      );
      return;
    }

    const formattedEntries = (
      Object.entries(entries) as [
        string,
        {
          placement: number;
          kills: number;
        }
      ][]
    )
      .filter(
        ([_, value]) =>
          value.placement > 0
      )
      .map(([team_id, value]) => ({
        team_id,
        placement: Number(
          value.placement
        ),
        kills: Number(
          value.kills || 0
        ),
      }));

    if (
      formattedEntries.length === 0
    ) {
      showToast(
        'Please enter placements for at least one squad.',
        'error'
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/matches/${selectedMatch.id}/results`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization: `Bearer ${adminToken}`,
          },

          body: JSON.stringify({
            entries: formattedEntries,
            finalizeAndLock,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error ||
            'Failed to save results',
          'error'
        );

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
      showToast(
        'Error saving results',
        'error'
      );
    }
  };

  // =========================================================
  // VALIDATE CSV
  // =========================================================

  const handleValidateCsv = async () => {
    if (!csvText.trim()) {
      showToast(
        'Please paste CSV data first',
        'error'
      );

      return;
    }

    if (!selectedMatch) {
      return;
    }

    setValidatingCsv(true);

    try {
      const res = await fetch(
        `/api/admin/matches/${selectedMatch.id}/results/csv-preview`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization: `Bearer ${adminToken}`,
          },

          body: JSON.stringify({
            csvText,
          }),
        }
      );

      const data = await res.json();

      setCsvValidation(data);

      if (!data.valid) {
        showToast(
          `Validation found ${data.errors.length} issue(s).`,
          'error'
        );
      } else {
        showToast(
          `Validated ${data.totalRows} squad entries successfully!`,
          'success'
        );
      }
    } catch {
      showToast(
        'Error validating CSV',
        'error'
      );
    } finally {
      setValidatingCsv(false);
    }
  };

  // =========================================================
  // IMPORT VERIFIED CSV
  // =========================================================

  const handleImportVerifiedCsv = async (
    finalizeAndLock: boolean = false
  ) => {
    if (
      !csvValidation ||
      !csvValidation.valid ||
      !csvValidation.parsedRows
    ) {
      showToast(
        'No valid CSV data to import',
        'error'
      );

      return;
    }

    if (!selectedMatch) {
      return;
    }

    const formattedEntries =
      csvValidation.parsedRows.map(
        (row: any) => ({
          team_id: row.team_id,
          placement: row.placement,
          kills: row.kills,
        })
      );

    try {
      const res = await fetch(
        `/api/admin/matches/${selectedMatch.id}/results`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',

            Authorization: `Bearer ${adminToken}`,
          },

          body: JSON.stringify({
            entries: formattedEntries,
            finalizeAndLock,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error ||
            'Failed to import CSV',
          'error'
        );

        return;
      }

      showToast(
        `Imported ${formattedEntries.length} verified results!`,
        'success'
      );

      setCsvText('');
      setCsvValidation(null);

      refreshAll();
    } catch {
      showToast(
        'Error importing CSV',
        'error'
      );
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="space-y-6">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div
        className="
          border-b
          border-zinc-300
          dark:border-zinc-800
          pb-4
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
        "
      >
        <div>
          <h1
            className="
              font-headline
              text-3xl
              text-black
              dark:text-white
              tracking-wider
            "
          >
            MATCH RESULT INGESTION & ADJUDICATION
          </h1>

          <p
            className="
              text-xs
              font-mono
              text-zinc-600
              dark:text-zinc-400
              mt-0.5
            "
          >
            Ingest manual or CSV match data.
            Standings and tie-breakers are
            calculated automatically.
          </p>
        </div>

        {/* MATCH SELECT */}

        <div className="flex items-center gap-3">

          <label
            className="
              text-xs
              font-mono
              text-zinc-600
              dark:text-zinc-400
              uppercase
            "
          >
            SELECT ROOM:
          </label>

          <select
            value={selectedMatchId}
            onChange={(e) =>
              setSelectedMatchId(
                e.target.value
              )
            }
            className="
              bg-zinc-50
              dark:bg-[#140b28]
              border-2
              border-[#00f5ff]
              text-black
              dark:text-white
              p-2
              font-headline
              text-sm
              tracking-wider
              outline-none
            "
          >
            {matches.map((match) => (
              <option
                key={match.id}
                value={match.id}
              >
                {match.name} ({match.map}){' '}
                {match.is_locked ? '🔒' : ''}
              </option>
            ))}
          </select>

        </div>
      </div>

      {/* =====================================================
          LOCK NOTICE
          ===================================================== */}

      {selectedMatch?.is_locked ? (
        <div
          className="
            p-4
            bg-emerald-50
            dark:bg-emerald-950/40
            border
            border-emerald-400
            dark:border-emerald-500/50
            flex
            items-center
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
              text-emerald-700
              dark:text-emerald-400
              text-xs
              font-mono
            "
          >
            <Lock
              className="w-5 h-5 shrink-0"
            />

            <span>
              THIS MATCH SCORECARD IS
              VERIFIED AND LOCKED. Results
              are published and immutable.
              Unlock in Match Schedule to
              edit.
            </span>
          </div>
        </div>
      ) : null}

      {/* =====================================================
          MODE TABS
          ===================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-zinc-300
          dark:border-zinc-800
          gap-3
          flex-wrap
        "
      >
        <div className="flex items-center gap-2">

          {/* MANUAL */}

          <button
            type="button"
            onClick={() =>
              setEntryMode('manual')
            }
            className={`
              px-4
              py-2
              font-headline
              text-sm
              tracking-wider
              cursor-pointer
              transition-colors
              flex
              items-center
              gap-1
              ${
                entryMode === 'manual'
                  ? 'bg-[#ff007f] text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-white/5'
              }
            `}
          >
            <ClipboardList className="w-4 h-4" />

            MANUAL SQUAD GRID
          </button>

          {/* CSV */}

          <button
            type="button"
            onClick={() =>
              setEntryMode('csv')
            }
            className={`
              px-4
              py-2
              font-headline
              text-sm
              tracking-wider
              cursor-pointer
              transition-colors
              flex
              items-center
              gap-1
              ${
                entryMode === 'csv'
                  ? 'bg-[#ff007f] text-white'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white bg-zinc-100 dark:bg-white/5'
              }
            `}
          >
            <Upload className="w-4 h-4" />

            CSV BATCH IMPORT
          </button>

        </div>

        {/* QUICK POPULATE */}

        {entryMode === 'manual' &&
          !selectedMatch?.is_locked && (
            <button
              type="button"
              onClick={
                handleQuickSeedResults
              }
              className="
                px-3
                py-1
                bg-zinc-100
                dark:bg-[#1a0f35]
                hover:bg-zinc-200
                dark:hover:bg-[#27144d]
                text-zinc-700
                dark:text-zinc-300
                text-xs
                font-mono
                border
                border-zinc-300
                dark:border-zinc-700
                cursor-pointer
              "
              title="Auto-fills realistic placements and kills for testing"
            >
              ⚡ QUICK AUTO-POPULATE SQUAD
              RESULTS
            </button>
          )}

      </div>

      {/* =====================================================
          MANUAL ENTRY
          ===================================================== */}

      {entryMode === 'manual' && (
        <div className="space-y-6">

          {/* TABLE */}

          <div
            className="
              bg-white
              dark:bg-[#0b0518]
              comic-border
              overflow-x-auto
              transition-colors
            "
          >
            <table
              className="
                w-full
                text-left
                border-collapse
                text-sm
              "
            >

              <thead>
                <tr
                  className="
                    bg-zinc-100
                    dark:bg-[#140b29]
                    border-b
                    border-zinc-300
                    dark:border-zinc-800
                    text-xs
                    font-headline
                    tracking-widest
                    text-[#009fbd]
                    dark:text-[#00f5ff]
                  "
                >
                  <th className="py-3 px-4">
                    SQUAD
                  </th>

                  <th className="py-3 px-4">
                    TAG
                  </th>

                  <th className="py-3 px-4 w-32">
                    PLACEMENT (#)
                  </th>

                  <th className="py-3 px-4 w-32">
                    KILLS
                  </th>

                  <th className="py-3 px-4 text-center text-[#d9006c] dark:text-[#ff007f]">
                    PLACE PTS
                  </th>

                  <th className="py-3 px-4 text-center text-[#009fbd] dark:text-[#00f5ff]">
                    KILL PTS
                  </th>

                  <th className="py-3 px-4 text-center text-[#b39400] dark:text-[#ffe600] font-bold">
                    TOTAL PTS
                  </th>
                </tr>
              </thead>

              <tbody
                className="
                  divide-y
                  divide-zinc-200
                  dark:divide-zinc-900
                  font-display
                "
              >

                {loadingMatchData ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="
                        py-10
                        text-center
                        text-xs
                        font-mono
                        text-zinc-500
                      "
                    >
                      LOADING MATCH RESULTS...
                    </td>
                  </tr>
                ) : eligibleTeams.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="
                        py-10
                        text-center
                        text-xs
                        font-mono
                        text-zinc-500
                      "
                    >
                      NO ELIGIBLE SQUADS FOUND
                    </td>
                  </tr>
                ) : (
                  eligibleTeams.map(
                    (team) => {
                      const currentEntry =
                        entries[team.id] || {
                          placement: 0,
                          kills: 0,
                        };

                      const pts =
                        calculatePoints(
                          currentEntry.placement,
                          currentEntry.kills
                        );

                      return (
                        <tr
                          key={team.id}
                          className={`
                            transition-colors
                            ${
                              currentEntry.placement ===
                              1
                                ? 'bg-[#ffe600]/10 font-bold'
                                : 'hover:bg-black/5 dark:hover:bg-white/5'
                            }
                          `}
                        >

                          {/* SQUAD */}

                          <td
                            className="
                              py-3
                              px-4
                              font-headline
                              text-lg
                              text-black
                              dark:text-white
                            "
                          >
                            {team.name}
                          </td>

                          {/* TAG */}

                          <td
                            className="
                              py-3
                              px-4
                              font-mono
                              text-xs
                              text-[#d9006c]
                              dark:text-[#ff007f]
                            "
                          >
                            {team.tag}
                          </td>

                          {/* PLACEMENT */}

                          <td className="py-3 px-4">

                            <input
                              type="number"
                              min="1"
                              max={
                                settings?.teams_per_group ||
                                25
                              }
                              disabled={
                                selectedMatch?.is_locked ===
                                1
                              }
                              value={
                                currentEntry.placement ||
                                ''
                              }
                              onChange={(e) =>
                                handleManualChange(
                                  team.id,
                                  'placement',
                                  Number(
                                    e.target.value
                                  )
                                )
                              }
                              placeholder="Rank"
                              className="
                                w-24
                                bg-zinc-50
                                dark:bg-[#140b28]
                                border
                                border-zinc-300
                                dark:border-zinc-700
                                focus:border-[#00f5ff]
                                text-black
                                dark:text-white
                                p-1.5
                                text-center
                                font-headline
                                text-base
                                outline-none
                                disabled:opacity-50
                              "
                            />

                          </td>

                          {/* KILLS */}

                          <td className="py-3 px-4">

                            <input
                              type="number"
                              min="0"
                              disabled={
                                selectedMatch?.is_locked ===
                                1
                              }
                              value={
                                currentEntry.kills !==
                                undefined
                                  ? currentEntry.kills
                                  : ''
                              }
                              onChange={(e) =>
                                handleManualChange(
                                  team.id,
                                  'kills',
                                  Number(
                                    e.target.value
                                  )
                                )
                              }
                              placeholder="0"
                              className="
                                w-24
                                bg-zinc-50
                                dark:bg-[#140b28]
                                border
                                border-zinc-300
                                dark:border-zinc-700
                                focus:border-[#00f5ff]
                                text-black
                                dark:text-white
                                p-1.5
                                text-center
                                font-headline
                                text-base
                                outline-none
                                disabled:opacity-50
                              "
                            />

                          </td>

                          {/* PLACE POINTS */}

                          <td
                            className="
                              py-3
                              px-4
                              text-center
                              font-mono
                              text-[#d9006c]
                              dark:text-[#ff007f]
                            "
                          >
                            {pts.pPts}
                          </td>

                          {/* KILL POINTS */}

                          <td
                            className="
                              py-3
                              px-4
                              text-center
                              font-mono
                              text-[#009fbd]
                              dark:text-[#00f5ff]
                            "
                          >
                            {pts.kPts}
                          </td>

                          {/* TOTAL */}

                          <td
                            className="
                              py-3
                              px-4
                              text-center
                              font-headline
                              text-xl
                              text-[#b39400]
                              dark:text-[#ffe600]
                            "
                          >
                            {pts.total}
                          </td>

                        </tr>
                      );
                    }
                  )
                )}

              </tbody>
            </table>
          </div>

          {/* =================================================
              ACTION BUTTONS
              ================================================= */}

          {!selectedMatch?.is_locked && (
            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-center
                justify-end
                gap-3
                pt-4
                border-t
                border-zinc-300
                dark:border-zinc-800
              "
            >

              {/* SAVE DRAFT */}

              <button
                type="button"
                onClick={() =>
                  handleSaveManualResults(
                    false
                  )
                }
                className="
                  w-full
                  sm:w-auto
                  px-6
                  py-3
                  bg-zinc-100
                  dark:bg-[#190e32]
                  hover:bg-zinc-200
                  dark:hover:bg-[#28154e]
                  border
                  border-zinc-300
                  dark:border-zinc-600
                  text-black
                  dark:text-white
                  font-headline
                  text-base
                  tracking-wider
                  comic-border-sm
                  cursor-pointer
                  transition-colors
                "
              >
                <Save className="w-4 h-4 inline mr-1" />

                SAVE RESULTS (DRAFT)
              </button>

              {/* FINALIZE */}

              <button
                type="button"
                onClick={() =>
                  handleSaveManualResults(
                    true
                  )
                }
                className="
                  w-full
                  sm:w-auto
                  px-6
                  py-3
                  bg-linear-to-r
                  from-emerald-600
                  to-teal-500
                  hover:from-emerald-500
                  hover:to-teal-400
                  text-white
                  font-headline
                  text-base
                  tracking-wider
                  comic-border-sm
                  cursor-pointer
                  shadow-[0_0_15px_rgba(16,185,129,0.4)]
                  transition-all
                "
              >
                <Lock className="w-4 h-4 inline mr-1" />

                FINALIZE & LOCK MATCH
              </button>

            </div>
          )}

        </div>
      )}

      {/* =====================================================
          CSV MODE
          ===================================================== */}

      {entryMode === 'csv' && (
        <div className="space-y-6">

          {/* CSV INPUT */}

          <div
            className="
              bg-white
              dark:bg-[#0b0518]
              comic-border
              p-6
              space-y-4
              transition-colors
            "
          >

            <div
              className="
                flex
                flex-col
                sm:flex-row
                items-start
                sm:items-center
                justify-between
                gap-2
              "
            >

              <h3
                className="
                  font-headline
                  text-2xl
                  text-black
                  dark:text-white
                "
              >
                PASTE SQUAD RESULTS CSV
              </h3>

              <span
                className="
                  text-xs
                  font-mono
                  text-zinc-600
                  dark:text-zinc-400
                "
              >
                Format:{' '}
                <code className="text-[#009fbd] dark:text-[#00f5ff]">
                  Team Name / Tag, Placement,
                  Kills
                </code>
              </span>

            </div>

            <textarea
              rows={8}
              value={csvText}
              onChange={(e) =>
                setCsvText(e.target.value)
              }
              placeholder={`Team Name, Placement, Kills
GodLike Esports, 1, 14
Team Soul, 2, 8
Team XSpark, 3, 6
Blind Esports, 4, 4...`}
              className="
                w-full
                bg-zinc-50
                dark:bg-[#140b28]
                border
                border-zinc-300
                dark:border-zinc-700
                focus:border-[#ff007f]
                text-black
                dark:text-white
                p-3
                font-mono
                text-xs
                outline-none
              "
            />

            <div
              className="
                flex
                flex-col
                sm:flex-row
                justify-between
                items-start
                sm:items-center
                gap-3
              "
            >

              <span
                className="
                  text-[11px]
                  font-mono
                  text-zinc-500
                "
              >
                Matches can also be imported by
                Squad Tag (e.g. GODL, SOUL, TX,
                BLIND).
              </span>

              <button
                type="button"
                disabled={
                  validatingCsv ||
                  !csvText.trim()
                }
                onClick={
                  handleValidateCsv
                }
                className="
                  px-5
                  py-2
                  bg-[#00f5ff]
                  hover:bg-[#39f6ff]
                  text-black
                  font-headline
                  text-sm
                  tracking-wider
                  comic-border-sm
                  cursor-pointer
                  disabled:opacity-50
                "
              >
                {validatingCsv
                  ? 'VALIDATING...'
                  : 'VERIFY & PREVIEW CSV'}
              </button>

            </div>

          </div>

          {/* =================================================
              VALIDATION REPORT
              ================================================= */}

          {csvValidation && (
            <div
              className="
                bg-white
                dark:bg-[#0e071e]
                comic-border-cyan
                p-6
                space-y-4
                transition-colors
              "
            >

              {/* VALIDATION HEADER */}

              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  items-start
                  sm:items-center
                  justify-between
                  gap-2
                  border-b
                  border-zinc-300
                  dark:border-zinc-800
                  pb-3
                "
              >

                <div className="flex items-center gap-2">

                  {csvValidation.valid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-500 dark:text-red-400" />
                  )}

                  <h4
                    className="
                      font-headline
                      text-xl
                      text-black
                      dark:text-white
                    "
                  >
                    {csvValidation.valid
                      ? 'VALIDATION SUCCESSFUL'
                      : 'VALIDATION ISSUES DETECTED'}
                  </h4>

                </div>

                <span
                  className="
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                  "
                >
                  {csvValidation.totalRows}{' '}
                  SQUADS IDENTIFIED
                </span>

              </div>

              {/* ERRORS */}

              {csvValidation.errors &&
                csvValidation.errors.length >
                  0 && (
                  <div
                    className="
                      p-3
                      bg-red-50
                      dark:bg-red-950/40
                      border
                      border-red-300
                      dark:border-red-500
                      text-xs
                      font-mono
                      text-red-700
                      dark:text-red-200
                      space-y-1
                    "
                  >
                    {csvValidation.errors.map(
                      (
                        error: string,
                        index: number
                      ) => (
                        <div key={index}>
                          • {error}
                        </div>
                      )
                    )}
                  </div>
                )}

              {/* =================================================
                  PREVIEW TABLE
                  ================================================= */}

              {csvValidation.parsedRows &&
                csvValidation.parsedRows.length >
                  0 && (
                  <div
                    className="
                      overflow-x-auto
                      max-h-80
                      overflow-y-auto
                    "
                  >
                    <table
                      className="
                        w-full
                        text-left
                        text-xs
                        font-mono
                        border-collapse
                      "
                    >

                      <thead>
                        <tr
                          className="
                            border-b
                            border-zinc-300
                            dark:border-zinc-800
                            text-[#009fbd]
                            dark:text-[#00f5ff]
                          "
                        >
                          <th className="py-2 px-3">
                            PLACE
                          </th>

                          <th className="py-2 px-3">
                            SQUAD
                          </th>

                          <th className="py-2 px-3">
                            KILLS
                          </th>

                          <th className="py-2 px-3">
                            PLACE PTS
                          </th>

                          <th className="py-2 px-3">
                            TOTAL PTS
                          </th>
                        </tr>
                      </thead>

                      <tbody
                        className="
                          divide-y
                          divide-zinc-200
                          dark:divide-zinc-900
                        "
                      >
                        {csvValidation.parsedRows.map(
                          (row: any) => (
                            <tr
                              key={row.team_id}
                              className="
                                hover:bg-black/5
                                dark:hover:bg-white/5
                              "
                            >

                              <td
                                className="
                                  py-2
                                  px-3
                                  font-bold
                                  text-black
                                  dark:text-white
                                "
                              >
                                #{row.placement}
                              </td>

                              <td
                                className="
                                  py-2
                                  px-3
                                  font-bold
                                  text-[#009fbd]
                                  dark:text-[#00f5ff]
                                "
                              >
                                {row.team_name}
                              </td>

                              <td
                                className="
                                  py-2
                                  px-3
                                  text-zinc-700
                                  dark:text-zinc-300
                                "
                              >
                                {row.kills}
                              </td>

                              <td
                                className="
                                  py-2
                                  px-3
                                  text-[#d9006c]
                                  dark:text-[#ff007f]
                                "
                              >
                                {row.placement_points}
                              </td>

                              <td
                                className="
                                  py-2
                                  px-3
                                  text-[#b39400]
                                  dark:text-[#ffe600]
                                  font-bold
                                "
                              >
                                {row.total_points}
                              </td>

                            </tr>
                          )
                        )}
                      </tbody>

                    </table>
                  </div>
                )}

              {/* =================================================
                  IMPORT BUTTONS
                  ================================================= */}

              {csvValidation.valid &&
                !selectedMatch?.is_locked && (
                  <div
                    className="
                      flex
                      flex-col
                      sm:flex-row
                      justify-end
                      gap-3
                      pt-4
                      border-t
                      border-zinc-300
                      dark:border-zinc-800
                    "
                  >

                    <button
                      type="button"
                      onClick={() =>
                        handleImportVerifiedCsv(
                          false
                        )
                      }
                      className="
                        px-5
                        py-2.5
                        bg-zinc-100
                        dark:bg-[#170c32]
                        hover:bg-zinc-200
                        dark:hover:bg-[#25134e]
                        text-black
                        dark:text-white
                        font-headline
                        text-sm
                        tracking-wider
                        comic-border-sm
                        cursor-pointer
                      "
                    >
                      IMPORT VERIFIED DATA
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleImportVerifiedCsv(
                          true
                        )
                      }
                      className="
                        px-5
                        py-2.5
                        bg-emerald-600
                        hover:bg-emerald-500
                        text-white
                        font-headline
                        text-sm
                        tracking-wider
                        comic-border-sm
                        cursor-pointer
                      "
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