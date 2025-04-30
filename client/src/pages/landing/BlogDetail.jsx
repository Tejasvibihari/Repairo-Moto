import { useParams } from "react-router-dom";

import NavBar from "../../components/ui/NavBar";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import Footer from "../../components/landing/Footer"

export default function BlogDetail() {
    const { id } = useParams();


    const blogPosts = {
        1: {
            title: "Blog Image Post",
            date: "27 FEB 2022",
            author: "Admin",
            image: "/images/tery.webp",
            content: [
                {
                    type: "paragraph", text: "Welcome to our motorcycle safety blog Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea reiciendis culpa pariatur esse? Tempore, odit reiciendis! Et, in qui sint, consequatur ad eaque voluptatum odit dolores tenetur ab veniam pariatur!"
                },
                {
                    type: "paragraph", text: "Welcome to our motorcycle safety blog Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ea reiciendis culpa pariatur esse? Tempore, odit reiciendis! Et, in qui sint, consequatur ad eaque voluptatum odit dolores tenetur ab veniam pariatur!"
                },



            ]
        },
        2: {
            title: "Second Gallery Post",
            date: "28 FEB 2022",
            author: "Admin",
            image: "/images/bikerepair.jpg",
            content: [
                {
                    type: "paragraph", text: "Second post content Regular maintenance is key for safety and performance Regular maintenance is key for safety and performance "
                }
            ]
        },
        3: {
            title: "Motorcycle Safety Tips",
            date: "01 MAR 2022",
            author: "Admin",
            image: "/images/helmet.webp",
            content: [
                { type: "paragraph", text: "Safety tips for every motorcycle rider." }
            ]
        }
    };

    const post = blogPosts[id];

    if (!post) return <div className="p-10">Blog Not Found</div>;






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
            <div className="bg-gray-50 py-10 px-4 sm:px-6">
                <div className="max-w-6xl mx-auto bg-white p-6 sm:p-10 rounded-xl  space-y-8">

                    {/* Top Featured Image */}
                    <img src={post.image} alt={post.title} className="w-full h-80 object-cover rounded-lg" />

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-sm text-gray-800">
                        <span>By <strong>{post.author}</strong></span>
                        <span className="text-gray-900">{post.date}</span>
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl font-extrabold text-gray-900">{post.title}</h1>

                    {/* Content */}
                    <div className="space-y-6 text-gray-700 text-lg leading-relaxed max-w-none text-justify ">
                        {post.content
                            .filter(block => block.type === 'paragraph')
                            .map((block, idx) => (
                                <p key={idx}>{block.text}</p>
                            ))}
                    </div>


                </div>
            </div>

            {/* footer */}

            <Footer/>

        </>
    )
}
