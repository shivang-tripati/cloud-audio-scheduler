import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Schedule } from './types'

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

export function formatTargets(schedule: Schedule) {
  if (schedule.target_type === 'ALL') {
    return "All Branches"
  }
  if (schedule.target_type === 'REGION') {
    return schedule.targets?.map(t => t.target_value).join(", ")
  }
  if (schedule.target_type === 'BRANCH') {
    return schedule.targets?.map(t => t.target_value).join(", ")
  }

  const values = schedule.targets?.map(t => t.target_value).join(", ")
  return values || "-"
}
