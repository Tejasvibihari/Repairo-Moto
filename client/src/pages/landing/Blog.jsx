import NavBar from "../../components/ui/NavBar";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import { Calendar, User } from 'lucide-react';
import Footer from "../../components/landing/Footer";
import { motion } from "framer-motion";
import axiosClient from "../../service/axiosClient";
import { useEffect, useState } from "react";
import CircularLoading from "../../components/ui/CircularLoading";
import { Link } from "react-router-dom";

export default function Blog() {
    const [loading, setLoading] = useState(false)
    const [allBlogs, setAllBlogs] = useState([])

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get("/api/admin/blog/getallblog")
                console.log(response.data.blogs)
                setAllBlogs(response.data.blogs)
                setLoading(false);
            } catch (error) {
                console.log(error)
            }
        }
        fetchBlogs()
    }, [])

    const stripHtml = (html) => {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    };

    const truncateHtmlText = (html, length) => {
        const plainText = stripHtml(html);
        return plainText.length > length ? plainText.slice(0, length) + '...' : plainText;
    };
    return (
        <>
            <NavBar />

            <div className="min-h-screen bg-gray-50">
                {/* Hero Banner */}
                <motion.div
                    className="relative bg-cover bg-center h-72 flex items-center justify-center text-white"
                    style={{ backgroundImage: "url('/images/Breadcrums.png')" }}
                    initial={{ opacity: 0, y: -50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
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
                </motion.div>

                {/* Blog Posts */}
                <div className="container mx-auto p-10">
                    <div className="max-w-6xl mx-auto grid gap-16">
                        {/* Blog Posts Loop */}
                        {loading ? (
                            <div className="flex justify-center items-center min-h-[200px]">
                                <CircularLoading />
                            </div>
                        ) : allBlogs && allBlogs.length > 0 ? (
                            allBlogs.map((blog, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row items-center shadow-md rounded-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300 mb-6">
                                    <div className="md:w-2/5 w-full overflow-hidden">
                                        <img
                                            src={`${import.meta.env.VITE_API_URL}${blog.banner}`}
                                            alt={blog.title}
                                            className="w-full h-64 object-cover transform hover:scale-105 transition-transform duration-500 ease-in-out"
                                        />
                                    </div>
                                    <div className="p-8 md:w-3/5 w-full">
                                        <div className="flex items-center text-gray-500 text-sm mb-4 gap-6">
                                            <div className="flex items-center gap-2">
                                                <User size={18} />
                                                <span>BY: {blog.author}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={18} />
                                                <span>
                                                    {new Date(blog.updatedAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{blog.title}</h3>
                                        <p className="text-gray-600 mb-6 leading-relaxed">
                                            {truncateHtmlText(blog.content || '', 100)}
                                        </p>
                                        <Link
                                            to={`/blog/${blog._id}`}
                                            className="inline-block bg-primary hover:bg-gray-800 text-white px-6 py-3 rounded-full font-semibold transition-all duration-300"
                                        >
                                            Read More →
                                        </Link>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 text-lg font-medium py-8">No Blogs Found</div>
                        )}


                    </div>

                    {/* Pagination */}
                    <motion.div
                        className="flex justify-center mt-20"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="flex items-center space-x-3">
                            <a href="#" className="px-5 py-2 bg-primary text-white font-medium rounded-full shadow hover:bg-gray-800 transition-all duration-300">1</a>
                            <a href="#" className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-all duration-300">2</a>
                            <a href="#" className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-all duration-300">3</a>
                            <a href="#" className="px-5 py-2 bg-gray-200 text-gray-700 font-medium rounded-full hover:bg-gray-300 transition-all duration-300">
                                Next →
                            </a>
                        </div>
                    </motion.div>
                </div>
            </div >

            <Footer />
        </>
    );
}
