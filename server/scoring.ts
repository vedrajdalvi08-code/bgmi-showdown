import { supabase } from './db.js';

export interface ScoreRuleConfig { placement_points: Record<number, number>; kill_point_value: number; tie_breaker_order: string[]; }

export async function getScoringRules(): Promise<ScoreRuleConfig> {
  const { data, error } = await supabase.from('tournament_settings').select('key,value').in('key', ['placement_points', 'kill_point_value', 'tie_breaker_order']);
  if (error) throw error;
  const values = Object.fromEntries((data || []).map(row => [row.key, row.value]));
  let placement_points: Record<number, number> = { 1: 10, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1 };
  let tie_breaker_order = ['total_points', 'total_kills', 'placement_points', 'best_placement', 'recent_match'];
  try { if (values.placement_points) placement_points = JSON.parse(values.placement_points); } catch { /* defaults */ }
  try { if (values.tie_breaker_order) tie_breaker_order = JSON.parse(values.tie_breaker_order); } catch { /* defaults */ }
  return { placement_points, kill_point_value: values.kill_point_value ? Number(values.kill_point_value) : 1, tie_breaker_order };
}

export async function calculateMatchPoints(placement: number, kills: number) {
  const rules = await getScoringRules();
  const placement_points = Number(rules.placement_points[Math.max(1, placement)] ?? 0);
  const kill_points = Math.max(0, kills) * rules.kill_point_value;
  return { placement_points, kill_points, total_points: placement_points + kill_points };
}

export interface TeamLeaderboardRow { rank: number; team_id: string; team_name: string; team_tag: string; team_logo: string; group_id: string | null; group_name?: string; matches_played: number; total_kills: number; placement_points: number; total_points: number; match_breakdown: Record<string, number>; best_placement: number; recent_match_points: number; chicken_dinners: number; qualification_status: 'QUALIFIED' | 'ON THE BUBBLE' | 'ELIMINATED' | 'IN HUNT' | 'CHAMPION' | 'PODIUM'; }

export async function computeLeaderboard(stage: 'group' | 'finals', groupId?: string) {
  const rules = await getScoringRules();
  const setting = await supabase.from('tournament_settings').select('value').eq('key', 'qualifiers_per_group').maybeSingle();
  if (setting.error) throw setting.error;
  const qualifiersCount = setting.data ? Number(setting.data.value) : 8;
  let matchQuery = supabase.from('matches').select('id,match_number,name,map,status,is_locked').eq('stage', stage).order('match_number');
  if (stage === 'group' && groupId) matchQuery = matchQuery.eq('group_id', groupId);
  const matchResponse = await matchQuery;
  if (matchResponse.error) throw matchResponse.error;
  const matches = matchResponse.data || [];
  const isStageCompleted = matches.length > 0 && matches.every(m => m.status === 'Completed' || m.status === 'Locked');
  let teamQuery = supabase.from('teams').select('id,name,tag,logo_url,group_id,status');
  if (stage === 'group' && groupId) teamQuery = teamQuery.eq('group_id', groupId);
  if (stage === 'finals') teamQuery = teamQuery.eq('status', 'Qualified');
  const teamResponse = await teamQuery;
  if (teamResponse.error) throw teamResponse.error;
  let teams = teamResponse.data || [];
  if (stage === 'finals' && teams.length === 0) {
    const [a, b] = await Promise.all([computeLeaderboard('group', 'grp_a'), computeLeaderboard('group', 'grp_b')]);
    const ids = [...a.leaderboard.slice(0, qualifiersCount), ...b.leaderboard.slice(0, qualifiersCount)].map(row => row.team_id);
    if (ids.length) { const response = await supabase.from('teams').select('id,name,tag,logo_url,group_id,status').in('id', ids); if (response.error) throw response.error; teams = response.data || []; }
  }
  const resultResponse = matches.length ? await supabase.from('match_results').select('match_id,team_id,placement,kills,total_points').in('match_id', matches.map(m => m.id)) : { data: [], error: null };
  if (resultResponse.error) throw resultResponse.error;
  const resultMap: Record<string, Record<string, any>> = {};
  for (const result of resultResponse.data || []) (resultMap[result.team_id] ||= {})[result.match_id] = result;
  const rows: TeamLeaderboardRow[] = teams.map(team => {
    const teamResults = resultMap[team.id] || {}; let matches_played = 0, total_kills = 0, total_points = 0, best_placement = 999, recent_match_points = 0, chicken_dinners = 0; const match_breakdown: Record<string, number> = {};
    for (const match of matches) { const result = teamResults[match.id]; match_breakdown[match.id] = result?.total_points || 0; if (result) { matches_played++; total_kills += result.kills; total_points += result.total_points; best_placement = Math.min(best_placement, result.placement); recent_match_points = result.total_points; if (result.placement === 1) chicken_dinners++; } }
    return { rank: 0, team_id: team.id, team_name: team.name, team_tag: team.tag, team_logo: team.logo_url || '', group_id: team.group_id, matches_played, total_kills, placement_points: total_points - total_kills * rules.kill_point_value, total_points, match_breakdown, best_placement: best_placement === 999 ? 0 : best_placement, recent_match_points, chicken_dinners, qualification_status: 'IN HUNT' };
  });
  rows.sort((a, b) => { for (const rule of rules.tie_breaker_order) { const value = (row: TeamLeaderboardRow) => rule === 'best_placement' ? row.best_placement || 999 : rule === 'chicken_dinners' || rule === 'wwcd' ? row.chicken_dinners : rule === 'total_kills' ? row.total_kills : rule === 'placement_points' ? row.placement_points : rule === 'recent_match' ? row.recent_match_points : row.total_points; const av = value(a), bv = value(b); if (av !== bv) return rule === 'best_placement' ? av - bv : bv - av; } return a.team_name.localeCompare(b.team_name); });
  rows.forEach((row, index) => { row.rank = index + 1; if (stage === 'group') row.qualification_status = isStageCompleted ? row.rank <= qualifiersCount ? 'QUALIFIED' : 'ELIMINATED' : row.rank < qualifiersCount ? 'QUALIFIED' : row.rank <= qualifiersCount + 1 ? 'ON THE BUBBLE' : 'IN HUNT'; else row.qualification_status = isStageCompleted ? row.rank === 1 ? 'CHAMPION' : row.rank <= 3 ? 'PODIUM' : 'QUALIFIED' : row.rank <= 3 ? 'PODIUM' : 'QUALIFIED'; });
  return { leaderboard: rows, matches: matches.map(m => ({ id: m.id, match_number: m.match_number, name: m.name, map: m.map, status: m.status })), qualifiersCount, isStageCompleted };
}
