import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Shield,
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  X,
} from 'lucide-react';
import { Team } from '../../types';
import { getGroupOptions } from '../../utils/groups';

export const AdminTeamsPage: React.FC = () => {
  const {
    teams,
    settings,
    adminToken,
    showToast,
    refreshAll,
  } = useTournament();

  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('all');

  const groupOptions = getGroupOptions(settings?.group_names);

  // =========================================================
  // MODAL STATE
  // =========================================================

  const [showAddTeamModal, setShowAddTeamModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [managingPlayersTeam, setManagingPlayersTeam] =
    useState<Team | null>(null);

  // =========================================================
  // TEAM FORM
  // =========================================================

  const [teamName, setTeamName] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [teamGroup, setTeamGroup] =
    useState<string>('grp_a');
  const [teamStatus, setTeamStatus] =
    useState<string>('Registered');

  // =========================================================
  // PLAYER FORM
  // =========================================================

  const [playerName, setPlayerName] = useState('');
  const [playerIGN, setPlayerIGN] = useState('');
  const [playerUID, setPlayerUID] = useState('');
  const [playerRole, setPlayerRole] = useState<
    'IGL' | 'Assaulter' | 'Sniper' | 'Support' | 'Substitute'
  >('Assaulter');

  // =========================================================
  // FILTER TEAMS
  // =========================================================

  const filteredTeams = teams.filter((team) => {
    if (
      groupFilter !== 'all' &&
      team.group_id !== groupFilter
    ) {
      return false;
    }

    if (
      search &&
      !team.name
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      !team.tag
        .toLowerCase()
        .includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // =========================================================
  // CREATE TEAM
  // =========================================================

  const handleCreateTeam = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!teamName || !teamTag) {
      showToast(
        'Team name and tag are required',
        'error'
      );
      return;
    }

    try {
      const res = await fetch('/api/admin/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          name: teamName,
          tag: teamTag,
          group_id: teamGroup,
          status: teamStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error || 'Failed to create team',
          'error'
        );
        return;
      }

      showToast(
        `Squad "${teamName}" registered successfully!`,
        'success'
      );

      setShowAddTeamModal(false);
      setTeamName('');
      setTeamTag('');

      refreshAll();
    } catch {
      showToast(
        'Error registering squad',
        'error'
      );
    }
  };

  // =========================================================
  // UPDATE TEAM
  // =========================================================

  const handleUpdateTeam = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!editingTeam) return;

    try {
      const res = await fetch(
        `/api/admin/teams/${editingTeam.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            name: teamName,
            tag: teamTag,
            group_id: teamGroup,
            status: teamStatus,
          }),
        }
      );

      if (!res.ok) {
        showToast(
          'Failed to update team',
          'error'
        );
        return;
      }

      showToast(
        `Squad "${teamName}" updated successfully`,
        'success'
      );

      setEditingTeam(null);

      refreshAll();
    } catch {
      showToast(
        'Error updating squad',
        'error'
      );
    }
  };

  // =========================================================
  // DELETE TEAM
  // =========================================================

  const handleDeleteTeam = async (
    teamId: string,
    name: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete squad "${name}"? This removes all associated players and match records.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/teams/${teamId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (res.ok) {
        showToast(
          `Squad "${name}" deleted.`,
          'info'
        );

        refreshAll();
      }
    } catch {
      showToast(
        'Failed to delete squad',
        'error'
      );
    }
  };

  // =========================================================
  // ADD PLAYER
  // =========================================================

  const handleAddPlayer = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!managingPlayersTeam) return;

    if (!playerName || !playerIGN) {
      showToast(
        'Real name and in-game name are required',
        'error'
      );
      return;
    }

    try {
      const res = await fetch(
        `/api/admin/teams/${managingPlayersTeam.id}/players`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            name: playerName,
            in_game_name: playerIGN,
            in_game_id: playerUID,
            role: playerRole,
          }),
        }
      );

      if (res.ok) {
        showToast(
          `Player "${playerIGN}" added to ${managingPlayersTeam.name}!`,
          'success'
        );

        setPlayerName('');
        setPlayerIGN('');
        setPlayerUID('');

        refreshAll();

        const updatedTeam = teams.find(
          (team) =>
            team.id === managingPlayersTeam.id
        );

        if (updatedTeam) {
          setManagingPlayersTeam(updatedTeam);
        }
      }
    } catch {
      showToast(
        'Failed to add player',
        'error'
      );
    }
  };

  // =========================================================
  // REMOVE PLAYER
  // =========================================================

  const handleRemovePlayer = async (
    playerId: string
  ) => {
    try {
      const res = await fetch(
        `/api/admin/players/${playerId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      if (res.ok) {
        showToast(
          'Player removed.',
          'info'
        );

        refreshAll();
      }
    } catch {
      showToast(
        'Failed to remove player',
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

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-300 dark:border-zinc-800 pb-4">
        <div>
          <h1 className="font-headline text-3xl text-black dark:text-white tracking-wider">
            SQUAD & ROSTER MANAGEMENT
          </h1>

          <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400 mt-0.5">
            Total Squads:{' '}
            <strong className="text-[#009fbd] dark:text-[#00f5ff]">
              {teams.length}
            </strong>{' '}
            / {settings?.max_teams || 48} target
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTeamName('');
            setTeamTag('');
            setTeamGroup(
              groupOptions[0]?.id || 'grp_a'
            );
            setTeamStatus('Registered');
            setShowAddTeamModal(true);
          }}
          className="px-4 py-2 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-headline text-sm tracking-wider comic-border-sm flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          ADD NEW SQUAD
        </button>
      </div>

      {/* =====================================================
          FILTER + SEARCH
          ===================================================== */}

      <div
        className="
          flex
          flex-col
          sm:flex-row
          items-stretch
          sm:items-center
          justify-between
          gap-4
          bg-white dark:bg-[#0e061c]
          p-4
          border
          border-zinc-300 dark:border-zinc-800
          transition-colors
        "
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-500">
            GROUP:
          </span>

          {[
            'all',
            ...groupOptions.map(
              (group) => group.id
            ),
          ].map((groupId) => (
            <button
              key={groupId}
              type="button"
              onClick={() =>
                setGroupFilter(groupId)
              }
              className={`
                px-3
                py-1
                font-headline
                text-xs
                tracking-wider
                cursor-pointer
                transition-colors
                ${
                  groupFilter === groupId
                    ? 'bg-[#00f5ff] text-black font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10'
                }
              `}
            >
              {groupId === 'all'
                ? 'ALL'
                : groupOptions
                    .find(
                      (group) =>
                        group.id === groupId
                    )
                    ?.name.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="relative min-w-60">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />

          <input
            type="text"
            placeholder="Search teams..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="
              w-full
              bg-zinc-50 dark:bg-[#140b28]
              border
              border-zinc-300 dark:border-zinc-700
              text-black dark:text-white
              text-xs
              pl-8
              pr-3
              py-1.5
              placeholder-zinc-500
              outline-none
              focus:border-[#00f5ff]
              transition-colors
            "
          />
        </div>
      </div>

      {/* =====================================================
          SQUADS TABLE
          ===================================================== */}

      <div
        className="
          bg-white dark:bg-[#0b0518]
          comic-border
          overflow-x-auto
          transition-colors
        "
      >
        <table className="w-full text-left border-collapse text-sm">

          <thead>
            <tr
              className="
                bg-zinc-100 dark:bg-[#140b29]
                border-b
                border-zinc-300 dark:border-zinc-800
                text-xs
                font-headline
                tracking-widest
                text-[#009fbd] dark:text-[#00f5ff]
              "
            >
              <th className="py-3 px-4">
                TAG
              </th>

              <th className="py-3 px-4">
                SQUAD NAME
              </th>

              <th className="py-3 px-4 text-center">
                GROUP
              </th>

              <th className="py-3 px-4 text-center">
                STATUS
              </th>

              <th className="py-3 px-4 text-center">
                ROSTER
              </th>

              <th className="py-3 px-4 text-right">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 font-display">
            {filteredTeams.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="
                    py-10
                    text-center
                    font-mono
                    text-xs
                    text-zinc-500
                  "
                >
                  NO SQUADS FOUND
                </td>
              </tr>
            ) : (
              filteredTeams.map((team) => (
                <tr
                  key={team.id}
                  className="
                    hover:bg-black/5
                    dark:hover:bg-white/5
                    transition-colors
                  "
                >
                  <td className="py-3 px-4 font-mono font-bold text-[#d9006c] dark:text-[#ff007f]">
                    {team.tag}
                  </td>

                  <td className="py-3 px-4 font-headline text-lg text-black dark:text-white">
                    {team.name}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className="
                        px-2
                        py-0.5
                        bg-zinc-100 dark:bg-white/10
                        text-zinc-700 dark:text-zinc-300
                        text-xs
                        font-mono
                      "
                    >
                      {team.group_name ||
                        groupOptions.find(
                          (group) =>
                            group.id ===
                            team.group_id
                        )?.name ||
                        'UNASSIGNED'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span
                      className="
                        px-2
                        py-0.5
                        bg-emerald-100 dark:bg-emerald-500/20
                        text-emerald-700 dark:text-emerald-400
                        text-xs
                        font-mono
                      "
                    >
                      {team.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-xs text-zinc-600 dark:text-zinc-300">
                    {team.players?.length || 0}{' '}
                    Players
                  </td>

                  <td className="py-3 px-4 text-right space-x-2">

                    {/* MANAGE ROSTER */}

                    <button
                      type="button"
                      onClick={() =>
                        setManagingPlayersTeam(
                          team
                        )
                      }
                      className="
                        p-1.5
                        bg-cyan-50 dark:bg-[#1f103d]
                        hover:bg-cyan-100 dark:hover:bg-[#2d1757]
                        text-[#008da8] dark:text-[#00f5ff]
                        border
                        border-cyan-200 dark:border-zinc-700
                        cursor-pointer
                        transition-colors
                      "
                      title="Manage Roster"
                    >
                      <Users className="w-4 h-4" />
                    </button>

                    {/* EDIT */}

                    <button
                      type="button"
                      onClick={() => {
                        setEditingTeam(team);
                        setTeamName(team.name);
                        setTeamTag(team.tag);
                        setTeamGroup(
                          team.group_id ||
                            groupOptions[0]?.id ||
                            'grp_a'
                        );
                        setTeamStatus(
                          team.status
                        );
                      }}
                      className="
                        p-1.5
                        bg-zinc-100 dark:bg-white/5
                        hover:bg-zinc-200 dark:hover:bg-white/10
                        text-zinc-700 dark:text-zinc-300
                        hover:text-black dark:hover:text-white
                        border
                        border-zinc-300 dark:border-zinc-700
                        cursor-pointer
                        transition-colors
                      "
                      title="Edit Details"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* DELETE */}

                    <button
                      type="button"
                      onClick={() =>
                        handleDeleteTeam(
                          team.id,
                          team.name
                        )
                      }
                      className="
                        p-1.5
                        bg-red-50 dark:bg-red-950/40
                        hover:bg-red-100 dark:hover:bg-red-900/60
                        text-red-600 dark:text-red-400
                        border
                        border-red-200 dark:border-red-800/40
                        cursor-pointer
                        transition-colors
                      "
                      title="Delete Squad"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          CREATE / EDIT TEAM MODAL
          ===================================================== */}

      {(showAddTeamModal || editingTeam) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">

          <div
            className="
              w-full
              max-w-md
              bg-white dark:bg-[#0d061c]
              border-2
              border-[#00f5ff]
              p-6
              space-y-4
              shadow-[0_0_30px_rgba(0,245,255,0.15)]
              dark:shadow-[0_0_30px_rgba(0,245,255,0.25)]
            "
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800 pb-3">

              <h3 className="font-headline text-2xl text-black dark:text-white">
                {editingTeam
                  ? 'EDIT SQUAD DETAILS'
                  : 'REGISTER NEW SQUAD'}
              </h3>

              <button
                type="button"
                onClick={() => {
                  setShowAddTeamModal(false);
                  setEditingTeam(null);
                }}
                className="
                  p-1
                  text-zinc-500 dark:text-zinc-400
                  hover:text-black dark:hover:text-white
                  cursor-pointer
                "
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORM */}

            <form
              onSubmit={
                editingTeam
                  ? handleUpdateTeam
                  : handleCreateTeam
              }
              className="space-y-4"
            >

              {/* SQUAD NAME */}

              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                  Squad Name
                </label>

                <input
                  type="text"
                  required
                  value={teamName}
                  onChange={(e) =>
                    setTeamName(e.target.value)
                  }
                  placeholder="e.g. Team Soul"
                  className="
                    w-full
                    bg-zinc-50 dark:bg-[#150a2e]
                    border
                    border-zinc-300 dark:border-zinc-700
                    text-black dark:text-white
                    p-2
                    text-sm
                    outline-none
                    focus:border-[#00f5ff]
                  "
                />
              </div>

              {/* SQUAD TAG */}

              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                  Squad Tag (Short code)
                </label>

                <input
                  type="text"
                  required
                  value={teamTag}
                  onChange={(e) =>
                    setTeamTag(e.target.value)
                  }
                  placeholder="e.g. SOUL"
                  className="
                    w-full
                    bg-zinc-50 dark:bg-[#150a2e]
                    border
                    border-zinc-300 dark:border-zinc-700
                    text-black dark:text-white
                    p-2
                    text-sm
                    outline-none
                    focus:border-[#00f5ff]
                    uppercase
                  "
                />
              </div>

              {/* GROUP */}

              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                  Assigned Group
                </label>

                <select
                  value={teamGroup}
                  onChange={(e) =>
                    setTeamGroup(e.target.value)
                  }
                  className="
                    w-full
                    bg-zinc-50 dark:bg-[#150a2e]
                    border
                    border-zinc-300 dark:border-zinc-700
                    text-black dark:text-white
                    p-2
                    text-sm
                    outline-none
                    focus:border-[#00f5ff]
                  "
                >
                  {groupOptions.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                    >
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* STATUS */}

              <div>
                <label className="block text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                  Status
                </label>

                <select
                  value={teamStatus}
                  onChange={(e) =>
                    setTeamStatus(e.target.value)
                  }
                  className="
                    w-full
                    bg-zinc-50 dark:bg-[#150a2e]
                    border
                    border-zinc-300 dark:border-zinc-700
                    text-black dark:text-white
                    p-2
                    text-sm
                    outline-none
                    focus:border-[#00f5ff]
                  "
                >
                  <option value="Registered">
                    Registered
                  </option>
                  <option value="Checked In">
                    Checked In
                  </option>
                  <option value="Qualified">
                    Qualified
                  </option>
                  <option value="Eliminated">
                    Eliminated
                  </option>
                  <option value="Disqualified">
                    Disqualified
                  </option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-300 dark:border-zinc-800">

                <button
                  type="button"
                  onClick={() => {
                    setShowAddTeamModal(false);
                    setEditingTeam(null);
                  }}
                  className="
                    px-4
                    py-2
                    bg-zinc-200 dark:bg-zinc-800
                    hover:bg-zinc-300 dark:hover:bg-zinc-700
                    text-zinc-800 dark:text-zinc-300
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
                  {editingTeam
                    ? 'SAVE CHANGES'
                    : 'CREATE SQUAD'}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          MANAGE PLAYERS MODAL
          ===================================================== */}

      {managingPlayersTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">

          <div
            className="
              w-full
              max-w-2xl
              bg-white dark:bg-[#0d061c]
              border-2
              border-[#00f5ff]
              p-6
              space-y-6
              max-h-[90vh]
              overflow-y-auto
              shadow-[0_0_30px_rgba(0,245,255,0.15)]
              dark:shadow-[0_0_30px_rgba(0,245,255,0.25)]
            "
          >

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-zinc-300 dark:border-zinc-800 pb-3">

              <div>
                <h3 className="font-headline text-2xl text-black dark:text-white">
                  ROSTER: {managingPlayersTeam.name}{' '}
                  ({managingPlayersTeam.tag})
                </h3>

                <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">
                  Add or manage players for this squad
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setManagingPlayersTeam(null)
                }
                className="
                  p-1
                  text-zinc-500 dark:text-zinc-400
                  hover:text-black dark:hover:text-white
                  cursor-pointer
                "
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* =================================================
                CURRENT PLAYERS
                ================================================= */}

            <div className="space-y-2">

              <h4 className="font-headline text-lg text-[#009fbd] dark:text-[#00f5ff]">
                REGISTERED PLAYERS
              </h4>

              <div
                className="
                  divide-y
                  divide-zinc-200 dark:divide-zinc-800
                  border
                  border-zinc-300 dark:border-zinc-800
                  bg-zinc-50 dark:bg-[#080313]
                "
              >
                {managingPlayersTeam.players &&
                managingPlayersTeam.players.length >
                  0 ? (
                  managingPlayersTeam.players.map(
                    (player) => (
                      <div
                        key={player.id}
                        className="
                          p-3
                          flex
                          items-center
                          justify-between
                          gap-3
                        "
                      >
                        <div className="min-w-0">

                          <span className="font-headline text-lg text-black dark:text-white">
                            {player.in_game_name}
                          </span>

                          <span
                            className="
                              ml-2
                              px-1.5
                              py-0.5
                              bg-zinc-200 dark:bg-white/10
                              text-[10px]
                              font-mono
                              text-zinc-700 dark:text-zinc-300
                            "
                          >
                            {player.role}
                          </span>

                          <div className="text-xs font-display text-zinc-600 dark:text-zinc-400">
                            Real: {player.name} • UID:{' '}
                            {player.in_game_id || 'N/A'}
                          </div>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleRemovePlayer(
                              player.id
                            )
                          }
                          className="
                            p-1
                            text-red-600 dark:text-red-400
                            hover:bg-red-100 dark:hover:bg-red-950/40
                            border
                            border-red-200 dark:border-red-900
                            cursor-pointer
                            shrink-0
                          "
                          title="Remove Player"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )
                  )
                ) : (
                  <div className="p-4 text-center text-xs text-zinc-500 font-mono">
                    No players assigned yet.
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                ADD PLAYER FORM
                ================================================= */}

            <form
              onSubmit={handleAddPlayer}
              className="
                bg-zinc-50 dark:bg-[#120726]
                p-4
                border
                border-zinc-300 dark:border-zinc-800
                space-y-3
              "
            >
              <h4 className="font-headline text-lg text-[#d9006c] dark:text-[#ff007f]">
                ADD PLAYER TO SQUAD
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {/* IGN */}

                <div>
                  <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                    In-Game Name (IGN)
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan"
                    value={playerIGN}
                    onChange={(e) =>
                      setPlayerIGN(e.target.value)
                    }
                    className="
                      w-full
                      bg-white dark:bg-[#080313]
                      border
                      border-zinc-300 dark:border-zinc-700
                      text-black dark:text-white
                      p-1.5
                      text-xs
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  />
                </div>

                {/* REAL NAME */}

                <div>
                  <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                    Real Name
                  </label>

                  <input
                    type="text"
                    required
                    placeholder="e.g. Jonathan Amaral"
                    value={playerName}
                    onChange={(e) =>
                      setPlayerName(e.target.value)
                    }
                    className="
                      w-full
                      bg-white dark:bg-[#080313]
                      border
                      border-zinc-300 dark:border-zinc-700
                      text-black dark:text-white
                      p-1.5
                      text-xs
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  />
                </div>

                {/* UID */}

                <div>
                  <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                    In-Game UID
                  </label>

                  <input
                    type="text"
                    placeholder="e.g. 5123456789"
                    value={playerUID}
                    onChange={(e) =>
                      setPlayerUID(e.target.value)
                    }
                    className="
                      w-full
                      bg-white dark:bg-[#080313]
                      border
                      border-zinc-300 dark:border-zinc-700
                      text-black dark:text-white
                      p-1.5
                      text-xs
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  />
                </div>

                {/* ROLE */}

                <div>
                  <label className="block text-[11px] font-mono text-zinc-600 dark:text-zinc-400 uppercase">
                    Combat Role
                  </label>

                  <select
                    value={playerRole}
                    onChange={(e) =>
                      setPlayerRole(
                        e.target.value as
                          | 'IGL'
                          | 'Assaulter'
                          | 'Sniper'
                          | 'Support'
                          | 'Substitute'
                      )
                    }
                    className="
                      w-full
                      bg-white dark:bg-[#080313]
                      border
                      border-zinc-300 dark:border-zinc-700
                      text-black dark:text-white
                      p-1.5
                      text-xs
                      outline-none
                      focus:border-[#00f5ff]
                    "
                  >
                    <option value="Assaulter">
                      Assaulter
                    </option>

                    <option value="IGL">
                      IGL (In-Game Leader)
                    </option>

                    <option value="Sniper">
                      Sniper
                    </option>

                    <option value="Support">
                      Support
                    </option>

                    <option value="Substitute">
                      Substitute
                    </option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="
                    px-4
                    py-1.5
                    bg-[#00f5ff]
                    hover:bg-[#3bf6ff]
                    text-black
                    font-headline
                    text-xs
                    tracking-wider
                    cursor-pointer
                  "
                >
                  ADD PLAYER
                </button>
              </div>
            </form>

            {/* =================================================
                DONE
                ================================================= */}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() =>
                  setManagingPlayersTeam(null)
                }
                className="
                  px-5
                  py-2
                  bg-black
                  dark:bg-white
                  text-white
                  dark:text-black
                  font-headline
                  text-sm
                  cursor-pointer
                "
              >
                DONE
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};