# Agent instructions

- Use Wrangler CLI (`npx wrangler@3.90.0`) for Cloudflare operations instead of the dashboard; follow `docs/DEPLOYMENT.md`.
- Authenticate with `npx wrangler@3.90.0 login` and its local OAuth credentials. Never put API tokens in commands or commit them.
