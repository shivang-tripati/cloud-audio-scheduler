"use client";

import { useEffect, useState } from "react";
import { getBranches, getSchedules } from "@/lib/api-client";
import {
  Loader2, Building2, Cpu, CheckCircle2,
  Clock, Activity, LayoutDashboard, ListMusic
} from "lucide-react";
import { useLiveDevices } from "@/hooks/use-live-devices";
import LiveBranches from "@/components/ui/live-branches";
import StatCard from "@/components/ui/stat-card";
import DeviceRow from "@/components/ui/device-row";
import DeviceMonitor from "@/components/ui/device-monitor";

interface DashboardStats {
  totalBranches: number;
  totalDevices: number;
  activeDevices: number;
  prayerConfigured: boolean;
}

export default function DashboardPage() {
  const liveDevices = useLiveDevices();
  const [branches, setBranches] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatic = async () => {
      try {
        const [branchesRes, schedulesRes] = await Promise.all([
          getBranches(),
          getSchedules(),
        ]);
        setBranches(branchesRes.data || []);
        setSchedules(schedulesRes.data || []);
      } catch (e) {
        console.error("Dashboard Data Error:", e);
      }
    };
    loadStatic();
  }, []);

  useEffect(() => {
    if (!branches.length && !schedules.length) return;

    const activeDevices = liveDevices.filter((d) => d.status === "ONLINE").length;
    const prayerConfigured = schedules.some(
      (s) => s.schedule_type === "DAILY_PRAYER" && s.is_active
    );

    setStats({
      totalBranches: branches.length,
      totalDevices: liveDevices.length,
      activeDevices,
      prayerConfigured,
    });
    setLoading(false);
  }, [liveDevices, branches, schedules]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <Activity className="w-5 h-5 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground animate-pulse font-medium tracking-wide">Syncing Live Data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto p-4 md:p-8 space-y-12">

      {/* 1. HERO HEADER */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl shadow-inner border border-primary/20">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-extrabold tracking-tight leading-tight text-3xl md:text-4xl lg:text-5xl">
              <span className="text-red-500 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-500/60">
                RedioCast
              </span>{" "}
              Dashboard
            </h1>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            RedioCast Audio Network: <span className="font-semibold text-foreground">Real-time Device Player Performance Monitoring</span>
          </p>
        </div>

        {/* <div className="flex items-center gap-4 bg-card border px-4 py-3 rounded-2xl shadow-sm self-start lg:self-center">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">System Status</span>
            <span className="text-sm font-bold text-green-600">All Systems Operational</span>
          </div>
        </div> */}
      </header>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard
          title="Total Branches"
          value={stats?.totalBranches}
          icon={<Building2 className="w-5 h-5 text-blue-500" />}
          description="Global footprint"
        />
        <StatCard
          title="Connected Hardware"
          value={stats?.totalDevices}
          icon={<Cpu className="w-5 h-5 text-purple-500" />}
          description="Active endpoints"
        />
        <StatCard
          title="Online Now"
          value={stats?.activeDevices}
          icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
          color="text-green-600"
          description="Ready for playback"
        />
        {/* <StatCard
          title="Prayer Automation"
          value={stats?.prayerConfigured ? "Active" : "Disabled"}
          icon={<Clock className="w-5 h-5 text-orange-500" />}
          color={stats?.prayerConfigured ? "text-orange-600" : "text-muted-foreground"}
          description="Schedule integrity"
        /> */}
      </div>

      {/* 3. BRANCH MONITORING (The 3-Column Grid Layout) */}
      {/* <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-muted pb-4">
          <div className="flex items-center gap-3">
            <ListMusic className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Live Branch Monitoring</h2>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[11px] font-bold uppercase tracking-tighter text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border">
            Data Refreshes Every 30s
          </div>
        </div>

        <div className="w-full">
          <LiveBranches />
        </div>
      </section> */}

      <DeviceMonitor liveDevices={liveDevices} />

    </div>
  );
}