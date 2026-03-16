// User and Authentication types
export type UserRole = "SUPER_ADMIN" | "STORE_MANAGER"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  password: string
  confirmPassword: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: User
  token: string
  expiresAt: number
}

// Branch types
export interface Branch {
  id: string
  branch_code: string
  name: string
  city: string
  state: string
  region: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// ADD THESE TO YOUR EXISTING lib/types.ts
// ─────────────────────────────────────────────────────────────

export interface PlaylistItem {
  id: number
  branch_id: number
  audio_id: number
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  audio: {
    id: number
    title: string
    audio_type: "PRAYER" | "FESTIVAL" | "DAILY" | "OTHER"
    file_url: string
    duration_seconds: number
    language: string
    is_active: boolean
  }
}

// Device types
export type DeviceStatus = "ONLINE" | "OFFLINE"

export interface Device {
  id: string
  device_code: string
  device_name: string
  branch_id: string
  status: DeviceStatus
  last_seen: string
  created_at: string
  updated_at: string
  volume?: number
}

// Audio types
export type AudioType = "PRAYER" | "FESTIVAL" | "DAILY" | "OTHER"
export type Language = "Hindi" | "English" | "Gujarati" | "Bengali" | "Marathi" | "OTHER"

export interface Audio {
  id: string
  title: string
  audio_type: AudioType
  language: Language
  duration_seconds: number
  file_url: string
  created_at: string
  updated_at: string
}

// Schedule types
export type ScheduleType = "DAILY_PRAYER" | "FESTIVAL" | "DAILY" | "ANOUNCEMENT" | "SPECIAL" | "EMERGENCY" | "OTHER"
export type TargetType = "ALL" | "REGION" | "BRANCH"
export type ScheduleMode = "DAILY" | "DATE_RANGE" | "ONCE"

export interface Schedule {
  id: string
  title: string

  schedule_mode: "DAILY" | "DATE_RANGE" | "ONCE"

  play_time?: string
  start_date?: string | null
  end_date?: string | null
  play_at?: string | null

  play_count: number
  priority: number
  is_active: boolean

  audio?: {
    id: string
    title: string
    audio_type: AudioType
    language: Language
    duration_seconds: number
    file_url: string
  }
  target_type: "ALL" | "REGION" | "BRANCH"

  targets: {
    target_type: "ALL" | "REGION" | "BRANCH"
    target_value: string | null
  }[]
  target_values?: string[]


  created_at: string
  updated_at: string
}

export interface ScheduleFormData {
  title: string
  audio_id: string

  schedule_mode: ScheduleMode

  // DAILY & DATE_RANGE
  play_time?: string

  // DATE_RANGE
  start_date?: string | null
  end_date?: string | null

  // ONCE
  play_at?: string

  // Repeat
  play_count: number

  priority: number
  is_active: boolean

  target_type: TargetType
  target_values: string[]
}



// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    status?: number
    errors?: any
  }
}

export interface ApiError {
  code: string
  message: string
  status?: number
  errors?: any
}



export interface DeviceStatusUpdate {
  device_id: number;
  device_name: string;
  branch_id: number;
  branch: {
    id: number;
    name: string;
    branch_code: string;
    region: string;
  };
  status: "ONLINE" | "OFFLINE" | "DISABLED" | "PENDING";
  current_state: "PLAYING" | "IDLE";
  current_audio: string | null;
  volume: number;
  last_seen: string;
}


export interface PlayCommand {
  type: "PLAY";
  audio: {
    title: string;
    file_url: string;
  };
  priority?: "normal" | "emergency";
}

export interface StopCommand {
  type: "STOP";
}

export interface ScheduleUpdate {
  type: "SCHEDULE_UPDATE";
  schedule: any[];
}

type Command = PlayCommand | StopCommand | ScheduleUpdate;

export interface ServerToClientEvents {
  device_status_update: (data: DeviceStatusUpdate) => void;
  command: (data: Command) => void;
}

export interface ClientToServerEvents {
  admin_play_now: (payload: { deviceId: number; audioId: number }) => void;
}
