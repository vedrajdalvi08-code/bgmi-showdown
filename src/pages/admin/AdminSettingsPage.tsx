import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import {
  Settings,
  Save,
  Sliders,
  CheckCircle2,
  Lock,
  Minus,
  Plus,
  Users,
} from 'lucide-react';
import {
  getGroupDistribution,
  MAX_TEAMS_PER_GROUP,
  MAX_TOTAL_TEAMS,
} from '../../utils/groups';

export const AdminSettingsPage: React.FC = () => {
  const {
    settings,
    teams,
    adminToken,
    showToast,
    refreshAll,
  } = useTournament();

  // General state
  const [tournamentName, setTournamentName] = useState(
    settings?.name || 'BGMI SHOWDOWN'
  );

  const [tagline, setTagline] = useState(
    settings?.tagline || 'DROP. SURVIVE. DOMINATE.'
  );

  const [description, setDescription] = useState(
    settings?.description || ''
  );

  const [status, setStatus] = useState<string>(
    settings?.status || 'Group Stage'
  );

  const [maxTeams, setMaxTeams] = useState<string>(
    String(settings?.max_teams || 48)
  );

  const [teamCountError, setTeamCountError] =
    useState('');

  const saveTeamCountTimer =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const [qualifiersPerGroup, setQualifiersPerGroup] =
    useState<number>(
      settings?.qualifiers_per_group || 8
    );

  const [killPointValue, setKillPointValue] =
    useState<number>(
      settings?.kill_point_value || 1
    );

  // Placement points
  const [placementPoints, setPlacementPoints] =
    useState<Record<number, number>>({
      1: 10,
      2: 6,
      3: 5,
      4: 4,
      5: 3,
      6: 2,
      7: 1,
      8: 1,
      9: 0,
      10: 0,
      11: 0,
      12: 0,
      13: 0,
      14: 0,
      15: 0,
      16: 0,
      ...(settings?.placement_points || {}),
    });

  // Tie-breaker order
  const [tieBreakers, setTieBreakers] =
    useState<string[]>(
      settings?.tie_breaker_order || [
        'total_points',
        'total_kills',
        'placement_points',
        'best_placement',
        'recent_match',
      ]
    );

  // Change password state
  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [changingPass, setChangingPass] =
    useState(false);

  useEffect(() => {
    if (settings) {
      setTournamentName(settings.name);
      setTagline(settings.tagline);
      setDescription(settings.description);
      setStatus(settings.status);
      setMaxTeams(String(settings.max_teams));
      setQualifiersPerGroup(
        settings.qualifiers_per_group
      );
      setKillPointValue(
        settings.kill_point_value
      );

      if (settings.placement_points) {
        setPlacementPoints(
          settings.placement_points
        );
      }

      if (settings.tie_breaker_order) {
        setTieBreakers(
          settings.tie_breaker_order
        );
      }
    }
  }, [settings]);

  const parsedTeamCount = Number(maxTeams);

  const groupDistribution =
    Number.isInteger(parsedTeamCount) &&
    parsedTeamCount >= 1 &&
    parsedTeamCount <= MAX_TOTAL_TEAMS
      ? getGroupDistribution(parsedTeamCount)
      : [];

  const validateTeamCount = (
    value: string
  ): number | null => {
    const parsed = Number(value);

    if (
      !value.trim() ||
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      parsed > MAX_TOTAL_TEAMS
    ) {
      return null;
    }

    return parsed;
  };

  const handleTeamCountChange = (
    value: string
  ) => {
    setMaxTeams(value);

    const parsed =
      validateTeamCount(value);

    setTeamCountError(
      parsed === null
        ? `Enter a whole number from 1 to ${MAX_TOTAL_TEAMS}.`
        : ''
    );

    if (saveTeamCountTimer.current) {
      clearTimeout(
        saveTeamCountTimer.current
      );
    }

    if (parsed !== null && adminToken) {
      saveTeamCountTimer.current =
        setTimeout(async () => {
          await fetch('/api/admin/settings', {
            method: 'PUT',
            headers: {
              'Content-Type':
                'application/json',
              Authorization: `Bearer ${adminToken}`,
            },
            body: JSON.stringify({
              max_teams: parsed,
            }),
          });

          await refreshAll();
        }, 500);
    }
  };

  const handlePlacementChange = (
    rank: number,
    val: number
  ) => {
    setPlacementPoints((prev) => ({
      ...prev,
      [rank]: val,
    }));
  };

  const handleSaveSettings = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    const parsedTeamCount =
      validateTeamCount(maxTeams);

    if (parsedTeamCount === null) {
      setTeamCountError(
        `Enter a whole number from 1 to ${MAX_TOTAL_TEAMS}.`
      );

      showToast(
        'Total teams must be a valid whole number.',
        'error'
      );

      return;
    }

    try {
      const res = await fetch(
        '/api/admin/settings',
        {
          method: 'PUT',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            name: tournamentName,
            tagline,
            description,
            status,
            max_teams: parsedTeamCount,
            qualifiers_per_group:
              Number(qualifiersPerGroup),
            kill_point_value:
              Number(killPointValue),
            placement_points:
              placementPoints,
            tie_breaker_order:
              tieBreakers,
          }),
        }
      );

      if (res.ok) {
        showToast(
          'Tournament settings & scoring rules updated!',
          'success'
        );

        refreshAll();
      }
    } catch {
      showToast(
        'Failed to save settings',
        'error'
      );
    }
  };

  const handleChangePassword = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      !newPassword ||
      newPassword.length < 6
    ) {
      showToast(
        'New password must be at least 6 characters',
        'error'
      );

      return;
    }

    setChangingPass(true);

    try {
      const res = await fetch(
        '/api/admin/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
            Authorization: `Bearer ${adminToken}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          data.error ||
            'Password change failed',
          'error'
        );
      } else {
        showToast(
          'Admin password updated successfully!',
          'success'
        );

        setCurrentPassword('');
        setNewPassword('');
      }
    } catch {
      showToast(
        'Network error while changing password',
        'error'
      );
    } finally {
      setChangingPass(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div
        className="
          border-b
          border-zinc-300
          dark:border-zinc-800
          pb-4
        "
      >
        <h1
          className="
            font-headline
            text-3xl
            text-black
            dark:text-white
            tracking-wider
          "
        >
          TOURNAMENT ENGINE & SCORING CONFIGURATION
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
          Fully configuration-driven rules.
          Changes propagate in real time across
          standings and leaderboards.
        </p>
      </div>

      <form
        onSubmit={handleSaveSettings}
        className="space-y-8"
      >

        {/* ========================================= */}
        {/* TOURNAMENT IDENTITY */}
        {/* ========================================= */}

        <div
          className="
            bg-white
            dark:bg-[#0b0518]
            comic-border-cyan
            p-6
            space-y-4
          "
        >
          <h3
            className="
              font-headline
              text-2xl
              text-black
              dark:text-white
              flex
              items-center
              gap-2
            "
          >
            <Settings
              className="
                w-5
                h-5
                text-[#009fbd]
                dark:text-[#00f5ff]
              "
            />

            TOURNAMENT IDENTITY & STATUS
          </h3>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              gap-4
            "
          >

            {/* Tournament Name */}
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
                Tournament Name
              </label>

              <input
                type="text"
                required
                value={tournamentName}
                onChange={(e) =>
                  setTournamentName(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  text-black
                  dark:text-white
                  p-2
                  text-sm
                  outline-none
                  focus:border-[#00bcd4]
                  dark:focus:border-[#00f5ff]
                "
              />
            </div>

            {/* Tagline */}
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
                Tagline / Slogan
              </label>

              <input
                type="text"
                value={tagline}
                onChange={(e) =>
                  setTagline(e.target.value)
                }
                className="
                  w-full
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  text-black
                  dark:text-white
                  p-2
                  text-sm
                  outline-none
                  focus:border-[#00bcd4]
                  dark:focus:border-[#00f5ff]
                "
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
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
                Tournament Description
              </label>

              <textarea
                rows={2}
                value={description}
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  text-black
                  dark:text-white
                  p-2
                  text-xs
                  font-display
                  outline-none
                  focus:border-[#00bcd4]
                  dark:focus:border-[#00f5ff]
                "
              />
            </div>

            {/* Stage */}
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
                Current Tournament Stage
              </label>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
                className="
                  w-full
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  text-black
                  dark:text-white
                  p-2
                  text-sm
                  outline-none
                  cursor-pointer
                "
              >
                <option value="Upcoming">
                  Upcoming
                </option>

                <option value="Registration Open">
                  Registration Open
                </option>

                <option value="Group Stage">
                  Group Stage
                </option>

                <option value="Finals">
                  Finals
                </option>

                <option value="Completed">
                  Completed
                </option>
              </select>
            </div>

            {/* Maximum Teams */}
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
                Maximum Competing Squads
              </label>

              <input
                type="number"
                min="1"
                max={MAX_TOTAL_TEAMS}
                value={maxTeams}
                onChange={(e) =>
                  handleTeamCountChange(
                    e.target.value
                  )
                }
                className="
                  w-full
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  text-black
                  dark:text-white
                  p-2
                  text-sm
                  outline-none
                  focus:border-[#00bcd4]
                  dark:focus:border-[#00f5ff]
                "
              />

              {teamCountError && (
                <p
                  className="
                    text-xs
                    font-mono
                    text-red-600
                    dark:text-red-400
                    mt-1
                  "
                >
                  {teamCountError}
                </p>
              )}
            </div>

          </div>
        </div>

        {/* ========================================= */}
        {/* AUTOMATIC GROUP DISTRIBUTION */}
        {/* ========================================= */}

        <div
          className="
            bg-white
            dark:bg-[#0b0518]
            comic-border-cyan
            p-6
            space-y-5
          "
        >
          <div>
            <h3
              className="
                font-headline
                text-2xl
                text-black
                dark:text-white
                flex
                items-center
                gap-2
              "
            >
              <Users
                className="
                  w-5
                  h-5
                  text-[#009fbd]
                  dark:text-[#00f5ff]
                "
              />

              AUTOMATIC GROUP DISTRIBUTION
            </h3>

            <p
              className="
                text-xs
                font-mono
                text-zinc-600
                dark:text-zinc-400
                mt-1
              "
            >
              Groups recalculate and registered
              squads are reassigned whenever the
              total changes.
            </p>
          </div>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-3
              gap-4
            "
          >

            {/* Total Teams */}
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
                Total Teams
              </label>

              <div className="flex items-stretch">

                <button
                  type="button"
                  aria-label="Decrease total teams"
                  onClick={() =>
                    handleTeamCountChange(
                      String(
                        Math.max(
                          1,
                          parsedTeamCount - 1
                        )
                      )
                    )
                  }
                  className="
                    w-10
                    bg-zinc-100
                    dark:bg-[#140b28]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    text-black
                    dark:text-white
                    hover:text-[#009fbd]
                    dark:hover:text-[#00f5ff]
                    cursor-pointer
                  "
                >
                  <Minus className="w-4 h-4 mx-auto" />
                </button>

                <input
                  type="number"
                  min="1"
                  max={MAX_TOTAL_TEAMS}
                  value={maxTeams}
                  onChange={(e) =>
                    handleTeamCountChange(
                      e.target.value
                    )
                  }
                  className="
                    min-w-0
                    flex-1
                    bg-zinc-50
                    dark:bg-[#140b28]
                    border-y
                    border-zinc-300
                    dark:border-zinc-700
                    text-black
                    dark:text-white
                    p-2
                    text-center
                    font-headline
                    text-lg
                    outline-none
                  "
                />

                <button
                  type="button"
                  aria-label="Increase total teams"
                  onClick={() =>
                    handleTeamCountChange(
                      String(
                        Math.min(
                          MAX_TOTAL_TEAMS,
                          parsedTeamCount + 1
                        )
                      )
                    )
                  }
                  className="
                    w-10
                    bg-zinc-100
                    dark:bg-[#140b28]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    text-black
                    dark:text-white
                    hover:text-[#009fbd]
                    dark:hover:text-[#00f5ff]
                    cursor-pointer
                  "
                >
                  <Plus className="w-4 h-4 mx-auto" />
                </button>

              </div>
            </div>

            {/* Max Teams Per Group */}
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
                Max Teams Per Group
              </label>

              <div
                className="
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  text-[#9a8000]
                  dark:text-[#ffe600]
                  p-2
                  font-headline
                  text-lg
                "
              >
                {MAX_TEAMS_PER_GROUP}
              </div>
            </div>

            {/* Automatic Groups */}
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
                Automatic Groups
              </label>

              <div
                className="
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-zinc-300
                  dark:border-zinc-700
                  text-[#008ca3]
                  dark:text-[#00f5ff]
                  p-2
                  font-headline
                  text-lg
                "
              >
                {groupDistribution.length || '—'}
              </div>
            </div>

          </div>

          {/* Distribution */}
          <div>
            <div
              className="
                text-xs
                font-mono
                text-zinc-600
                dark:text-zinc-400
                uppercase
                mb-2
              "
            >
              Distribution
            </div>

            {groupDistribution.length > 0 ? (
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  lg:grid-cols-4
                  gap-3
                "
              >
                {groupDistribution.map(
                  (group) => (
                    <div
                      key={group.code}
                      className="
                        bg-zinc-50
                        dark:bg-[#140b28]
                        border
                        border-zinc-300
                        dark:border-zinc-700
                        p-3
                      "
                    >
                      <div
                        className="
                          font-headline
                          text-black
                          dark:text-white
                          tracking-wider
                        "
                      >
                        {group.name.toUpperCase()}
                      </div>

                      <div
                        className="
                          text-[#008ca3]
                          dark:text-[#00f5ff]
                          font-mono
                          text-sm
                          mt-1
                        "
                      >
                        {group.size} TEAMS
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <p
                className="
                  text-xs
                  font-mono
                  text-red-600
                  dark:text-red-400
                "
              >
                Enter a valid total team count
                to preview distribution.
              </p>
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* SCORING MATRIX */}
        {/* ========================================= */}

        <div
          className="
            bg-white
            dark:bg-[#0b0518]
            comic-border-yellow
            p-6
            space-y-4
          "
        >
          <div
            className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              justify-between
              gap-2
              border-b
              border-zinc-300
              dark:border-zinc-800
              pb-3
            "
          >
            <div>
              <h3
                className="
                  font-headline
                  text-2xl
                  text-black
                  dark:text-white
                  flex
                  items-center
                  gap-2
                "
              >
                <Sliders
                  className="
                    w-5
                    h-5
                    text-[#9a8000]
                    dark:text-[#ffe600]
                  "
                />

                SCORING MATRIX & MULTIPLIERS
              </h3>

              <p
                className="
                  text-xs
                  font-mono
                  text-zinc-600
                  dark:text-zinc-400
                "
              >
                Placement points (1st to 16th)
                and elimination value.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label
                className="
                  text-xs
                  font-mono
                  text-zinc-700
                  dark:text-zinc-300
                "
              >
                KILL POINT VALUE:
              </label>

              <input
                type="number"
                min="1"
                max="10"
                value={killPointValue}
                onChange={(e) =>
                  setKillPointValue(
                    Number(e.target.value)
                  )
                }
                className="
                  w-16
                  bg-zinc-50
                  dark:bg-[#140b28]
                  border
                  border-[#b39400]
                  dark:border-[#ffe600]
                  text-[#8a7200]
                  dark:text-[#ffe600]
                  p-1
                  text-center
                  font-headline
                  text-lg
                  outline-none
                "
              />
            </div>
          </div>

          {/* Placement Points */}
          <div
            className="
              grid
              grid-cols-2
              sm:grid-cols-4
              md:grid-cols-8
              gap-3
            "
          >
            {Array.from(
              { length: 16 },
              (_, i) => i + 1
            ).map((rank) => (
              <div
                key={rank}
                className="
                  bg-zinc-50
                  dark:bg-[#140b28]
                  p-2
                  border
                  border-zinc-300
                  dark:border-zinc-800
                  text-center
                "
              >
                <div
                  className="
                    text-[11px]
                    font-mono
                    text-zinc-500
                    dark:text-zinc-400
                    mb-1
                  "
                >
                  #{rank}{' '}
                  {rank === 1 ? '👑' : ''}
                </div>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={
                    placementPoints[rank] !==
                    undefined
                      ? placementPoints[rank]
                      : 0
                  }
                  onChange={(e) =>
                    handlePlacementChange(
                      rank,
                      Number(e.target.value)
                    )
                  }
                  className="
                    w-full
                    bg-white
                    dark:bg-[#070311]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    focus:border-[#b39400]
                    dark:focus:border-[#ffe600]
                    text-center
                    text-black
                    dark:text-white
                    font-headline
                    text-lg
                    p-1
                    outline-none
                  "
                />
              </div>
            ))}
          </div>
        </div>

        {/* ========================================= */}
        {/* TIE BREAKERS */}
        {/* ========================================= */}

        <div
          className="
            bg-white
            dark:bg-[#0b0518]
            comic-border
            p-6
            space-y-4
          "
        >
          <h3
            className="
              font-headline
              text-2xl
              text-black
              dark:text-white
              flex
              items-center
              gap-2
            "
          >
            <CheckCircle2
              className="
                w-5
                h-5
                text-[#d9006c]
                dark:text-[#ff007f]
              "
            />

            TIE-BREAKER RESOLUTION PRIORITY
          </h3>

          <p
            className="
              text-xs
              font-mono
              text-zinc-600
              dark:text-zinc-400
            "
          >
            Current active tie-breaking
            resolution sequence (evaluated in
            descending order):
          </p>

          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-5
              gap-2
              text-xs
              font-mono
            "
          >
            {tieBreakers.map(
              (tb, idx) => (
                <div
                  key={tb}
                  className="
                    p-3
                    bg-zinc-50
                    dark:bg-[#170a2f]
                    border
                    border-zinc-300
                    dark:border-zinc-700
                    flex
                    items-center
                    justify-between
                  "
                >
                  <div>
                    <div
                      className="
                        text-[10px]
                        text-zinc-500
                      "
                    >
                      PRIORITY #{idx + 1}
                    </div>

                    <div
                      className="
                        text-black
                        dark:text-white
                        font-bold
                        uppercase
                        mt-0.5
                      "
                    >
                      {tb.replace('_', ' ')}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* ========================================= */}
        {/* SAVE BUTTON */}
        {/* ========================================= */}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="
              px-8
              py-3.5
              bg-linear-to-r
              from-[#ff007f]
              to-[#b967ff]
              hover:from-[#ff1a8c]
              hover:to-[#c67eff]
              text-white
              font-headline
              text-lg
              tracking-wider
              comic-border-sm
              cursor-pointer
              shadow-[0_0_20px_rgba(255,0,127,0.4)]
              transition-all
              flex
              items-center
              gap-2
            "
          >
            <Save className="w-5 h-5" />

            SAVE ENGINE CONFIGURATION
          </button>
        </div>

      </form>

      {/* ========================================= */}
      {/* PASSWORD SECURITY */}
      {/* ========================================= */}

      <div
        className="
          bg-white
          dark:bg-[#0e071e]
          comic-border
          p-6
          space-y-4
          pt-6
          border-t-2
          border-red-300
          dark:border-red-500/40
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            text-red-600
            dark:text-red-400
          "
        >
          <Lock className="w-5 h-5" />

          <h3
            className="
              font-headline
              text-2xl
              text-black
              dark:text-white
            "
          >
            UPDATE OPERATOR CREDENTIALS
          </h3>
        </div>

        <form
          onSubmit={handleChangePassword}
          className="space-y-4 max-w-md"
        >

          {/* Current Password */}
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
              Current Password
            </label>

            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) =>
                setCurrentPassword(
                  e.target.value
                )
              }
              placeholder="••••••••"
              className="
                w-full
                bg-zinc-50
                dark:bg-[#150a2e]
                border
                border-zinc-300
                dark:border-zinc-700
                text-black
                dark:text-white
                placeholder:text-zinc-400
                dark:placeholder:text-zinc-600
                p-2
                text-sm
                outline-none
                focus:border-red-400
                dark:focus:border-red-500
              "
            />
          </div>

          {/* New Password */}
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
              New Administrator Password
            </label>

            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) =>
                setNewPassword(
                  e.target.value
                )
              }
              placeholder="At least 6 characters..."
              className="
                w-full
                bg-zinc-50
                dark:bg-[#150a2e]
                border
                border-zinc-300
                dark:border-zinc-700
                text-black
                dark:text-white
                placeholder:text-zinc-400
                dark:placeholder:text-zinc-600
                p-2
                text-sm
                outline-none
                focus:border-red-400
                dark:focus:border-red-500
              "
            />
          </div>

          <button
            type="submit"
            disabled={changingPass}
            className="
              px-5
              py-2
              bg-red-600
              hover:bg-red-500
              text-white
              font-headline
              text-sm
              tracking-wider
              comic-border-sm
              cursor-pointer
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {changingPass
              ? 'UPDATING...'
              : 'UPDATE PASSWORD'}
          </button>

        </form>
      </div>

    </div>
  );
};