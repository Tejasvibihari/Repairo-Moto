import { useParams } from "react-router-dom";

import NavBar from "../../components/ui/NavBar";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Footer from "../../components/landing/Footer"
import CircularLoading from "../../components/ui/CircularLoading";
import { useEffect, useState } from "react";
import axiosClient from "../../service/axiosClient";

export default function BlogDetail() {
    const { id } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                const res = await axiosClient.get(`/api/admin/blog/blogbyid/${id}`);
                setBlog(res.data);
                setLoading(false);
            } catch (err) {
                setError('Blog not found');
                setLoading(false);
                console.log(err)
            }
        };

        fetchBlog();
    }, [id]);



    if (loading) {
        return (
            <div className="flex justify-center items-center h-[50vh]">
                <CircularLoading />
            </div>
        );
    }


    if (error || !blog) {
        return <div className="p-10 text-red-600 font-semibold">{error || 'Blog Not Found'}</div>;
    }
    return (
        <>
            <NavBar />
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
                            { label: 'Blog Detail' },
                        ]}
                    />
                </div>
            </div>

            {/* Blog Detail Section */}
            {loading ? <CircularLoading size={30} /> :
                <div className="bg-gray-50 py-10 px-4 sm:px-6">
                    <div className="max-w-6xl mx-auto bg-white p-6 sm:p-10 rounded-xl  space-y-8">

                        {/* Top Featured Image */}
                        <img src={`${import.meta.env.VITE_API_URL}${blog.banner}`} alt={blog.title} className="w-full h-80 object-cover rounded-lg" />

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm text-gray-800">
                            <span>By <strong>{blog.author}</strong></span>
                            <span className="text-gray-900">{blog.date}</span>
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl font-extrabold text-gray-900">{blog.title}</h1>

                        {/* Content */}
                        <div
                            className="space-y-6 text-gray-700 text-lg leading-relaxed max-w-none text-justify"
                            dangerouslySetInnerHTML={{ __html: blog.content }}
                        ></div>
                    </div>
                </div>
            }

            {/* footer */}

            <Footer />

        </>
    )
}
