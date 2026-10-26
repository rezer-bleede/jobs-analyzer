import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <main className="page-shell grid min-h-[55vh] place-items-center text-center">
    <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">404 · Page not found</p><h1 className="mt-4 text-4xl font-bold tracking-tight">This page isn’t here.</h1><p className="mt-3 text-slate-600 dark:text-slate-400">The link may be outdated or the page may have moved.</p><Link to="/" className="btn-primary mt-6 inline-flex">Back to the jobs board</Link></div>
  </main>
)
