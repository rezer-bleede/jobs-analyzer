# Jobs Analyzer

This repository hosts a modern single-page application that spotlights data engineering opportunities across the Middle
East. The site is designed to run as a static Cloudflare Pages deployment while sourcing live job listings from a JSON
object stored in Cloudflare R2.

## Project structure

- [`web/`](web/) – React + TypeScript front-end that powers the public website.

## Quick start

1. Install dependencies:

   ```bash
   cd web
   npm install
   ```

2. Provide the Cloudflare R2 JSON endpoint via an environment variable before starting the development server or
   running the production build:

   ```bash
   export VITE_JOBS_DATA_URL="https://<account-id>.r2.cloudflarestorage.com/me-data-jobs"
   ```

3. Launch the local development server:

   ```bash
   npm run dev
   ```

4. Execute the automated test suite (unit + integration):

   ```bash
   npm test
   ```

5. Create an optimized production build:

   ```bash
   npm run build
   ```

## Cloudflare Pages deployment

1. In the Cloudflare Pages dashboard, create a new project that points to this repository.
2. Set the **Build command** to `npm run build` and the **Build output directory** to `dist`.
3. Define the `VITE_JOBS_DATA_URL` environment variable under **Settings → Environment variables** and point it to the
   Cloudflare R2 bucket URL that serves your JSON feed (`https://6d9a56e137a3328cc52e48656dd30d91.r2.cloudflarestorage.com/me-data-jobs`).
4. Trigger a deployment. The app will automatically fetch and render the latest data engineering roles.

## License

This project is released under the [MIT License](LICENSE).
