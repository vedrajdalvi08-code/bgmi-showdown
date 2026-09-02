import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { TournamentSettings, Team, Match, LeaderboardRow, TournamentRule } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_RULES, DEFAULT_STATS } from '../data/defaults';
import { safeFetchJson } from '../utils/api';

interface TournamentContextType {
  settings: TournamentSettings | null;
  stats: {
    totalTeams: number;
    completedMatches: number;
    totalMatches: number;
    totalKills: number;
    totalChickenDinners?: number;
    remainingMatches: number;
  } | null;
  nextMatch: Match | null;
  recentMatch: Match | null;
  teams: Team[];
  matches: Match[];
  leaderboard: LeaderboardRow[];
  leaderboardMatches: Array<{ id: string; match_number: number; name: string; map: string }>;
  rules: TournamentRule[];
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedTeamId: string | null;
  setSelectedTeamId: (id: string | null) => void;
  selectedMatchId: string | null;
  setSelectedMatchId: (id: string | null) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  // Admin State
  isAdmin: boolean;
  isAdminAuthenticated: boolean;
  adminToken: string | null;
  loginAdmin: (token: string) => void;
  logoutAdmin: () => Promise<void>;
  refreshAll: () => Promise<void>;
  fetchLeaderboard: (stage: 'group' | 'finals', groupId?: string) => Promise<{
    leaderboard: LeaderboardRow[];
    matches: Array<{ id: string; match_number: number; name: string; map: string }>;
    qualifiersCount: number;
  }>;
  // Theme Management
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('bgmi_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // ignore
    }
    return 'dark'; // Default to Vice Noir dark
  });

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('bgmi_theme', newTheme);
    } catch {
      // ignore
    }
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prevTheme => {
      const nextTheme = prevTheme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('bgmi_theme', nextTheme);
      } catch {
        // ignore
      }
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      }
      return nextTheme;
    });
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
    }
  }, [theme]);

  const [settings, setSettings] = useState<TournamentSettings | null>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<any>(DEFAULT_STATS);
  const [nextMatch, setNextMatch] = useState<Match | null>(null);
  const [recentMatch, setRecentMatch] = useState<Match | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [leaderboardMatches, setLeaderboardMatches] = useState<Array<{ id: string; match_number: number; name: string; map: string }>>([]);
  const [rules, setRules] = useState<TournamentRule[]>(DEFAULT_RULES);
  const [loading, setLoading] = useState(true);

  // Navigation: 'home' | 'leaderboard' | 'groups' | 'matches' | 'finals' | 'teams' | 'team-detail' | 'rules' | 'admin-login' | 'admin' | 'admin-teams' | 'admin-groups' | 'admin-matches' | 'admin-results' | 'admin-finals' | 'admin-settings' | 'admin-rules'
  const [activeTab, setActiveTabState] = useState<string>('home');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Admin session state
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return localStorage.getItem('bgmi_admin_token');
  });
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Check admin session on mount or token change
  useEffect(() => {
    if (!adminToken) {
      setIsAdmin(false);
      return;
    }

    fetch('/api/admin/me', {
      headers: { Authorization: `Bearer ${adminToken}` }
    })
      .then(res => {
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setAdminToken(null);
          localStorage.removeItem('bgmi_admin_token');
        }
      })
      .catch(() => {
        setIsAdmin(false);
      });
  }, [adminToken]);

  const loginAdmin = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('bgmi_admin_token', token);
    setIsAdmin(true);
    showToast('Admin clearance granted. Welcome to Mission Control.', 'success');
  };

  const logoutAdmin = async () => {
    try {
      if (adminToken) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${adminToken}` }
        });
      }
    } catch {
      // ignore
    }
    setAdminToken(null);
    localStorage.removeItem('bgmi_admin_token');
    setIsAdmin(false);
    showToast('Logged out of Admin Panel.', 'info');
    setActiveTab('home');
  };

  // Fetch Public Tournament Data
  const refreshAll = useCallback(async () => {
    try {
      const [tData, teamsData, mData, rData] = await Promise.all([
        safeFetchJson<{ settings?: any; stats?: any; nextMatch?: any; recentMatch?: any }>('/api/tournament', undefined, 2, 400),
        safeFetchJson<{ teams?: Team[] }>('/api/teams', undefined, 2, 400),
        safeFetchJson<{ matches?: Match[] }>('/api/matches', undefined, 2, 400),
        safeFetchJson<{ rules?: TournamentRule[] }>('/api/rules', undefined, 2, 400)
      ]);

      if (tData) {
        if (tData.settings) setSettings(tData.settings);
        if (tData.stats) setStats(tData.stats);
        if (tData.nextMatch !== undefined) setNextMatch(tData.nextMatch);
        if (tData.recentMatch !== undefined) setRecentMatch(tData.recentMatch);
      }
      if (teamsData?.teams) {
        setTeams(teamsData.teams);
      }
      if (mData?.matches) {
        setMatches(mData.matches);
      }
      if (rData?.rules) {
        setRules(rData.rules);
      }
    } catch {
      // Gracefully fall back to preloaded defaults
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchLeaderboard = useCallback(async (stage: 'group' | 'finals', groupId?: string) => {
    try {
      let url = `/api/leaderboard?stage=${stage}`;
      if (groupId) url += `&groupId=${groupId}`;
      const data = await safeFetchJson<{
        leaderboard: LeaderboardRow[];
        matches: Array<{ id: string; match_number: number; name: string; map: string }>;
        qualifiersCount: number;
      }>(url, undefined, 2, 400);

      if (data?.leaderboard) {
        setLeaderboard(data.leaderboard);
        setLeaderboardMatches(data.matches || []);
        return data;
      }
    } catch {
      // Gracefully maintain existing leaderboard
    }
    return { leaderboard: [], matches: [], qualifiersCount: 8 };
  }, []);

  useEffect(() => {
    refreshAll();
    fetchLeaderboard('group', 'grp_a');

    // Polling every 12 seconds for live leaderboard updates without page reload
    const interval = setInterval(() => {
      refreshAll();
    }, 12000);

    return () => clearInterval(interval);
  }, [refreshAll, fetchLeaderboard]);

  return (
    <TournamentContext.Provider
      value={{
        settings,
        stats,
        nextMatch,
        recentMatch,
        teams,
        matches,
        leaderboard,
        leaderboardMatches,
        rules,
        loading,
        activeTab,
        setActiveTab,
        selectedTeamId,
        setSelectedTeamId,
        selectedMatchId,
        setSelectedMatchId,
        toast,
        showToast,
        isAdmin,
        isAdminAuthenticated: isAdmin,
        adminToken,
        loginAdmin,
        logoutAdmin,
        refreshAll,
        fetchLeaderboard,
        theme,
        toggleTheme,
        setTheme
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
};
