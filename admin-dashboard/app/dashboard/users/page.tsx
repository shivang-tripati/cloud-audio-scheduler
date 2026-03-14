"use client"

import { AlertDialogFooter } from "@/components/ui/alert-dialog"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/types"
import { getCurrentUser } from "@/lib/auth"
import { getUsers, createUser, updateUser, deleteUser } from "@/lib/api-client"
import { UsersTable } from "@/components/tables/users-table"
import { UserModal } from "@/components/modals/user-modal"
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

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  useEffect(() => {
    const user = getCurrentUser()
    if (!user) {
      router.push("/login")
      return
    }
    setCurrentUser(user)
    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await getUsers()
      if (res.success && res.data) {
        setUsers(res.data)
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveUser = async (formData: Partial<User>) => {
    try {
      setLoading(true)
      let res
      if (selectedUser) {
        res = await updateUser(selectedUser.id, formData)
      } else {
        res = await createUser(formData)
      }

      if (res.success) {
        toast({ title: "Success", description: selectedUser ? "User updated successfully" : "User created successfully" })
        await loadUsers()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to save user", variant: "destructive" })
      }
      setSelectedUser(null)
    } catch (error) {
      toast({ title: "Error", description: "Failed to save user", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return

    try {
      setLoading(true)
      const res = await deleteUser(userToDelete.id)

      if (res.success) {
        toast({ title: "Success", description: "User deleted successfully" })
        await loadUsers()
      } else {
        toast({ title: "Error", description: res.error?.message || "Failed to delete user", variant: "destructive" })
      }
      setUserToDelete(null)
      setDeleteConfirm(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete user", variant: "destructive" })
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
              Access
            </span>{" "}
            Control
          </h1>
          <p className="text-muted-foreground mt-1 text-sm font-medium">Manage administrative privileges and user roles</p>
        </div>
      </div>

      <UsersTable
        users={users}
        currentUserRole={currentUser?.role || ""}
        onEdit={(user) => {
          setSelectedUser(user)
          setModalOpen(true)
        }}
        onDelete={(user) => {
          setUserToDelete(user)
          setDeleteConfirm(true)
        }}
        onCreateNew={() => {
          setSelectedUser(null)
          setModalOpen(true)
        }}
        loading={loading}
      />

      <UserModal
        open={modalOpen}
        user={selectedUser}
        onOpenChange={setModalOpen}
        onSave={handleSaveUser}
        loading={loading}
      />

      <AlertDialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {userToDelete?.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
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
