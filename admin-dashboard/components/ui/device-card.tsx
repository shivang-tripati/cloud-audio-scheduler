import { useMemo, useState, useEffect } from "react";
import {
    Monitor,
    Music,
    Volume2,
    VolumeX,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
    updateDeviceVolume
} from "@/lib/api-client";
import debounce from "lodash/debounce";


export default function DeviceCard({ device }: any) {


    const [localVolume, setLocalVolume] = useState<number | null>(null);

    // Use localVolume for instant UI, otherwise server volume
    const volume = localVolume ?? device.volume ?? 0;


    // ✅ FIX 1: Always clear localVolume when server volume changes
    useEffect(() => {
        setLocalVolume(null);
    }, [device.volume]);


    const isOnline = device.status === "ONLINE";

    const isPlaying = device.current_state === "PLAYING";


    // ✅ FIX 2: Proper debounce creation
    const debouncedUpdate = useMemo(() => {

        const fn = debounce(async (vol: number) => {

            await updateDeviceVolume(device.device_id, vol);

        }, 400);

        return fn;

    }, [device.device_id]);


    // ✅ FIX 3: Cleanup debounce on unmount
    useEffect(() => {

        return () => {

            debouncedUpdate.cancel();

        };

    }, [debouncedUpdate]);


    function handleChange(value: number[]) {

        const vol = value[0];

        setLocalVolume(vol);

        debouncedUpdate(vol);

    }


    // ✅ FIX 4: Use debounce here also (do NOT call API directly)
    function handleMute() {

        setLocalVolume(0);

        debouncedUpdate(0);

    }



    return (

        <div
            key={device.device_id}
            className={`border border-border/50 rounded-xl p-4 bg-card/30 backdrop-blur-sm transition-all duration-300 hover:bg-card/50 hover:scale-[1.02] ${!isOnline && "opacity-60"}`}
        >

            {/* Header */}

            <div className="flex justify-between items-start mb-3">

                <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        <Monitor size={16} />
                    </div>

                    <div className="flex flex-col">
                        <span className="font-bold text-sm tracking-tight">
                            {device.device_name}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                            Device Terminal
                        </span>
                    </div>

                </div>


                <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${isOnline
                    ? "bg-green-500/10 text-green-500 border-green-500/20"
                    : "bg-red-500/10 text-red-500 border-red-500/20"
                    }`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    {device.status}
                </div>

            </div>



            {/* Current audio */}

            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10 text-[11px] mb-4 group/audio">

                <div className={`p-1 rounded-full ${isPlaying ? 'bg-primary/20 text-primary animate-spin-slow' : 'bg-muted text-muted-foreground'}`}>
                    <Music size={12} />
                </div>

                <div className="flex flex-col truncate">
                    <span className="text-muted-foreground font-medium uppercase tracking-tighter text-[9px]">Currently Playing</span>
                    <span className={`font-bold truncate ${isPlaying ? 'text-foreground' : 'text-muted-foreground/60'}`}>
                        {isPlaying ? device.current_audio : "System Idle"}
                    </span>
                </div>

            </div>



            {/* Volume */}

            <div className="space-y-3 px-1">

                <div className="flex justify-between items-center">

                    <div className="flex gap-2 items-center text-[11px] font-bold text-muted-foreground">

                        <Volume2 size={14} className="text-primary" />

                        {volume}%

                    </div>


                    <button

                        onClick={handleMute}

                        disabled={!isOnline}

                        className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"

                    >

                        <VolumeX size={14} />

                    </button>

                </div>


                <Slider

                    value={[volume]}

                    max={100}

                    step={1}

                    disabled={!isOnline}

                    onValueChange={handleChange}

                    className="py-1"

                />

            </div>



            {/* Controls */}

            <div className="flex gap-2 mt-3">

                {/* future controls */}

            </div>


        </div>

    );

}