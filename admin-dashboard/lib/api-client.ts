import type { ApiResponse, ApiError } from "./types"
import { getSession, clearSession } from "./auth"
import type { PlaylistItem } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

interface FetchOptions extends RequestInit {
  params?: Record<string, any>
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null
  const session = getSession()
  return session?.token || null
}

async function apiFetch<T>(
  endpoint: string,
  options?: FetchOptions
): Promise<ApiResponse<T>> {
  // if (!API_BASE_URL) {
  //   return getMockData<T>(endpoint, options)
  // }

  try {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.slice(1)
      : endpoint


    const url = new URL('api/' + cleanEndpoint, API_BASE_URL)



    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    const headers: Record<string, string> = {}

    if (options?.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value
        })
      } else {
        Object.assign(headers, options.headers as Record<string, string>)
      }
    }

    const token = getAuthToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    if (!(options?.body instanceof FormData)) {
      headers["Content-Type"] = "application/json"
    }

    const response = await fetch(url.toString(), {
      ...options,
      headers,
    })

    if (response.status === 401) {
      const isLoginRequest = cleanEndpoint.startsWith("auth/login")
      const token = getAuthToken()

      // Only auto-logout if user WAS logged in
      if (token && !isLoginRequest) {
        clearSession()
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }

      const errorData = await response.json().catch(() => ({}))

      throw {
        code: "UNAUTHORIZED",
        message: errorData.message || "Unauthorized",
        status: 401,
      } as ApiError
    }


    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw {
        code: `ERROR_${response.status}`,
        message: errorData.message || `HTTP ${response.status}`,
        errors: errorData.errors,
        status: response.status,
      } as ApiError
    }

    const data = await response.json()
    return { success: true, data: data.data }
  } catch (error: any) {
    console.error("[API Error]", error.message)

    return {
      success: false,
      error: {
        code: error?.code || "FETCH_ERROR",
        message: error?.message || "Network error",
        status: error?.status || 0,
      },
    }
  }
}


// Auth APIs
export async function loginUser(email: string, password: string): Promise<ApiResponse<any>> {
  // if (!API_BASE_URL) {
  //   const user = mockUsers.find((u) => u.email === email)
  //   if (user) {
  //     return { success: true, data: { user, token: "mock-jwt-token-" + Date.now() } }
  //   }
  //   return {
  //     success: false,
  //     error: {
  //       code: "INVALID_CREDENTIALS",
  //       message: "Invalid email or password",
  //       status: 401,
  //     },
  //   }
  // }


  return apiFetch("auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

// Users APIs
export async function getUsers(): Promise<ApiResponse<any[]>> {
  return apiFetch("users")
}

export async function getUserById(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`users/${id}`)
}

export async function createUser(data: any): Promise<ApiResponse<any>> {
  return apiFetch("users", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateUser(id: string, data: any): Promise<ApiResponse<any>> {
  return apiFetch(`users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteUser(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`users/${id}`, {
    method: "DELETE",
  })
}

// Branches APIs
export async function getBranches(): Promise<ApiResponse<any[]>> {
  return apiFetch("branches")
}

export async function getBranchById(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`/branches/${id}`)
}

export async function createBranch(data: any): Promise<ApiResponse<any>> {
  return apiFetch("branches", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateBranch(id: string, data: any): Promise<ApiResponse<any>> {
  return apiFetch(`branches/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteBranch(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`branches/${id}`, {
    method: "DELETE",
  })
}

// GET /api/branches/:branchId/playlist/manage  (admin UI — all items)
export const getBranchPlaylist = (branchId: string | number) =>
  apiFetch(`/branches/${branchId}/playlist/manage`)

// POST /api/branches/:branchId/playlist
export const addToPlaylist = (branchId: string | number, audioId: number) =>
  apiFetch<{ message: string }>(`/branches/${branchId}/playlist`, {
    method: "POST",
    body: JSON.stringify({ audio_id: audioId }),
  })

// DELETE /api/branches/:branchId/playlist/:itemId
export const removeFromPlaylist = (branchId: string | number, itemId: number) =>
  apiFetch<{ message: string }>(`/branches/${branchId}/playlist/${itemId}`, {
    method: "DELETE",
  })

// PATCH /api/branches/:branchId/playlist/:itemId/toggle
export const togglePlaylistItem = (branchId: string | number, itemId: number) =>
  apiFetch<{ is_active: boolean }>(`/branches/${branchId}/playlist/${itemId}/toggle`, {
    method: "PATCH",
  })

// PUT /api/branches/:branchId/playlist/reorder
export const reorderPlaylist = (
  branchId: string | number,
  items: { id: number; order_index: number }[]
) =>
  apiFetch<{ message: string }>(`/branches/${branchId}/playlist/reorder`, {
    method: "PUT",
    body: JSON.stringify({ items }),
  })

// DELETE /api/branches/:branchId/playlist/clear
export const clearPlaylist = (branchId: string | number) =>
  apiFetch<{ message: string }>(`/branches/${branchId}/playlist/clear`, {
    method: "DELETE",
  })



// Devices APIs
export async function registerDevice(data: any): Promise<ApiResponse<any>> {
  return apiFetch("devices/register", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function getDevices(): Promise<ApiResponse<any[]>> {
  return apiFetch("devices")
}

export async function getDeviceById(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`devices/${id}`)
}

export async function getDeviceStatus(deviceCode?: string): Promise<ApiResponse<any>> {
  return apiFetch("devices/status", {
    params: deviceCode ? { device_code: deviceCode } : undefined,
  })
}

export async function updateDevice(id: string, data: any): Promise<ApiResponse<any>> {
  return apiFetch(`devices/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function updateDeviceVolume(id: string, volume: number): Promise<ApiResponse<any>> {
  return apiFetch(`devices/${id}/volume`, {
    method: "POST",
    body: JSON.stringify({ volume }),
  })
}

export async function deleteDevice(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`devices/${id}`, {
    method: "DELETE",
  })
}

export async function resetDevice(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`devices/${id}/reset`, {
    method: "POST",
  })
}

// Device Sync API (for device player)
export async function deviceSync(deviceCode: string): Promise<ApiResponse<any>> {
  return apiFetch(`devices/sync`, {
    params: { device_code: deviceCode },
  })
}

// Device Heartbeat API
export async function sendDeviceHeartbeat(deviceCode: string): Promise<ApiResponse<any>> {
  return apiFetch("devices/heartbeat", {
    method: "POST",
    body: JSON.stringify({ device_code: deviceCode, timestamp: new Date().toISOString() }),
  })
}

// Device Logs API
export async function logDevicePlayback(
  deviceCode: string,
  scheduleId: string,
  status: "PLAYED" | "MISSED",
): Promise<ApiResponse<any>> {
  return apiFetch("devices/logs", {
    method: "POST",
    body: JSON.stringify({
      device_code: deviceCode,
      schedule_id: scheduleId,
      status,
      timestamp: new Date().toISOString(),
    }),
  })
}

// Audio APIs
export async function getAudio(): Promise<ApiResponse<any[]>> {
  return apiFetch("audio")
}

export async function getAudioById(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`audio/${id}`)
}

export async function uploadAudio(formData: FormData): Promise<ApiResponse<any>> {
  return apiFetch("audio", {
    method: "POST",
    body: formData,
  })
}

export async function updateAudio(id: string, formData: FormData): Promise<ApiResponse<any>> {
  return apiFetch(`audio/${id}`, {
    method: "PUT",
    body: formData,
  })
}

export async function deleteAudio(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`audio/${id}`, {
    method: "DELETE",
  })
}

// Schedules APIs
export async function getSchedules(): Promise<ApiResponse<any[]>> {
  return apiFetch("schedules")
}

export async function getScheduleById(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`schedules/${id}`)
}

export async function createSchedule(data: any): Promise<ApiResponse<any>> {
  return apiFetch("schedules", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export async function updateSchedule(id: string, data: any): Promise<ApiResponse<any>> {
  return apiFetch(`schedules/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteSchedule(id: string): Promise<ApiResponse<any>> {
  return apiFetch(`schedules/${id}`, {
    method: "DELETE",
  })
}
