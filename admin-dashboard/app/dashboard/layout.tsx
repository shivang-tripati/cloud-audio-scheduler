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
    <div className="flex h-screen bg-background relative overflow-hidden">
      {/* Global Background Glow */}
      <div className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] opacity-20 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40 blur-[120px] rounded-full" />
      </div>

      <Sidebar />
      <main className="flex-1 overflow-auto md:ml-[280px] flex flex-col relative z-10 w-full md:w-[calc(100%-280px)]">
        <div className="p-4 md:p-8 flex-1">{children}</div>
        <footer className="p-6 border-t bg-card/20 text-center text-xs text-muted-foreground uppercase tracking-widest">
          © {new Date().getFullYear()} RedioCast. Professional Audio Solutions.
        </footer>
      </main>
    </div>
  )
}
