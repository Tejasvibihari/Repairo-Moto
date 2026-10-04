// Live map of every ONLINE (= checked-in) mechanic and delivery partner.
// Shared by the admin page (/live-tracking) and the manager page (/employee/live-tracking).
// Leaflet is loaded from the CDN, same as ServiceAreaMap.jsx, so no extra map package is needed.
import { useEffect, useMemo, useRef, useState } from "react";
import { Phone, LocateFixed } from "lucide-react";
import useLiveMechanics from "../../hooks/useLiveMechanics";

const ROLE = {
    mechanic: { label: "Mechanic", color: "#2ECC9A" },
    delivery: { label: "Delivery", color: "#3B82F6" },
};
const SELECTED = "#e2a731";
const DEFAULT_CENTER = [25.5941, 85.1376]; // Patna, same default as the mobile app

const ago = (iso, now) => {
    if (!iso) return "—";
    const sec = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
    if (sec < 10) return "just now";
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    return `${Math.floor(sec / 3600)}h ago`;
};

const pinIcon = (L, color, name, selected) =>
    L.divIcon({
        className: "",
        html: `<div style="display:flex;flex-direction:column;align-items:center;transform:translate(-50%,-100%)">
            <div style="background:#292929;color:#fff;font:600 11px sans-serif;padding:2px 7px;border-radius:6px;margin-bottom:3px;white-space:nowrap;border:1px solid ${color}">${name.replace(/[<>&]/g, "")}</div>
            <div style="width:${selected ? 22 : 18}px;height:${selected ? 22 : 18}px;background:${selected ? SELECTED : color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 3px ${color}55,0 2px 8px rgba(0,0,0,.35)"></div>
        </div>`,
        iconSize: [0, 0],
    });

function loadLeaflet() {
    if (window.L) return Promise.resolve(window.L);
    if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
    }
    return new Promise((resolve, reject) => {
        const existing = document.getElementById("leaflet-js");
        if (existing) {
            existing.addEventListener("load", () => resolve(window.L));
            existing.addEventListener("error", reject);
            return;
        }
        const s = document.createElement("script");
        s.id = "leaflet-js";
        s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        s.onload = () => resolve(window.L);
        s.onerror = reject;
        document.head.appendChild(s);
    });
}

export default function LiveTrackingView() {
    const { mechanics, connected, loading, error } = useLiveMechanics();
    const mapEl = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef(new Map()); // id -> L.marker
    const fittedOnce = useRef(false);
    const [mapReady, setMapReady] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [now, setNow] = useState(Date.now());

    // keep "Updated 12s ago" truthful
    useEffect(() => {
        const t = setInterval(() => setNow(Date.now()), 5000);
        return () => clearInterval(t);
    }, []);

    const located = useMemo(() => mechanics.filter((m) => m.lat != null && m.lng != null), [mechanics]);

    // create the map once
    useEffect(() => {
        let cancelled = false;
        loadLeaflet().then((L) => {
            if (cancelled || mapRef.current || !mapEl.current) return;
            const map = L.map(mapEl.current, { center: DEFAULT_CENTER, zoom: 11, zoomControl: false });
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);
            L.control.zoom({ position: "bottomright" }).addTo(map);
            mapRef.current = map;
            setMapReady(true);
        });
        return () => {
            cancelled = true;
            if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
            markersRef.current.clear();
            setMapReady(false);
        };
    }, []);

    // sync markers with data (move existing ones, add new, remove gone)
    useEffect(() => {
        const map = mapRef.current;
        const L = window.L;
        if (!mapReady || !map || !L) return;

        const seen = new Set();
        located.forEach((m) => {
            seen.add(m.id);
            const color = ROLE[m.position]?.color || ROLE.mechanic.color;
            const icon = pinIcon(L, color, m.name || "Staff", selectedId === m.id);
            let marker = markersRef.current.get(m.id);
            if (!marker) {
                marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
                marker.on("click", () => setSelectedId(m.id));
                markersRef.current.set(m.id, marker);
            } else {
                marker.setLatLng([m.lat, m.lng]);
                marker.setIcon(icon);
            }
            marker.setZIndexOffset(selectedId === m.id ? 1000 : 0);
        });
        markersRef.current.forEach((marker, id) => {
            if (!seen.has(id)) { map.removeLayer(marker); markersRef.current.delete(id); }
        });

        if (!fittedOnce.current && located.length) {
            fittedOnce.current = true;
            map.fitBounds(located.map((m) => [m.lat, m.lng]), { padding: [80, 80], maxZoom: 16 });
        }
    }, [located, selectedId, mapReady]);

    const focus = (m) => {
        setSelectedId(m.id);
        if (m.lat != null && mapRef.current) mapRef.current.flyTo([m.lat, m.lng], 16, { duration: 0.6 });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-3" style={{ height: "calc(100vh - 110px)", minHeight: 420 }}>
            {/* map */}
            <div className="relative flex-1 min-h-[300px] rounded-xl overflow-hidden border border-gray-200 bg-white">
                <div ref={mapEl} className="absolute inset-0" />
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/95 border border-gray-200 shadow text-xs font-bold text-gray-800">
                    <span className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-red-500"}`} />
                    {mechanics.length} online · {connected ? "Live" : "Reconnecting…"}
                </div>
            </div>

            {/* list */}
            <aside className="lg:w-80 w-full lg:h-full max-h-64 lg:max-h-none overflow-y-auto flex flex-col gap-2">
                {error && !connected && (
                    <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">{error}</div>
                )}
                {loading ? (
                    <div className="p-4 text-sm text-gray-500">Loading…</div>
                ) : mechanics.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 text-center">
                        No mechanics or delivery partners are online right now.
                        <div className="text-xs text-gray-400 mt-1">They appear here once they check in on the mobile app.</div>
                    </div>
                ) : (
                    mechanics.map((m) => (
                        <div
                            key={m.id}
                            onClick={() => focus(m)}
                            className={`p-3 rounded-xl bg-white border-2 cursor-pointer transition ${selectedId === m.id ? "border-primary" : "border-gray-200 hover:border-gray-300"}`}
                        >
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                <span className="font-bold text-sm text-gray-900 truncate flex-1">{m.name}</span>
                                {m.lat != null && <LocateFixed size={15} className="text-gray-400" />}
                            </div>
                            {ROLE[m.position] && (
                                <div className="text-xs font-bold mt-0.5" style={{ color: ROLE[m.position].color }}>
                                    {ROLE[m.position].label}
                                </div>
                            )}
                            <div className="text-xs text-gray-500 mt-0.5">
                                {m.lat == null ? "Waiting for GPS…" : `Updated ${ago(m.at, now)}`}
                                {m.speed != null && m.speed > 1 && ` · ${Math.round(m.speed * 3.6)} km/h`}
                            </div>
                            {!!m.phone && (
                                <a
                                    href={`tel:${m.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 mt-1.5 text-xs font-bold text-primary"
                                >
                                    <Phone size={13} /> {m.phone}
                                </a>
                            )}
                        </div>
                    ))
                )}
            </aside>
        </div>
    );
}
