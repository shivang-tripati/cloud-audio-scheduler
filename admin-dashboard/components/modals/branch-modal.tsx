"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Branch } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Loader2 } from "lucide-react"
import { REGIONS, STATES } from "@/constants"

interface BranchModalProps {
  open: boolean
  branch?: Branch | null
  onOpenChange: (open: boolean) => void
  onSave: (branch: Partial<Branch>) => Promise<void>
  loading?: boolean
}

export function BranchModal({ open, branch, onOpenChange, onSave, loading = false }: BranchModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    state: "",
    region: "",
    is_active: true,
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (branch) {
      setFormData({
        name: branch.name,
        city: branch.city,
        state: branch.state,
        region: branch.region,
        is_active: branch.is_active,
      })
    } else {
      setFormData({
        name: "",
        city: "",
        state: "",
        region: "",
        is_active: true,
      })
    }
    setError("")
  }, [branch, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")


    if (!formData.name.trim()) {
      setError("Branch name is required")
      return
    }

    if (!formData.city.trim()) {
      setError("City is required")
      return
    }

    if (!formData.state.trim()) {
      setError("State is required")
      return
    }

    if (!formData.region) {
      setError("Region is required")
      return
    }

    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (err) {
      setError("Failed to save branch")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{branch ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          <DialogDescription>{branch ? "Update branch information" : "Create a new branch"}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* <div className="space-y-2">
            <label className="text-sm font-medium">Branch Code</label>
            <Input
              value={formData.branch_code}
              onChange={(e) => setFormData({ ...formData, branch_code: e.target.value })}
              placeholder="JN-MUM-01"
              disabled={loading || !!branch}
            />
          </div> */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Branch Name</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Mumbai Central"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Mumbai"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State</label>
              <Select value={formData.state} onValueChange={(state) => setFormData({ ...formData, state })}>
                <SelectTrigger disabled={loading}>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Region</label>
            <Select value={formData.region} onValueChange={(region) => setFormData({ ...formData, region })}>
              <SelectTrigger disabled={loading}>
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent  >
                {REGIONS.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={formData.is_active ? "active" : "inactive"}
              onValueChange={(value) => setFormData({ ...formData, is_active: value === "active" })}
            >
              <SelectTrigger disabled={loading}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              {branch ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
