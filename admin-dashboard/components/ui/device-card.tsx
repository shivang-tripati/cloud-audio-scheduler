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
            className={`border rounded-lg p-3 ${!isOnline && "opacity-50"}`}
        >

            {/* Header */}

            <div className="flex justify-between mb-2">

                <div className="flex items-center gap-2">

                    <Monitor size={14} />

                    <span className="font-semibold text-sm">

                        {device.device_name}

                    </span>

                </div>


                <span className={`text-xs font-bold ${isOnline

                    ? "text-green-600"

                    : "text-red-500"

                    }`}>

                    {device.status}

                </span>

            </div>



            {/* Current audio */}

            <div className="flex items-center gap-2 text-xs mb-3">

                <Music size={14} />

                {isPlaying

                    ? device.current_audio

                    : "Idle"}

            </div>



            {/* Volume */}

            <div className="space-y-2">

                <div className="flex justify-between text-xs">

                    <div className="flex gap-1 items-center">

                        <Volume2 size={14} />

                        {volume}%

                    </div>


                    <button

                        onClick={handleMute}

                        disabled={!isOnline}

                        className="text-xs text-red-500"

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

                />

            </div>



            {/* Controls */}

            <div className="flex gap-2 mt-3">

                {/* future controls */}

            </div>


        </div>

    );

}