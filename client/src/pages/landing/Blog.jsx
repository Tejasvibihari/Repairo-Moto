import NavBar from "../../components/ui/NavBar";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import { Calendar, User } from 'lucide-react';
import Footer from "../../components/landing/Footer";

export default function Blog() {


    // Function to truncate text to a specified number of words
    function truncateText(text, maxWords) {
        const words = text.split(' ');
        if (words.length <= maxWords) {
            return text;
        }
        return words.slice(0, maxWords).join(' ') + '...';
    }
   


    return (
        <>
            <NavBar />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Banner */}
                <div className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                >
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/20 z-0" />
                    <div className="relative z-10 text-center">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-3 capitalize tracking-wide">Our Blog</h2>
                        <Breadcrumbs
                            items={[
                                { label: 'Home', href: '/' },
                                { label: 'Blog' },
                            ]}
                        />
                    </div>
                </div>

                {/* Blog Posts */}
                <div className="container mx-auto p-10">
                    <div className="max-w-6xl mx-auto grid gap-16">
                        {/* Blog Posts Loop */}
                        {[{ img: '/images/tery.webp', title: 'Blog Image Post', link: '/blog/post-1' },
                        { img: '/images/bikerepair.jpg', title: 'Blog Second Gallery Post', link: '/blog/post-2' },
                        { img: '/images/helmet.webp', title: 'Motorcycle Safety Tips', link: '/blog/post-3' }
                        ].map((post, idx) => (
                            <div key={idx} className="flex flex-col md:flex-row items-center  shadow-md rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300">
                                <div className="md:w-2/5 w-full overflow-hidden">
                                    <img
                                        src={post.img}
                                        alt={post.title}
                                        className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500 ease-in-out"
                                    />
                                </div>
                                <div className="p-8 md:w-3/5 w-full">
                                    <div className="flex items-center text-gray-500 text-sm mb-4 gap-6">
                                        <div className="flex items-center gap-2">
                                            <User size={18} />
                                            <span>BY: ADMIN</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar size={18} />
                                            <span>27 FEB 2022</span>
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h3>
                                    <p className="text-gray-600 mb-6 leading-relaxed">
                                        {truncateText(`Lorem ipsum dolor sit amet, consectetur adipisicing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`, 100)}
                                    </p>
                                    <a href={`/blog/${post.id}`} className="inline-block bg-primary hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300">
                                        Read More →
                                    </a>
                                </div>
                            </div>
                        ))}

                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-20">
                        <div className="flex items-center space-x-3">
                            <a href="#" className="px-5 py-2 bg-primary text-white font-medium rounded-full shadow hover:bg-gray-800 transition-all duration-300">1</a>
                            <a href="#" className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-all duration-300">2</a>
                            <a href="#" className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-all duration-300">3</a>
                            <a href="#" className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-all duration-300">
                                Next →
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
