"use client"

import { useState, useMemo } from "react"
import type { Audio } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Plus, Play, Search, X, SlidersHorizontal, ListPlus } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { checkPermission } from "@/lib/rbac"
import { formatDuration } from "@/lib/validators"

interface AudioTableProps {
  audio: Audio[]
  branches?: any[]
  currentUserRole: string
  onEdit: (audio: Audio) => void
  onDelete: (audio: Audio) => void
  onPlay: (audio: Audio) => void
  onCreateNew: () => void
  onAddFromLink: () => void
  onAddToPlaylist?: (audio: Audio, branchId: string | 'ALL') => void
  loading?: boolean
}

const AUDIO_TYPES = ["ALL", "PRAYER", "FESTIVAL", "DAILY", "OTHER"] as const
const LANGUAGES = ["ALL", "Hindi", "English", "Gujarati", "Bengali", "Marathi", "OTHER"] as const

export function AudioTable({
  audio,
  branches = [],
  currentUserRole,
  onEdit,
  onDelete,
  onPlay,
  onCreateNew,
  onAddFromLink,
  onAddToPlaylist,
  loading = false,
}: AudioTableProps) {
  const canModify = checkPermission(currentUserRole as any, "canUploadAudio")

  // ── Filter state ──
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("ALL")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ALL")

  // ── Derive unique values from data (in case there are types/languages not in the constant lists) ──
  const availableTypes = useMemo(() => {
    const fromData = Array.from(new Set(audio.map((a) => a.audio_type)))
    const merged = Array.from(new Set([...AUDIO_TYPES.slice(1), ...fromData]))
    return merged
  }, [audio])

  const availableLanguages = useMemo(() => {
    const fromData = Array.from(new Set(audio.map((a) => a.language)))
    const merged = Array.from(new Set([...LANGUAGES.slice(1), ...fromData]))
    return merged
  }, [audio])

  // ── Client-side filtering ──
  const filteredAudio = useMemo(() => {
    return audio.filter((file) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        file.title.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesType = selectedType === "ALL" || file.audio_type === selectedType
      const matchesLanguage = selectedLanguage === "ALL" || file.language === selectedLanguage

      return matchesSearch && matchesType && matchesLanguage
    })
  }, [audio, searchQuery, selectedType, selectedLanguage])

  const hasActiveFilters = searchQuery.trim() !== "" || selectedType !== "ALL" || selectedLanguage !== "ALL"

  const clearFilters = () => {
    setSearchQuery("")
    setSelectedType("ALL")
    setSelectedLanguage("ALL")
  }

  const getAudioTypeColor = (type: string) => {
    switch (type) {
      case "PRAYER":
        return "bg-blue-100 text-blue-800"
      case "FESTIVAL":
        return "bg-purple-100 text-purple-800"
      case "DAILY":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Audio Library</CardTitle>

        {canModify && (
          <div className="flex gap-2">
            <Button onClick={onCreateNew} size="sm" disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              Upload Audio
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={onAddFromLink}
              disabled={loading}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add From Link
            </Button>
          </div>
        )}
      </CardHeader>

      {/* ── Search & Filter Bar ── */}
      <div className="px-6 pb-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 p-4 rounded-xl bg-muted/40 backdrop-blur-sm border border-border/60">
          {/* Search input */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              id="audio-search"
              placeholder="Search by title…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9 h-9 bg-background/70 border-border/50 focus-visible:ring-primary/30 rounded-lg text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Divider (desktop) */}
          <div className="hidden md:block w-px h-7 bg-border/60" />

          {/* Type filter */}
          <div className="flex items-center gap-2 min-w-0">
            <label htmlFor="filter-type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              Type
            </label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 rounded-lg border border-border/50 bg-background/70 px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer min-w-[120px]"
            >
              <option value="ALL">All Types</option>
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-2 min-w-0">
            <label htmlFor="filter-language" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              Language
            </label>
            <select
              id="filter-language"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="h-9 rounded-lg border border-border/50 bg-background/70 px-3 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all cursor-pointer min-w-[120px]"
            >
              <option value="ALL">All Languages</option>
              {availableLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg shrink-0"
            >
              <X className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {/* Active filter summary */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 mt-2.5 text-xs text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              Showing <span className="font-bold text-foreground">{filteredAudio.length}</span> of{" "}
              <span className="font-bold text-foreground">{audio.length}</span> audio files
            </span>
          </div>
        )}
      </div>

      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Language</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-center">Preview</TableHead>
                {canModify && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudio.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canModify ? 6 : 5} className="text-center text-muted-foreground py-8">
                    {hasActiveFilters ? (
                      <div className="flex flex-col items-center gap-2">
                        <Search className="w-8 h-8 text-muted-foreground/50" />
                        <p>No audio files match your filters</p>
                        <Button variant="link" size="sm" onClick={clearFilters} className="text-primary">
                          Clear all filters
                        </Button>
                      </div>
                    ) : (
                      "No audio files found"
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAudio.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.title}</TableCell>
                    <TableCell>
                      <Badge className={getAudioTypeColor(file.audio_type)}>{file.audio_type}</Badge>
                    </TableCell>
                    <TableCell>{file.language}</TableCell>
                    <TableCell>{formatDuration(file.duration_seconds)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onPlay(file)}
                        disabled={loading}
                        className="mx-auto"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    {canModify && (
                      <TableCell className="text-right space-x-1">
                        {onAddToPlaylist && branches.length > 0 && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" disabled={loading} title="Add to Playlist">
                                <ListPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-xl border-border/50">
                              <DropdownMenuLabel>Add to Playlist</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => onAddToPlaylist(file, 'ALL')} className="font-semibold text-primary focus:text-primary focus:bg-primary/10">
                                All Branches
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {branches.map(b => (
                                <DropdownMenuItem key={b.id} onClick={() => onAddToPlaylist(file, String(b.id))}>
                                  {b.name}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => onEdit(file)} disabled={loading}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(file)}
                          disabled={loading}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
