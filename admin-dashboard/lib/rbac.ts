import type { UserRole } from "./types"

export const permissions = {
  SUPER_ADMIN: {
    canCreateUser: true,
    canEditUser: true,
    canDeleteUser: true,
    canCreateBranch: true,
    canEditBranch: true,
    canDeleteBranch: true,
    canRegisterDevice: true,
    canMapDevice: true,
    canUploadAudio: true,
    canEditAudio: true,
    canDeleteAudio: true,
    canCreateSchedule: true,
    canEditSchedule: true,
    canDeleteSchedule: true,
  },
  STORE_MANAGER: {
    canCreateUser: false,
    canEditUser: false,
    canDeleteUser: false,
    canCreateBranch: false,
    canEditBranch: false,
    canDeleteBranch: false,
    canRegisterDevice: false,
    canMapDevice: false,
    canUploadAudio: false,
    canEditAudio: false,
    canDeleteAudio: false,
    canCreateSchedule: false,
    canEditSchedule: false,
    canDeleteSchedule: false,
  },
}

export function checkPermission(role: UserRole, action: keyof typeof permissions.SUPER_ADMIN): boolean {
  return permissions[role]?.[action] ?? false
}
