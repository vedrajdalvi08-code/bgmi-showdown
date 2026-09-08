import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Trophy,
  Play,
} from 'lucide-react';
import { LeaderboardRow } from '../../types';
import { getGroupOptions } from '../../utils/groups';

export const AdminFinalsPage: React.FC = () => {
  const {
    settings,
    adminToken,
    fetchLeaderboard,
    showToast,
    refreshAll,
    setActiveTab,
  } = useTournament();

  const [groupPreviews, setGroupPreviews] = useState<
    Array<{ name: string; rows: LeaderboardRow[] }>
  >([]);

  const [loading, setLoading] = useState(true);
  const [qualifiersPerGroup, setQualifiersPerGroup] = useState<number>(8);
  const [matchesCount, setMatchesCount] = useState<number>(5);
  const [generating, setGenerating] = useState(false);

  const groupOptions = getGroupOptions(settings?.group_names);

  /*
   * =========================================================
   * LOAD GROUP QUALIFIERS
   * =========================================================
   */

  useEffect(() => {
    let mounted = true;

    const loadGroupPreviews = async () => {
      setLoading(true);

      try {
        const results = await Promise.all(
          groupOptions.map((group) =>
            fetchLeaderboard('group', group.id)
          )
        );

        if (!mounted) return;

        setGroupPreviews(
          results.map((result, index) => ({
            name: groupOptions[index].name,
            rows: (result.leaderboard || []).slice(
              0,
              qualifiersPerGroup
            ),
          }))
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadGroupPreviews();

    return () => {
      mounted = false;
    };
  }, [
    fetchLeaderboard,
    qualifiersPerGroup,
    settings?.group_names,
  ]);

  /*
   * =========================================================
   * GENERATE GRAND FINALS
   * =========================================================
   */

  const handleGenerateFinals = async () => {
    const totalFinalists =
      qualifiersPerGroup * groupOptions.length;

    if (
      !window.confirm(
        `Generate Grand Finals for ${totalFinalists} finalists across ${matchesCount} matches? This will update tournament stage to "Finals".`
      )
    ) {
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch(
        '/api/admin/finals/generate-dynamic',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            qualifiersPerGroup,
            matchesCount,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error || 'Failed to generate finals',
          'error'
        );
        return;
      }

      showToast(
        `Grand Finals generated with ${
          data.finalists?.length || totalFinalists
        } finalists!`,
        'success'
      );

      refreshAll();
      setActiveTab('finals');
    } catch {
      showToast('Error generating finals', 'error');
    } finally {
      setGenerating(false);
    }
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="border-b border-zinc-300 dark:border-zinc-800 pb-4">
        <h1 className="font-headline text-3xl text-black dark:text-white tracking-wider">
          GRAND FINALS STAGE GENERATOR
        </h1>

        <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-0.5">
          Transition from Group Stage to Grand Finals.
          Automatically qualifies top-ranking squads based on
          authoritative point tallies and tie-breakers.
        </p>
      </div>

      {/* =====================================================
          CONFIGURATION CONTROLS
          ===================================================== */}

      <div
        className="
          bg-white dark:bg-[#120726]
          border-2 border-[#ffe600]
          p-6
          space-y-4
          shadow-[0_0_16px_rgba(255,230,0,0.15)]
          dark:shadow-[0_0_16px_rgba(255,230,0,0.2)]
        "
      >
        <h3 className="font-headline text-2xl text-black dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ffe600]" />
          FINALS STAGE PARAMETERS
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* QUALIFIERS */}

          <div>
            <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
              Qualifiers Per Group (Target: 8 per group = 16
              finalists)
            </label>

            <input
              type="number"
              min="2"
              max="16"
              value={qualifiersPerGroup}
              onChange={(e) =>
                setQualifiersPerGroup(
                  Number(e.target.value)
                )
              }
              className="
                w-full
                bg-zinc-50 dark:bg-[#080313]
                border border-zinc-300 dark:border-zinc-700
                text-black dark:text-white
                p-2
                text-sm
                outline-none
                focus:border-[#ffe600]
                transition-colors
              "
            />
          </div>

          {/* MATCH COUNT */}

          <div>
            <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
              Grand Finals Match Count (Standard: 5 Matches)
            </label>

            <input
              type="number"
              min="1"
              max="15"
              value={matchesCount}
              onChange={(e) =>
                setMatchesCount(Number(e.target.value))
              }
              className="
                w-full
                bg-zinc-50 dark:bg-[#080313]
                border border-zinc-300 dark:border-zinc-700
                text-black dark:text-white
                p-2
                text-sm
                outline-none
                focus:border-[#ffe600]
                transition-colors
              "
            />
          </div>
        </div>

        {/* PROJECTED TOTAL */}

        <div
          className="
            p-3
            bg-zinc-50 dark:bg-[#080313]
            border border-zinc-300 dark:border-zinc-800
            text-xs
            font-mono
            text-zinc-600 dark:text-zinc-400
            flex
            flex-col
            sm:flex-row
            items-start
            sm:items-center
            justify-between
            gap-2
          "
        >
          <span>
            PROJECTED TOTAL FINALISTS:{' '}
            <strong className="text-[#d4a900] dark:text-[#ffe600]">
              {qualifiersPerGroup *
                groupOptions.length}{' '}
              SQUADS
            </strong>
          </span>

          <span>
            MAP ROTATIONS: ERANGEL, MIRAMAR, SANHOK
          </span>
        </div>
      </div>

      {/* =====================================================
          QUALIFIERS LIVE PREVIEW
          ===================================================== */}

      {loading ? (
        <div
          className="
            p-8
            text-center
            font-mono
            text-sm
            text-zinc-500 dark:text-zinc-400
            border
            border-zinc-300 dark:border-zinc-800
            bg-white dark:bg-[#0b0518]
          "
        >
          LOADING QUALIFIERS...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groupPreviews.map((group, groupIndex) => {
            const isCyanGroup = groupIndex % 2 === 0;

            return (
              <div
                key={group.name}
                className={`
                  p-5
                  space-y-3
                  transition-colors
                  duration-200
                  ${
                    isCyanGroup
                      ? `
                        bg-white dark:bg-[#0b0518]
                        border-2 border-[#00f5ff]
                        shadow-[0_0_14px_rgba(0,245,255,0.12)]
                        dark:shadow-[0_0_14px_rgba(0,245,255,0.25)]
                      `
                      : `
                        bg-white dark:bg-[#0b0518]
                        border-2 border-[#ff007f]
                        shadow-[0_0_14px_rgba(255,0,127,0.12)]
                        dark:shadow-[0_0_14px_rgba(255,0,127,0.25)]
                      `
                  }
                `}
              >
                {/* GROUP HEADER */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    border-b
                    border-zinc-300 dark:border-zinc-800
                    pb-2
                    gap-3
                  "
                >
                  <h4
                    className={`
                      font-headline
                      text-xl
                      ${
                        isCyanGroup
                          ? 'text-[#00aeca] dark:text-[#00f5ff]'
                          : 'text-[#d9006c] dark:text-[#ff007f]'
                      }
                    `}
                  >
                    {group.name.toUpperCase()} ADVANCING
                    SQUADS (TOP {qualifiersPerGroup})
                  </h4>

                  <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                    SEED 1-{qualifiersPerGroup}
                  </span>
                </div>

                {/* SQUADS */}

                <div className="space-y-1.5 font-display text-sm">
                  {group.rows.length === 0 ? (
                    <div className="p-4 text-center text-xs font-mono text-zinc-500 dark:text-zinc-500">
                      NO QUALIFIERS AVAILABLE
                    </div>
                  ) : (
                    group.rows.map((team) => (
                      <div
                        key={team.team_id}
                        className="
                          p-2
                          bg-zinc-50 dark:bg-[#120726]
                          border
                          border-zinc-300 dark:border-zinc-800
                          flex
                          items-center
                          justify-between
                          gap-3
                          transition-colors
                        "
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`
                              font-headline
                              text-base
                              ${
                                isCyanGroup
                                  ? 'text-[#00aeca] dark:text-[#00f5ff]'
                                  : 'text-[#d9006c] dark:text-[#ff007f]'
                              }
                            `}
                          >
                            #{team.rank}
                          </span>

                          <span className="text-black dark:text-white font-bold truncate">
                            {team.team_name}
                          </span>

                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 whitespace-nowrap">
                            ({team.team_tag})
                          </span>
                        </div>

                        <div className="font-mono text-xs text-[#b39400] dark:text-[#ffe600] whitespace-nowrap">
                          {team.total_points} PTS •{' '}
                          {team.total_kills} KILLS
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          GENERATION TRIGGER
          ===================================================== */}

      <div
        className="
          bg-white dark:bg-[#0e071e]
          p-6
          border-2
          border-dashed
          border-[#c8a900]/50
          dark:border-[#ffe600]/40
          flex
          flex-col
          sm:flex-row
          items-center
          justify-between
          gap-4
          transition-colors
        "
      >
        <div>
          <h4 className="font-headline text-xl text-black dark:text-white">
            READY TO INITIATE FINALS?
          </h4>

          <p className="text-xs font-display text-zinc-600 dark:text-zinc-400">
            This will mark non-advancing squads as Eliminated,
            create {matchesCount} Grand Finals match rooms,
            and transition the tournament state.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGenerateFinals}
          disabled={generating}
          className="
            px-8
            py-3.5
            bg-[#ffe600]
            hover:bg-white
            text-black
            font-headline
            text-lg
            tracking-wider
            comic-border-sm
            cursor-pointer
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition-all
            flex
            items-center
            gap-2
            shadow-[0_0_20px_rgba(255,230,0,0.4)]
          "
        >
          {generating ? (
            'COMPUTING ADVANCEMENT...'
          ) : (
            <>
              <Play className="w-5 h-5 fill-black" />
              LAUNCH GRAND FINALS
            </>
          )}
        </button>
      </div>
    </div>
  );
};