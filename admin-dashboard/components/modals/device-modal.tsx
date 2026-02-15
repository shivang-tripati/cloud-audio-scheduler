"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Device, Branch } from "@/lib/types"
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

interface DeviceModalProps {
  open: boolean
  device?: Device | null
  branches: Branch[]
  onOpenChange: (open: boolean) => void
  onSave: (device: Partial<Device>) => Promise<void>
  loading?: boolean
}

export function DeviceModal({ open, device, branches, onOpenChange, onSave, loading = false }: DeviceModalProps) {
  const [formData, setFormData] = useState({

    device_name: "",
    branch_id: "",
  })
  const [error, setError] = useState("")

  useEffect(() => {
    if (device) {
      setFormData({
        device_name: device.device_name,
        branch_id: device.branch_id,
      })
    } else {
      setFormData({
        device_name: "",
        branch_id: "",
      })
    }
    setError("")
  }, [device, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")


    if (!formData.device_name.trim()) {
      setError("Device name is required")
      return
    }

    if (!formData.branch_id) {
      setError("Branch assignment is required")
      return
    }

    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (err) {
      setError("Failed to save device")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{device ? "Edit Device" : "Register Device"}</DialogTitle>
          <DialogDescription>
            {device ? "Update device information" : "Register a new audio player device"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* <div className="space-y-2">
            <label className="text-sm font-medium">Device Code</label>
            <Input
              value={formData.device_code}
              onChange={(e) => setFormData({ ...formData, device_code: e.target.value })}
              placeholder="DEV-MUM-001"
              disabled={loading || !!device}
            />
          </div> */}

          <div className="space-y-2">
            <label className="text-sm font-medium">Device Name</label>
            <Input
              value={formData.device_name}
              onChange={(e) => setFormData({ ...formData, device_name: e.target.value })}
              placeholder="Mumbai Central - Main"
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assign to Branch</label>
            <Select
              value={formData.branch_id}
              onValueChange={(branchId) => setFormData({ ...formData, branch_id: branchId })}
            >
              <SelectTrigger disabled={loading}>
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name} ({branch.branch_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
              {device ? "Update" : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
