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
    <Card className="border bg-card/40 backdrop-blur-md shadow-sm rounded-2xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 bg-card/20 py-5">
        <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          Branch Directory
        </CardTitle>
        {canModify && (
          <Button onClick={onCreateNew} size="sm" disabled={loading} className="gap-2 shadow-md hover:scale-[1.03] transition-all">
            <Plus className="w-4 h-4" />
            Add Branch
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto no-scrollbar">
          <Table>
            <TableHeader className="bg-card/50">
              <TableRow className="border-b border-border/50 hover:bg-transparent">
                <TableHead className="font-bold text-foreground py-4 pl-6 uppercase tracking-widest text-[10px]">Code</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Name</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">City</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Region</TableHead>
                <TableHead className="font-bold text-foreground py-4 uppercase tracking-widest text-[10px]">Status</TableHead>
                {canModify && <TableHead className="text-right py-4 pr-6 uppercase tracking-widest text-[10px]">Actions</TableHead>}
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
                  <TableRow key={branch.id} className="border-b border-border/40 hover:bg-primary/5 transition-colors group">
                    <TableCell className="font-bold text-sm py-4 pl-6 text-foreground group-hover:text-primary transition-colors">{branch.branch_code}</TableCell>
                    <TableCell className="text-sm font-medium">{branch.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{branch.city}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{branch.region}</TableCell>
                    <TableCell className="py-4">
                      <Badge 
                        variant="secondary"
                        className={`font-black uppercase tracking-tighter text-[10px] px-2.5 py-0.5 border ${branch.is_active 
                          ? "bg-green-500/10 text-green-500 border-green-500/20" 
                          : "bg-red-500/10 text-red-500 border-red-500/20"}`}
                      >
                        {branch.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    {canModify && (
                    <TableCell className="text-right py-4 pr-6">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(branch)}
                          disabled={loading}
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(branch)}
                          disabled={loading}
                          className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
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
