interface Env {
  REFDATAHUB_API_URL?: string
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  if (!env.REFDATAHUB_API_URL) {
    return Response.json({ error: 'RefDataHub API is not configured.' }, { status: 503 })
  }

  let url: URL
  try {
    url = new URL('/api/reference/company-aliases', env.REFDATAHUB_API_URL)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Unsupported protocol')
  } catch {
    return Response.json({ error: 'Invalid RefDataHub API URL.' }, { status: 500 })
  }

  try {
    const upstream = await fetch(url, { headers: { accept: 'application/json' } })
    if (!upstream.ok) return Response.json({ error: 'RefDataHub is unavailable.' }, { status: 502 })
    const aliases: unknown = await upstream.json()
    if (!Array.isArray(aliases)) return Response.json({ error: 'Invalid RefDataHub response.' }, { status: 502 })
    return Response.json(aliases, {
      headers: { 'cache-control': 'public, max-age=300, stale-while-revalidate=3600' },
    })
  } catch {
    return Response.json({ error: 'RefDataHub is unavailable.' }, { status: 502 })
  }
}
