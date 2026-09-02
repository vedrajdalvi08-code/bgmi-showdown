export interface TournamentSettings {
  name: string;
  tagline: string;
  description: string;
  status: 'Upcoming' | 'Registration Open' | 'Group Stage' | 'Finals' | 'Completed';
  start_date: string;
  end_date: string;
  timezone: string;
  logo_url: string;
  banner_url: string;
  max_teams: number;
  min_teams: number;
  players_per_team: number;
  substitutes_allowed: boolean;
  substitutes_count: number;
  registration_status: string;
  num_groups: number;
  group_names: string[];
  teams_per_group: number;
  qualifiers_per_group: number;
  finals_teams_count: number;
  group_matches_count: number;
  finals_matches_count: number;
  finals_points_carry_over: boolean;
  kill_point_value: number;
  placement_points: Record<number, number>;
  tie_breaker_order: string[];
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  in_game_name: string;
  in_game_id?: string;
  role: 'IGL' | 'Assaulter' | 'Sniper' | 'Support' | 'Substitute';
}

export interface Team {
  id: string;
  name: string;
  tag: string;
  logo_url?: string;
  group_id: string | null;
  group_name?: string;
  status: 'Registered' | 'Checked In' | 'Assigned' | 'Playing' | 'Qualified' | 'Eliminated' | 'Disqualified' | 'Withdrawn';
  created_at?: string;
  players?: Player[];
}

export interface Match {
  id: string;
  match_number: number;
  name: string;
  stage: 'group' | 'finals';
  group_id: string | null;
  group_name?: string;
  map: 'Erangel' | 'Miramar' | 'Sanhok' | 'Vikendi' | 'Rondo';
  status: 'Scheduled' | 'Live' | 'Completed' | 'Locked';
  scheduled_time?: string;
  is_locked: number;
  locked_at?: string;
  winner?: {
    team_name: string;
    team_tag: string;
    kills: number;
    total_points: number;
  };
  topKillTeam?: {
    team_name: string;
    team_tag: string;
    kills: number;
  };
}

export interface MatchResultItem {
  id: string;
  match_id: string;
  team_id: string;
  team_name: string;
  team_tag: string;
  team_logo?: string;
  placement: number;
  kills: number;
  placement_points: number;
  kill_points: number;
  total_points: number;
}

export interface LeaderboardRow {
  rank: number;
  team_id: string;
  team_name: string;
  team_tag: string;
  team_logo: string;
  group_id: string | null;
  matches_played: number;
  total_kills: number;
  placement_points: number;
  total_points: number;
  chicken_dinners: number;
  match_breakdown: Record<string, number>;
  best_placement: number;
  recent_match_points: number;
  qualification_status: 'QUALIFIED' | 'ON THE BUBBLE' | 'ELIMINATED' | 'IN HUNT' | 'CHAMPION' | 'PODIUM';
}

export interface TournamentRule {
  id: string;
  category: string;
  title: string;
  content: string;
  order_index: number;
  display_order?: number;
}

export type Rule = TournamentRule;

export interface AuditLog {
  id: string;
  action: string;
  admin_user: string;
  details: string;
  created_at: string;
}
