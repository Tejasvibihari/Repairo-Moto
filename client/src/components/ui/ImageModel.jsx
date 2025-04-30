// components/ui/ImageModal.jsx
import { X } from 'lucide-react';

export default function ImageModal({ isOpen, imageUrl, onClose }) {
    if (!isOpen || !imageUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-5">
            <div className="bg-gray-100 rounded-xl shadow-lg w-full max-w-3xl h-[80vh] flex overflow-hidden relative">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white z-50"
                >
                    <X size={28} className="bg-black/70 rounded-full p-1" />
                </button>

                {/* Left - Image */}
                <div className="w-full flex items-center justify-center p-3">
                    <img
                        src={imageUrl}
                        alt="Preview"
                        className="h-full object-contain "
                    />
                </div>

               
            </div>
        </div>
    );
}
