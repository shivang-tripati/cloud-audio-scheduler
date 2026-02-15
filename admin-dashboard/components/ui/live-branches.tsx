import { useLiveBranches } from "@/hooks/useLiveBranches";
import { Monitor, Music, Volume2, Globe, SignalHigh, SignalLow } from "lucide-react";

export default function LiveBranches() {
    const branches = useLiveBranches();

    return (
        <div className="w-full">
            {/* THIS IS THE KEY: A grid that wraps the branch sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {branches.map((b) => (
                    <section
                        key={b.branch.id + b.branch.name}
                        className="flex flex-col bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                    >
                        {/* Branch Header */}
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed">
                            <div className="flex items-center gap-2 truncate">
                                <Globe className="w-4 h-4 text-primary shrink-0" />
                                <h2 className="text-base font-bold truncate tracking-tight">
                                    {b.branch.name}
                                </h2>
                            </div>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-muted rounded text-muted-foreground shrink-0">
                                {b.branch.branch_code}
                            </span>
                        </div>

                        {/* Device Container: Stacks vertically inside the branch card */}
                        <div className="space-y-3">
                            {b.devices.map((d) => {
                                const isOnline = d.status === "ONLINE";
                                const isPlaying = d.current_state === "PLAYING";

                                return (
                                    <div
                                        key={d.device_id + d.device_name}
                                        className={`relative overflow-hidden rounded-xl border transition-all duration-200 ${isOnline ? "bg-background" : "bg-muted/30 opacity-80"
                                            }`}
                                    >
                                        <div className={`absolute top-0 left-0 w-1 h-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />

                                        <div className="p-3">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <Monitor className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                                    <span className="font-bold text-xs truncate">
                                                        {d.device_name}
                                                    </span>
                                                </div>
                                                <div className={`flex items-center gap-1 text-[9px] font-bold uppercase ${isOnline ? 'text-green-600' : 'text-red-500'}`}>
                                                    {isOnline ? "Online" : "Offline"}
                                                </div>
                                            </div>

                                            <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg mb-2 ${isPlaying ? 'bg-primary/5 text-primary' : 'bg-muted/50 text-muted-foreground'}`}>
                                                <Music className={`w-3 h-3 ${isPlaying ? 'animate-pulse' : ''}`} />
                                                <span className="text-[11px] font-medium truncate">
                                                    {isPlaying ? d.current_audio : "System Idle"}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 font-medium">
                                                    <Volume2 className="w-3 h-3" />
                                                    {d.volume}%
                                                </div>
                                                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary/40 transition-all"
                                                        style={{ width: `${d.volume}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}