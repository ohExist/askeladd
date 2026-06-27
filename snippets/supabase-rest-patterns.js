// Supabase REST patterns (n8n HTTP nodes)
//
// All storage is plain PostgREST over HTTP. Identifiers below use
// placeholders — the live base URL and keys live in n8n credentials,
// never in the workflow.
//
//   SUPABASE_URL   e.g. https://<project>.supabase.co
//   apikey / Authorization: Bearer <key>  -> set via Header Auth credential

// --- SELECT (Send Body OFF) ---------------------------------------
// Fetch the most recent memory facts for a user.
// Hard cap on row count; newest first.
GET ${SUPABASE_URL}/rest/v1/askeladd_memory_2
    ?chatId=eq.${chatId}
    &userId=eq.${userId}
    &order=updatedAt.desc
    &limit=20

// Fetch recent history (descending; reversed in code, see
// snippets/ask-builder-history.js).
GET ${SUPABASE_URL}/rest/v1/askeladd_history
    ?chatId=eq.${chatId}
    &userId=eq.${userId}
    &order=createdAt.desc
    &limit=10

// --- UPSERT (Send Body ON) ----------------------------------------
// Merge on a unique constraint instead of failing on conflict.
POST ${SUPABASE_URL}/rest/v1/askeladd_cities?on_conflict=chatId,userId
// Header: Prefer: resolution=merge-duplicates,return=representation

// --- Notes --------------------------------------------------------
// - PostgREST returns an array [{...}]; n8n surfaces it as a single
//   item, so read $json.field (not $json[0].field).
// - camelCase columns survive only because they were created quoted;
//   in raw SQL they must stay double-quoted ("chatId"), but in REST
//   URLs they're written bare (chatId=eq.X).
// - GET and DELETE: Send Body OFF. POST: Send Body ON.
