import { TournamentSettings, TournamentRule } from '../types';

export const DEFAULT_SETTINGS: TournamentSettings = {
  name: 'BGMI SHOWDOWN',
  tagline: 'DROP. SURVIVE. DOMINATE.',
  description: 'The pinnacle of competitive Battlegrounds Mobile India. 48 top tier squads battle across grueling phases for the championship trophy and bragging rights.',
  status: 'Group Stage',
  start_date: '2026-09-05',
  end_date: '2026-09-12',
  timezone: 'IST (UTC+5:30)',
  logo_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80',
  banner_url: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&q=80',
  max_teams: 48,
  min_teams: 16,
  players_per_team: 4,
  substitutes_allowed: true,
  substitutes_count: 1,
  registration_status: 'Closed',
  num_groups: 2,
  group_names: ['Group A', 'Group B'],
  teams_per_group: 25,
  qualifiers_per_group: 8,
  finals_teams_count: 16,
  group_matches_count: 3,
  finals_matches_count: 5,
  finals_points_carry_over: false,
  kill_point_value: 1,
  placement_points: {
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
    16: 0
  },
  tie_breaker_order: ['total_points', 'total_kills', 'placement_points', 'best_placement', 'recent_match']
};

export const DEFAULT_RULES: TournamentRule[] = [
  {
    id: 'rule_1',
    category: 'General',
    title: 'Eligibility & Roster Requirements',
    content: 'All players must have a minimum account level of 35 and tier Crown V or above in BGMI. Team rosters must consist of 4 primary players and at most 1 registered substitute. Only registered players are allowed in the custom room.',
    order_index: 1,
    display_order: 1
  },
  {
    id: 'rule_2',
    category: 'General',
    title: 'Fair Play & Code of Conduct',
    content: 'Toxic behavior, abuse, match-fixing, griefing, teaming up with opponents, and unsportsmanlike conduct in Discord or in-game voice chat will result in immediate disqualification and a 1-year competitive ban.',
    order_index: 2,
    display_order: 2
  },
  {
    id: 'rule_3',
    category: 'Room Rules',
    title: 'Custom Room Entry & Punctuality',
    content: 'Room ID and Password will be distributed on the official Discord 15 minutes before match start. Teams must join their allocated slot numbers within 10 minutes. Matches start strictly at scheduled time. No rematches will be hosted for late players.',
    order_index: 3,
    display_order: 3
  },
  {
    id: 'rule_4',
    category: 'Scoring',
    title: 'Official Points System',
    content: 'Scoring follows the standard official esports format: 1st Place = 10 pts, 2nd = 6 pts, 3rd = 5 pts, 4th = 4 pts, 5th = 3 pts, 6th = 2 pts, 7th = 1 pt, 8th = 1 pt, 9th-16th = 0 pts. Every single confirmed kill earns 1 Point.',
    order_index: 4,
    display_order: 4
  },
  {
    id: 'rule_5',
    category: 'Qualification',
    title: 'Group Stage Progression to Grand Finals',
    content: 'Top 8 squads with the highest accumulated points from Group A and Top 8 squads from Group B will qualify directly for the 16-Team Grand Finals. Points reset to 0 in the Grand Finals.',
    order_index: 5,
    display_order: 5
  },
  {
    id: 'rule_6',
    category: 'Anti-Cheat',
    title: 'Security, Device & Emulator Regulations',
    content: 'Only handheld iOS and Android smartphones are permitted. Tablets, iPads, Emulators, Triggers, and modified APKs are strictly prohibited. POV recording with in-game sound and hand-cam is mandatory for all players in all rounds.',
    order_index: 6,
    display_order: 6
  },
  {
    id: 'rule_7',
    category: 'Disputes',
    title: 'Protests & Organizer Authority',
    content: 'Any protest or accusation must be submitted within 30 minutes of match completion along with timestamped video evidence. The tournament administrative committee retains sole and final authority over all verdicts.',
    order_index: 7,
    display_order: 7
  }
];

export const DEFAULT_STATS = {
  totalTeams: 48,
  completedMatches: 3,
  totalMatches: 6,
  totalKills: 185,
  totalChickenDinners: 3,
  remainingMatches: 3
};
