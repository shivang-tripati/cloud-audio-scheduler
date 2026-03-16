"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Audio, AudioType, Language } from "@/lib/types"
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
import { AlertCircle, Loader2, Upload } from "lucide-react"
import { toast } from "@/hooks/use-toast"

const AUDIO_TYPES: AudioType[] = ["PRAYER", "FESTIVAL", "DAILY", "OTHER"]
const LANGUAGES: Language[] = ["Hindi", "English", "Gujarati", "Bengali", "Marathi"]

interface AudioModalProps {
  open: boolean
  audio?: Audio | null
  onOpenChange: (open: boolean) => void
  onSave: (data: { audio: Partial<Audio>, audio_file: File | null }) => Promise<void>
  loading?: boolean
}

export function AudioModal({ open, audio, onOpenChange, onSave, loading = false }: AudioModalProps) {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    audio_type: "DAILY" as AudioType,
    language: "Hindi" as Language,
    file_url: "",
  })
  const [error, setError] = useState("")
  const [fileName, setFileName] = useState("")

  useEffect(() => {
    if (audio) {
      setFormData({
        title: audio.title,
        audio_type: audio.audio_type,
        language: audio.language,
        file_url: audio.file_url,
      })
      setFileName(audio.file_url.split("/").pop() || "")
    } else {
      setFormData({
        title: "",
        audio_type: "DAILY",
        language: "Hindi",
        file_url: "",
      })
      setFileName("")
    }
    setError("")
  }, [audio, open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setSelectedFile(file);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.title.trim()) {
      setError("Audio title is required")
      return
    }

    if (!audio && !fileName) {
      setError("Please select an audio file")
      return
    }


    try {
      await onSave({ audio: formData, audio_file: selectedFile })
      onOpenChange(false)
    } catch (err) {
      toast({ title: "Error", description: "Failed to save audio file", variant: "destructive" })
      setError("Failed to save audio file")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{audio ? "Edit Audio" : "Upload Audio"}</DialogTitle>
          <DialogDescription>{audio ? "Update audio metadata" : "Upload and manage audio files"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Audio Title</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Morning Prayer"
              disabled={loading}
            />
          </div>

          {!audio && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload File</label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">{fileName || "Click to upload audio file"}</p>
                  <p className="text-xs text-muted-foreground mt-1">MP3, WAV, OGG supported</p>
                </label>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select
                value={formData.audio_type}
                onValueChange={(type) => setFormData({ ...formData, audio_type: type as AudioType })}
              >
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {AUDIO_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select
                value={formData.language}
                onValueChange={(lang) => setFormData({ ...formData, language: lang as Language })}
              >
                <SelectTrigger disabled={loading}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang} value={lang}>
                      {lang}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>


          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              {audio ? "Update" : "Upload"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
