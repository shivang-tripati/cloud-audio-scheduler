"use client"

import type { Schedule, Audio, Branch } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Plus } from "lucide-react"
import { checkPermission } from "@/lib/rbac"
import { formatScheduleWhen, formatTargets } from "@/lib/utils"

interface SchedulesTableProps {
  schedules: Schedule[]
  audioFiles: Audio[]
  branches: Branch[]
  currentUserRole: string
  onEdit: (schedule: Schedule) => void
  onDelete: (schedule: Schedule) => void
  onCreateNew: () => void
  loading?: boolean
}

export function SchedulesTable({
  schedules,
  audioFiles,
  branches,
  currentUserRole,
  onEdit,
  onDelete,

  onCreateNew,
  loading = false,
}: SchedulesTableProps) {
  const canModify = checkPermission(currentUserRole as any, "canCreateSchedule")

  const getAudioTitle = (audioId: string) => audioFiles.find((a) => a.id === audioId)?.title || "Unknown"
  const getBranchName = (branchId: string) => branches.find((b) => b.id === branchId)?.name || "All Branches"


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Schedules Management</CardTitle>
        {canModify && (
          <Button onClick={onCreateNew} size="sm" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Create Schedule
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Audio</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>When</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead>Targets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {schedules.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No schedules found
                  </TableCell>
                </TableRow>
              ) : (

                schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">{schedule.title}</TableCell>

                    <TableCell>
                      {schedule.audio?.title ?? "-"}
                    </TableCell>

                    <TableCell>
                      <Badge variant="outline">{schedule.schedule_mode}</Badge>
                    </TableCell>

                    <TableCell>
                      {formatScheduleWhen(schedule)}
                    </TableCell>

                    <TableCell className="text-center">
                      {schedule.play_count}×
                    </TableCell>

                    <TableCell>
                      {formatTargets(schedule, branches)}
                    </TableCell>

                    <TableCell>
                      <Badge variant={schedule.is_active ? "default" : "secondary"}>
                        {schedule.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>




                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(schedule)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
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
