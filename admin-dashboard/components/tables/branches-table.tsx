"use client"

import type { Branch } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Edit2, Trash2, Plus } from "lucide-react"
import { checkPermission } from "@/lib/rbac"

interface BranchesTableProps {
  branches: Branch[]
  currentUserRole: string
  onEdit: (branch: Branch) => void
  onDelete: (branch: Branch) => void
  onCreateNew: () => void
  loading?: boolean
}

export function BranchesTable({
  branches,
  currentUserRole,
  onEdit,
  onDelete,
  onCreateNew,
  loading = false,
}: BranchesTableProps) {
  const canModify = checkPermission(currentUserRole as any, "canEditBranch")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Branches Management</CardTitle>
        {canModify && (
          <Button onClick={onCreateNew} size="sm" disabled={loading}>
            <Plus className="w-4 h-4 mr-2" />
            Add Branch
          </Button>
        )}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Status</TableHead>
                {canModify && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canModify ? 6 : 5} className="text-center text-muted-foreground py-8">
                    No branches found
                  </TableCell>
                </TableRow>
              ) : (
                branches.map((branch) => (
                  <TableRow key={branch.id}>
                    <TableCell className="font-medium">{branch.branch_code}</TableCell>
                    <TableCell>{branch.name}</TableCell>
                    <TableCell>{branch.city}</TableCell>
                    <TableCell>{branch.region}</TableCell>
                    <TableCell>
                      <Badge variant={branch.is_active ? "outline" : "destructive"}>
                        {branch.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canModify && (
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(branch)} disabled={loading}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(branch)}
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
