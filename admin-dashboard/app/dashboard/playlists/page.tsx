"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Branch } from "@/lib/types"
import type { PlaylistItem } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getBranches, getAudio } from "@/lib/api-client"
import {
    getBranchPlaylist,
    addToPlaylist,
    removeFromPlaylist,
    togglePlaylistItem,
    reorderPlaylist,
    clearPlaylist,
} from "@/lib/api-client"
import { PlaylistTable } from "@/components/tables/playlist-table"
import { AddTrackModal } from "@/components/modals/add-track-modal"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Radio, Plus, Trash2, Building2 } from "lucide-react"

export default function PlaylistPage() {
    const router = useRouter()
    const { toast } = useToast()

    const [currentUser, setCurrentUser] = useState<any>(null)
    const [branches, setBranches] = useState<Branch[]>([])
    const [selectedBranchId, setSelectedBranchId] = useState<string>("")
    const [playlist, setPlaylist] = useState<PlaylistItem[]>([])
    const [audioFiles, setAudioFiles] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [addModalOpen, setAddModalOpen] = useState(false)
    const [clearConfirm, setClearConfirm] = useState(false)
    const [removeConfirm, setRemoveConfirm] = useState(false)
    const [itemToRemove, setItemToRemove] = useState<PlaylistItem | null>(null)

    // ── Auth guard ──
    useEffect(() => {
        const user = getCurrentUser()
        if (!user) { router.push("/login"); return }
        setCurrentUser(user)
        loadInitialData()
    }, [router])

    // ── Reload playlist when branch changes ──
    useEffect(() => {
        if (selectedBranchId) loadPlaylist(selectedBranchId)
    }, [selectedBranchId])

    const loadInitialData = async () => {
        try {
            setLoading(true)
            const [branchesRes, audioRes] = await Promise.all([getBranches(), getAudio()])

            const branchList = branchesRes.data || []
            const audioList = audioRes.data || []

            setBranches(branchList)
            setAudioFiles(audioList)

            // Auto-select first branch
            if (branchList.length > 0) {
                setSelectedBranchId(String(branchList[0].id))
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load data", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const loadPlaylist = async (branchId: string) => {
        try {
            setLoading(true)
            const res = await getBranchPlaylist(branchId)
            if (res.success && res.data) {
                const data = res.data as PlaylistItem[]
                setPlaylist(data)
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to load playlist", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // ── Add track ──
    const handleAddTrack = async (audioId: number) => {
        try {
            setLoading(true)
            const res = await addToPlaylist(selectedBranchId, audioId)
            if (res.success) {
                toast({ title: "Success", description: "Track added to playlist" })
                await loadPlaylist(selectedBranchId)
                setAddModalOpen(false)
            } else {
                toast({ title: "Error", description: res.error?.message || "Failed to add track", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to add track", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // ── Remove track ──
    const handleRemoveTrack = async () => {
        if (!itemToRemove) return
        try {
            setLoading(true)
            const res = await removeFromPlaylist(selectedBranchId, itemToRemove.id)
            if (res.success) {
                toast({ title: "Success", description: "Track removed" })
                await loadPlaylist(selectedBranchId)
            } else {
                toast({ title: "Error", description: res.error?.message || "Failed to remove", variant: "destructive" })
            }
            setItemToRemove(null)
            setRemoveConfirm(false)
        } catch (error) {
            toast({ title: "Error", description: "Failed to remove track", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // ── Toggle active/inactive ──
    const handleToggle = async (item: PlaylistItem) => {
        try {
            const res = await togglePlaylistItem(selectedBranchId, item.id)
            if (res.success) {
                const data = res.data as { is_active: boolean }
                toast({ title: "Success", description: data?.is_active ? "Track enabled" : "Track disabled" })
                await loadPlaylist(selectedBranchId)
            } else {
                toast({ title: "Error", description: "Failed to toggle track", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to toggle track", variant: "destructive" })
        }
    }

    // ── Reorder (drag-and-drop result) ──
    const handleReorder = async (reorderedItems: PlaylistItem[]) => {
        // Optimistic update
        setPlaylist(reorderedItems)
        try {
            const items = reorderedItems.map((item, index) => ({
                id: item.id,
                order_index: index,
            }))
            const res = await reorderPlaylist(selectedBranchId, items)
            if (!res.success) {
                // Revert on failure
                await loadPlaylist(selectedBranchId)
                toast({ title: "Error", description: "Failed to save order", variant: "destructive" })
            }
        } catch (error) {
            await loadPlaylist(selectedBranchId)
            toast({ title: "Error", description: "Failed to save order", variant: "destructive" })
        }
    }

    // ── Clear playlist ──
    const handleClear = async () => {
        try {
            setLoading(true)
            const res = await clearPlaylist(selectedBranchId)
            if (res.success) {
                toast({ title: "Success", description: "Playlist cleared" })
                setPlaylist([])
                setClearConfirm(false)
            } else {
                toast({ title: "Error", description: "Failed to clear playlist", variant: "destructive" })
            }
        } catch (error) {
            toast({ title: "Error", description: "Failed to clear playlist", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const selectedBranch = branches.find((b) => String(b.id) === selectedBranchId)

    // Audio not yet in playlist (for add modal)
    const availableAudio = audioFiles.filter(
        (a) => a.is_active && !playlist.some((p) => p.audio_id === a.id)
    )

    const activeCount = playlist.filter((p) => p.is_active).length
    const totalDuration = playlist
        .filter((p) => p.is_active)
        .reduce((acc, p) => acc + (p.audio?.duration_seconds || 0), 0)

    const fmtDuration = (sec: number) => {
        const m = Math.floor(sec / 60)
        const s = sec % 60
        return `${m}m ${s}s`
    }

    return (
        <div>
            {/* Header — matches branches/devices pattern */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">FM Radio Playlists</h1>
                <p className="text-muted-foreground mt-2">
                    Manage branch-level continuous audio playlists
                </p>
            </div>

            {/* Branch selector + stats bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                        <SelectContent>
                            {branches.map((b) => (
                                <SelectItem key={b.id} value={String(b.id)}>
                                    {b.name} — {b.city}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Live stats for selected branch */}
                    {playlist.length > 0 && (
                        <div className="hidden sm:flex items-center gap-2">
                            <Badge variant="secondary">
                                <Radio className="w-3 h-3 mr-1" />
                                {activeCount} active tracks
                            </Badge>
                            <Badge variant="outline">{fmtDuration(totalDuration)} loop</Badge>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {playlist.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setClearConfirm(true)}
                            disabled={loading}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Clear Playlist
                        </Button>
                    )}
                    <Button
                        size="sm"
                        onClick={() => setAddModalOpen(true)}
                        disabled={loading || !selectedBranchId}
                    >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Track
                    </Button>
                </div>
            </div>

            {/* Playlist table */}
            <PlaylistTable
                playlist={playlist}
                loading={loading}
                currentUserRole={currentUser?.role || ""}
                onToggle={handleToggle}
                onRemove={(item) => {
                    setItemToRemove(item)
                    setRemoveConfirm(true)
                }}
                onReorder={handleReorder}
            />

            {/* Add Track Modal */}
            <AddTrackModal
                open={addModalOpen}
                onOpenChange={setAddModalOpen}
                audioFiles={availableAudio}
                loading={loading}
                onAdd={handleAddTrack}
            />

            {/* Remove confirm */}
            <AlertDialog open={removeConfirm} onOpenChange={setRemoveConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Track</AlertDialogTitle>
                        <AlertDialogDescription>
                            Remove &quot;{itemToRemove?.audio?.title}&quot; from this branch&apos;s playlist?
                            The audio file will not be deleted.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemoveTrack}
                            disabled={loading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Clear confirm */}
            <AlertDialog open={clearConfirm} onOpenChange={setClearConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Clear Playlist</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove all {playlist.length} tracks from{" "}
                            <strong>{selectedBranch?.name}</strong>&apos;s playlist. All devices at this
                            branch will stop FM radio playback.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleClear}
                            disabled={loading}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Clear Playlist
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}