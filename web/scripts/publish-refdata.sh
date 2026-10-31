#!/usr/bin/env bash
set -euo pipefail

api_origin=${REFDATAHUB_API_URL:-http://localhost:8000}
api_origin=${api_origin%/}
tmpdir=$(mktemp -d)
trap 'rm -rf "$tmpdir"' EXIT

for feed in company-aliases company-identities; do
  file="$tmpdir/$feed.json"
  curl -fsS "$api_origin/api/reference/$feed" -o "$file"
  python3 - "$file" "$feed" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as f:
    data = json.load(f)
if not isinstance(data, list) or (sys.argv[2] == "company-identities" and not data):
    raise SystemExit(f"RefDataHub returned an invalid or empty {sys.argv[2]} feed")
print(f"Validated {sys.argv[2]}: {len(data)} records")
PY
  npx --yes wrangler@3.90.0 r2 object put "me-data-jobs/$feed.json" \
    --file "$file" \
    --content-type application/json \
    --cache-control 'public, max-age=300, stale-while-revalidate=3600'
done
