import type { SkillFrequency } from '../utils/skills'

interface SkillHighlightsProps {
  skills: SkillFrequency[]
  maxVisible?: number
}

export const SkillHighlights = ({ skills, maxVisible = 12 }: SkillHighlightsProps) => {
  if (skills.length === 0) return null

  const visibleSkills = skills.slice(0, maxVisible)
  const maxValue = visibleSkills[0]?.count ?? 1

  return (
    <section className="section-card mb-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">In-demand technologies</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Based on the latest job descriptions from leading employers across the Middle East.
      </p>
      <div className="flex flex-wrap gap-2">
        {visibleSkills.map((skill, index) => {
          const intensity = Math.max(0.3, skill.count / maxValue)
          return (
            <span
              key={skill.skill}
              className="badge transition-transform hover:scale-105"
              style={{
                background: `linear-gradient(135deg, rgba(124, 58, 237, ${intensity * 0.2}) 0%, rgba(6, 182, 212, ${intensity * 0.2}) 100%)`,
                color: index < 3 ? '#7c3aed' : '#475569',
                fontWeight: index < 3 ? 700 : 500,
              }}
            >
              {skill.skill}
              <span className="ml-1.5 opacity-60 text-xs">({skill.count})</span>
            </span>
          )
        })}
      </div>
    </section>
  )
}
