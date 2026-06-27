// Ask Builder — conversation history block
//
// Runs inside the Main Bot's Ask Builder (n8n Code node).
// History is fetched newest-first from Postgres, then rebuilt into
// chronological order for the model. See ENGINEERING_NOTES.md
// ("Token economy: the history-ordering bug") for why this matters.

// Pull rows from the upstream "Get History" node, keep only valid
// role/content pairs, and reverse: the query returns descending
// (newest first), so reversing restores chronological order.
let historyItems = $('Ask Get History').all()
  .filter(item => item.json && item.json.role && item.json.content)
  .reverse();

// The Anthropic API rejects a message list that doesn't start with a
// user turn. Drop any leading assistant messages.
while (historyItems.length && historyItems[0].json.role !== 'user') {
  historyItems.shift();
}

// Cap each message to keep request size bounded as the table grows.
const historyMessages = historyItems.map(item => ({
  role: item.json.role,
  content: (item.json.content || '').slice(0, 1200)
}));
