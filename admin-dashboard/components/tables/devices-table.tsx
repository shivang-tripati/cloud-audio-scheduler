"use client"

import type { Device, Branch } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Plus, Circle } from "lucide-react"
import { checkPermission } from "@/lib/rbac"
import { formatDistanceToNow } from "date-fns"

interface DevicesTableProps {
  devices: Device[]
  branches: Branch[]
  currentUserRole: string
  onEdit: (device: Device) => void
  onDelete: (device: Device) => void
  onReset: (id: string) => void
  onCreateNew: () => void
  loading?: boolean
}

export function DevicesTable({
  devices,
  branches,
  currentUserRole,
  onEdit,
  onDelete,
  onCreateNew,
  onReset,
  loading = false,
}: DevicesTableProps) {
  const canModify = checkPermission(currentUserRole as any, "canRegisterDevice")

  const getBranchName = (branchId: string) => {
    return branches.find((b) => b.id === branchId)?.name || "Unknown"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Devices Management</CardTitle>
        {canModify && (
          <Button onClick={onCreateNew} size="sm" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Register Device
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Seen</TableHead>
                {canModify && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {devices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canModify ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No devices found
                  </TableCell>
                </TableRow>
              ) : (
                devices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.device_code}</TableCell>
                    <TableCell>{device.device_name}</TableCell>
                    <TableCell>{getBranchName(device.branch_id)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={device.status === "ONLINE" ? "outline" : "destructive"}
                        className="flex items-center gap-1 w-fit"
                      >
                        <Circle
                          className={`w-2 h-2 ${device.status === "ONLINE" ? "fill-green-500 text-green-500" : "fill-red-500 text-red-500"}`}
                        />
                        {device.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(device.last_seen), { addSuffix: true })}
                    </TableCell>
                    {canModify && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(device)} disabled={loading}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => onReset(device.id)}
                        >
                          Reset Device
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(device)}
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
