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
    { label: "Playlist", href: "/dashboard/playlists", icon: <Music className="w-4 h-4" /> },
    { label: "Devices", href: "/dashboard/devices", icon: <Cpu className="w-4 h-4" /> },
    { label: "Audio Library", href: "/dashboard/audio", icon: <Music className="w-4 h-4" /> },
    { label: "Schedules", href: "/dashboard/schedules", icon: <Calendar className="w-4 h-4" /> },
  ]

  const handleLogout = () => {
    clearSession()
    router.push("/login")
  }

  return (
    <div className="mr-10">
      {/* Mobile toggle */}
      <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50" onClick={() => setOpen(!open)}>
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-40" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card/40 backdrop-blur-xl border-r border-border transition-transform md:translate-x-0 z-40 ${open ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="p-6 border-b border-border ml-10">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground uppercase">
            <span className="text-red-500 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500/60">
              RedioCast
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 tracking-wide font-medium">Admin Dashboard</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href} className="block">
                <button
                  onClick={() => setOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                    ? "bg-primary/15 text-primary border border-primary/20 shadow-sm"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground hover:scale-[1.02]"
                    }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4 bg-card/20">
          {user && (
            <div className="text-xs px-2">
              <p className="text-foreground font-semibold">{user.name}</p>
              <p className="text-muted-foreground">{user.role}</p>
            </div>
          )}
          <Button
            variant="outline"
            className="w-full justify-start gap-2 text-red-500 hover:text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition backdrop-blur-sm rounded-xl"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>
    </div>
  )
}
