# Auto-memory: two-stage fact extraction

After each `/ask`, the bot decides whether the user's message contains a
durable fact worth remembering. Running a model on every message would be
wasteful and noisy, so this is gated.

## Stage 1 — Length gate (cheap, deterministic)

An `IF` node runs before any model call. The message must:

- be at least 30 characters, **and**
- not match a stop-word list of throwaway replies ("ok", "thanks",
  "got it", "lol", etc.)

Combinator `AND`, type conversion on. Short or throwaway messages never
reach the classifier — the cheapest filter runs first.

## Stage 2 — Classifier (Haiku)

Messages that pass the gate go to a small Haiku call. The classifier is
deliberately **biased toward silence**: a memory store that accumulates
noise is worse than one that occasionally misses a fact.

Design of the prompt:

- **Save:** name, birth date, city, studies, goals, stable interests,
  health, relationships, durable traits.
- **Don't save:** one-off numbers, single-task details, temporary states,
  momentary curiosity, anything already stored.
- **When in doubt, don't save.**
- Output is strict JSON: `{"save": true, "text": "..."}` or `{"save": false}`.

## Why two stages

The length gate removes the bulk of traffic for free. The classifier only
spends tokens on plausible candidates, and its conservative bias keeps the
store small. A separate weekly job (Memory Consolidation) then collapses
semantic duplicates — see ENGINEERING_NOTES.md.
