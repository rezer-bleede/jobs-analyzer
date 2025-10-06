import type { SkillFrequency } from '../utils/skills'

interface SkillHighlightsProps {
  skills: SkillFrequency[]
  maxVisible?: number
}

export const SkillHighlights = ({ skills, maxVisible = 12 }: SkillHighlightsProps) => {
  if (skills.length === 0) {
    return null
  }

  const visibleSkills = skills.slice(0, maxVisible)

  return (
    <section className="bg-white rounded-4 shadow-sm p-4 mb-4">
      <h2 className="h5 fw-bold mb-3">In-demand technologies</h2>
      <p className="text-body-secondary mb-3">
        Based on the latest job descriptions from leading employers across the Middle East.
      </p>
      <div className="d-flex flex-wrap gap-2">
        {visibleSkills.map((skill) => (
          <span key={skill.skill} className="badge bg-secondary-subtle text-secondary-emphasis rounded-pill px-3 py-2">
            {skill.skill}
            <span className="ms-1 text-body-secondary small">({skill.count})</span>
          </span>
        ))}
      </div>
    </section>
  )
}
