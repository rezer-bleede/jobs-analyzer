/**
 * Pre-build script: fetches live job data from the configured data URL
 * and writes it to public/jobs.json so the static fallback always contains
 * real data instead of dummy placeholders.
 *
 * Usage:  VITE_JOBS_DATA_URL=https://… node scripts/fetch-data.mjs
 *
 * If the URL is not set or the fetch fails, the existing public/jobs.json
 * is left untouched and a warning is printed.
 */

import { writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_PATH = resolve(__dirname, '..', 'public', 'jobs.json')

const dataUrl = process.env.VITE_JOBS_DATA_URL?.trim()

if (!dataUrl) {
  console.warn('[fetch-data] VITE_JOBS_DATA_URL is not set – skipping data fetch.')
  process.exit(0)
}

console.log(`[fetch-data] Fetching jobs from ${dataUrl} …`)

try {
  const res = await fetch(dataUrl)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`)
  }

  const payload = await res.json()

  // Normalise: accept both bare arrays and { metadata, jobs } wrappers
  const jobs = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.jobs)
      ? payload.jobs
      : null

  if (!jobs) {
    throw new Error('Unexpected payload shape – expected an array or { jobs: [] }')
  }

  // Filter out deleted jobs
  const activeJobs = jobs.filter((j) => j?.is_deleted !== 'Y')

  const output = {
    metadata: payload?.metadata ?? {
      lastUpdated: new Date().toISOString(),
      totalJobs: activeJobs.length,
      source: 'Middle East Data Engineering Jobs',
      version: '1.0.0',
      dataFreshness: 'live',
    },
    jobs: activeJobs,
  }

  // Update totalJobs to match filtered count
  output.metadata.totalJobs = activeJobs.length
  output.metadata.lastUpdated = new Date().toISOString()

  writeFileSync(OUT_PATH, JSON.stringify(output))
  const sizeMB = (Buffer.byteLength(JSON.stringify(output)) / 1_048_576).toFixed(1)
  console.log(`[fetch-data] Wrote ${activeJobs.length} jobs (${sizeMB} MB) to public/jobs.json`)
} catch (err) {
  console.error(`[fetch-data] Failed to fetch data: ${err.message}`)
  console.warn('[fetch-data] Keeping existing public/jobs.json as fallback.')
  process.exit(0) // non-fatal – build continues with whatever file exists
}
