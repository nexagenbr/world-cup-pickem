insert into public.players (name) values
  ('Gopal Baba'), ('Gopi'), ('Manvati'), ('Caru Krsna')
on conflict (name) do nothing;

insert into public.matches (
  api_match_id, stage, is_knockout, home_team, away_team, home_team_code,
  away_team_code, kickoff, status, venue
) values
  (-1001, 'Group Stage - 1', false, 'Brazil', 'Japan', 'BRA', 'JPN', now() + interval '2 hours', 'NS', 'Demo Stadium'),
  (-1002, 'Group Stage - 1', false, 'Portugal', 'Ghana', 'POR', 'GHA', now() + interval '1 day', 'NS', 'Demo Stadium'),
  (-1003, 'Round of 32', true, 'Argentina', 'Denmark', 'ARG', 'DEN', now() + interval '2 days', 'NS', 'Demo Stadium')
on conflict (api_match_id) do update set kickoff = excluded.kickoff;
