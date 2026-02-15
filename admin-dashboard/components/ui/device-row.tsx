


import { DeviceStatusUpdate } from "@/lib/types";
import { Cpu, Building2, Music, Volume2 } from "lucide-react";

function DeviceRow({ device: d }: { device: DeviceStatusUpdate }) {
    const isOnline = d.status === "ONLINE";
    const isPlaying = d.current_state === "PLAYING";

    return (
        <div className="flex items-center justify-between p-3 bg-card border rounded-xl hover:shadow-sm transition-all group">
            <div className="flex items-center gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isOnline ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Cpu className={`w-5 h-5 ${isOnline ? 'text-green-600' : 'text-red-600'}`} />
                </div>
                <div className="truncate">
                    <div className="font-bold text-sm truncate">{d.device_name}</div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" /> {d.branch?.name}
                    </div>
                </div>
            </div>

            <div className="text-right shrink-0">
                <div className={`text-xs font-bold mb-1 ${isPlaying ? "text-primary flex items-center justify-end gap-1" : "text-muted-foreground"}`}>
                    {isPlaying ? (
                        <><Music className="w-3 h-3 animate-bounce" /> {d.current_audio}</>
                    ) : (
                        isOnline ? "System Ready" : "Disconnected"
                    )}
                </div>
                <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" /> {d.volume}%
                    </div>
                    <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                </div>
            </div>
        </div>
    );
}

export default DeviceRow