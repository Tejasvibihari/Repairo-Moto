import { useEffect, useState } from "react";
import { ArrowRight, Megaphone, X } from "lucide-react";
import axiosClient from "../../service/axiosClient";

export default function DynamicAppContent() {
    const [items, setItems] = useState([]);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const response = await axiosClient.get("/api/app-content/active");
                setItems(response.data.content || []);
            } catch (error) {
                console.error("Failed to load app content:", error);
            }
        };

        fetchContent();
    }, []);

    if (dismissed || items.length === 0) return null;

    return (
        <section className="bg-gray-950 px-4 py-3 text-white" aria-label="Announcements">
            <div className="mx-auto flex max-w-7xl items-center gap-4">
                <Megaphone className="hidden shrink-0 text-primary sm:block" size={22} />
                <div className="min-w-0 flex-1 overflow-x-auto">
                    <div className="flex gap-4">
                        {items.map((item) => (
                            <a
                                key={item._id}
                                href={item.link || "#"}
                                className="group flex min-w-[280px] items-center gap-3 sm:min-w-[420px]"
                            >
                                <img
                                    src={`${import.meta.env.VITE_API_URL}${item.image}`}
                                    alt=""
                                    className="h-12 w-20 shrink-0 rounded object-cover"
                                />
                                <span className="min-w-0">
                                    <strong className="block truncate text-sm font-bold">{item.title}</strong>
                                    {item.message && <span className="block truncate text-xs text-gray-300">{item.message}</span>}
                                </span>
                                {item.link && <ArrowRight className="shrink-0 text-primary transition-transform group-hover:translate-x-1" size={18} />}
                            </a>
                        ))}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setDismissed(true)}
                    className="shrink-0 rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
                    aria-label="Dismiss announcements"
                >
                    <X size={18} />
                </button>
            </div>
        </section>
    );
}
