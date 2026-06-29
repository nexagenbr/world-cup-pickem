create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

select vault.create_secret('https://YOUR-APP.vercel.app', 'pickem_app_url');
select vault.create_secret('YOUR_CRON_SECRET', 'pickem_cron_secret');

select cron.schedule(
  'pickem-sync-fixtures-hourly',
  '7 * * * *',
  $$select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'pickem_app_url') || '/api/cron/fixtures',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'pickem_cron_secret')),
    timeout_milliseconds := 60000
  );$$
);

select cron.schedule(
  'pickem-sync-results',
  '*/10 * * * *',
  $$select net.http_get(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'pickem_app_url') || '/api/cron/results',
    headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'pickem_cron_secret')),
    timeout_milliseconds := 60000
  );$$
);
