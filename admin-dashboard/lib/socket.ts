import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./types";

const URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(URL, {
    autoConnect: false,
    auth: {
        token:
            typeof window !== "undefined"
                ? JSON.parse(localStorage.getItem("auth_session") || "{}")?.token
                : null
    }
});
