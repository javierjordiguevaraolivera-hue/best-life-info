# Everflow attribution for `iul-v6`

This folder is the single place to inspect Everflow behavior.

- `config.ts`: fixed tracking constants, including offer ID `3765`, tracking domain, and the fixed referrer `https://www.best-life.info/iul-v6`.
- `attribution.ts`: pure URL rules. It decides whether traffic is redirect tracking, direct linking, or internal.
- `server.ts`: server-side click fallback. It calls Everflow from Vercel before the client loads.
- `client.ts`: browser SDK click fallback using `@everflow/everflow-sdk`.
- `types.ts`: shared diagnostics and attribution types.

Business rules:

- Redirect tracking is only `?sub1=...&sub2=...`; those URL values are saved directly.
- Direct linking is any URL with `oid` and `affid`; `sub1` saved to Supabase is `affid`.
- For direct linking, `sub2` saved to Supabase must be the Everflow transaction ID, not the URL `sub2`.
- The browser may only reuse a stored transaction ID when the current click signature matches. This prevents stale transaction IDs from being reused across different leads.
- Everflow receives a fixed referrer value: `https://www.best-life.info/iul-v6`. Do not send the full URL with campaign params as the referrer.
