import { useLiveBranches } from "@/hooks/useLiveBranches";
import DeviceCard from "./device-card";
import { Globe } from "lucide-react";

export default function LiveBranches() {

    const branches = useLiveBranches();
    return (
        <div className="w-full">
            {/* THIS IS THE KEY: A grid that wraps the branch sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
                {branches.map((b) => (
                    <section
                        key={`branch-${b.branch.branch_code}`}
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
                            {b.devices.map((d: any) => <DeviceCard key={`${d.device_id}-${d.current_audio}-${d.position_ms}`} device={d} />)}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
}