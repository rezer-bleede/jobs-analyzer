# Middle East Data Engineering Jobs

A React + Bootstrap single-page application tailored for Cloudflare Pages. It surfaces curated data engineering roles
across the Middle East by reading a JSON feed stored in Cloudflare R2.

## Features

- 🎯 **Focused experience** – Highlights data engineering roles with company, location, and posting insights.
- 📱 **Mobile-first design** – Responsive layout keeps the filters and results easy to read on phones and tablets.
- 🔍 **Powerful filters** – Multi-select keyword search with autocomplete, country filtering, and posting date controls.
- 📊 **Market signals** – Dedicated analytics dashboard with hiring momentum, cross-country coverage, and in-demand technologies.
- ☁️ **Cloudflare ready** – Designed for static deployment with data delivered from R2 via `VITE_JOBS_DATA_URL`.
- ✅ **Quality assured** – Includes unit and integration tests powered by Vitest and Testing Library.
- 🛡️ **Resilient data ingest** – Normalises Cloudflare R2 payloads and defends against network failures with tested fallbacks.

## Getting started locally

```bash
cd web
npm install
# Optional: only needed when you have a CORS-enabled remote JSON feed
export VITE_JOBS_DATA_URL="https://6d9a56e137a3328cc52e48656dd30d91.r2.cloudflarestorage.com/me-data-jobs"
npm run dev
```

If `VITE_JOBS_DATA_URL` is omitted, the app automatically falls back to the local [`public/jobs.json`](public/jobs.json)
fixture, keeping development friction-free.

The development server runs on <http://localhost:5173>. Update the environment variable to point at your own R2 object as
needed.

## Available scripts

- `npm run dev` – Start the Vite development server.
- `npm run build` – Type-check and create a production build in `dist`.
- `npm run preview` – Preview the production build locally.
- `npm test` – Run the Vitest suite once (unit + integration tests).
- `npm run test:watch` – Run tests in watch mode.
- `npm run lint` – Execute ESLint with the provided configuration.

## Environment variables

| Variable             | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `VITE_JOBS_DATA_URL` | Absolute URL of the JSON payload in Cloudflare R2 that contains the job listings to render. |

> **CORS reminder:** Cloudflare R2 must return an `Access-Control-Allow-Origin` header that covers your deployment
> (e.g. `*` or `https://<project>.pages.dev`). Without it the browser will surface a CORS error and the app will display a
> guidance message while using `/jobs.json` as a safe fallback.

When deploying on Cloudflare Pages, configure the variable in **Settings → Environment variables**. The URL provided by
the user for this exercise is `https://6d9a56e137a3328cc52e48656dd30d91.r2.cloudflarestorage.com/me-data-jobs`.

## Testing strategy

- **Unit tests** cover the filtering logic to guarantee consistent search and filter behaviour.
- **Integration tests** render the full application, mock the R2 fetch call, and validate that user flows (search and
  posting-date filtering) operate end-to-end.

Run the full suite before every commit/deployment:

```bash
npm test
```

## Development notes

- The project opts into TypeScript's `verbatimModuleSyntax`, so type-only imports **must** use `import type { ... }` to
  keep the build green.
- Vitest configuration lives in `vite.config.ts` and is typed via Vitest's `InlineConfig`, keeping Vite and Vitest settings
  in one place.

## Deployment on Cloudflare Pages

1. Connect the repository to a new Cloudflare Pages project.
2. Set the build command to `npm run build` and the output directory to `dist`.
3. Add `VITE_JOBS_DATA_URL` under environment variables and point it at your R2 object.
4. Trigger a deployment – the site will statically build and fetch live job data on the client.

## License

Released under the [MIT License](../LICENSE).
