"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { Branch } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getBranches, createBranch, updateBranch, deleteBranch } from "@/lib/api-client"
import { BranchesTable } from "@/components/tables/branches-table"
import { BranchModal } from "@/components/modals/branch-modal"
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

export default function BranchesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)
    loadBranches()
  }, [router])

  const loadBranches = async () => {
    try {
      setLoading(true)
      const res = await getBranches()
      if (res.success && res.data) {
        setBranches(res.data)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load branches", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveBranch = async (formData: Partial<Branch>) => {
    try {
      setLoading(true)
      let res
      if (selectedBranch) {
        res = await updateBranch(selectedBranch.id, formData)
      } else {
        res = await createBranch(formData)
      }

      if (res.success) {
        toast({ title: "Success", description: selectedBranch ? "Branch updated successfully" : "Branch created successfully" })
        await loadBranches()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to save branch", variant: "destructive" })
      }
      setSelectedBranch(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save branch", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBranch = async () => {
    if (!branchToDelete) return

    try {
      setLoading(true)
      const res = await deleteBranch(branchToDelete.id)

      if (res.success) {
        toast({ title: "Success", description: "Branch deleted successfully" })
        await loadBranches()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete branch", variant: "destructive" })
      }
      setBranchToDelete(null)
      setDeleteConfirm(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete branch", variant: "destructive" })
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
              Branch
            </span>{" "}
            Management
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Manage and monitor retail branch locations</p>
        </div>
      </div>

      <BranchesTable
        branches={branches}
        currentUserRole={currentUser?.role || ""}
        onEdit={(branch) => {
          setSelectedBranch(branch)
          setModalOpen(true)
        }}
        onDelete={(branch) => {
          setBranchToDelete(branch)
          setDeleteConfirm(true)
        }}
        onCreateNew={() => {
          setSelectedBranch(null)
          setModalOpen(true)
        }}
        loading={loading}
      />

      <BranchModal
        open={modalOpen}
        branch={selectedBranch}
        onOpenChange={setModalOpen}
        onSave={handleSaveBranch}
        loading={loading}
      />

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Branch</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {branchToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBranch}
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
