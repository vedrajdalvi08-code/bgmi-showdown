create table if not exists tournament_settings (key text primary key, value text not null);
create table if not exists groups (id text primary key, name text not null, code text not null unique, display_order integer not null default 0);
create table if not exists teams (id text primary key, name text not null unique, tag text not null, logo_url text, group_id text references groups(id) on delete set null, status text not null default 'Registered', created_at timestamptz not null);
create table if not exists players (id text primary key, team_id text not null references teams(id) on delete cascade, name text not null, in_game_name text not null, in_game_id text, role text not null default 'Assaulter');
create table if not exists matches (id text primary key, match_number integer not null, name text not null, stage text not null check (stage in ('group','finals')), group_id text references groups(id) on delete set null, map text not null, status text not null default 'Scheduled' check (status in ('Scheduled','Live','Completed','Locked')), scheduled_time text, is_locked boolean not null default false, locked_at timestamptz, created_at timestamptz not null);
create table if not exists match_results (id text primary key, match_id text not null references matches(id) on delete cascade, team_id text not null references teams(id) on delete cascade, placement integer not null check (placement > 0), kills integer not null check (kills >= 0), placement_points integer not null default 0, kill_points integer not null default 0, total_points integer not null default 0, created_at timestamptz not null, updated_at timestamptz not null, unique(match_id, team_id));
create table if not exists tournament_rules (id text primary key, category text not null, title text not null, content text not null, display_order integer not null default 0);
create table if not exists admin_auth (id text primary key, password_hash text not null, salt text not null, updated_at timestamptz not null);
create table if not exists admin_sessions (token text primary key, created_at timestamptz not null, expires_at bigint not null);
create table if not exists audit_logs (id text primary key, action text not null, admin_user text not null, details text, created_at timestamptz not null);
create table if not exists login_attempts (ip text primary key, attempts integer not null default 0, last_attempt bigint not null);

create index if not exists matches_stage_group_order_idx on matches(stage, group_id, match_number);
create index if not exists results_match_placement_idx on match_results(match_id, placement);
create index if not exists results_team_idx on match_results(team_id);
create index if not exists players_team_idx on players(team_id);
create index if not exists audit_created_idx on audit_logs(created_at desc);

alter table tournament_settings disable row level security;
alter table groups disable row level security;
alter table teams disable row level security;
alter table players disable row level security;
alter table matches disable row level security;
alter table match_results disable row level security;
alter table tournament_rules disable row level security;
alter table admin_auth disable row level security;
alter table admin_sessions disable row level security;
alter table audit_logs disable row level security;
alter table login_attempts disable row level security;

insert into tournament_settings(key,value) values
 ('name','"BGMI SHOWDOWN"'),('tagline','"DROP. SURVIVE. DOMINATE."'),('description','"The pinnacle of competitive Battlegrounds Mobile India. 48 top tier squads battle across grueling phases for the championship trophy and bragging rights."'),('status','"Group Stage"'),('start_date','"2026-09-05"'),('end_date','"2026-09-12"'),('timezone','"IST (UTC+5:30)"'),('logo_url','"https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80"'),('banner_url','"https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1600&q=80"'),('max_teams','48'),('min_teams','16'),('players_per_team','4'),('substitutes_allowed','true'),('substitutes_count','1'),('registration_status','"Closed"'),('num_groups','2'),('group_names','["Group A","Group B"]'),('teams_per_group','25'),('qualifiers_per_group','8'),('finals_teams_count','16'),('group_matches_count','3'),('finals_matches_count','5'),('finals_points_carry_over','false'),('kill_point_value','1'),('placement_points','{"1":10,"2":6,"3":5,"4":4,"5":3,"6":2,"7":1,"8":1}'),('tie_breaker_order','["total_points","total_kills","placement_points","best_placement","recent_match"]')
on conflict (key) do nothing;
insert into groups values ('grp_a','Group A','A',1),('grp_b','Group B','B',2) on conflict do nothing;

-- Seed the same 48 squad slots and four-player rosters used by the demo.
do $$
declare
  team_names text[] := array['Team Soul','GodLike Esports','Blind Esports','Gladiators Esports','Team XSpark','Orangutan','Revenant Esports','Entity Gaming','Global Esports','Medal Esports','Hyderabad Hydras','Gujarat Tigers','Big Brother Esports','Team Insane','Reckoning Esports','Team Tamilas','Gods Reign','WindGod Esports','Marcos Gaming','Autobotz Esports','WSB Gaming','Team Forever','Enigma Gaming','8Bit Esports','Carnival Gaming','Team Zero','FS Esports','Genesis Esports','Raven Esports','Dragon Claw','Titan Force','Night Hawks','Inferno Squad','Vanguard Elite','Apex Predators','Cyber Wolves','Velocity Gaming','Shadow Strikers','Thunderbolts','Frostbite Clan','Phantom Brigade','Ironclad Gaming','Solar Flare','Rogue Legion','Hydra Clan','Kodiak Esports','Nexus Gaming','Valkyrie Squad'];
  team_tags text[] := array['SOUL','GODL','BLIND','GLAD','TX','OG','RNT','ENT','GE','MEDAL','HH','GT','BB','INS','REC','TT','GR','WG','MG','AB','WSB','4EVR','EG','8BIT','CG','ZERO','FS','GEN','RVN','DC','TF','NH','INF','VE','APEX','CW','VLT','SS','TB','FC','PB','IG','SF','RL','HYD','KDK','NX','VS'];
  i integer; team_id text; group_id text;
begin
  for i in 1..48 loop
    team_id := 'team_' || case when i <= 24 then 'a_' else 'b_' end || case when i <= 24 then i else i-24 end;
    group_id := case when i <= 24 then 'grp_a' else 'grp_b' end;
    insert into teams(id,name,tag,logo_url,group_id,status,created_at) values(team_id,team_names[i],team_tags[i],'',group_id,'Assigned',now()) on conflict do nothing;
    insert into players(id,team_id,name,in_game_name,in_game_id,role) values
      ('p_'||team_id||'_1',team_id,'IGL '||team_tags[i],team_tags[i]||'_IGL','', 'IGL'),
      ('p_'||team_id||'_2',team_id,'Assaulter 1',team_tags[i]||'_A1','', 'Assaulter'),
      ('p_'||team_id||'_3',team_id,'Assaulter 2',team_tags[i]||'_A2','', 'Assaulter'),
      ('p_'||team_id||'_4',team_id,'Support',team_tags[i]||'_SUP','', 'Support') on conflict do nothing;
  end loop;
end $$;

insert into matches(id,match_number,name,stage,group_id,map,status,scheduled_time,is_locked,locked_at,created_at) values
 ('m_ga_1',1,'Group A — Match 1','group','grp_a','Erangel','Locked','2026-09-05 14:00 IST',true,'2026-09-05 15:00',now()),('m_ga_2',2,'Group A — Match 2','group','grp_a','Miramar','Locked','2026-09-05 15:30 IST',true,'2026-09-05 16:30',now()),('m_ga_3',3,'Group A — Match 3','group','grp_a','Sanhok','Scheduled','2026-09-05 17:00 IST',false,null,now()),('m_ga_4',4,'Group A — Match 4','group','grp_a','Rondo','Scheduled','2026-09-05 18:30 IST',false,null,now()),('m_gb_1',1,'Group B — Match 1','group','grp_b','Erangel','Locked','2026-09-06 14:00 IST',true,'2026-09-06 15:00',now()),('m_gb_2',2,'Group B — Match 2','group','grp_b','Miramar','Scheduled','2026-09-06 15:30 IST',false,null,now()),('m_gb_3',3,'Group B — Match 3','group','grp_b','Sanhok','Scheduled','2026-09-06 17:00 IST',false,null,now()),('m_gb_4',4,'Group B — Match 4','group','grp_b','Rondo','Scheduled','2026-09-06 18:30 IST',false,null,now()) on conflict do nothing;

-- Seed the verified result rows for the first two Group A matches and Group B match 1.
do $$
declare i integer; place integer; kills integer; match_id text; team_id text; p integer;
begin
  foreach match_id in array array['m_ga_1','m_ga_2','m_gb_1'] loop
    for i in 1..16 loop
      place := i; kills := greatest(0, 17 - i); p := case when i = 1 then 10 when i = 2 then 6 when i = 3 then 5 when i = 4 then 4 when i = 5 then 3 when i = 6 then 2 when i in (7,8) then 1 else 0 end;
      team_id := 'team_' || case when match_id like 'm_ga%' then 'a_' else 'b_' end || i;
      insert into match_results(id,match_id,team_id,placement,kills,placement_points,kill_points,total_points,created_at,updated_at)
        values('res_'||replace(match_id,'m_','')||'_'||i,match_id,team_id,place,kills,p,kills,p+kills,now(),now()) on conflict do nothing;
    end loop;
  end loop;
end $$;

insert into tournament_rules(id,category,title,content,display_order) values
 ('rule_1','General','Eligibility & Roster Requirements','All players must have a minimum account level of 35 and tier Crown V or above in BGMI. Team rosters must consist of 4 primary players and at most 1 registered substitute.',1),('rule_2','General','Fair Play & Code of Conduct','Toxic behavior, abuse, match-fixing, griefing, teaming up with opponents, and unsportsmanlike conduct will result in disqualification.',2),('rule_3','Room Rules','Custom Room Entry & Punctuality','Room ID and Password will be distributed 15 minutes before match start. Matches start strictly at scheduled time.',3),('rule_4','Scoring','Official Points System','1st Place = 10 pts, 2nd = 6 pts, 3rd = 5 pts, 4th = 4 pts, 5th = 3 pts, 6th = 2 pts, 7th = 1 pt, 8th = 1 pt. Every kill earns 1 point.',4),('rule_5','Qualification','Group Stage Progression to Grand Finals','Top 8 squads from each group qualify for the 16-Team Grand Finals. Points reset in the Grand Finals.',5),('rule_6','Anti-Cheat','Security, Device & Emulator Regulations','Only handheld iOS and Android smartphones are permitted. Emulators and modified APKs are prohibited.',6),('rule_7','Disputes','Protests & Organizer Authority','Protests must be submitted within 30 minutes with timestamped evidence. The committee has final authority.',7) on conflict do nothing;

insert into admin_auth(id,password_hash,salt,updated_at) values ('admin_root','', '', now()) on conflict do nothing;
insert into audit_logs(id,action,admin_user,details,created_at) values ('audit_init_1','TOURNAMENT_BOOTSTRAP','system_admin','Initialized tournament settings, 48 squads across Group A and Group B, scoring engine rules, and seed match results.',now()) on conflict do nothing;
