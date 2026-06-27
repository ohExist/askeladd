-- Askeladd — database schema (Postgres / Supabase)
--
-- Illustrative DDL for the tables behind the bot. camelCase column
-- names are quoted so Postgres preserves their case; in REST URLs the
-- same columns are written bare (chatId=eq.X).
--
-- No data, no keys, no identifiers — schema only.

-- Long-term memory: durable facts about each user.
create table askeladd_memory_2 (
  id          bigint generated always as identity primary key,
  "chatId"    text not null,
  "userId"    text not null,
  text        text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
-- One copy of a given fact per (chat, user).
create unique index idx_memory_chat_user_text
  on askeladd_memory_2 ("chatId", "userId", text);

-- Conversation history (pruned to a rolling window by pg_cron).
create table askeladd_history (
  id          bigint generated always as identity primary key,
  "chatId"    text not null,
  "userId"    text not null,
  role        text not null,            -- 'user' | 'assistant'
  content     text not null,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);

-- Saved city per user (for weather commands).
create table askeladd_cities (
  id          bigint generated always as identity primary key,
  "chatId"    text not null,
  "userId"    text not null,
  city        text not null,
  latitude    double precision,
  longitude   double precision,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz not null default now()
);
create unique index idx_cities_chat_user
  on askeladd_cities ("chatId", "userId");

-- Generic key/value cache (e.g. market data).
create table askeladd_cache (
  id        bigint generated always as identity primary key,
  key       text unique not null,
  value     jsonb,
  updatedat timestamptz not null default now()
);

-- Per-user rate limiting.
create table askeladd_ratelimit (
  id           bigint generated always as identity primary key,
  userid       text unique not null,
  last_request timestamptz not null default now()
);

-- Reminders (polled every minute by WF4).
create table askeladd_reminders (
  id                uuid primary key default gen_random_uuid(),
  chatid            text not null,
  userid            text not null,
  message_thread_id text,
  text              text not null,
  remind_at         timestamptz not null,
  createdat         timestamptz not null default now()
);

-- Photo cache: base64 keyed by Telegram's stable file_unique_id,
-- so a re-sent image is never re-downloaded or re-encoded.
create table askeladd_photo_cache (
  id             bigint generated always as identity primary key,
  file_unique_id text unique not null,
  file_id        text,
  mime_type      text,
  base64         text,
  file_size      integer,
  width          integer,
  height         integer,
  createdat      timestamptz not null default now(),
  last_used_at   timestamptz not null default now()
);

-- Photo telemetry: cache-hit rate and payload sizes.
create table askeladd_photo_stats (
  id         bigint generated always as identity primary key,
  chatid     text not null,
  userid     text not null,
  file_size  integer,
  from_cache boolean not null default false,
  createdat  timestamptz not null default now()
);
