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
    <Card className="border bg-card/40 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/20 py-5">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Broadcast Registry
        </CardTitle>
        {canModify && (
          <Button onClick={onCreateNew} size="sm" disabled={loading} className="gap-2 shadow-md hover:scale-[1.03] transition-all">
            <Plus className="w-4 h-4" />
            Create Schedule
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-card/50">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="font-bold text-foreground py-4 pl-6 uppercase tracking-widest text-[10px]">Title</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Audio</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Mode</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">When</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Plays</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Targets</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Status</TableHead>
                <TableHead className="text-right py-4 pr-6 uppercase tracking-widest text-[10px]">Actions</TableHead>
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
                  <TableRow key={schedule.id} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                    <TableCell className="font-bold text-sm py-4 pl-6 text-foreground group-hover:text-primary transition-colors">{schedule.title}</TableCell>

                    <TableCell className="text-sm font-medium">{schedule.audio?.title ?? "-"}</TableCell>

                    <TableCell>
                      <Badge variant="outline" className="border-border/50 bg-background/40 backdrop-blur-sm rounded-full px-2 py-0.5 font-bold uppercase tracking-tighter text-[9px]">{schedule.schedule_mode}</Badge>
                    </TableCell>

                    <TableCell className="text-sm text-muted-foreground">{formatScheduleWhen(schedule)}</TableCell>

                    <TableCell className="text-center font-bold text-primary">{schedule.play_count}×</TableCell>

                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{formatTargets(schedule, branches)}</TableCell>

                    <TableCell className="py-4">
                      <Badge 
                        variant="secondary"
                        className={`font-black uppercase tracking-tighter text-[10px] px-2.5 py-0.5 border ${schedule.is_active 
                          ? "bg-primary/10 text-primary border-primary/20" 
                          : "bg-muted text-muted-foreground border-border/50"}`}
                      >
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
