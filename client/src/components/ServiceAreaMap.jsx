import { useEffect, useRef } from "react";

let L;

export default function ServiceAreaMap({ marker, radius, onMapClick, existingAreas = [], lightMode = false }) {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const circleRef = useRef(null);
    const existingLayersRef = useRef([]);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const initMap = async () => {
            if (!window.L) {
                if (!document.getElementById("leaflet-css")) {
                    const link = document.createElement("link");
                    link.id = "leaflet-css";
                    link.rel = "stylesheet";
                    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                    document.head.appendChild(link);
                }
                await new Promise((resolve, reject) => {
                    if (window.L) return resolve();
                    const script = document.createElement("script");
                    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.head.appendChild(script);
                });
            }

            L = window.L;
            if (mapInstanceRef.current) return;

            const map = L.map(mapRef.current, {
                center: [20.5937, 78.9629],
                zoom: 5,
                zoomControl: false,
            });

            // Light tile layer
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);

            L.control.zoom({ position: "bottomright" }).addTo(map);

            map.on("click", (e) => {
                onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
            });

            mapInstanceRef.current = map;
        };

        initMap();

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // Update active marker & circle
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !window.L) return;
        L = window.L;

        if (markerRef.current) map.removeLayer(markerRef.current);
        if (circleRef.current) map.removeLayer(circleRef.current);

        if (marker) {
            const customIcon = L.divIcon({
                className: "",
                html: `<div style="
                    width:18px;height:18px;
                    background:#e2a731;
                    border:3px solid #fff;
                    border-radius:50%;
                    box-shadow:0 0 0 3px rgba(226,167,49,0.4), 0 2px 8px rgba(0,0,0,0.2);
                "></div>`,
                iconSize: [18, 18],
                iconAnchor: [9, 9],
            });

            markerRef.current = L.marker([marker.lat, marker.lng], { icon: customIcon })
                .addTo(map)
                .bindTooltip("Service Center", {
                    permanent: false,
                    direction: "top",
                    className: "leaflet-sa-tooltip-light",
                });

            if (radius && radius > 0) {
                circleRef.current = L.circle([marker.lat, marker.lng], {
                    radius: Number(radius),
                    color: "#e2a731",
                    fillColor: "#e2a731",
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: "6 4",
                }).addTo(map);

                const bounds = circleRef.current.getBounds();
                map.fitBounds(bounds, { padding: [40, 40] });
            } else {
                map.setView([marker.lat, marker.lng], 13);
            }
        }
    }, [marker, radius]);

    // Draw existing areas
    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !window.L) return;
        L = window.L;

        existingLayersRef.current.forEach((l) => map.removeLayer(l));
        existingLayersRef.current = [];

        existingAreas.forEach((area) => {
            if (!area.location?.coordinates) return;
            const [lng, lat] = area.location.coordinates;
            const color = area.isActive ? "#e2a731" : "#aaa";

            const icon = L.divIcon({
                className: "",
                html: `<div style="
                    width:11px;height:11px;
                    background:${color};
                    border:2px solid #fff;
                    border-radius:50%;
                    opacity:0.75;
                    box-shadow:0 1px 4px rgba(0,0,0,0.15);
                "></div>`,
                iconSize: [11, 11],
                iconAnchor: [5.5, 5.5],
            });

            const m = L.marker([lat, lng], { icon })
                .bindTooltip(area.name, {
                    direction: "top",
                    className: "leaflet-sa-tooltip-light",
                })
                .addTo(map);

            const c = L.circle([lat, lng], {
                radius: area.radius,
                color,
                fillColor: color,
                fillOpacity: 0.07,
                weight: 1.5,
                dashArray: "4 4",
            }).addTo(map);

            existingLayersRef.current.push(m, c);
        });
    }, [existingAreas]);

    return (
        <div className="relative w-full h-full rounded-xl overflow-hidden">
            <style>{`
                .leaflet-sa-tooltip-light {
                    background: #292929;
                    color: #e2a731;
                    border: 1px solid #e2a731;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 600;
                    padding: 3px 9px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                }
                .leaflet-container { font-family: inherit; }
            `}</style>
            <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
            {/* Overlay hint */}
            <div
                className="absolute top-3 left-3 z-[999] backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-semibold pointer-events-none border"
                style={{
                    background: "rgba(255,255,255,0.88)",
                    borderColor: "rgba(226,167,49,0.35)",
                    color: "#9a6b0a",
                }}
            >
                Click on map to place center point
            </div>
        </div>
    );
}