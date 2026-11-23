import { io } from "socket.io-client";

const base = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const socketUrl = base.replace(/\/api\/?$/, "");

export const socket = io(socketUrl, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  auth: {
    token: localStorage.getItem("as_crown_token") || ""
  }
});

export function connectRealtime(userId:number){
  if (!Number.isInteger(Number(userId)) || Number(userId)<=0) return;
  socket.auth = { token: localStorage.getItem("as_crown_token") || "" };
  if (!socket.connected) socket.connect();
  socket.emit("join-user", Number(userId));
}

export function joinCommunity(groupId:number){
  if (!socket.connected) socket.connect();
  socket.emit("join-community", Number(groupId));
}

export function leaveCommunity(groupId:number){ socket.emit("leave-community", Number(groupId)); }
