import { memo } from 'react'
import { JobCard } from './JobCard'
import { JobListItem } from './JobListItem'
import { JobTable } from './JobTable'
import type { JobView } from '../hooks/useJobView'
import type { Job } from '../types/job'

export const JobCollection = memo(({ jobs, view }: { jobs: Job[]; view: JobView }) => {
  if (view === 'table') return <JobTable jobs={jobs} />

  if (view === 'cards') {
    return (
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    )
  }

  return (
    <div className="job-list">
      {jobs.map((job) => (
        <JobListItem key={job.id} job={job} />
      ))}
    </div>
  )
})

JobCollection.displayName = 'JobCollection'
