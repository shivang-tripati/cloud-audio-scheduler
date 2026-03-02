"use client";

import { useEffect, useState, useMemo } from "react";
import { getBranches } from "@/lib/api-client";
import { useLiveDevices } from "./use-live-devices";

export function useLiveBranches() {

    const [branches, setBranches] = useState<any[]>([]);
    const liveDevices = useLiveDevices();

    useEffect(() => {

        getBranches().then(res => {

            setBranches(res.data || []);

        });

    }, []);

    return useMemo(() => {

        const map: Record<number, any> = {};

        branches.forEach(branch => {

            map[branch.id] = {

                branch,

                devices: []

            };

        });


        // SAFE iteration
        liveDevices.forEach(device => {

            if (map[device.branch_id]) {

                map[device.branch_id].devices.push(device);

            }

        });

        return Object.values(map);

    }, [branches, liveDevices]);

}