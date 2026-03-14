"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Device, Branch } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getDevices, getBranches, registerDevice, updateDevice, deleteDevice, resetDevice } from "@/lib/api-client"
import { DevicesTable } from "@/components/tables/devices-table"
import { DeviceModal } from "@/components/modals/device-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

export default function DevicesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [devices, setDevices] = useState<Device[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)
    loadData()
  }, [router])

  const loadData = async () => {
    try {
      setLoading(true)
      const [devicesRes, branchesRes] = await Promise.all([getDevices(), getBranches()])

      if (devicesRes.success && devicesRes.data) {
        setDevices(devicesRes.data)
      }
      if (branchesRes.success && branchesRes.data) {
        setBranches(branchesRes.data)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load devices", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDevice = async (formData: Partial<Device>) => {
    try {
      setLoading(true)
      let res
      if (selectedDevice) {
        res = await updateDevice(selectedDevice.id, formData)
      } else {
        res = await registerDevice(formData)
      }

      if (res.success) {
        toast({ title: "Success", description: selectedDevice ? "Device updated successfully" : "Device registered successfully" })
        await loadData()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to save device", variant: "destructive" })
      }
      setSelectedDevice(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save device", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return

    try {
      setLoading(true)
      const res = await deleteDevice(deviceToDelete.id)

      if (res.success) {
        toast({ title: "Success", description: "Device deleted successfully" })
        await loadData()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete device", variant: "destructive" })
      }
      setDeviceToDelete(null)
      setDeleteConfirm(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete device", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const onResetDevice = async (id: string) => {
    try {
      setLoading(true)
      const res = await resetDevice(id)

      if (res.success) {
        toast({ title: "Success", description: "Device reset successfully" })
        await loadData()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to reset device", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reset device", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-extrabold tracking-tight leading-tight text-3xl md:text-4xl">
            <span className="text-red-500 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500/60">
              Terminal
            </span>{" "}
            Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Provision and oversee audio player endpoints</p>
        </div>
      </div>

      <DevicesTable
        devices={devices}
        branches={branches}
        currentUserRole={currentUser?.role || ""}
        onEdit={(device) => {
          setSelectedDevice(device)
          setModalOpen(true)
        }}
        onReset={onResetDevice}
        onDelete={(device) => {
          setDeviceToDelete(device)
          setDeleteConfirm(true)
        }}
        onCreateNew={() => {
          setSelectedDevice(null)
          setModalOpen(true)
        }}
        loading={loading}
      />

      <DeviceModal
        open={modalOpen}
        device={selectedDevice}
        branches={branches}
        onOpenChange={setModalOpen}
        onSave={handleSaveDevice}
        loading={loading}
      />

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Device</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {deviceToDelete?.device_name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDevice}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
