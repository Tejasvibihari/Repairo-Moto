import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Pencil, Trash2, X, Loader2, Link as LinkIcon, Calendar, ImageOff, CheckCircle2, AlertCircle } from "lucide-react";
import Cropper from "react-easy-crop";
import axiosClient from "../../service/axiosClient";

const emptyForm = {
    title: "",
    message: "",
    link: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
};

const TITLE_LIMIT = 120;
const MESSAGE_LIMIT = 500;
const BANNER_ASPECT_RATIO = 2.63;

function createCroppedImage(imageSrc, crop) {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = crop.width;
            canvas.height = crop.height;
            const context = canvas.getContext("2d");
            context.drawImage(
                image,
                crop.x,
                crop.y,
                crop.width,
                crop.height,
                0,
                0,
                crop.width,
                crop.height
            );
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Could not crop image."));
                    return;
                }
                resolve(new File([blob], "app-banner.jpg", { type: "image/jpeg" }));
            }, "image/jpeg", 0.9);
        };
        image.onerror = () => reject(new Error("Could not load image."));
        image.src = imageSrc;
    });
}

function getSchedule(item) {
    const now = new Date();
    const starts = item.startsAt ? new Date(item.startsAt) : null;
    const ends = item.endsAt ? new Date(item.endsAt) : null;

    if (!item.isActive) return { label: "Hidden", tone: "bg-gray-100 text-gray-600" };
    if (starts && starts > now) return { label: "Scheduled", tone: "bg-amber-100 text-amber-700" };
    if (ends && ends < now) return { label: "Expired", tone: "bg-red-100 text-red-600" };
    return { label: "Live", tone: "bg-green-100 text-green-700" };
}

function formatDate(value) {
    if (!value) return null;
    return new Date(value).toLocaleString(undefined, {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function AppUi() {
    const [form, setForm] = useState(emptyForm);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [cropperImage, setCropperImage] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [items, setItems] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [deletingId, setDeletingId] = useState(null);
    const [notice, setNotice] = useState(null); // { type: "success" | "error", text }

    const editingItem = useMemo(
        () => items.find((item) => item._id === editingId) || null,
        [items, editingId]
    );

    const fetchItems = async () => {
        setFetching(true);
        try {
            const response = await axiosClient.get("/api/app-content");
            setItems(response.data.content || []);
        } catch {
            setNotice({ type: "error", text: "Could not load app content." });
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    useEffect(() => {
        if (!image) {
            setImagePreview(null);
            return;
        }
        const url = URL.createObjectURL(image);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    // Auto-dismiss success notices after a few seconds
    useEffect(() => {
        if (notice?.type !== "success") return;
        const timer = setTimeout(() => setNotice(null), 4000);
        return () => clearTimeout(timer);
    }, [notice]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
    };

    const handleImageSelected = (event) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;
        setCropperImage(URL.createObjectURL(selectedFile));
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedAreaPixels(null);
    };

    const closeCropper = () => {
        if (cropperImage) URL.revokeObjectURL(cropperImage);
        setCropperImage(null);
        const input = document.getElementById("app-content-image");
        if (input) input.value = "";
    };

    const applyCrop = async () => {
        if (!cropperImage || !croppedAreaPixels) return;
        try {
            const croppedFile = await createCroppedImage(cropperImage, croppedAreaPixels);
            setImage(croppedFile);
            closeCropper();
        } catch {
            setNotice({ type: "error", text: "Could not crop this image." });
        }
    };

    const resetForm = () => {
        setForm(emptyForm);
        setImage(null);
        setEditingId(null);
        closeCropper();
        const input = document.getElementById("app-content-image");
        if (input) input.value = "";
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!editingId && !image) {
            setNotice({ type: "error", text: "Please select and crop an image before publishing." });
            return;
        }
        setLoading(true);
        setNotice(null);
        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => data.append(key, value));
        if (image) data.append("image", image);

        try {
            const url = editingId ? `/api/app-content/${editingId}` : "/api/app-content";
            await axiosClient[editingId ? "patch" : "post"](url, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            await fetchItems();
            const wasEditing = Boolean(editingId);
            resetForm();
            setNotice({ type: "success", text: wasEditing ? "Content updated." : "Content published." });
        } catch (error) {
            setNotice({ type: "error", text: error.response?.data?.message || "Could not save content." });
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (item) => {
        setEditingId(item._id);
        setForm({
            title: item.title || "",
            message: item.message || "",
            link: item.link || "",
            startsAt: item.startsAt ? item.startsAt.slice(0, 16) : "",
            endsAt: item.endsAt ? item.endsAt.slice(0, 16) : "",
            isActive: item.isActive,
        });
        setImage(null);
        setNotice(null);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const removeItem = async (id) => {
        if (!window.confirm("Delete this app content? This can't be undone.")) return;
        setDeletingId(id);
        try {
            await axiosClient.delete(`/api/app-content/${id}`);
            setItems((current) => current.filter((item) => item._id !== id));
            setNotice({ type: "success", text: "Content deleted." });
            if (editingId === id) resetForm();
        } catch (error) {
            setNotice({ type: "error", text: error.response?.data?.message || "Could not delete content." });
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl space-y-6 pb-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">App UI content</h1>
                    <p className="mt-1 text-sm text-gray-500">Publish announcements, offers, and promotional artwork to the home page.</p>
                </div>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600">
                    {items.length} {items.length === 1 ? "item" : "items"} total
                </span>
            </div>

            {notice && (
                <div
                    className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${notice.type === "success"
                        ? "border-green-200 bg-green-50 text-green-800"
                        : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    {notice.type === "success" ? (
                        <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                    ) : (
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    )}
                    <span className="flex-1">{notice.text}</span>
                    <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-current opacity-60 hover:opacity-100">
                        <X size={16} />
                    </button>
                </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
                {editingId && (
                    <div className="mb-5 flex items-center justify-between rounded-md bg-primary/5 px-3 py-2 text-sm text-primary">
                        <span className="font-medium">Editing "{editingItem?.title || "content"}"</span>
                        <button type="button" onClick={resetForm} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide hover:underline">
                            <X size={14} /> Cancel edit
                        </button>
                    </div>
                )}

                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-gray-700">
                            <div className="mb-1 flex items-center justify-between">
                                <span>Title</span>
                                <span className="text-xs font-normal text-gray-400">{form.title.length}/{TITLE_LIMIT}</span>
                            </div>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                maxLength={TITLE_LIMIT}
                                className="w-full rounded border border-gray-300 px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Summer service offer"
                            />
                        </label>

                        <label className="block text-sm font-medium text-gray-700">
                            <div className="mb-1 flex items-center justify-between">
                                <span>Message</span>
                                <span className="text-xs font-normal text-gray-400">{form.message.length}/{MESSAGE_LIMIT}</span>
                            </div>
                            <textarea
                                name="message"
                                value={form.message}
                                onChange={handleChange}
                                maxLength={MESSAGE_LIMIT}
                                rows={3}
                                className="w-full rounded border border-gray-300 px-3 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                placeholder="Save 20% on your next service"
                            />
                        </label>

                        <label className="block text-sm font-medium text-gray-700">
                            Link <span className="font-normal text-gray-400">(optional)</span>
                            <div className="relative mt-1">
                                <LinkIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    name="link"
                                    type="url"
                                    value={form.link}
                                    onChange={handleChange}
                                    className="w-full rounded border border-gray-300 py-2 pl-9 pr-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    placeholder="https://..."
                                />
                            </div>
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Starts at
                                <input
                                    name="startsAt"
                                    type="datetime-local"
                                    value={form.startsAt}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </label>
                            <label className="block text-sm font-medium text-gray-700">
                                Ends at
                                <input
                                    name="endsAt"
                                    type="datetime-local"
                                    value={form.endsAt}
                                    onChange={handleChange}
                                    className="mt-1 w-full rounded border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="block text-sm font-medium text-gray-700">
                            Image {editingId ? <span className="font-normal text-gray-400">(leave blank to keep current)</span> : null}
                            <label
                                htmlFor="app-content-image"
                                className="mt-1 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center transition hover:border-primary hover:bg-primary/5"
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Selected preview" className="h-32 w-full rounded object-cover" />
                                ) : editingId && editingItem?.image ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${editingItem.image}`}
                                        alt="Current"
                                        className="h-32 w-full rounded object-cover opacity-80"
                                    />
                                ) : (
                                    <>
                                        <ImagePlus size={24} className="text-gray-400" />
                                        <span className="text-xs text-gray-500">Click to choose an image</span>
                                    </>
                                )}
                                {(imagePreview || (editingId && editingItem?.image)) && (
                                    <span className="text-xs font-medium text-primary">Click to {imagePreview ? "change" : "replace"} image</span>
                                )}
                            </label>
                            <input
                                id="app-content-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelected}
                                className="hidden"
                            />
                        </div>

                        <label className="flex items-center justify-between rounded border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-700">
                            <span>Show on the app</span>
                            <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} className="h-4 w-4 accent-primary" />
                        </label>

                        <div className="flex gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex flex-1 items-center justify-center gap-2 rounded bg-primary px-4 py-2.5 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <ImagePlus size={18} />}
                                {loading ? "Saving..." : editingId ? "Update content" : "Publish content"}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="inline-flex items-center gap-2 rounded border border-gray-300 px-4 py-2.5 text-gray-700 transition hover:bg-gray-50"
                                >
                                    <X size={18} /> Cancel
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </form>

            {cropperImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
                    <div className="w-full max-w-3xl overflow-hidden rounded-lg bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                            <div>
                                <h2 className="font-semibold text-gray-900">Crop banner image</h2>
                                <p className="text-xs text-gray-500">Wide banner ratio: 2.63:1</p>
                            </div>
                            <button type="button" onClick={closeCropper} className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Close cropper">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="relative h-[min(60vh,420px)] bg-gray-950">
                            <Cropper
                                image={cropperImage}
                                crop={crop}
                                zoom={zoom}
                                aspect={BANNER_ASPECT_RATIO}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={(_, areaPixels) => setCroppedAreaPixels(areaPixels)}
                            />
                        </div>
                        <div className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center">
                            <label className="flex flex-1 items-center gap-3 text-sm text-gray-600">
                                <span className="shrink-0">Zoom</span>
                                <input
                                    type="range"
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    value={zoom}
                                    onChange={(event) => setZoom(Number(event.target.value))}
                                    className="w-full accent-primary"
                                />
                            </label>
                            <div className="flex gap-2">
                                <button type="button" onClick={closeCropper} className="rounded border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="button" onClick={applyCrop} className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">Use cropped image</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 px-5 py-4 font-semibold text-gray-900">Published content</div>

                {fetching ? (
                    <div className="space-y-4 p-5">
                        {[1, 2, 3].map((n) => (
                            <div key={n} className="flex animate-pulse gap-4">
                                <div className="h-20 w-32 rounded bg-gray-100" />
                                <div className="flex-1 space-y-2 py-1">
                                    <div className="h-4 w-1/3 rounded bg-gray-100" />
                                    <div className="h-3 w-2/3 rounded bg-gray-100" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
                        <ImageOff size={28} className="text-gray-300" />
                        <p className="text-sm font-medium text-gray-600">No app content yet</p>
                        <p className="text-xs text-gray-400">Publish your first announcement using the form above.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {items.map((item) => {
                            const schedule = getSchedule(item);
                            const isDeleting = deletingId === item._id;
                            return (
                                <div
                                    key={item._id}
                                    className={`flex flex-col gap-4 p-5 transition sm:flex-row sm:items-center ${editingId === item._id ? "bg-primary/5" : "hover:bg-gray-50"
                                        }`}
                                >
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${item.image}`}
                                        alt=""
                                        className="h-20 w-32 shrink-0 rounded object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h2 className="truncate font-semibold text-gray-900">{item.title}</h2>
                                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${schedule.tone}`}>{schedule.label}</span>
                                        </div>
                                        <p className="mt-1 truncate text-sm text-gray-500">{item.message || "No message"}</p>
                                        {(item.startsAt || item.endsAt) && (
                                            <div className="mt-1.5 flex items-center gap-1 text-xs text-gray-400">
                                                <Calendar size={12} />
                                                <span>
                                                    {formatDate(item.startsAt) || "Anytime"} &rarr; {formatDate(item.endsAt) || "No end date"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex shrink-0 gap-2">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(item)}
                                            className="rounded border border-gray-300 p-2 text-gray-600 transition hover:border-primary hover:text-primary"
                                            title="Edit content"
                                        >
                                            <Pencil size={17} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item._id)}
                                            disabled={isDeleting}
                                            className="rounded border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                                            title="Delete content"
                                        >
                                            {isDeleting ? <Loader2 size={17} className="animate-spin" /> : <Trash2 size={17} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}