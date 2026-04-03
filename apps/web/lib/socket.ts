import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

// Ensure only ONE socket instance exists
export const socket: Socket = io(SOCKET_URL);

socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err.message);
});

socket.onAny((eventName, ...args) => {
  console.log(`[Socket] Event: ${eventName}`, args);
});