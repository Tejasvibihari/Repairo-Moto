import { useState, useEffect } from "react";
import { MapPin, Ruler, Tag, Check, X, Loader2, RefreshCw } from "lucide-react";

export default function ServiceAreaForm({ editTarget, onSubmit, onCancel, loading }) {
    const [form, setForm] = useState({ name: "", latitude: "", longitude: "", radius: "" });

    useEffect(() => {
        if (editTarget) {
            const [lng, lat] = editTarget.location?.coordinates || [];
            setForm({
                name: editTarget.name || "",
                latitude: lat?.toString() || "",
                longitude: lng?.toString() || "",
                radius: editTarget.radius?.toString() || "",
            });
        } else {
            setForm({ name: "", latitude: "", longitude: "", radius: "" });
        }
    }, [editTarget]);

    const handleChange = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            name: form.name,
            latitude: parseFloat(form.latitude),
            longitude: parseFloat(form.longitude),
            radius: parseFloat(form.radius),
        });
    };

    const isEdit = !!editTarget;

    const inputClass =
        "bg-[#f8f7f4] border border-[#292929]/12 focus:border-[#e2a731] rounded-lg px-3.5 py-2.5 text-sm text-[#292929] placeholder-[#292929]/30 outline-none transition-all duration-200 focus:ring-2 focus:ring-[#e2a731]/20 focus:bg-white w-full";

    const labelClass =
        "text-[11px] font-semibold text-[#292929]/50 uppercase tracking-widest flex items-center gap-1.5";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                    <Tag size={11} style={{ color: "#e2a731" }} /> Area Name
                </label>
                <input
                    type="text"
                    value={form.name}
                    onChange={handleChange("name")}
                    placeholder="e.g. Downtown Zone"
                    required
                    className={inputClass}
                />
            </div>

            {/* Lat / Lng */}
            <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        <MapPin size={11} style={{ color: "#e2a731" }} /> Latitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={form.latitude}
                        onChange={handleChange("latitude")}
                        placeholder="28.6139"
                        required
                        className={inputClass}
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <label className={labelClass}>
                        <MapPin size={11} style={{ color: "#e2a731" }} /> Longitude
                    </label>
                    <input
                        type="number"
                        step="any"
                        value={form.longitude}
                        onChange={handleChange("longitude")}
                        placeholder="77.2090"
                        required
                        className={inputClass}
                    />
                </div>
            </div>

            {/* Radius */}
            <div className="flex flex-col gap-1.5">
                <label className={labelClass}>
                    <Ruler size={11} style={{ color: "#e2a731" }} /> Radius (meters)
                </label>
                <input
                    type="number"
                    value={form.radius}
                    onChange={handleChange("radius")}
                    placeholder="e.g. 5000"
                    min="100"
                    required
                    className={inputClass}
                />
                {form.radius && (
                    <p className="text-[11px] text-[#292929]/40 pl-1">
                        ≈ {(parseFloat(form.radius) / 1000).toFixed(2)} km
                    </p>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 font-bold py-2.5 rounded-lg text-sm active:scale-95 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: "#e2a731", color: "#292929" }}
                >
                    {loading ? (
                        <Loader2 size={15} className="animate-spin" />
                    ) : isEdit ? (
                        <RefreshCw size={15} />
                    ) : (
                        <Check size={15} />
                    )}
                    {loading ? "Saving..." : isEdit ? "Update Area" : "Create Area"}
                </button>
                {isEdit && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center justify-center gap-1.5 border border-[#292929]/15 text-[#292929]/55 hover:text-[#292929] hover:border-[#292929]/30 px-4 py-2.5 rounded-lg text-sm transition-all duration-150 bg-white"
                    >
                        <X size={14} />
                        Cancel
                    </button>
                )}
            </div>
        </form>
    );
}