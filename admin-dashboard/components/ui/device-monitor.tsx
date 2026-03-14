"use client";

import { useMemo, useState } from "react";
import DeviceCard from "./device-card";
import { Globe, ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DeviceMonitor({ liveDevices = [] }: any) {

    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});


    const branches = useMemo(() => {

        if (!Array.isArray(liveDevices)) return [];

        const map: Record<string, any> = {};

        liveDevices.forEach((device: any) => {

            const branchCode = device.branch?.branch_code;

            if (!branchCode) return;
            if (!map[branchCode]) {

                map[branchCode] = {

                    branch: device.branch,
                    devices: []

                };

            }

            map[branchCode].devices.push({ ...device });

        });


        Object.values(map).forEach((b: any) => {

            b.devices.sort((a: any, b: any) => {

                if (a.status === "ONLINE" && b.status !== "ONLINE") return -1;
                if (a.status !== "ONLINE" && b.status === "ONLINE") return 1;

                return a.device_name.localeCompare(b.device_name);

            });

        });


        return Object.values(map);

    }, [liveDevices]);


    function toggle(branchCode: string) {

        setCollapsed(prev => ({

            ...prev,
            [branchCode]: !prev[branchCode]

        }));

    }


    return (

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">

            {branches.map((b: any) => {

                const branchCode = b.branch.branch_code;

                const isCollapsed = collapsed[branchCode];


                return (

                    <div
                        key={branchCode}
                        className="bg-card/40 backdrop-blur-md border border-border rounded-2xl shadow-sm overflow-hidden transition-all duration-300 hover:bg-card/60"
                    >

                        {/* HEADER */}

                        <button

                            onClick={() => toggle(branchCode)}

                            className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition"

                        >

                            <div className="flex items-center gap-2">

                                {isCollapsed
                                    ? <ChevronRight size={18} />
                                    : <ChevronDown size={18} />
                                }

                                <Globe size={16} />

                                <span className="font-bold">

                                    {b.branch.name}

                                </span>

                            </div>


                            <span className="text-xs text-muted-foreground">

                                {b.devices.length}

                            </span>

                        </button>


                        {/* DEVICES */}

                        <AnimatePresence initial={false}>

                            {!isCollapsed && (

                                <motion.div

                                    key="content"

                                    initial={{ opacity: 0 }}

                                    animate={{ opacity: 1 }}

                                    exit={{ opacity: 0 }}

                                    transition={{ duration: 0.2 }}

                                    className="p-4 space-y-3"

                                >

                                    {b.devices.map((device: any) => (

                                        <DeviceCard
                                            key={device.device_id}
                                            device={device}
                                        />

                                    ))}

                                </motion.div>

                            )}

                        </AnimatePresence>

                    </div>

                );

            })}

        </div>

    );

}