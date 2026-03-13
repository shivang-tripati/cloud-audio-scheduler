"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated } from "@/lib/auth"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
    }
  }, [router])

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-64 flex flex-col">
        <div className="p-4 md:p-8 flex-1">{children}</div>
        <footer className="p-6 border-t bg-card/20 text-center text-xs text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} RedioCast. Professional Audio Solutions.
        </footer>
      </main>
    </div>
  )
}
