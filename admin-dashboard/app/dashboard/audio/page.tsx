"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Audio } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getAudio, uploadAudio, updateAudio, deleteAudio } from "@/lib/api-client"
import { AudioTable } from "@/components/tables/audio-table"
import { AudioModal } from "@/components/modals/audio-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Volume2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { API_BASE_URL } from "@/lib/config"

export default function AudioPage() {
  const router = useRouter()
  const { toast } = useToast()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [audioFiles, setAudioFiles] = useState<Audio[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAudio, setSelectedAudio] = useState<Audio | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [audioToDelete, setAudioToDelete] = useState<Audio | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)
    loadAudio()
  }, [router])

  const loadAudio = async () => {
    try {
      setLoading(true)
      const res = await getAudio()
      if (res.success && res.data) {
        setAudioFiles(res.data)
      }
      toast({ title: "Success", description: "Audio files loaded successfully" })
    } catch (error) {
      toast({ title: "Error", description: "Failed to load audio files", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handlePlayAudio = (audio: Audio) => {

    console.log("Audio file URL →", API_BASE_URL + audio.file_url)
    console.log("Playing audio:", audio)
    if (playingId === audio.id) {
      // Toggle play/pause
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }
    } else {
      // Play new audio
      setPlayingId(audio.id)
      setIsPlaying(true)
      if (audioRef.current) {
        audioRef.current.src = API_BASE_URL + "/" + audio.file_url
        audioRef.current.play()
      }
    }
  }

  const handleSaveAudio = async (data: { audio: Partial<Audio>, audio_file: File | null }) => {
    try {
      setLoading(true)

      // Create FormData for API
      const apiFormData = new FormData()
      if (data.audio.title) apiFormData.append('title', data.audio.title)
      if (data.audio.audio_type) apiFormData.append('audio_type', data.audio.audio_type)
      if (data.audio.language) apiFormData.append('language', data.audio.language)
      if (data.audio.duration_seconds) apiFormData.append('duration_seconds', String(data.audio.duration_seconds))

      if (data.audio_file) apiFormData.append('audio_file', data.audio_file)

      let res
      if (selectedAudio) {
        res = await updateAudio(selectedAudio.id, apiFormData)
      } else {
        res = await uploadAudio(apiFormData)
      }

      if (res.success) {
        toast({ title: "Success", description: selectedAudio ? "Audio updated successfully" : "Audio uploaded successfully" })
        await loadAudio()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to save audio", variant: "destructive" })
      }
      setSelectedAudio(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save audio", variant: "destructive" })
    } finally {
      setLoading(false)
      setModalOpen(false)
    }
  }

  const handleDeleteAudio = async () => {
    if (!audioToDelete) return

    try {
      setLoading(true)
      const res = await deleteAudio(audioToDelete.id)

      if (res.success) {
        toast({ title: "Success", description: "Audio deleted successfully" })
        setDeleteConfirm(false)
        setTimeout(async () => {
          setAudioToDelete(null)
          await loadAudio()
        }, 200)
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete audio", variant: "destructive" })
      }
      setAudioToDelete(null)
      setDeleteConfirm(false)
    } catch (error) {
      toast({ title: "Error", variant: "destructive", description: "Network Error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audio Library</h1>
        <p className="text-muted-foreground mt-2">Upload and manage audio files</p>
      </div>

      {playingId && (
        <Card className="mb-6 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Volume2 className="w-4 h-4" />
              Now Playing
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="font-medium">{audioFiles.find((a) => a.id === playingId)?.title}</p>
              <audio
                ref={audioRef}
                onEnded={() => {
                  setIsPlaying(false)
                  setPlayingId(null)
                }}
                crossOrigin="anonymous"
                className="w-full mt-2"
                controls
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setPlayingId(null)
                setIsPlaying(false)
                if (audioRef.current) {
                  audioRef.current.pause()
                }
              }}
            >
              Close
            </Button>
          </CardContent>
        </Card>
      )}

      <AudioTable
        audio={audioFiles}
        currentUserRole={currentUser?.role || ""}
        onEdit={(audio) => {
          setSelectedAudio(audio)
          setModalOpen(true)
        }}
        onDelete={(audio) => {
          setAudioToDelete(audio)
          setDeleteConfirm(true)
        }}
        onPlay={handlePlayAudio}
        onCreateNew={() => {
          setSelectedAudio(null)
          setModalOpen(true)
        }}
        loading={loading}
      />

      <AudioModal
        open={modalOpen}
        audio={selectedAudio}
        onOpenChange={setModalOpen}
        onSave={handleSaveAudio}
        loading={loading}
      />

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Audio</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{audioToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAudio}
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
