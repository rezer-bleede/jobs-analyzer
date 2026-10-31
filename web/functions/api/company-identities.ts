interface Env {
  JOBS_BUCKET: R2Bucket
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const object = await env.JOBS_BUCKET.get('company-identities.json')
  if (!object) {
    return Response.json({ error: 'Company identities are not available yet.' }, { status: 503 })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('content-type', 'application/json; charset=utf-8')
  headers.set('cache-control', 'public, max-age=300, stale-while-revalidate=3600')
  headers.set('access-control-allow-origin', '*')
  headers.set('x-content-type-options', 'nosniff')
  return new Response(object.body, { headers })
}
