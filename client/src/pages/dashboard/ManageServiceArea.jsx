import { useState, useEffect, useCallback } from "react";
import { Map, RefreshCw, AlertCircle, Layers, Plus, ChevronDown, ChevronUp } from "lucide-react";


import ServiceAreaMap from "../../components/ServiceAreaMap";
import ServiceAreaForm from "../../components/ServiceAreaForm";
import ServiceAreaCard from "../../components/ServiceAreaCard";

import {
    createServiceArea,
    getAllServiceAreas,
    toggleServiceArea,
    updateServiceArea,
} from "../../service/serviceAreaApi";

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({ toasts }) {
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div
                    key={t.id}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border animate-[slideIn_0.25s_ease] ${t.type === "success"
                        ? "bg-white border-[#e2a731]/50 text-[#292929]"
                        : "bg-white border-red-300 text-red-600"
                        }`}
                >
                    {t.type === "success" ? (
                        <span className="w-5 h-5 rounded-full bg-[#e2a731]/20 flex items-center justify-center text-[#e2a731] text-xs font-bold">✓</span>
                    ) : (
                        <AlertCircle size={16} className="text-red-500" />
                    )}
                    {t.message}
                </div>
            ))}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ManageServiceArea() {
    const [areas, setAreas] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [mapMarker, setMapMarker] = useState(null);
    const [formRadius, setFormRadius] = useState("");
    const [editTarget, setEditTarget] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [toasts, setToasts] = useState([]);
    const [listExpanded, setListExpanded] = useState(true);

    const addToast = useCallback((message, type = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
    }, []);

    const fetchAreas = useCallback(async () => {
        setFetchLoading(true);
        setFetchError(null);
        try {
            const res = await getAllServiceAreas();
            setAreas(res.data?.data || []);
        } catch {
            setFetchError("Failed to load service areas. Please try again.");
        } finally {
            setFetchLoading(false);
        }
    }, []);

    useEffect(() => { fetchAreas(); }, [fetchAreas]);

    const handleMapClick = useCallback(({ lat, lng }) => setMapMarker({ lat, lng }), []);

    const handleSubmit = async (formData) => {
        setSubmitLoading(true);
        try {
            if (editTarget) {
                await updateServiceArea(editTarget._id, formData);
                addToast("Service area updated successfully!");
                setEditTarget(null);
            } else {
                await createServiceArea(formData);
                addToast("Service area created successfully!");
                setMapMarker(null);
            }
            await fetchAreas();
        } catch (err) {
            addToast(err?.response?.data?.message || "Something went wrong.", "error");
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleToggle = async (id) => {
        setTogglingId(id);
        try {
            await toggleServiceArea(id);
            addToast("Status updated successfully!");
            setAreas((prev) => prev.map((a) => a._id === id ? { ...a, isActive: !a.isActive } : a));
        } catch {
            addToast("Failed to update status.", "error");
        } finally {
            setTogglingId(null);
        }
    };

    const handleEdit = (area) => {
        setEditTarget(area);
        const [lng, lat] = area.location?.coordinates || [];
        setMapMarker({ lat, lng });
        setFormRadius(area.radius?.toString() || "");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const activeCount = areas.filter((a) => a.isActive).length;
    const inactiveCount = areas.length - activeCount;

    return (
        <>
            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .sa-scroll::-webkit-scrollbar { width: 4px; }
                .sa-scroll::-webkit-scrollbar-track { background: transparent; }
                .sa-scroll::-webkit-scrollbar-thumb { background: #e2a731; border-radius: 4px; }
            `}</style>

            <div className="min-h-screen bg-[#f4f3ef] text-[#292929] font-sans">

                {/* Header */}
                <div className="bg-white border-b border-[#292929]/10 px-6 py-4 shadow-sm">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center border"
                                style={{ background: "rgba(226,167,49,0.12)", borderColor: "rgba(226,167,49,0.35)" }}>
                                <Map size={17} style={{ color: "#e2a731" }} />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-[#292929]">Service Areas</h1>
                                <p className="text-[11px] text-[#292929]/50">
                                    {areas.length} area{areas.length !== 1 ? "s" : ""} •{" "}
                                    <span className="text-green-600 font-medium">{activeCount} active</span>
                                    {inactiveCount > 0 && <span> • {inactiveCount} inactive</span>}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={fetchAreas}
                            disabled={fetchLoading}
                            className="flex items-center gap-1.5 text-xs text-[#292929]/55 hover:text-[#292929] border border-[#292929]/12 hover:border-[#292929]/25 bg-white hover:bg-[#f4f3ef] px-3 py-1.5 rounded-lg transition-all"
                        >
                            <RefreshCw size={12} className={fetchLoading ? "animate-spin" : ""} />
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="max-w-7xl mx-auto p-4 lg:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 lg:gap-6">

                        {/* Left: Map */}
                        <div className="flex flex-col gap-3">
                            <div
                                className="rounded-2xl overflow-hidden border border-[#292929]/10 shadow-sm bg-white"
                                style={{ height: "calc(100vh - 260px)", minHeight: "420px" }}
                            >
                                <ServiceAreaMap
                                    marker={mapMarker}
                                    radius={editTarget?.radius || formRadius}
                                    onMapClick={handleMapClick}
                                    existingAreas={areas}
                                    lightMode
                                />
                            </div>

                            {mapMarker && (
                                <div className="flex items-center gap-3 bg-white border rounded-xl px-4 py-2.5 text-xs shadow-sm"
                                    style={{ borderColor: "rgba(226,167,49,0.3)" }}>
                                    <span className="w-2 h-2 rounded-full animate-pulse shrink-0"
                                        style={{ background: "#e2a731" }} />
                                    <span className="text-[#292929]/50">Selected:</span>
                                    <span className="text-[#292929] font-mono font-medium">
                                        {mapMarker.lat.toFixed(6)}, {mapMarker.lng.toFixed(6)}
                                    </span>
                                    <button
                                        onClick={() => setMapMarker(null)}
                                        className="ml-auto text-[#292929]/30 hover:text-red-500 transition-colors"
                                    >Clear</button>
                                </div>
                            )}
                        </div>

                        {/* Right Panel */}
                        <div className="flex flex-col gap-4">

                            {/* Form card */}
                            <div className="bg-white border border-[#292929]/10 rounded-2xl p-5 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-1 h-4 rounded-full" style={{ background: "#e2a731" }} />
                                    <h2 className="text-sm font-bold text-[#292929]">
                                        {editTarget ? "Edit Service Area" : "Create New Area"}
                                    </h2>
                                    {editTarget && (
                                        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold"
                                            style={{ background: "#e2a731", color: "#292929" }}>
                                            Editing
                                        </span>
                                    )}
                                </div>

                                {mapMarker && !editTarget && (
                                    <div className="mb-3 text-[11px] rounded-lg px-3 py-2 border"
                                        style={{
                                            backgroundColor: "rgba(226,167,49,0.08)",
                                            borderColor: "rgba(226,167,49,0.25)",
                                            color: "#9a6b0a",
                                        }}>
                                        📍 Map point selected — coordinates are pre-filled below.
                                    </div>
                                )}

                                <ServiceAreaForm
                                    editTarget={
                                        editTarget ? editTarget
                                            : mapMarker ? {
                                                location: { coordinates: [mapMarker.lng, mapMarker.lat] },
                                                radius: formRadius,
                                            } : null
                                    }
                                    onSubmit={handleSubmit}
                                    onCancel={() => { setEditTarget(null); setMapMarker(null); }}
                                    loading={submitLoading}
                                    onRadiusChange={setFormRadius}
                                />
                            </div>

                            {/* Areas list */}
                            <div className="bg-white border border-[#292929]/10 rounded-2xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setListExpanded((p) => !p)}
                                    className="w-full flex items-center justify-between px-5 py-3.5 border-b border-[#292929]/[0.07] hover:bg-[#f4f3ef]/70 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <Layers size={14} style={{ color: "#e2a731" }} />
                                        <span className="text-sm font-bold text-[#292929]">All Service Areas</span>
                                        <span className="text-[10px] text-[#292929]/45 px-2 py-0.5 rounded-full border border-[#292929]/12 bg-[#292929]/[0.04]">
                                            {areas.length}
                                        </span>
                                    </div>
                                    {listExpanded
                                        ? <ChevronUp size={14} className="text-[#292929]/35" />
                                        : <ChevronDown size={14} className="text-[#292929]/35" />}
                                </button>

                                {listExpanded && (
                                    <div className="p-3 max-h-[420px] overflow-y-auto sa-scroll">
                                        {fetchLoading ? (
                                            <div className="flex flex-col gap-2">
                                                {[1, 2, 3].map((i) => (
                                                    <div key={i} className="h-[100px] rounded-xl bg-[#292929]/[0.05] animate-pulse" />
                                                ))}
                                            </div>
                                        ) : fetchError ? (
                                            <div className="flex flex-col items-center gap-2 py-6 text-center">
                                                <AlertCircle size={20} className="text-red-400" />
                                                <p className="text-xs text-[#292929]/50">{fetchError}</p>
                                                <button onClick={fetchAreas} className="text-xs hover:underline" style={{ color: "#e2a731" }}>Retry</button>
                                            </div>
                                        ) : areas.length === 0 ? (
                                            <div className="flex flex-col items-center gap-2 py-8 text-center">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1 border"
                                                    style={{ backgroundColor: "rgba(226,167,49,0.1)", borderColor: "rgba(226,167,49,0.3)" }}>
                                                    <Plus size={16} style={{ color: "#e2a731" }} />
                                                </div>
                                                <p className="text-sm text-[#292929]/60 font-medium">No areas yet</p>
                                                <p className="text-xs text-[#292929]/35 max-w-[200px]">
                                                    Click on the map and fill the form to create your first service area.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-2">
                                                {areas.map((area) => (
                                                    <ServiceAreaCard
                                                        key={area._id}
                                                        area={area}
                                                        onToggle={handleToggle}
                                                        onEdit={handleEdit}
                                                        toggling={togglingId}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Toast toasts={toasts} />
        </>
    );
}