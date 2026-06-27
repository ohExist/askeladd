# Askeladd — Production Multimodal Telegram AI Assistant

A self-hosted, production-grade Telegram assistant built on **n8n + Claude + Supabase**. It handles text, photos, voice messages and video notes through one unified reasoning pipeline, with persistent long-term memory, prompt caching, graceful degradation and automated maintenance.

Built and run in production — not a demo repo.

**▶️ Watch the 90-second demo:** https://www.loom.com/share/d3e9f454dcee4a328d4e6817713b4796

---

## Live production metrics

| Metric | Value |
|---|---|
| Production executions | **10,289** |
| Success rate | **99.3%** |
| Average run time | **0.29s** |
| Tokens served from prompt cache / request | **~1,613** |

---

## What it does

A single Telegram bot that accepts five input modalities and routes them through one reasoning pipeline:

- **Text** — direct chat in private, mention/reply in groups
- **Photos** — Claude Vision with a base64 cache keyed by `file_unique_id`
- **Voice messages** — transcription via Groq Whisper Large v3 Turbo
- **Video notes** — transcription via AssemblyAI (async polling architecture)
- **Combos** — reply with a voice message or video note *to a photo* → transcript + Vision fused into one request

### Commands

`/ask` (memory + history) · `/remember` `/forget` `/memory` `/clearmemory` · `/setcity` `/weather` `/tomorrow` `/weekend` · `/price` (crypto) · `/search` (web) · `/summarize` (URL) · `/chart` · `/remind` · `/say` (text-to-speech) · `/delete`

---

## Repository contents

| Path | What's inside |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | The five workflows, the request pipeline, and the stack |
| [`docs/ENGINEERING_NOTES.md`](docs/ENGINEERING_NOTES.md) | Production lessons — the real bugs, constraints and fixes behind the metrics |
| [`snippets/`](snippets/) | Selected logic: request builder, prompt caching, history handling, memory classification |
| [`sql/`](sql/) | Database schema and automated maintenance jobs |

> This is a **curated showcase**, not a runnable clone. Infrastructure identifiers, credentials and private chat IDs have been removed.

---

## Stack

| Layer | Technology |
|---|---|
| Orchestration | n8n (self-hosted via Docker, reverse-proxied with SSL) |
| Reasoning | Claude Sonnet 4.5 (chat) · Claude Haiku 4.5 (memory classification & consolidation) |
| Vision | Claude Vision (multimodal image understanding) |
| Speech-to-text | Groq Whisper Large v3 Turbo (voice) · AssemblyAI (video notes) |
| Text-to-speech | OpenAI `gpt-4o-mini-tts` |
| Storage | Supabase (Postgres) + `pg_cron` automated cleanup |
| Data APIs | Tavily (search) · Jina (page parsing) · CoinGecko / Binance (prices) · QuickChart |
| Channel | Telegram Bot API |

---

## Contact

Built and maintained by **@ohexist** on Telegram.

Need a multimodal AI assistant or n8n automation for your own use case? Message me — I build these end to end.
