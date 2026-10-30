# Middle East Data Engineering Jobs

A React + Bootstrap single-page application tailored for Cloudflare Pages. It surfaces curated data engineering roles
across the Middle East by reading a JSON feed stored in Cloudflare R2.

## Features

- 🎯 **Focused experience** – Condensed landing page with immediate access to filters, summary metrics, and job results.
- 📱 **Mobile-first design** – Responsive layout keeps the filters and results easy to read on phones and tablets.
- 🔍 **Powerful filters** – Multi-select keyword search with autocomplete, country filtering, and posting date controls.
- 📈 **Advanced analytics** – Hiring velocity sparkline, remote adoption donut, salary benchmarks, industry momentum, and
  location coverage tables – all rendered with lightweight SVG charts.
- 🧩 **Custom analytics workspace** – Compose bespoke bar, donut, or table widgets by grouping the live dataset across
  companies, geographies, skills, remote status, and more.
- ☁️ **Cloudflare ready** – Designed for static deployment with data delivered from R2 via `VITE_JOBS_DATA_URL`.
- ✅ **Quality assured** – Includes unit, integration, and analytics aggregation tests powered by Vitest and Testing
  Library.
- 🛡️ **Resilient data ingest** – Normalises Cloudflare R2 payloads and defends against network failures with tested
  fallbacks.

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
| `REFDATAHUB_API_URL` | RefDataHub API origin used by the Pages Function to fetch approved company aliases.         |

> **CORS reminder:** Cloudflare R2 must return an `Access-Control-Allow-Origin` header that covers your deployment
> (e.g. `*` or `https://<project>.pages.dev`). Without it the browser will surface a CORS error and the app will display a
> guidance message while using `/jobs.json` as a safe fallback.

When deploying on Cloudflare Pages, configure the variable in **Settings → Environment variables**. The URL provided by
the user for this exercise is `https://6d9a56e137a3328cc52e48656dd30d91.r2.cloudflarestorage.com/me-data-jobs`.

## Testing strategy

- **Unit tests** cover the filtering logic and analytics aggregations to guarantee consistent insights.
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
3. Add `VITE_JOBS_DATA_URL` and point it at your R2 object.
4. Add `REFDATAHUB_API_URL` as a Pages runtime variable pointing to the deployed RefDataHub API. Create a `company` dimension and approve raw company-name mappings there; unresolved or conflicting aliases remain separate.
5. Trigger a deployment – the site fetches live jobs and approved company aliases through Pages Functions.

## License

Released under the [MIT License](../LICENSE).
