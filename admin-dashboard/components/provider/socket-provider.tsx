"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { getSession } from "@/lib/auth"


export default function SocketProvider({ children }: { children: React.ReactNode }) {

    useEffect(() => {

        const session = getSession()
        if (session?.token) {

            socket.auth = { token: session.token }

            socket.connect()

        }

        socket.on("connect", () => {
            console.log("✅ Socket connected:", socket.id);
        });

        socket.on("disconnect", () => {
            console.log("❌ Socket disconnected");
        });

        return () => {
            socket.off("connect")
            socket.off("disconnect")
        };

    }, []);

    return children;

}