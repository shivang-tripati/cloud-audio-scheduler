export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

export const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters"
  }
  return null
}

// export const validateBranchCode = (code: string): boolean => {
//   return /^[A-Z]{2,}-[A-Z]{3,}-\d{2}$/.test(code)
// }

// export const validateDeviceCode = (code: string): boolean => {
//   return /^DEV-[A-Z]{3,}-\d{3}$/.test(code)
// }

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}
