import { useLiveDevices } from "./use-live-devices";
import { DeviceStatusUpdate } from "@/lib/types";

export function useLiveBranches() {
    const devices = useLiveDevices();

    const branches = new Map<number, {
        branch: DeviceStatusUpdate["branch"];
        devices: DeviceStatusUpdate[];
    }>();

    devices.forEach(device => {
        if (!branches.has(device.branch_id)) {
            branches.set(device.branch_id, {
                branch: device.branch,
                devices: []
            });
        }
        branches.get(device.branch_id)!.devices.push(device);
    });

    return Array.from(branches.values());
}
