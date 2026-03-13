"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Wifi, WifiOff, Copy, Check } from "lucide-react"

interface DeviceInfo {
  device_code: string
  status: "ONLINE" | "OFFLINE"
  branch: string
  last_sync: string
}

interface Schedule {
  id: string
  title: string
  audio_id: string
  schedule_type: "DAILY_PRAYER" | "FESTIVAL" | "DAILY"
  priority: number
  time: string
  target_type: "ALL" | "REGION" | "BRANCH"
  target_value: string | null
  is_active: boolean
}

interface Audio {
  id: string
  title: string
  audio_type: "PRAYER" | "FESTIVAL" | "DAILY"
  language: string
  duration_seconds: number
  file_url: string
}

export default function DevicePage() {
  const [deviceCode, setDeviceCode] = useState("")
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [status, setStatus] = useState<"ONLINE" | "OFFLINE">("OFFLINE")
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [copied, setCopied] = useState(false)

  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [audioLibrary, setAudioLibrary] = useState<Audio[]>([])
  const [nowPlaying, setNowPlaying] = useState<string | null>(null)

  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const schedulerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const initializeDevice = async () => {
      // Check if device code exists in localStorage
      let code = localStorage.getItem("device_code")

      if (!code) {
        // Generate device code only once
        code = `DEV-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${Math.floor(Math.random() * 900) + 100}`
        localStorage.setItem("device_code", code)
      }

      setDeviceCode(code)

      // Fetch initial schedules and audio library
      await fetchSchedules()

      setLoading(false)
    }

    initializeDevice()
  }, [])

  const fetchSchedules = async () => {
    try {
      const response = await fetch("/api/mock/schedules.json")
      const data = await response.json()
      setSchedules(data.schedules)

      const audioResponse = await fetch("/api/mock/audio.json")
      const audioData = await audioResponse.json()
      setAudioLibrary(audioData.audio)
    } catch (error) {
      console.error("[Device] Failed to fetch schedules:", error)
      // Use cached data on error
      const cachedSchedules = localStorage.getItem("cached_schedules")
      if (cachedSchedules) {
        setSchedules(JSON.parse(cachedSchedules))
      }
    }
  }

  useEffect(() => {
    if (!deviceCode) return

    const performSync = async () => {
      setSyncing(true)
      try {
        // Mock GET /device/sync call
        const syncResponse = await fetch(`/api/mock/schedules.json`)

        if (syncResponse.ok) {
          const data = await syncResponse.json()
          setSchedules(data.schedules)
          localStorage.setItem("cached_schedules", JSON.stringify(data.schedules))

          setStatus("ONLINE")
          setDeviceInfo({
            device_code: deviceCode,
            status: "ONLINE",
            branch: "Not Yet Mapped",
            last_sync: new Date().toLocaleTimeString(),
          })
        } else {
          throw new Error("Sync failed")
        }
      } catch (error) {
        console.error("[Device] Sync failed:", error)
        setStatus("OFFLINE")

        // On offline, set up to play cached DAILY_PRAYER only
        const cachedSchedules = localStorage.getItem("cached_schedules")
        if (cachedSchedules) {
          const cached = JSON.parse(cachedSchedules) as Schedule[]
          const dailyPrayer = cached.find((s) => s.schedule_type === "DAILY_PRAYER")
          if (dailyPrayer) {
            setSchedules([dailyPrayer])
          }
        }
      } finally {
        setSyncing(false)
      }
    }

    // Sync every 30-60 seconds with random jitter
    const syncInterval = 30000 + Math.random() * 30000
    syncIntervalRef.current = setInterval(performSync, syncInterval)

    // Perform initial sync
    performSync()

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [deviceCode])

  useEffect(() => {
    if (!deviceCode) return

    const sendHeartbeat = async () => {
      try {
        // Mock POST /device/heartbeat
        const response = await fetch(`/api/mock/schedules.json`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_code: deviceCode, timestamp: new Date().toISOString() }),
        })

        if (response.ok) {
          setStatus("ONLINE")
        } else {
          setStatus("OFFLINE")
        }
      } catch (error) {
        console.error("[Device] Heartbeat failed:", error)
        setStatus("OFFLINE")
      }
    }

    heartbeatIntervalRef.current = setInterval(sendHeartbeat, 5 * 60 * 1000) // 5 minutes

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current)
      }
    }
  }, [deviceCode])

  useEffect(() => {
    if (schedules.length === 0 || !audioLibrary.length) return

    const checkAndPlaySchedule = () => {
      const now = new Date()
      const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`
      const todayDate = now.toISOString().split("T")[0]

      // Get active schedules sorted by priority
      const activeSchedules = schedules.filter((s) => s.is_active).sort((a, b) => a.priority - b.priority)

      for (const schedule of activeSchedules) {
        // Check if time matches
        if (schedule.time !== currentTime) continue

        if (schedule.schedule_type === "DAILY_PRAYER") {
          const lastPlayedDate = localStorage.getItem(`daily_prayer_played_${todayDate}`)
          if (lastPlayedDate) {
            continue
          }

          // Mark DAILY_PRAYER as played for today
          localStorage.setItem(`daily_prayer_played_${todayDate}`, "true")
        }

        // Find audio and play
        const audio = audioLibrary.find((a) => a.id === schedule.audio_id)
        if (audio) {
          playAudio(audio, schedule)
          break // Play highest priority only
        }
      }
    }

    schedulerIntervalRef.current = setInterval(checkAndPlaySchedule, 30000) // Check every 30 seconds

    return () => {
      if (schedulerIntervalRef.current) {
        clearInterval(schedulerIntervalRef.current)
      }
    }
  }, [schedules, audioLibrary])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      // Post PLAYED log
      if (nowPlaying) {
        const schedule = schedules.find((s) => s.audio_id === nowPlaying)
        if (schedule) {
          logPlaybackEvent(schedule, "PLAYED")
        }
      }
      setNowPlaying(null)
    }

    const handleError = () => {
      console.error("[Device] Audio playback error")
      // Post MISSED log
      if (nowPlaying) {
        const schedule = schedules.find((s) => s.audio_id === nowPlaying)
        if (schedule) {
          logPlaybackEvent(schedule, "MISSED")
        }
      }
      setNowPlaying(null)
    }

    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError)

    return () => {
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError)
    }
  }, [nowPlaying, schedules])

  const logPlaybackEvent = async (schedule: Schedule, status: "PLAYED" | "MISSED") => {
    try {
      // Mock POST /device/logs
      await fetch(`/api/mock/schedules.json`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          device_code: deviceCode,
          schedule_id: schedule.id,
          status,
          timestamp: new Date().toISOString(),
        }),
      })
    } catch (error) {
      console.error("[Device] Failed to log playback event:", error)
    }
  }

  const playAudio = (audio: Audio, schedule: Schedule) => {
    if (!audioRef.current) return

    setNowPlaying(audio.id)

    // Use placeholder audio URL for mock
    audioRef.current.src = audio.file_url

    audioRef.current.play().catch((error) => {
      console.error("[Device] Playback error:", error)
      logPlaybackEvent(schedule, "MISSED")
    })
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(deviceCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Status Indicator */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Device Status</CardTitle>
              {status === "ONLINE" ? (
                <Badge className="gap-1 bg-green-100 text-green-800">
                  <Wifi className="w-3 h-3" />
                  Online
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <WifiOff className="w-3 h-3" />
                  Offline
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Device Code</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-background rounded font-mono text-sm font-bold">{deviceCode}</code>
                <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex-shrink-0 bg-transparent">
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {syncing && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing with server...
              </div>
            )}

            {deviceInfo && status === "ONLINE" && (
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-muted-foreground">Branch</p>
                  <p className="font-medium">{deviceInfo.branch}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Sync</p>
                  <p className="font-medium">{deviceInfo.last_sync}</p>
                </div>
              </div>
            )}

            {nowPlaying && (
              <div className="p-2 bg-blue-50 rounded text-sm text-blue-900">
                <p className="font-medium">Now Playing</p>
                <p>{audioLibrary.find((a) => a.id === nowPlaying)?.title || "Unknown"}</p>
              </div>
            )}

            <div className="p-2 bg-slate-50 rounded text-sm">
              <p className="text-muted-foreground">Active Schedules</p>
              <p className="font-medium">{schedules.filter((s) => s.is_active).length}</p>
            </div>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card className="bg-card border border-border">
          <CardHeader>
            <CardTitle className="text-base">Device Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="font-medium">{status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registered</span>
              <span className="font-medium">{status === "ONLINE" ? "Yes" : "No"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sync Interval</span>
              <span className="font-medium">30-60 seconds</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Heartbeat</span>
              <span className="font-medium">Every 5 minutes</span>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-blue-50 border border-blue-200">
          <CardHeader>
            <CardTitle className="text-base text-blue-900">How to Register</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <ol className="list-decimal list-inside space-y-1">
              <li>Copy the device code above</li>
              <li>Go to Admin Dashboard</li>
              <li>Navigate to Devices section</li>
              <li>Register this device with the code</li>
              <li>Assign to a branch</li>
            </ol>
          </CardContent>
        </Card>

        {/* Audio Player (Hidden - For Script Playback) */}
        <audio ref={audioRef} crossOrigin="anonymous" />
      </div>
    </div>
  )
}
