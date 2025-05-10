import { useState } from 'react';
import NavBar from '../../components/ui/NavBar';
import Footer from '../../components/landing/Footer';
import BreadCrumbs from '../../components/ui/BreadCrumbs';
import { Heart, BookmarkPlus, Share2, MessageCircle, X } from 'lucide-react';
import ImageModal from '../../components/ui/ImageModel';

export default function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [modalImage, setModalImage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const bikes = [
    {
      id: 1,
      imageUrl: "/images/pic1.jpeg",
      title: "Royal Enfield Classic 350",
      engine: "349cc",
      price: "₹1.90 Lakh",
      type: "Cruiser",
      likes: 150,
      comments: 18,
    },
    {
      id: 2,
      imageUrl: "/images/pic2.jpeg",
      title: "Yamaha R15 V4",
      engine: "155cc",
      price: "₹1.82 Lakh",
      type: "Sports",
      likes: 200,
      comments: 22,
    },
    {
      id: 3,
      imageUrl: "/images/pic3.jpeg",
      title: "Hero Splendor Plus",
      engine: "97.2cc",
      price: "₹75,000",
      type: "Commuter",
      likes: 120,
      comments: 15,
    },
    {
      id: 4,
      imageUrl: "/images/pic4.jpeg",
      title: "Ather 450X",
      engine: "Electric",
      price: "₹1.26 Lakh",
      type: "Electric",
      likes: 170,
      comments: 20,
    },
    {
      id: 5,
      imageUrl: "/images/pic5.jpeg",
      title: "Bajaj Pulsar NS200",
      engine: "199.5cc",
      price: "₹1.48 Lakh",
      type: "Sports",
      likes: 140,
      comments: 17,
    },
    {
      id: 6,
      imageUrl: "/images/pic6.jpeg",
      title: "KTM Duke 390",
      engine: "373.2cc",
      price: "₹2.97 Lakh",
      type: "Electric",
      likes: 180,
      comments: 25,
    },
    {
      id: 7,
      imageUrl: "/images/pic7.jpeg",
      title: "Honda CB Shine",
      engine: "124cc",
      price: "₹77,000",
      type: "Commuter",
      likes: 130,
      comments: 19,
    },
    {
      id: 8,
      imageUrl: "/images/pic8.jpeg",
      title: "TVS Apache RTR 160",
      engine: "159.7cc",
      price: "₹1.10 Lakh",
      type: "Sports",
      likes: 160,
      comments: 21,
    },
    {
      id: 9,
      imageUrl: "/images/pic9.jpeg",
      title: "Suzuki Gixxer SF 250",
      engine: "249cc",
      price: "₹1.85 Lakh",
      type: "Sports",
      likes: 190,
      comments: 23,
    },
    {
      id: 10,
      imageUrl: "/images/pic10.jpeg",
      title: "Kawasaki Ninja 300",
      engine: "296cc",
      price: "₹3.40 Lakh",
      type: "Sports",
      likes: 210,
      comments: 30,
    }
  ];

  const [items, setItems] = useState(bikes);

  const categories = ["All", ...new Set(bikes.map(bike => bike.type))];

  const filteredItems =
    selectedCategory === "All"
      ? items
      : items.filter(item => item.type === selectedCategory);

  const handleLike = (id) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, likes: item.likes + 1 } : item
      )
    );
  };

  const openModal = (imageUrl) => {
    console.log("Opening modal for:", imageUrl);
    setModalImage(imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalImage(null);
  };

  return (
    <>
      <NavBar />
      <div className="min-h-screen">
        {/* Hero Section */}
        <div
          className="relative bg-cover bg-center bg-no-repeat h-72 flex items-center justify-center text-white"
          style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-transparent z-0" />
          <div className="relative z-10 text-center">
            <h2 className="text-4xl md:text-5xl font-bold">Gallery</h2>

            <BreadCrumbs
              items={[
                { label: 'Home', href: '/' },
                { label: 'Gallery', href: '/gallery' },
              ]}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition 
                  ${selectedCategory === category
                    ? 'bg-black text-white'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="container mx-auto px-4 pb-10">
          {filteredItems.length === 0 ? (
            <p className="text-center text-gray-500">No bikes found.</p>
          ) : (
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  className="break-inside-avoid mb-4 rounded-lg overflow-hidden bg-white shadow hover:shadow-lg transition"
                >
                  <div className="relative group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      onClick={() => openModal(item.imageUrl)}
                      className="w-full h-64 object-cover cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition pointer-events-none" />
                    <div className="absolute bottom-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100 pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                      >
                        <Heart size={18} className="text-gray-700" />
                      </button>
                      <button
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <BookmarkPlus size={18} className="text-gray-700" />
                      </button>
                      <button
                        className="p-2 bg-white rounded-full shadow hover:bg-gray-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Share2 size={18} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">@BikerBrand</p>
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="flex items-center mr-3">
                        <Heart size={14} className="mr-1" />
                        {item.likes}
                      </span>
                      <span className="flex items-center">
                        <MessageCircle size={14} className="mr-1" />
                        {item.comments}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={showModal}
        imageUrl={modalImage}
        onClose={closeModal}
      />

      <Footer />
    </>
  );
}