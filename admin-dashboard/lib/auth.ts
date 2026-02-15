import type { AuthSession, User, UserRole } from "./types"

const SESSION_KEY = "auth_session"
const SESSION_EXPIRY_KEY = "auth_expiry"

export function saveSession(session: AuthSession): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    localStorage.setItem(SESSION_EXPIRY_KEY, String(session.expiresAt))
  }
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null

  const sessionStr = localStorage.getItem(SESSION_KEY)
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY)

  if (!sessionStr || !expiry) return null

  if (Date.now() > Number.parseInt(expiry)) {
    clearSession()
    return null
  }

  try {
    return JSON.parse(sessionStr)
  } catch {
    clearSession()
    return null
  }
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem(SESSION_EXPIRY_KEY)
  }
}

export function getCurrentUser(): User | null {
  const session = getSession()
  return session?.user || null
}

export function isAuthenticated(): boolean {
  return getSession() !== null
}

export function hasRole(requiredRole: UserRole | UserRole[]): boolean {
  const user = getCurrentUser()
  if (!user) return false

  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role)
  }
  return user.role === requiredRole
}
