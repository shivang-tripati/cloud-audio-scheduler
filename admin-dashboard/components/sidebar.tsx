"use client"

import type React from "react"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { getCurrentUser, clearSession } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, Building2, Cpu, Music, Calendar, LogOut, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const currentUser = getCurrentUser()
    setUser(currentUser)
  }, [])

  const navItems: NavItem[] = [
    { label: "Overview", href: "/dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: "Users", href: "/dashboard/users", icon: <Users className="w-4 h-4" /> },
    { label: "Branches", href: "/dashboard/branches", icon: <Building2 className="w-4 h-4" /> },
    { label: "Devices", href: "/dashboard/devices", icon: <Cpu className="w-4 h-4" /> },
    { label: "Audio Library", href: "/dashboard/audio", icon: <Music className="w-4 h-4" /> },
    { label: "Schedules", href: "/dashboard/schedules", icon: <Calendar className="w-4 h-4" /> },
  ]

  const handleLogout = () => {
    clearSession()
    router.push("/login")
  }

  return (
    <>
      {/* Mobile toggle */}
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={() => setOpen(!open)}>
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col transition-transform md:translate-x-0 z-40 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-lg font-bold text-sidebar-foreground">Jewel Audio</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-1">Admin Dashboard</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <button
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border space-y-4">
          {user && (
            <div className="text-xs">
              <p className="text-sidebar-foreground font-medium">{user.name}</p>
              <p className="text-sidebar-foreground/60">{user.role}</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive bg-transparent"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
