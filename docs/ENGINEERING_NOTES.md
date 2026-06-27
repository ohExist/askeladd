# Engineering notes

The metrics on the front page are the output. These are the decisions and bugs behind them — the part that only shows up once something actually runs in production.

## Token economy: the history-ordering bug

The single biggest cost win came from a one-word bug. Conversation history was being fetched **oldest-first** with a row limit. As the history table grew, that query stopped returning *recent* context and started returning the *oldest* messages in a user's entire history — long-finished conversations that bloated every request to 24k+ tokens and gave the bot a kind of functional amnesia about the current chat.

Fix: fetch **newest-first** with a small limit, reverse in code to restore chronological order, drop any leading assistant turns (the API rejects a history that doesn't start with a user turn), and cap each message's length.

Lesson: with a growing table, `ascending + limit` silently freezes on stale rows. For recent context, always `descending + reverse`. The money was in the *history* table, not the *memory* table — they're different problems and conflating them wastes effort.

## Prompt caching

The system prompt is split into two blocks. The large static block — persona, behavior rules, memory-handling rules — is marked `cache_control: ephemeral` and served from cache on every request (~1,613 tokens read from cache per call). Only the small dynamic block (current facts, time, photo context) is re-sent uncached. This cuts input cost on every single message without touching behavior.

## n8n 2.x binary-data constraint

In n8n 2.x, **Code nodes cannot read binary file data.** This breaks the obvious approach to turning an uploaded image into base64 for a Vision request. The working pattern is `Extract from File` → `Move File to Base64 String`, never a Code node. This is an architectural rule, not a preference — the Code-node path simply returns nothing.

## STT hallucination guard

Speech-to-text on muffled or near-silent audio doesn't fail loudly — it returns confident nonsense. Confidence scores measure *how clearly the audio was heard*, not *whether the speech was meaningful*, so a high confidence score on a bad clip will happily pass garbage downstream.

The guard combines the confidence threshold with **repetition heuristics**: a long run of the same characters plus a low unique-character ratio flags the transcript as junk before it reaches the model. Phonetically plausible mumbling can still slip through, but obvious hallucinations are caught.

## Async transcription: polling architecture

Video-note transcription is asynchronous — submit a job, then poll until it's done. Two non-obvious traps:

- **The upload URL is single-use.** It's consumed by the first transcription request, so the polling loop has to be tested with a fresh clip every time, not a replayed one.
- **A wait-node loop loses state across HTTP calls** — the HTTP response overwrites the working data. The poll counter has to live in a separate node *before* the HTTP call and be read by reference, or the loop silently loses its place.

## TTS container fix

The TTS provider returns raw Opus audio with no OGG container. Telegram accepts it but clips the tail of the voice message. Fix: rename the binary to `voice.ogg` and set the mime type to `audio/ogg` before sending — Telegram then treats it as a proper voice note and plays it in full.

## Rate limiting before the model call

The rate-limit check has to run **before** model processing, not after. A multi-second API response otherwise opens a race condition where a user's rapid second message slips through before the first request has recorded itself.

## Graceful degradation

When the photo/Vision path fails, the request falls back to a text-only answer instead of dropping. The user gets a useful reply; the failure is logged rather than surfaced as an error.

## Memory: classify, then consolidate

Durable facts are extracted after each turn by a cheap Haiku call, behind a pre-filter that drops short or throwaway messages so the classifier never even runs on "ok" or "thanks." The classifier's instruction is biased toward silence — *when in doubt, don't save* — because a memory store that accumulates noise is worse than one that misses the occasional fact.

A separate weekly job consolidates each user's facts, collapsing semantic duplicates. One caveat learned the hard way: the consolidation model is unreliable at arithmetic (it would recompute a birth date into a wrong age), so the prompt explicitly forbids deriving new numbers, and a validation flag catches malformed output before it overwrites the store.

## Automated maintenance

`pg_cron` prunes the photo cache, conversation history, rate-limit rows and stale reminders on a daily schedule. No manual upkeep, and the volatile tables never grow unbounded.
