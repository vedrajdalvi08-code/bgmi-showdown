import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Swords,
  Plus,
  Lock,
  Unlock,
  Edit2,
  Trash2,
  Clock,
  X,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { Match } from '../../types';
import { getGroupOptions } from '../../utils/groups';

export const AdminMatchesPage: React.FC = () => {
  const {
    matches,
    settings,
    adminToken,
    showToast,
    refreshAll,
    setActiveTab,
  } = useTournament();

  const groupOptions = getGroupOptions(settings?.group_names);

  // =========================================================
  // MODAL STATE
  // =========================================================

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMatch, setEditingMatch] =
    useState<Match | null>(null);
  const [unlockingMatch, setUnlockingMatch] =
    useState<Match | null>(null);
  const [unlockReason, setUnlockReason] = useState('');

  // =========================================================
  // FORM STATES
  // =========================================================

  const [matchNumber, setMatchNumber] =
    useState<number>(matches.length + 1);

  const [matchName, setMatchName] = useState('');

  const [stage, setStage] =
    useState<'group' | 'finals'>('group');

  const [groupId, setGroupId] =
    useState<string>('grp_a');

  const [map, setMap] =
    useState<Match['map']>('Erangel');

  const [status, setStatus] =
    useState<string>('Scheduled');

  const [scheduledTime, setScheduledTime] =
    useState('');

  // =========================================================
  // CREATE MATCH
  // =========================================================

  const handleCreateMatch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/admin/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          match_number: Number(matchNumber),
          name: matchName || `Match ${matchNumber}`,
          stage,
          group_id:
            stage === 'group' ? groupId : null,
          map,
          scheduled_time: scheduledTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error || 'Failed to create match',
          'error'
        );
        return;
      }

      showToast(
        'Match created successfully',
        'success'
      );

      setShowAddModal(false);

      refreshAll();
    } catch {
      showToast(
        'Failed to create match',
        'error'
      );
    }
  };

  // =========================================================
  // UPDATE MATCH
  // =========================================================

  const handleUpdateMatch = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingMatch) return;

    try {
      const res = await fetch(
        `/api/admin/matches/${editingMatch.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            match_number: Number(matchNumber),
            name: matchName,
            stage,
            group_id:
              stage === 'group' ? groupId : null,
            map,
            status,
            scheduled_time: scheduledTime,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error || 'Failed to update match',
          'error'
        );
        return;
      }

      showToast(
        'Match updated successfully',
        'success'
      );

      setEditingMatch(null);

      refreshAll();
    } catch {
      showToast(
        'Failed to update match',
        'error'
      );
    }
  };

  // =========================================================
  // LOCK MATCH
  // =========================================================

  const handleLockMatch = async (
    matchId: string
  ) => {
    if (
      !window.confirm(
        'Are you sure you want to verify and LOCK this match? Once locked, scores cannot be modified without an audit reason.'
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/matches/${matchId}/lock`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (!res.ok) {
        showToast(
          'Failed to lock match',
          'error'
        );
        return;
      }

      showToast(
        'Match verified and locked',
        'success'
      );

      refreshAll();
    } catch {
      showToast(
        'Failed to lock match',
        'error'
      );
    }
  };

  // =========================================================
  // UNLOCK MATCH
  // =========================================================

  const handleConfirmUnlock = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !unlockingMatch ||
      !unlockReason.trim()
    ) {
      showToast(
        'An audit reason is required to unlock',
        'error'
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/matches/${unlockingMatch.id}/unlock`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            reason: unlockReason,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error || 'Failed to unlock match',
          'error'
        );
        return;
      }

      showToast(
        'Match unlocked for score correction',
        'info'
      );

      setUnlockingMatch(null);
      setUnlockReason('');

      refreshAll();
    } catch {
      showToast(
        'Failed to unlock match',
        'error'
      );
    }
  };

  // =========================================================
  // DELETE MATCH
  // =========================================================

  const handleDeleteMatch = async (
    matchId: string,
    name: string
  ) => {
    if (
      !window.confirm(
        `Delete match "${name}"?`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/matches/${matchId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error || 'Cannot delete match',
          'error'
        );
        return;
      }

      showToast(
        'Match deleted',
        'info'
      );

      refreshAll();
    } catch {
      showToast(
        'Error deleting match',
        'error'
      );
    }
  };

  // =========================================================
  // OPEN CREATE MODAL
  // =========================================================

  const openCreateModal = () => {
    const nextMatchNumber =
      matches.length + 1;

    setMatchNumber(nextMatchNumber);
    setMatchName(
      `Match ${nextMatchNumber}`
    );
    setStage('group');
    setGroupId(
      groupOptions[0]?.id || 'grp_a'
    );
    setMap('Erangel');
    setStatus('Scheduled');
    setScheduledTime(
      '2026-09-10 16:00 IST'
    );

    setShowAddModal(true);
  };

  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const openEditModal = (match: Match) => {
    setEditingMatch(match);
    setMatchNumber(match.match_number);
    setMatchName(match.name);
    setStage(match.stage);
    setGroupId(
      match.group_id ||
        groupOptions[0]?.id ||
        'grp_a'
    );
    setMap(match.map);
    setStatus(match.status);
    setScheduledTime(
      match.scheduled_time || ''
    );
  };

  // =========================================================
  // CLOSE MATCH MODAL
  // =========================================================

  const closeMatchModal = () => {
    setShowAddModal(false);
    setEditingMatch(null);
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
          flex
          flex-col
          sm:flex-row
          sm:items-center
          justify-between
          gap-4
          border-b
          border-zinc-300
          dark:border-zinc-800
          pb-4
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
            MATCH SCHEDULE & LOBBY CONTROL
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
            Configure custom rooms, map rotations,
            and secure score verification locks.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="
            px-4
            py-2
            bg-[#ff007f]
            hover:bg-[#ff1a8c]
            text-white
            font-headline
            text-sm
            tracking-wider
            comic-border-sm
            flex
            items-center
            gap-2
            cursor-pointer
            transition-colors
          "
        >
          <Plus className="w-4 h-4" />
          CREATE MATCH
        </button>
      </div>

      {/* =====================================================
          MATCHES LIST
          ===================================================== */}

      <div className="space-y-3">

        {matches.length === 0 ? (
          <div
            className="
              bg-white
              dark:bg-[#0e071e]
              border-2
              border-dashed
              border-zinc-300
              dark:border-zinc-800
              p-10
              text-center
              transition-colors
            "
          >
            <Swords
              className="
                w-8
                h-8
                mx-auto
                mb-3
                text-zinc-400
              "
            />

            <p
              className="
                font-headline
                text-xl
                text-zinc-700
                dark:text-zinc-300
              "
            >
              NO MATCHES SCHEDULED
            </p>

            <p
              className="
                text-xs
                font-mono
                text-zinc-500
                mt-1
              "
            >
              Create a match to begin scheduling.
            </p>
          </div>
        ) : (
          matches.map((m) => (
            <div
              key={m.id}
              className={`
                p-4
                bg-white
                dark:bg-[#0e071e]
                border-2
                transition-all
                flex
                flex-col
                md:flex-row
                md:items-center
                justify-between
                gap-4
                ${
                  m.is_locked
                    ? `
                      border-emerald-400
                      dark:border-emerald-500/50
                      bg-emerald-50
                      dark:bg-[#0a1114]/50
                    `
                    : `
                      border-zinc-300
                      dark:border-zinc-800
                      hover:border-[#ff007f]/60
                    `
                }
              `}
            >

              {/* =================================================
                  MATCH INFORMATION
                  ================================================= */}

              <div className="space-y-1">

                <div
                  className="
                    flex
                    items-center
                    gap-2
                    flex-wrap
                  "
                >

                  {/* MATCH NUMBER */}

                  <span
                    className="
                      text-xs
                      font-mono
                      font-bold
                      px-2
                      py-0.5
                      bg-zinc-100
                      dark:bg-white/10
                      text-black
                      dark:text-white
                    "
                  >
                    MATCH #{m.match_number}
                  </span>

                  {/* MAP */}

                  <span
                    className="
                      text-xs
                      font-mono
                      px-2
                      py-0.5
                      bg-zinc-100
                      dark:bg-[#170a2f]
                      text-zinc-700
                      dark:text-zinc-300
                      border
                      border-zinc-300
                      dark:border-zinc-700
                    "
                  >
                    {m.map}
                  </span>

                  {/* GROUP / STAGE */}

                  <span
                    className="
                      text-xs
                      font-mono
                      px-2
                      py-0.5
                      bg-cyan-50
                      dark:bg-[#170a2f]
                      text-[#008da8]
                      dark:text-[#00f5ff]
                    "
                  >
                    {m.stage === 'group'
                      ? groupOptions.find(
                          (group) =>
                            group.id ===
                            m.group_id
                        )?.name.toUpperCase() ||
                        'UNASSIGNED'
                      : 'GRAND FINALS'}
                  </span>

                  {/* LOCK STATUS */}

                  {m.is_locked ? (
                    <span
                      className="
                        text-xs
                        font-mono
                        px-2
                        py-0.5
                        bg-emerald-100
                        dark:bg-emerald-500/20
                        text-emerald-700
                        dark:text-emerald-400
                        border
                        border-emerald-300
                        dark:border-emerald-500/40
                        flex
                        items-center
                        gap-1
                      "
                    >
                      <Lock className="w-3 h-3" />
                      VERIFIED & LOCKED
                    </span>
                  ) : (
                    <span
                      className="
                        text-xs
                        font-mono
                        px-2
                        py-0.5
                        bg-amber-100
                        dark:bg-amber-500/20
                        text-amber-700
                        dark:text-amber-400
                      "
                    >
                      {m.status}
                    </span>
                  )}

                </div>

                {/* MATCH NAME */}

                <h3
                  className="
                    font-headline
                    text-2xl
                    text-black
                    dark:text-white
                  "
                >
                  {m.name}
                </h3>

                {/* TIME */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                  "
                >
                  <span
                    className="
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <Clock
                      className="
                        w-3.5
                        h-3.5
                        text-[#d4ae00]
                        dark:text-[#ffe600]
                      "
                    />

                    {m.scheduled_time ||
                      'Schedule TBA'}
                  </span>
                </div>

              </div>

              {/* =================================================
                  ACTIONS
                  ================================================= */}

              <div
                className="
                  flex
                  items-center
                  gap-2
                  flex-wrap
                "
              >

                {/* QUICK RESULTS */}

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(
                      'admin-results'
                    );
                  }}
                  className="
                    px-3
                    py-1.5
                    bg-[#00f5ff]
                    hover:bg-[#3af6ff]
                    text-black
                    font-headline
                    text-xs
                    tracking-wider
                    cursor-pointer
                    flex
                    items-center
                    gap-1
                  "
                >
                  <ClipboardList
                    className="w-3.5 h-3.5"
                  />
                  ENTER RESULTS
                </button>

                {/* LOCK / UNLOCK */}

                {m.is_locked ? (
                  <button
                    type="button"
                    onClick={() =>
                      setUnlockingMatch(m)
                    }
                    className="
                      px-3
                      py-1.5
                      bg-amber-100
                      dark:bg-amber-900/40
                      hover:bg-amber-200
                      dark:hover:bg-amber-900/80
                      text-amber-700
                      dark:text-amber-300
                      border
                      border-amber-400
                      dark:border-amber-600
                      font-headline
                      text-xs
                      tracking-wider
                      cursor-pointer
                      flex
                      items-center
                      gap-1
                    "
                    title="Unlock match for correction"
                  >
                    <Unlock
                      className="w-3.5 h-3.5"
                    />
                    UNLOCK
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleLockMatch(m.id)
                    }
                    className="
                      px-3
                      py-1.5
                      bg-emerald-100
                      dark:bg-emerald-950/40
                      hover:bg-emerald-200
                      dark:hover:bg-emerald-900/80
                      text-emerald-700
                      dark:text-emerald-400
                      border
                      border-emerald-400
                      dark:border-emerald-700
                      font-headline
                      text-xs
                      tracking-wider
                      cursor-pointer
                      flex
                      items-center
                      gap-1
                    "
                    title="Lock finalized results"
                  >
                    <Lock
                      className="w-3.5 h-3.5"
                    />
                    LOCK SCORECARD
                  </button>
                )}

                {/* EDIT */}

                <button
                  type="button"
                  onClick={() =>
                    openEditModal(m)
                  }
                  className="
                    p-1.5
                    bg-zinc-100
                    dark:bg-white/5
                    hover:bg-zinc-200
                    dark:hover:bg-white/10
                    text-zinc-700
                    dark:text-zinc-300
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    cursor-pointer
                    transition-colors
                  "
                  title="Edit Match"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* DELETE */}

                {!m.is_locked && (
                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteMatch(
                        m.id,
                        m.name
                      )
                    }
                    className="
                      p-1.5
                      bg-red-50
                      dark:bg-red-950/40
                      hover:bg-red-100
                      dark:hover:bg-red-900/60
                      text-red-600
                      dark:text-red-400
                      border
                      border-red-200
                      dark:border-red-800/40
                      cursor-pointer
                      transition-colors
                    "
                    title="Delete Match"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

              </div>
            </div>
          ))
        )}

      </div>

      {/* =====================================================
          CREATE / EDIT MATCH MODAL
          ===================================================== */}

      {(showAddModal || editingMatch) && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-4
            bg-black/80
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-md
              bg-white
              dark:bg-[#0d061c]
              comic-border-cyan
              p-6
              space-y-4
              shadow-[0_0_30px_rgba(0,245,255,0.15)]
              dark:shadow-[0_0_30px_rgba(0,245,255,0.25)]
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-zinc-300
                dark:border-zinc-800
                pb-3
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
                {editingMatch
                  ? 'EDIT MATCH ROOM'
                  : 'SCHEDULE NEW MATCH'}
              </h3>

              <button
                type="button"
                onClick={closeMatchModal}
                className="
                  p-1
                  text-zinc-500
                  dark:text-zinc-400
                  hover:text-black
                  dark:hover:text-white
                  cursor-pointer
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                editingMatch
                  ? handleUpdateMatch
                  : handleCreateMatch
              }
              className="space-y-4"
            >

              {/* MATCH NUMBER + MAP */}

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-mono
                      text-zinc-600
                      dark:text-zinc-400
                      uppercase
                      mb-1
                    "
                  >
                    Match #
                  </label>

                  <input
                    type="number"
                    required
                    value={matchNumber}
                    onChange={(e) =>
                      setMatchNumber(
                        Number(e.target.value)
                      )
                    }
                    className="
                      w-full
                      bg-zinc-50
                      dark:bg-[#150a2e]
                      border
                      border-zinc-300
                      dark:border-zinc-700
                      text-black
                      dark:text-white
                      p-2
                      text-sm
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-mono
                      text-zinc-600
                      dark:text-zinc-400
                      uppercase
                      mb-1
                    "
                  >
                    Map
                  </label>

                  <select
                    value={map}
                    onChange={(e) =>
                      setMap(
                        e.target.value as Match['map']
                      )
                    }
                    className="
                      w-full
                      bg-zinc-50
                      dark:bg-[#150a2e]
                      border
                      border-zinc-300
                      dark:border-zinc-700
                      text-black
                      dark:text-white
                      p-2
                      text-sm
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  >
                    <option value="Erangel">
                      Erangel
                    </option>

                    <option value="Miramar">
                      Miramar
                    </option>

                    <option value="Sanhok">
                      Sanhok
                    </option>

                    <option value="Rondo">
                      Rondo
                    </option>

                    <option value="Vikendi">
                      Vikendi
                    </option>
                  </select>
                </div>

              </div>

              {/* MATCH NAME */}

              <div>
                <label
                  className="
                    block
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                    uppercase
                    mb-1
                  "
                >
                  Match Name
                </label>

                <input
                  type="text"
                  required
                  value={matchName}
                  onChange={(e) =>
                    setMatchName(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Group A — Match 3 — Sanhok"
                  className="
                    w-full
                    bg-zinc-50
                    dark:bg-[#150a2e]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    text-black
                    dark:text-white
                    p-2
                    text-sm
                    outline-none
                    focus:border-[#00f5ff]
                  "
                />
              </div>

              {/* STAGE + GROUP */}

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-mono
                      text-zinc-600
                      dark:text-zinc-400
                      uppercase
                      mb-1
                    "
                  >
                    Stage
                  </label>

                  <select
                    value={stage}
                    onChange={(e) =>
                      setStage(
                        e.target.value as
                          | 'group'
                          | 'finals'
                      )
                    }
                    className="
                      w-full
                      bg-zinc-50
                      dark:bg-[#150a2e]
                      border
                      border-zinc-300
                      dark:border-zinc-700
                      text-black
                      dark:text-white
                      p-2
                      text-sm
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  >
                    <option value="group">
                      Group Stage
                    </option>

                    <option value="finals">
                      Grand Finals
                    </option>
                  </select>
                </div>

                {stage === 'group' && (
                  <div>
                    <label
                      className="
                        block
                        text-xs
                        font-mono
                        text-zinc-600
                        dark:text-zinc-400
                        uppercase
                        mb-1
                      "
                    >
                      Group
                    </label>

                    <select
                      value={groupId}
                      onChange={(e) =>
                        setGroupId(
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        bg-zinc-50
                        dark:bg-[#150a2e]
                        border
                        border-zinc-300
                        dark:border-zinc-700
                        text-black
                        dark:text-white
                        p-2
                        text-sm
                        outline-none
                        focus:border-[#00f5ff]
                      "
                    >
                      {groupOptions.map(
                        (group) => (
                          <option
                            key={group.id}
                            value={group.id}
                          >
                            {group.name}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}

              </div>

              {/* STATUS */}

              {editingMatch && (
                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-mono
                      text-zinc-600
                      dark:text-zinc-400
                      uppercase
                      mb-1
                    "
                  >
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(
                        e.target.value
                      )
                    }
                    className="
                      w-full
                      bg-zinc-50
                      dark:bg-[#150a2e]
                      border
                      border-zinc-300
                      dark:border-zinc-700
                      text-black
                      dark:text-white
                      p-2
                      text-sm
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  >
                    <option value="Scheduled">
                      Scheduled
                    </option>

                    <option value="Live">
                      Live
                    </option>

                    <option value="Completed">
                      Completed
                    </option>

                    <option value="Cancelled">
                      Cancelled
                    </option>
                  </select>
                </div>
              )}

              {/* SCHEDULED TIME */}

              <div>
                <label
                  className="
                    block
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                    uppercase
                    mb-1
                  "
                >
                  Scheduled Time (IST)
                </label>

                <input
                  type="text"
                  value={scheduledTime}
                  onChange={(e) =>
                    setScheduledTime(
                      e.target.value
                    )
                  }
                  placeholder="e.g. 2026-09-10 16:30 IST"
                  className="
                    w-full
                    bg-zinc-50
                    dark:bg-[#150a2e]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    text-black
                    dark:text-white
                    p-2
                    text-sm
                    outline-none
                    focus:border-[#00f5ff]
                  "
                />
              </div>

              {/* MODAL BUTTONS */}

              <div
                className="
                  flex
                  justify-end
                  gap-2
                  pt-3
                  border-t
                  border-zinc-300
                  dark:border-zinc-800
                "
              >
                <button
                  type="button"
                  onClick={closeMatchModal}
                  className="
                    px-4
                    py-2
                    bg-zinc-200
                    dark:bg-zinc-800
                    hover:bg-zinc-300
                    dark:hover:bg-zinc-700
                    text-zinc-800
                    dark:text-zinc-300
                    font-headline
                    text-sm
                    cursor-pointer
                  "
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="
                    px-5
                    py-2
                    bg-[#ff007f]
                    hover:bg-[#ff1a8c]
                    text-white
                    font-headline
                    text-sm
                    cursor-pointer
                  "
                >
                  {editingMatch
                    ? 'SAVE CHANGES'
                    : 'CREATE MATCH'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          UNLOCK AUDIT CONFIRMATION MODAL
          ===================================================== */}

      {unlockingMatch && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            p-4
            bg-black/80
            backdrop-blur-sm
          "
        >
          <div
            className="
              w-full
              max-w-md
              bg-white
              dark:bg-[#0d061c]
              comic-border-yellow
              p-6
              space-y-4
              shadow-[0_0_30px_rgba(255,230,0,0.15)]
              dark:shadow-[0_0_30px_rgba(255,230,0,0.25)]
            "
          >

            {/* HEADER */}

            <div
              className="
                flex
                items-center
                gap-2
                text-[#b28e00]
                dark:text-[#ffe600]
              "
            >
              <AlertTriangle className="w-6 h-6" />

              <h3
                className="
                  font-headline
                  text-2xl
                  text-black
                  dark:text-white
                "
              >
                UNLOCK VERIFIED MATCH
              </h3>
            </div>

            {/* DESCRIPTION */}

            <p
              className="
                text-xs
                font-display
                text-zinc-700
                dark:text-zinc-300
                leading-relaxed
              "
            >
              Match{' '}
              <strong
                className="
                  text-black
                  dark:text-white
                "
              >
                {unlockingMatch.name}
              </strong>{' '}
              is currently locked. Unlocking it
              will permit score edits. For integrity
              compliance, please enter a detailed
              audit reason.
            </p>

            {/* UNLOCK FORM */}

            <form
              onSubmit={handleConfirmUnlock}
              className="space-y-4"
            >

              <div>
                <label
                  className="
                    block
                    text-xs
                    font-mono
                    text-zinc-600
                    dark:text-zinc-400
                    uppercase
                    mb-1
                  "
                >
                  Reason for Unlocking
                  (Recorded in Audit Logs)
                </label>

                <textarea
                  required
                  rows={3}
                  value={unlockReason}
                  onChange={(e) =>
                    setUnlockReason(
                      e.target.value
                    )
                  }
                  placeholder="e.g. Referee review corrected squad kill credit in round 4..."
                  className="
                    w-full
                    bg-zinc-50
                    dark:bg-[#150a2e]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    text-black
                    dark:text-white
                    p-2
                    text-xs
                    font-mono
                    outline-none
                    focus:border-[#ffe600]
                  "
                />
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setUnlockingMatch(null);
                    setUnlockReason('');
                  }}
                  className="
                    px-4
                    py-2
                    bg-zinc-200
                    dark:bg-zinc-800
                    hover:bg-zinc-300
                    dark:hover:bg-zinc-700
                    text-zinc-800
                    dark:text-zinc-300
                    font-headline
                    text-sm
                    cursor-pointer
                  "
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  className="
                    px-5
                    py-2
                    bg-amber-500
                    hover:bg-amber-400
                    text-black
                    font-headline
                    text-sm
                    cursor-pointer
                  "
                >
                  CONFIRM UNLOCK
                </button>

              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};