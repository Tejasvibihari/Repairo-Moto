import { MapPin, Ruler, ToggleLeft, ToggleRight, Pencil, Loader2 } from "lucide-react";

export default function ServiceAreaCard({ area, onToggle, onEdit, toggling }) {
    const [lng, lat] = area.location?.coordinates || [];

    return (
        <div
            className={`group relative bg-[#faf9f6] border rounded-xl p-4 transition-all duration-200 hover:shadow-sm hover:border-[#e2a731]/40 ${area.isActive ? "border-[#292929]/10" : "border-[#292929]/[0.06] opacity-60"
                }`}
        >
            {/* Status dot */}
            <span
                className={`absolute top-3.5 right-3.5 w-2 h-2 rounded-full ${area.isActive
                    ? "bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"
                    : "bg-[#292929]/20"
                    }`}
            />

            <div className="pr-4">
                <h4 className="font-semibold text-[#292929] text-sm truncate mb-2">{area.name}</h4>
                <div className="flex flex-col gap-1 text-[11px] text-[#292929]/45">
                    <span className="flex items-center gap-1.5">
                        <MapPin size={10} style={{ color: "#e2a731", opacity: 0.7 }} className="shrink-0" />
                        {lat?.toFixed(5)}, {lng?.toFixed(5)}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <Ruler size={10} style={{ color: "#e2a731", opacity: 0.7 }} className="shrink-0" />
                        {area.radius >= 1000
                            ? `${(area.radius / 1000).toFixed(1)} km`
                            : `${area.radius} m`}{" "}
                        radius
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#292929]/[0.07]">
                {/* Edit */}
                <button
                    onClick={() => onEdit(area)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-[#292929]/55 hover:text-[#292929] border border-[#292929]/12 hover:border-[#292929]/25 bg-white rounded-lg py-1.5 transition-all duration-150"
                >
                    <Pencil size={11} />
                    Edit
                </button>

                {/* Toggle */}
                <button
                    onClick={() => onToggle(area._id)}
                    disabled={toggling === area._id}
                    className={`flex-1 flex items-center justify-center gap-1.5 text-xs rounded-lg py-1.5 border transition-all duration-150 bg-white disabled:opacity-50 ${area.isActive
                        ? "text-red-500 border-red-200 hover:border-red-300 hover:bg-red-50"
                        : "text-green-600 border-green-200 hover:border-green-300 hover:bg-green-50"
                        }`}
                >
                    {toggling === area._id ? (
                        <Loader2 size={11} className="animate-spin" />
                    ) : area.isActive ? (
                        <ToggleRight size={12} />
                    ) : (
                        <ToggleLeft size={12} />
                    )}
                    {area.isActive ? "Deactivate" : "Activate"}
                </button>
            </div>
        </div>
    );
}