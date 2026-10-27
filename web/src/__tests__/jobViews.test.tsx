import { act, render, renderHook, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App'
import { ThemeProvider } from '../hooks/useTheme'
import { useJobView } from '../hooks/useJobView'

describe('useJobView', () => {
  beforeEach(() => localStorage.clear())

  it('defaults to the list layout and persists changes', () => {
    const { result } = renderHook(() => useJobView())
    expect(result.current[0]).toBe('list')

    act(() => result.current[1]('table'))

    expect(result.current[0]).toBe('table')
    expect(localStorage.getItem('jobView')).toBe('table')
  })

  it('restores a saved layout', () => {
    localStorage.setItem('jobView', 'cards')
    const { result } = renderHook(() => useJobView())
    expect(result.current[0]).toBe('cards')
  })
})

describe('job layout toggle', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.stubEnv('VITE_JOBS_DATA_URL', 'https://example.com/jobs.json')
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve([
              {
                job_hash: 'job-1',
                title: 'Staff Data Engineer',
                company: 'Northwind',
                location: 'Riyadh, Saudi Arabia',
                is_remote: true,
                desired_tech_skills_inferred: 'dbt, SQL',
              },
            ]),
        }) as unknown as Response,
      ),
    )
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('starts in list view and switches to cards', async () => {
    render(
      <ThemeProvider>
        <App />
      </ThemeProvider>,
    )

    await screen.findByText('Staff Data Engineer')
    expect(screen.getByRole('button', { name: 'List view' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByRole('link', { name: 'Role details' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Card view' }))

    expect(await screen.findByRole('link', { name: 'Role details' })).toBeInTheDocument()
    expect(localStorage.getItem('jobView')).toBe('cards')
  })
})
