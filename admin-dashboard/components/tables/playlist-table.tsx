"use client"

import { useState, useRef, useMemo } from "react"
import type { PlaylistItem } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { GripVertical, Trash2, Music2, Radio, Inbox, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

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

interface PlaylistTableProps {
    playlist: PlaylistItem[]
    loading: boolean
    currentUserRole: string
    onToggle: (item: PlaylistItem) => void
    onRemove: (item: PlaylistItem) => void
    onReorder: (items: PlaylistItem[]) => void
}

export function PlaylistTable({
    playlist,
    loading,
    currentUserRole,
    onToggle,
    onRemove,
    onReorder,
}: PlaylistTableProps) {
    const canEdit = ["SUPER_ADMIN", "ADMIN"].includes(currentUserRole)

    // Filter states
    const [searchQuery, setSearchQuery] = useState("")
    const [typeFilter, setTypeFilter] = useState<string>("ALL")
    const [languageFilter, setLanguageFilter] = useState<string>("ALL")

    const { filteredPlaylist, uniqueTypes, uniqueLanguages } = useMemo(() => {
        const types = new Set<string>()
        const langs = new Set<string>()
        
        playlist.forEach(item => {
            if (item.audio?.audio_type) types.add(item.audio.audio_type)
            if (item.audio?.language) langs.add(item.audio.language)
        })

        const filtered = playlist.filter((item) => {
            const titleMatch = item.audio?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false
            const typeMatch = typeFilter === "ALL" || item.audio?.audio_type === typeFilter
            const langMatch = languageFilter === "ALL" || item.audio?.language === languageFilter
            return titleMatch && typeMatch && langMatch
        })

        return {
            filteredPlaylist: filtered,
            uniqueTypes: Array.from(types).sort(),
            uniqueLanguages: Array.from(langs).sort()
        }
    }, [playlist, searchQuery, typeFilter, languageFilter])

    const isFiltered = searchQuery !== "" || typeFilter !== "ALL" || languageFilter !== "ALL"
    const canReorder = canEdit && !isFiltered

    // Drag state
    const dragIndex = useRef<number | null>(null)
    const [draggingOver, setDraggingOver] = useState<number | null>(null)

    const handleDragStart = (index: number) => {
        if (!canReorder) return
        dragIndex.current = index
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
        if (!canReorder) return
        setDraggingOver(index)
    }

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (!canReorder) return
        if (dragIndex.current === null || dragIndex.current === dropIndex) {
            setDraggingOver(null)
            return
        }

        const reordered = [...playlist]
        const [moved] = reordered.splice(dragIndex.current, 1)
        reordered.splice(dropIndex, 0, moved)

        dragIndex.current = null
        setDraggingOver(null)
        onReorder(reordered)
    }

    const handleDragEnd = () => {
        dragIndex.current = null
        setDraggingOver(null)
    }

    // ── Loading skeleton ──
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </CardContent>
            </Card>
        )
    }

    // ── Empty state ──
    if (playlist.length === 0) {
        return (
            <Card>
                <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="p-4 rounded-full bg-muted">
                        <Inbox className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-lg">No tracks in playlist</p>
                        <p className="text-muted-foreground text-sm mt-1">
                            Add audio tracks to start FM radio for this branch
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="flex flex-col overflow-hidden">
            <CardHeader className="flex flex-col gap-4 pb-4 border-b border-border/50">
                <div className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Radio className="w-4 h-4 text-primary" />
                        Playlist — {playlist.length} track{playlist.length !== 1 && 's'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        {canReorder ? "Drag rows to reorder" : isFiltered ? "Dragging disabled while filtering" : "View only"}
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] bg-background/50">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                            <SelectItem value="ALL">All Types</SelectItem>
                            {uniqueTypes.map(t => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={languageFilter} onValueChange={setLanguageFilter}>
                        <SelectTrigger className="w-full sm:w-[150px] bg-background/50">
                            <SelectValue placeholder="All Languages" />
                        </SelectTrigger>
                        <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                            <SelectItem value="ALL">All Languages</SelectItem>
                            {uniqueLanguages.map(l => (
                                <SelectItem key={l} value={l}>{l}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {canEdit && <TableHead className="w-10"></TableHead>}
                            <TableHead className="w-10">#</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead className="hidden sm:table-cell">Type</TableHead>
                            <TableHead className="hidden md:table-cell">Language</TableHead>
                            <TableHead className="hidden md:table-cell">Duration</TableHead>
                            <TableHead>Active</TableHead>
                            {canEdit && <TableHead className="w-16 text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {filteredPlaylist.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={canEdit ? 8 : 7} className="h-24 text-center text-muted-foreground">
                                    No results matched your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPlaylist.map((item) => {
                                const realIndex = playlist.findIndex(p => p.id === item.id)

                                return (
                                    <TableRow
                                        key={item.id}
                                        draggable={canReorder}
                                        onDragStart={() => handleDragStart(realIndex)}
                                        onDragOver={(e) => handleDragOver(e, realIndex)}
                                        onDrop={(e) => handleDrop(e, realIndex)}
                                        onDragEnd={handleDragEnd}
                                        className={[
                                            canReorder ? "cursor-grab active:cursor-grabbing" : "",
                                            draggingOver === realIndex ? "bg-primary/5 border-t-2 border-primary" : "",
                                            !item.is_active ? "opacity-50" : "",
                                        ].join(" ")}
                                    >
                                        {/* Drag handle */}
                                        {canEdit && (
                                            <TableCell className="w-10">
                                                {canReorder ? (
                                                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                                                ) : (
                                                    <GripVertical className="w-4 h-4 text-muted-foreground/30 cursor-not-allowed" />
                                                )}
                                            </TableCell>
                                        )}

                                        {/* Position */}
                                        <TableCell className="w-10 text-muted-foreground text-sm font-mono">
                                            {realIndex + 1}
                                        </TableCell>

                                        {/* Title */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 rounded-md bg-primary/10 shrink-0">
                                                    <Music2 className="w-3.5 h-3.5 text-primary" />
                                                </div>
                                                <span className={`font-medium text-sm ${!item.is_active ? "line-through text-muted-foreground" : ""}`}>
                                                    {item.audio?.title || "Unknown"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        {/* Type */}
                                        <TableCell className="hidden sm:table-cell">
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${AUDIO_TYPE_BADGE[item.audio?.audio_type] || AUDIO_TYPE_BADGE.OTHER}`}>
                                                {item.audio?.audio_type}
                                            </span>
                                        </TableCell>

                                        {/* Language */}
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                                            {item.audio?.language}
                                        </TableCell>

                                        {/* Duration */}
                                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground font-mono">
                                            {fmtDuration(item.audio?.duration_seconds)}
                                        </TableCell>

                                        {/* Toggle */}
                                        <TableCell>
                                            {canEdit ? (
                                                <Switch
                                                    checked={item.is_active}
                                                    onCheckedChange={() => onToggle(item)}
                                                    aria-label={item.is_active ? "Disable track" : "Enable track"}
                                                />
                                            ) : (
                                                <Badge variant={item.is_active ? "default" : "secondary"}>
                                                    {item.is_active ? "On" : "Off"}
                                                </Badge>
                                            )}
                                        </TableCell>

                                        {/* Remove */}
                                        {canEdit && (
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => onRemove(item)}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>

                {/* Loop indicator */}
                <div className="px-4 py-3 border-t border-muted/60 flex items-center gap-2 text-xs text-muted-foreground">
                    <Radio className="w-3 h-3" />
                    Loops continuously · Schedule interrupts resume from exact position
                </div>
            </CardContent>
        </Card>
    )
}