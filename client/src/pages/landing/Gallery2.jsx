import { useState, useEffect } from 'react';
import { X, Heart, Download, Share2, MessageCircle } from 'lucide-react';

// Mock data for gallery images
const mockImages = [
    {
        id: 1,
        src: '/api/placeholder/400/300',
        alt: 'Gallery Image 1',
        user: 'John Doe',
        likes: 124,
        comments: 12,
        aspectRatio: 4 / 3
    },
    {
        id: 2,
        src: '/api/placeholder/400/600',
        alt: 'Gallery Image 2',
        user: 'Jane Smith',
        likes: 89,
        comments: 5,
        aspectRatio: 2 / 3
    },
    {
        id: 3,
        src: '/api/placeholder/400/400',
        alt: 'Gallery Image 3',
        user: 'Robert Johnson',
        likes: 245,
        comments: 32,
        aspectRatio: 1
    },
    {
        id: 4,
        src: '/api/placeholder/400/250',
        alt: 'Gallery Image 4',
        user: 'Sarah Williams',
        likes: 67,
        comments: 8,
        aspectRatio: 8 / 5
    },
    {
        id: 5,
        src: '/api/placeholder/400/550',
        alt: 'Gallery Image 5',
        user: 'Michael Brown',
        likes: 189,
        comments: 24,
        aspectRatio: 4 / 5.5
    },
    {
        id: 6,
        src: '/api/placeholder/400/300',
        alt: 'Gallery Image 6',
        user: 'Emily Davis',
        likes: 112,
        comments: 15,
        aspectRatio: 4 / 3
    },
    {
        id: 7,
        src: '/api/placeholder/400/500',
        alt: 'Gallery Image 7',
        user: 'Daniel Wilson',
        likes: 78,
        comments: 6,
        aspectRatio: 4 / 5
    },
    {
        id: 8,
        src: '/api/placeholder/400/320',
        alt: 'Gallery Image 8',
        user: 'Olivia Martinez',
        likes: 156,
        comments: 19,
        aspectRatio: 5 / 4
    },
    {
        id: 9,
        src: '/api/placeholder/400/600',
        alt: 'Gallery Image 9',
        user: 'James Taylor',
        likes: 234,
        comments: 42,
        aspectRatio: 2 / 3
    },
    {
        id: 10,
        src: '/api/placeholder/400/350',
        alt: 'Gallery Image 10',
        user: 'Sophia Anderson',
        likes: 95,
        comments: 11,
        aspectRatio: 8 / 7
    }
];

// Modal Component for Full Screen View
const ImageModal = ({ image, onClose }) => {
    if (!image) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="relative max-w-6xl w-full bg-white rounded-lg shadow-xl overflow-hidden">
                <div className="flex justify-end p-2 absolute top-0 right-0 z-10">
                    <button
                        onClick={onClose}
                        className="bg-black/50 hover:bg-black text-white p-2 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="bg-gray-100 flex items-center justify-center">
                        <img
                            src={image.src}
                            alt={image.alt}
                            className="w-full h-auto max-h-[80vh] object-contain"
                        />
                    </div>

                    {/* Info Section */}
                    <div className="p-6 flex flex-col">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 rounded-full bg-gray-300 mr-3"></div>
                            <div>
                                <p className="font-medium">{image.user}</p>
                                <p className="text-sm text-gray-500">Photographer</p>
                            </div>
                        </div>

                        <h2 className="text-xl font-bold mb-4">{image.alt}</h2>

                        <div className="flex items-center space-x-6 my-4">
                            <div className="flex items-center">
                                <Heart size={20} className="text-gray-600 mr-2" />
                                <span>{image.likes}</span>
                            </div>
                            <div className="flex items-center">
                                <MessageCircle size={20} className="text-gray-600 mr-2" />
                                <span>{image.comments}</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t flex justify-between">
                            <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-2">
                                <Share2 size={20} />
                            </button>
                            <button className="bg-primary text-white px-4 py-2 rounded-full hover:bg-opacity-90">
                                <Download size={20} className="inline mr-2" />
                                Download
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Gallery Item Component
const GalleryItem = ({ image, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className="break-inside-avoid mb-4"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="relative rounded-lg overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-shadow"
                onClick={() => onClick(image)}
            >
                <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-auto object-cover"
                />

                {/* Hover overlay */}
                {isHovered && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex flex-col justify-between p-3">
                        <div className="flex justify-end">
                            <button
                                className="bg-white rounded-full p-2 shadow hover:bg-gray-100"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    console.log('Save to collection');
                                }}
                            >
                                <Heart size={16} className="text-gray-700" />
                            </button>
                        </div>
                        <div className="text-white">
                            <p className="font-medium">{image.user}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Pinterest Gallery Component
export default function PinterestGallery({ images = mockImages }) {
    const [selectedImage, setSelectedImage] = useState(null);
    const [columnCount, setColumnCount] = useState(4);

    // Responsive column adjustment
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setColumnCount(1);
            } else if (window.innerWidth < 768) {
                setColumnCount(2);
            } else if (window.innerWidth < 1024) {
                setColumnCount(3);
            } else {
                setColumnCount(4);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-6 text-primary">Photo Gallery</h2>

            {/* CSS Grid-based masonry layout */}
            <div
                className="masonry-grid"
                style={{
                    columnCount: columnCount,
                    columnGap: '1rem',
                    width: '100%'
                }}
            >
                {images.map(image => (
                    <GalleryItem
                        key={image.id}
                        image={image}
                        onClick={setSelectedImage}
                    />
                ))}
            </div>

            {/* Modal for full screen view */}
            {selectedImage && (
                <ImageModal
                    image={selectedImage}
                    onClose={() => setSelectedImage(null)}
                />
            )}

            {/* Add custom CSS for animations */}
            <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}