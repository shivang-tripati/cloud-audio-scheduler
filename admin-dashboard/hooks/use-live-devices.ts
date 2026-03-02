"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { socket } from "../lib/socket"
import { DeviceStatusUpdate } from "@/lib/types"
import { getDeviceStatus } from "@/lib/api-client"

export function useLiveDevices() {

    const [devices, setDevices] = useState<Record<number, DeviceStatusUpdate>>({})
    const initialized = useRef(false)

    useEffect(() => {

        if (initialized.current) return
        initialized.current = true


        // ✅ Ensure socket connected
        if (!socket.connected) {

            console.log("Connecting socket from hook...")

            socket.connect()

        }


        // ✅ Load initial state
        getDeviceStatus()
            .then(res => {

                const map: Record<number, DeviceStatusUpdate> = {}

                res.data.forEach((d: DeviceStatusUpdate) => {
                    map[d.device_id] = d
                })

                setDevices(map)

            })

        // ✅ Live update handler
        const handler = (data: DeviceStatusUpdate) => {

            console.log("🔥 LIVE UPDATE RECEIVED:", data)

            setDevices(prev => ({
                ...prev,
                [data.device_id]: {
                    ...prev[data.device_id],
                    ...data
                }
            }))
        }
        socket.on("device_status_update", handler)

        return () => {
            socket.off("device_status_update", handler)
        }
    }, [])
    return useMemo(() => Object.values(devices), [devices])

}