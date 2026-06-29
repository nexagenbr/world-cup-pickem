create extension if not exists pgcrypto;
create schema if not exists private;

create type public.prediction as enum ('HOME', 'DRAW', 'AWAY');

create table public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);

create table public.matches (
  id uuid primary key default gen_random_uuid(),
  api_match_id bigint not null unique,
  competition text not null default 'FIFA World Cup',
  season integer not null default 2026,
  stage text not null,
  is_knockout boolean not null default false,
  home_team text not null,
  away_team text not null,
  home_team_code text,
  away_team_code text,
  home_team_logo text,
  away_team_logo text,
  kickoff timestamptz not null,
  status text not null default 'NS',
  status_detail text,
  elapsed integer,
  home_score integer check (home_score >= 0),
  away_score integer check (away_score >= 0),
  home_penalty_score integer check (home_penalty_score >= 0),
  away_penalty_score integer check (away_penalty_score >= 0),
  winner public.prediction,
  advancing_team public.prediction check (advancing_team is null or advancing_team <> 'DRAW'),
  venue text,
  updated_at timestamptz not null default now(),
  check (home_team <> away_team)
);

create table public.picks (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  prediction public.prediction not null,
  home_score integer check (home_score >= 0),
  away_score integer check (away_score >= 0),
  points integer check (points in (0, 3, 4)),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  locked boolean not null default false,
  unique (player_id, match_id)
);

create table public.sync_logs (
  id bigint generated always as identity primary key,
  sync_type text not null check (sync_type in ('fixtures', 'results')),
  status text not null check (status in ('started', 'success', 'failed')),
  fixtures_processed integer not null default 0,
  message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index matches_kickoff_idx on public.matches(kickoff);
create index matches_status_idx on public.matches(status);
create index picks_player_idx on public.picks(player_id);
create index picks_match_idx on public.picks(match_id);

create function private.set_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger matches_updated_at before update on public.matches
for each row execute function private.set_updated_at();
create trigger picks_updated_at before update on public.picks
for each row execute function private.set_updated_at();

create or replace function public.submit_pick(
  p_player_id uuid,
  p_match_id uuid,
  p_prediction public.prediction,
  p_home_score integer default null,
  p_away_score integer default null
) returns public.picks
language plpgsql
set search_path = ''
as $$
declare
  target public.matches;
  saved public.picks;
begin
  select * into target from public.matches where id = p_match_id for update;
  if not found then raise exception 'Match not found'; end if;
  if not exists (select 1 from public.players where id = p_player_id) then
    raise exception 'Player not found';
  end if;
  if clock_timestamp() >= target.kickoff then raise exception 'Picks are locked'; end if;
  if target.is_knockout and p_prediction = 'DRAW' then
    raise exception 'Knockout picks must select who advances';
  end if;
  if not target.is_knockout and (p_home_score is null or p_away_score is null) then
    raise exception 'Group stage picks require a score prediction';
  end if;
  if p_home_score < 0 or p_away_score < 0 then
    raise exception 'Scores must be non-negative';
  end if;

  insert into public.picks (player_id, match_id, prediction, home_score, away_score)
  values (p_player_id, p_match_id, p_prediction, p_home_score, p_away_score)
  on conflict (player_id, match_id) do update
    set prediction = excluded.prediction,
        home_score = excluded.home_score,
        away_score = excluded.away_score,
        updated_at = now()
  returning * into saved;
  return saved;
end;
$$;

create or replace function public.grade_finished_matches() returns integer
language plpgsql
set search_path = ''
as $$
declare
  affected integer;
begin
  -- Grade group stage picks with exact score bonus
  update public.picks p
  set points = case
      when not exists (select 1 from public.matches m where m.id = p.match_id and not m.is_knockout) then
        -- Knockout: 3 pts for correct winner
        case when p.prediction = (select advancing_team from public.matches m where m.id = p.match_id) then 3 else 0 end
      else
        -- Group stage: 3 pts for correct winner/draw, +1 bonus for exact score
        case
          when p.prediction = (select winner from public.matches m where m.id = p.match_id) then
            case
              when p.home_score = (select home_score from public.matches m where m.id = p.match_id)
               and p.away_score = (select away_score from public.matches m where m.id = p.match_id) then 4
              else 3
            end
          else 0
        end
    end,
    locked = true,
    updated_at = now()
  from public.matches m
  where p.match_id = m.id
    and m.status in ('FT', 'AET', 'PEN')
    and (case when m.is_knockout then m.advancing_team else m.winner end) is not null
    and p.points is null;

  get diagnostics affected = row_count;

  -- Lock any remaining picks past kickoff
  update public.picks p set locked = true
  from public.matches m
  where p.match_id = m.id
    and m.kickoff <= now()
    and not p.locked;

  return affected;
end;
$$;

create function private.pick_streaks(target_player uuid)
returns table(current_streak bigint, longest_streak bigint)
language sql stable set search_path = '' as $$
  with ordered as (
    select p.points,
      row_number() over (order by m.kickoff desc, p.id desc) as recent_rank,
      sum(case when p.points = 0 or p.points = 4 then 1 else 0 end)
        over (order by m.kickoff, p.id) as run_group
    from public.picks p join public.matches m on m.id = p.match_id
    where p.player_id = target_player and p.points is not null
  ), runs as (
    select count(*) as run_length from ordered where points in (3, 4) group by run_group
  )
  select
    coalesce((select count(*) from ordered o where o.points in (3, 4) and o.recent_rank <
      coalesce((select min(recent_rank) from ordered where points = 0), 9223372036854775807)), 0),
    coalesce((select max(run_length) from runs), 0);
$$;

create view public.leaderboard with (security_invoker = true) as
select
  pl.id as player_id,
  pl.name,
  coalesce(sum(pk.points), 0)::integer as points,
  count(*) filter (where pk.points in (3, 4))::integer as correct_picks,
  count(*) filter (where pk.points = 0)::integer as incorrect_picks,
  count(pk.id) filter (where pk.points is null)::integer as pending_picks,
  count(*) filter (where pk.points = 4)::integer as exact_scores,
  case when count(*) filter (where pk.points is not null) = 0 then 0
    else round(100.0 * count(*) filter (where pk.points in (3, 4)) /
      count(*) filter (where pk.points is not null), 1) end as accuracy,
  streaks.current_streak::integer,
  streaks.longest_streak::integer
from public.players pl
left join public.picks pk on pk.player_id = pl.id
cross join lateral private.pick_streaks(pl.id) streaks
group by pl.id, pl.name, streaks.current_streak, streaks.longest_streak;

alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.picks enable row level security;
alter table public.sync_logs enable row level security;

revoke all on schema public from anon, authenticated;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all functions in schema public from anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.players, public.matches, public.picks, public.sync_logs to service_role;
grant select on public.leaderboard to service_role;
grant usage, select on sequence public.sync_logs_id_seq to service_role;
grant execute on function public.submit_pick(uuid, uuid, public.prediction, integer, integer) to service_role;
grant execute on function public.grade_finished_matches() to service_role;
grant usage on schema private to service_role;
grant execute on function private.pick_streaks(uuid) to service_role;
