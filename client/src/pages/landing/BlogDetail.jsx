import { useParams } from "react-router-dom";
import { useState } from "react";
import NavBar from "../../components/ui/NavBar";
import Breadcrumbs from "../../components/ui/Breadcrumbs";

export default function BlogDetail() {
    const { id } = useParams(); 
    const [form, setForm] = useState({ name: '', message: '' });
    const [comments, setComments] = useState([
        { id: 1, name: "John Doe", message: "Great blog! Very informative." },
        { id: 2, name: "Jane Smith", message: "Loved the tips, thanks!" }
    ]);

    const blogPosts = {
        1: {
            title: "Blog Image Post",
            date: "27 FEB 2022",
            author: "Admin",
            image: "/images/tery.webp",
            content: [
                { type: "paragraph", text: "Welcome to our motorcycle safety blog." },
                { type: "image", src: "/images/helmet.webp", alt: "Helmet Safety" },
                { type: "paragraph", text: "Always wear a helmet to prevent head injuries." },
                { type: "image", src: "/images/bikerepair.jpg", alt: "Bike Repair" },
                { type: "paragraph", text: "Regular maintenance is key for safety and performance." }
            ]
        },
        2: {
            title: "Second Gallery Post",
            date: "28 FEB 2022",
            author: "Admin",
            image: "/images/bikerepair.jpg",
            content: [
                { type: "paragraph", text: "Second post content here..." }
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
   

  


    function handleSubmit(e) {
        e.preventDefault();
        if (form.name && form.message) {
            const newComment = { id: comments.length + 1, ...form };
            setComments([newComment, ...comments]);
            setForm({ name: '', message: '' });
        }
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
                            { label: 'Blog' },
                        ]}
                    />
                </div>
            </div>
   
      <div className="min-h-screen bg-gray-50 py-20 px-6">
          <div className="max-w-4xl mx-auto">

              {/* Blog Header */}
              <h1 className="text-4xl font-extrabold mb-4 text-gray-900">{post.title}</h1>
              <div className="flex items-center gap-6 text-gray-500 text-sm mb-8">
                  <span>By {post.author}</span>
                  <span>•</span>
                  <span>{post.date}</span>
              </div>

              {/* Blog Content */}
              <div className="space-y-8 text-gray-700 leading-relaxed text-lg mb-16">
                  {post.content.map((block, idx) => (
                      block.type === 'paragraph' ? (
                          <p key={idx}>{block.text}</p>
                      ) : (
                          <img
                              key={idx}
                              src={block.src}
                              alt={block.alt}
                              className="w-full h-80 object-cover rounded-lg"
                          />
                      )
                  ))}
              </div>

              {/* Comments Section */}
              <div className="mt-16">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Comments ({comments.length})</h2>
                  <div className="space-y-6 mb-12">
                      {comments.map(comment => (
                          <div key={comment.id} className="p-4 bg-white rounded-lg shadow-md">
                              <h4 className="font-semibold text-gray-900">{comment.name}</h4>
                              <p className="text-gray-600">{comment.message}</p>
                          </div>
                      ))}
                  </div>

                  {/* Leave a Comment Form */}
                  <h2 className="text-2xl font-bold mb-6 text-gray-800">Leave a Comment</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <input
                          type="text"
                          placeholder="Your Name"
                          value={form.name}
                          onChange={e => setForm({ ...form, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                      />
                      <textarea
                          placeholder="Your Comment"
                          value={form.message}
                          onChange={e => setForm({ ...form, message: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary h-40"
                          required
                      />
                      <button
                          type="submit"
                          className="bg-primary hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-full transition-all duration-300"
                      >
                          Post Comment
                      </button>
                  </form>
              </div>
          </div>
            </div>
            

        </>
  )
}
