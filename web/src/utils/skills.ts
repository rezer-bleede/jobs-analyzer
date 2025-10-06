import { Job } from '../types/job'

const SKILL_DELIMITERS = /,|\n|\||;|\//

const titleCase = (skill: string): string => {
  if (skill.toUpperCase() === skill) {
    return skill
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }
  return skill
}

export const parseSkillList = (value?: string): string[] => {
  if (!value) {
    return []
  }

  return value
    .split(SKILL_DELIMITERS)
    .map((item) => titleCase(item.trim()))
    .filter((item, index, array) => item.length > 0 && array.indexOf(item) === index)
}

export interface SkillFrequency {
  skill: string
  count: number
}

export const buildSkillFrequency = (jobs: Job[]): SkillFrequency[] => {
  const frequencyMap = new Map<string, number>()

  jobs.forEach((job) => {
    const combined = new Set([...job.techSkills, ...job.domainSkills])
    combined.forEach((skill) => {
      if (!skill) {
        return
      }
      const current = frequencyMap.get(skill) ?? 0
      frequencyMap.set(skill, current + 1)
    })
  })

  return Array.from(frequencyMap.entries())
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count || a.skill.localeCompare(b.skill))
}
