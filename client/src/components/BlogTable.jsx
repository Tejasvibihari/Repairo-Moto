import { UserPen, Trash2 } from 'lucide-react';


const currentDate = new Date().toLocaleDateString();

export default function BlogTable({ blogs }) {
    return (
        <div className="p-4 border border-gray-200 rounded shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left">No.</th>
                            <th className="px-4 py-2 text-left">Title</th>
                            <th className="px-4 py-2 text-left">Image</th>
                            <th className="px-4 py-2 text-left">Author</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-end">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {blogs.map((blog, index) => (
                            <tr key={blog._id} className="hover:bg-gray-50 border-b border-gray-200" >
                                <td className="px-3 py-2">{index + 1}</td>
                                <td className="px-3 py-2">{blog.title}</td>
                                <td className="px-3 py-2">
                                    <img src={`${import.meta.env.VITE_API_URL}/${blog.banner}`} alt={blog.banner} className="w-16 h-10 object-cover rounded" />
                                </td>
                                <td className="px-3 py-2">{blog.author}</td>
                                <td className="px-3 py-2">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${blog.status === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                        }`}>
                                        {blog.status}
                                    </span>
                                </td>
                                <td className="px-3 py-2">{currentDate}</td>
                                <td className="px-3 py-2 flex gap-2 flex-wrap justify-end">
                                    <button className="flex items-center justify-center bg-primary text-white py-2 rounded-md px-3 cursor-pointer hover:bg-transparent hover:text-primary border border-primary">
                                        <UserPen size={18} className="mr-0 md:mr-2" />
                                        <span className="hidden md:inline">Edit</span>
                                    </button>
                                    <button className="flex items-center justify-center bg-transparent text-red-600 py-2 rounded-md px-3 cursor-pointer hover:bg-red-600 hover:text-white border border-primary">
                                        <Trash2 size={18} className="mr-0 md:mr-2" />
                                        <span className="hidden md:inline">Delete</span>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div >
    );
}
