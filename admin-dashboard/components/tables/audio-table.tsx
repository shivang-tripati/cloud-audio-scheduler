"use client"

import type { Audio } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Plus, Play } from "lucide-react"
import { checkPermission } from "@/lib/rbac"
import { formatDuration } from "@/lib/validators"

interface AudioTableProps {
  audio: Audio[]
  currentUserRole: string
  onEdit: (audio: Audio) => void
  onDelete: (audio: Audio) => void
  onPlay: (audio: Audio) => void
  onCreateNew: () => void
  onAddFromLink: () => void
  loading?: boolean
}

export function AudioTable({
  audio,
  currentUserRole,
  onEdit,
  onDelete,
  onPlay,
  onCreateNew,
  onAddFromLink,
  loading = false,
}: AudioTableProps) {
  const canModify = checkPermission(currentUserRole as any, "canUploadAudio")

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
              {audio.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canModify ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No audio files found
                  </TableCell>
                </TableRow>
              ) : (
                audio.map((file) => (
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
                      <TableCell className="text-right space-x-2">
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
