"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Schedule, Audio, Branch, ScheduleType, ScheduleFormData, TargetType, ScheduleMode } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"


const REGIONS = ["North", "South", "East", "West", "Central"]

interface ScheduleModalProps {
  open: boolean
  schedule?: Schedule | null
  audioFiles: Audio[]
  branches: Branch[]
  onOpenChange: (open: boolean) => void
  onSave: (data: ScheduleFormData) => Promise<void>
  loading?: boolean
}

export function ScheduleModal({
  open,
  schedule,
  audioFiles,
  branches,
  onOpenChange,
  onSave,
  loading = false,
}: ScheduleModalProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: "",
    audio_id: "",
    schedule_mode: "DAILY",

    play_time: "09:00",
    start_date: null,
    end_date: null,
    play_at: "",

    play_count: 1,
    priority: 3,

    target_type: "ALL",
    target_values: [],
    is_active: true,
  })

  const [error, setError] = useState("")

  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title,
        audio_id: schedule?.audio?.id || "",
        schedule_mode: schedule.schedule_mode,
        play_time: schedule.play_time.slice(0, 5),
        start_date: schedule.start_date,
        end_date: schedule.end_date,
        play_at: schedule.play_at ? schedule.play_at.slice(0, 16) : "",
        play_count: schedule.play_count,
        priority: schedule.priority,
        target_type: schedule.target_type,
        target_values: schedule.targets?.map(t => t.target_value) || [],
      })
    } else {
      //reset form
      setFormData({
        title: "",
        audio_id: "",
        schedule_mode: "DAILY",
        play_time: "09:00",
        start_date: null,
        end_date: null,
        play_at: "",
        play_count: 1,
        priority: 3,
        target_type: "ALL",
        target_values: [],
        is_active: true,
      })
    }
    setError("")
  }, [schedule, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Schedule title is required")
      return
    }

    if (!formData.audio_id) {
      setError("Please select an audio file")
      return
    }


    if (
      formData.target_type !== "ALL" &&
      formData.target_values.length === 0
    ) {
      setError("Please select at least one target")
      return
    }

    if (formData.schedule_mode === "DATE_RANGE") {
      if (!formData.start_date || !formData.end_date) {
        setError("Start date and end date are required")
        return
      }
      if (formData.start_date > formData.end_date) {
        setError("Start date cannot be after end date")
        return
      }
    }

    if (formData.schedule_mode === "ONCE") {
      if (!formData.play_at) {
        setError("Please select date and time")
        return
      }
    }

    if (formData.schedule_mode !== "ONCE") {
      if (!formData.play_time) {
        setError("Play time is required")
        return
      }
    }


    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (err) {
      setError("Failed to save schedule")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit Schedule" : "Create Schedule"}</DialogTitle>
          <DialogDescription>{schedule ? "Update schedule details" : "Create a new audio schedule"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Schedule Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Morning Prayer Schedule"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Audio File</label>

              <Select
                value={formData.audio_id}
                onValueChange={(id) =>
                  setFormData({ ...formData, audio_id: id })
                }
              >
                <SelectTrigger disabled={loading}>
                  <span className="truncate">
                    {audioFiles.find(a => String(a.id) === formData.audio_id)?.title ?? "Select audio file"}
                  </span>
                </SelectTrigger>

                <SelectContent>
                  {audioFiles.map((audio) => (
                    <SelectItem key={audio.id} value={audio.id}>
                      {audio.title} ({audio.audio_type})
                    </SelectItem>
                  ))}

                </SelectContent>
              </Select>

            </div>


            <div className="space-y-2">
              <label className="text-sm font-medium">Schedule Mode</label>
              <Select
                value={formData.schedule_mode}
                onValueChange={(mode) =>
                  setFormData({
                    ...formData,
                    schedule_mode: mode as ScheduleMode,
                    start_date: null,
                    end_date: null,
                    play_at: "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select schedule mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="DATE_RANGE">Date Range</SelectItem>
                  <SelectItem value="ONCE">Once</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>


          {formData.schedule_mode !== "ONCE" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Play Time</label>
              <Input
                type="time"
                value={formData.play_time}
                onChange={(e) =>
                  setFormData({ ...formData, play_time: e.target.value })
                }
              />
            </div>
          )}

          {formData.schedule_mode === "DATE_RANGE" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, start_date: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, end_date: e.target.value })
                  }
                />
              </div>
            </div>
          )}

          {formData.schedule_mode === "ONCE" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Play At</label>
              <Input
                type="datetime-local"
                value={formData.play_at}
                onChange={(e) =>
                  setFormData({ ...formData, play_at: e.target.value })
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Play Count</label>
            <Input
              type="number"
              min={1}
              value={formData.play_count}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  play_count: Number(e.target.value),
                })
              }
            />
            <p className="text-xs text-muted-foreground">
              Audio will play this many times consecutively when triggered.
            </p>
          </div>



          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Input
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number.parseInt(e.target.value) })}
              disabled={loading}
              min="1"
              max="10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target</label>
            <Select
              value={formData.target_type}
              onValueChange={(type) =>
                setFormData({ ...formData, target_type: type as TargetType, target_values: [] })
              }
            >
              <SelectTrigger disabled={loading}>
                <SelectValue placeholder="Select target" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Branches</SelectItem>
                <SelectItem value="REGION">Specific Region</SelectItem>
                <SelectItem value="BRANCH">Specific Branch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.target_type === "REGION" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Region</label>
              <Select
                value={formData.target_values[0] || ""}
                onValueChange={(region) => setFormData({ ...formData, target_values: [region] })}
              >
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.target_type === "BRANCH" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Branches</label>
              <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                {branches.map((branch) => (
                  <label key={branch.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={formData.target_values.includes(branch.id)}
                      onChange={(e) => {
                        const checked = e.target.checked
                        setFormData((prev) => ({
                          ...prev,
                          target_values: checked
                            ? [...prev.target_values, branch.id]
                            : prev.target_values.filter((id) => id !== branch.id),
                        }))
                      }}
                    />
                    {branch.name} ({branch.branch_code})
                  </label>
                ))}
              </div>
            </div>
          )}


          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formData.is_active ? "active" : "inactive"}
              onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
            >
              <SelectTrigger disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              {schedule ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog >
  )
}
