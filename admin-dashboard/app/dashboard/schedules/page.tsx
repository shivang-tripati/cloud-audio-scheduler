"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Schedule, Audio, Branch, ScheduleFormData } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getSchedules, getAudio, getBranches, createSchedule, updateSchedule, deleteSchedule } from "@/lib/api-client"
import { SchedulesTable } from "@/components/tables/schedules-table"
import { ScheduleModal } from "@/components/modals/schedule-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function SchedulesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [audioFiles, setAudioFiles] = useState<Audio[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [schedulesRes, audioRes, branchesRes] = await Promise.all([getSchedules(), getAudio(), getBranches()])

      if (schedulesRes.success && schedulesRes.data) {
        setSchedules(schedulesRes.data)
      }
      if (audioRes.success && audioRes.data) {
        setAudioFiles(audioRes.data)
      }
      if (branchesRes.success && branchesRes.data) {
        setBranches(branchesRes.data)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load schedules", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSchedule = async (formData: ScheduleFormData) => {
    const {
      target_type,
      target_values,
      play_time,
      play_at,
      ...rest
    } = formData

    const payload: any = {
      ...rest,
      targets:
        target_type === "ALL"
          ? [{ target_type: "ALL", target_value: null }]
          : target_values.map((v) => ({
            target_type,
            target_value: v,
          })),
    }

    if (formData.schedule_mode !== "ONCE") {
      payload.play_time = `${play_time}:00`
    }

    if (formData.schedule_mode === "ONCE") {
      if (!formData.play_at) {
        throw new Error("play_at is required for ONCE schedule")
      }
      payload.play_at = new Date(formData.play_at).toISOString()
    }

    const res = selectedSchedule
      ? await updateSchedule(selectedSchedule.id.toString(), payload)
      : await createSchedule(payload)

    if (res.success) {
      toast({ title: "Success" })
      await loadData()
    }
  }



  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return

    try {
      setLoading(true)
      const res = await deleteSchedule(scheduleToDelete.id.toString())

      if (res.success) {
        toast({ title: "Success", description: "Schedule deleted successfully" })
        await loadData()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete schedule", variant: "destructive" })
      }
      setScheduleToDelete(null)
      setDeleteConfirm(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete schedule", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold tracking-tight leading-tight text-3xl md:text-4xl">
            <span className="text-red-500 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500/60">
              Broadcast
            </span>{" "}
            Schedules
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Automate and orchestrate audio playback events</p>
        </div>
      </div>

      <SchedulesTable
        schedules={schedules}
        audioFiles={audioFiles}
        branches={branches}
        currentUserRole={currentUser?.role || ""}
        onEdit={(schedule) => {
          setSelectedSchedule(schedule)
          setModalOpen(true)
        }}
        onDelete={(schedule) => {
          setScheduleToDelete(schedule)
          setDeleteConfirm(true)
        }}
        onCreateNew={() => {
          setSelectedSchedule(null)
          setModalOpen(true)
        }}
        loading={loading}
      />

      <ScheduleModal
        open={modalOpen}
        schedule={selectedSchedule}
        audioFiles={audioFiles}
        branches={branches}
        onOpenChange={setModalOpen}
        onSave={handleSaveSchedule}
        loading={loading}
      />

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Schedule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{scheduleToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSchedule}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
