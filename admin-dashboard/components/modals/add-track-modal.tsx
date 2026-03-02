"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Music2, Plus, Loader2 } from "lucide-react"

const AUDIO_TYPE_BADGE: Record<string, string> = {
    PRAYER: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    FESTIVAL: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    DAILY: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
}

const fmtDuration = (sec: number) => {
    if (!sec) return "--:--"
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, "0")}`
}

interface AddTrackModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    audioFiles: any[]
    loading: boolean
    onAdd: (audioId: number) => void
}

export function AddTrackModal({
    open,
    onOpenChange,
    audioFiles,
    loading,
    onAdd,
}: AddTrackModalProps) {
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("ALL")
    const [addingId, setAddingId] = useState<number | null>(null)

    const filtered = audioFiles.filter((a) => {
        if (typeFilter !== "ALL" && a.audio_type !== typeFilter) return false
        if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const handleAdd = async (audioId: number) => {
        setAddingId(audioId)
        await onAdd(audioId)
        setAddingId(null)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Track to Playlist</DialogTitle>
                    <DialogDescription>
                        Select an audio file to add to this branch&apos;s FM radio playlist.
                    </DialogDescription>
                </DialogHeader>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search audio..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>

                {/* Type filter pills */}
                <div className="flex gap-2 flex-wrap">
                    {["ALL", "PRAYER", "FESTIVAL", "DAILY", "OTHER"].map((type) => (
                        <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className={[
                                "px-3 py-1 text-xs font-semibold rounded-full border transition-colors",
                                typeFilter === type
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-muted-foreground border-border hover:border-primary/50",
                            ].join(" ")}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                {/* Audio list */}
                <ScrollArea className="h-72 -mx-1 px-1">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                            <Music2 className="w-8 h-8 opacity-30" />
                            <p className="text-sm">No audio found</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filtered.map((audio) => (
                                <div
                                    key={audio.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                                >
                                    <div className="p-2 rounded-md bg-primary/10 shrink-0">
                                        <Music2 className="w-4 h-4 text-primary" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{audio.title}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${AUDIO_TYPE_BADGE[audio.audio_type] || AUDIO_TYPE_BADGE.OTHER}`}>
                                                {audio.audio_type}
                                            </span>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {fmtDuration(audio.duration_seconds)}
                                            </span>
                                            <span className="text-xs text-muted-foreground">{audio.language}</span>
                                        </div>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleAdd(audio.id)}
                                        disabled={loading || addingId === audio.id}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                                    >
                                        {addingId === audio.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                <div className="flex justify-end pt-2 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Done
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}