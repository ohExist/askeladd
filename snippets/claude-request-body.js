// Claude request body (n8n HTTP node, expression mode)
//
// Builds the /v1/messages request. Two things to note:
//
// 1. `system` is an ARRAY of blocks. The large static persona/rules
//    block (assembled in Ask Builder) carries cache_control: ephemeral,
//    so it is served from cache on every request (~1,613 cached tokens).
//
// 2. The user turn is multimodal: when an image is present, base64
//    image blocks are prepended to the text block in a single request.
//    Image base64 is produced via Extract from File -> Move File to
//    Base64 String, NOT a Code node (n8n 2.x binary constraint).

{
  model: "claude-sonnet-4-5",
  max_tokens: $json.photoReady ? 1500 : 1024,
  system: $json.systemPrompt,           // [ {cached static block}, {dynamic block} ]
  messages: [
    ...$json.historyMessages,           // chronological, capped (see ask-builder-history.js)
    {
      role: "user",
      content: $json.photoReady
        ? [
            ...$json.photoBase64List.map(p => ({
              type: "image",
              source: { type: "base64", media_type: p.mimeType, data: p.base64 }
            })),
            { type: "text", text: $json.question }
          ]
        : $json.question
    }
  ]
}

// Endpoint: POST https://api.anthropic.com/v1/messages
// Headers:  x-api-key, anthropic-version: 2023-06-01, content-type: application/json
// Retry:    enabled on the node (transient 5xx / overload)
