// src/hooks/useLiveMechanics.js
// Web version of the mobile hook (Repairo-Moto-Console/src/hooks/useLiveMechanics.js).
//
// Admin / manager side: snapshot of ONLINE mechanics + delivery partners, kept fresh over
// Socket.IO (namespace /tracking).
//
// While the tab is visible this sends a "watch" heartbeat every 30s. That is what tells the
// staff phones to switch from low-power pings to the fast GPS stream; when the tab is hidden
// or closed the heartbeats stop and the phones drop back to low-power on their own.
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import axiosClient from "../service/axiosClient";

const SOCKET_URL = import.meta.env.VITE_API_URL;

export default function useLiveMechanics() {
    // Admin portal stores adminToken, the manager portal stores employeeToken — the server accepts both.
    const token = useSelector((s) => s.auth.adminToken || s.auth.employeeToken);
    const [mechanics, setMechanics] = useState({}); // { [id]: { id, name, phone, position, lat, lng, speed, at } }
    const [connected, setConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [staff, setStaff] = useState([]);          // everyone trackable (online or not) + why they are offline
    const [error, setError] = useState(null);
    const socketRef = useRef(null);

    const [tabVisible, setTabVisible] = useState(document.visibilityState === "visible");
    useEffect(() => {
        const onVis = () => setTabVisible(document.visibilityState === "visible");
        document.addEventListener("visibilitychange", onVis);
        return () => document.removeEventListener("visibilitychange", onVis);
    }, []);
    const watching = tabVisible && connected;

    // "I'm looking at them" heartbeat
    useEffect(() => {
        if (!watching) return undefined;
        const beat = () => socketRef.current?.emit("watch", {});
        beat();
        const t = setInterval(beat, 30000);
        return () => clearInterval(t);
    }, [watching]);

    const loadSnapshot = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/api/admin/tracking/live");
            const next = {};
            (data.mechanics || []).forEach((m) => { next[m.id] = m; });
            setMechanics(next);
            setError(null);
        } catch (e) {
            setError(e?.response?.data?.message || e.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Explains an empty map: lists offline staff with the reason (not checked in, on break, ...)
    const loadStaff = useCallback(async () => {
        try {
            const { data } = await axiosClient.get("/api/admin/tracking/staff");
            setStaff(data.staff || []);
        } catch {
            /* the diagnostic list is optional — the live map still works without it */
        }
    }, []);

    useEffect(() => {
        if (!token) return undefined;
        loadSnapshot();
        loadStaff();

        const socket = io(`${SOCKET_URL}/tracking`, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
        });
        socketRef.current = socket;

        socket.on("connect", () => { setConnected(true); loadSnapshot(); loadStaff(); }); // re-sync after any gap
        socket.on("disconnect", () => setConnected(false));
        socket.on("connect_error", (e) => { setConnected(false); setError(e?.message || "Connection failed"); });

        socket.on("mechanic:location", (m) =>
            setMechanics((prev) => ({ ...prev, [m.id]: { ...prev[m.id], ...m } })));

        socket.on("mechanic:status", (m) => {
            loadStaff(); // someone went online / offline → refresh the "not online" list
            setMechanics((prev) => {
                if (!m.isOnline) {
                    const { [m.id]: _gone, ...rest } = prev;
                    return rest;
                }
                return {
                    ...prev,
                    [m.id]: {
                        ...prev[m.id],
                        id: m.id, name: m.name, phone: m.phone, position: m.position,
                        lat: m.location?.lat ?? prev[m.id]?.lat,
                        lng: m.location?.lng ?? prev[m.id]?.lng,
                        at: m.at,
                    },
                };
            });
        });

        return () => { socket.disconnect(); socketRef.current = null; };
    }, [token, loadSnapshot, loadStaff]);

    const offline = staff.filter((p) => !p.online);
    return { mechanics: Object.values(mechanics), offline, connected, loading, error, reload: loadSnapshot };
}
