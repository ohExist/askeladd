-- Askeladd — automated maintenance (pg_cron)
--
-- Four daily jobs keep the volatile tables from growing unbounded.
-- Times are UTC. Retention windows are illustrative.

-- Drop photo-cache rows untouched for 30 days.
select cron.schedule('cleanup-photo-cache', '0 4 * * *',
  $$ delete from public.askeladd_photo_cache
     where last_used_at < now() - interval '30 days' $$);

-- Keep a rolling 90-day conversation history window.
select cron.schedule('cleanup-history', '15 4 * * *',
  $$ delete from public.askeladd_history
     where createdat < now() - interval '90 days' $$);

-- Rate-limit rows are only needed briefly.
select cron.schedule('cleanup-ratelimit', '30 4 * * *',
  $$ delete from public.askeladd_ratelimit
     where last_request < now() - interval '1 day' $$);

-- Clear reminders that already fired.
select cron.schedule('cleanup-stale-reminders', '45 4 * * *',
  $$ delete from public.askeladd_reminders
     where remind_at < now() - interval '7 days' $$);
