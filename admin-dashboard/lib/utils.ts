import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Schedule, Branch } from './types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  if (h > 0) {
    return `${h}h ${m}m ${s}s`
  }
  return `${m}m ${s}s`
}


export function formatScheduleWhen(schedule: Schedule) {
  switch (schedule.schedule_mode) {
    case "DAILY":
      return `Every day at ${schedule.play_time}`

    case "DATE_RANGE":
      return `From ${schedule.start_date} to ${schedule.end_date} at ${schedule.play_time}`

    case "ONCE":
      return `Once at ${new Date(schedule.play_at!).toLocaleString()}`

    default:
      return "-"
  }
}

export function formatTargets(schedule: Schedule, branches: Branch[] = []) {
  if (schedule.target_type === 'ALL') {
    return "All Branches"
  }

  const values = schedule.target_values || schedule.targets?.map(t => t.target_value) || []

  if (values.length === 0) return "-"

  let displayNames: string[] = []

  if (schedule.target_type === 'BRANCH' && branches.length > 0) {
    displayNames = values.map(id => {
      const branch = branches.find(b => String(b.id) === String(id))
      return branch ? branch.name : `Branch ${id}`
    })
  } else {
    displayNames = values as string[]
  }

  if (displayNames.length > 2) {
    return `${displayNames.slice(0, 2).join(", ")} +${displayNames.length - 2} more`
  }

  return displayNames.join(", ")
}
