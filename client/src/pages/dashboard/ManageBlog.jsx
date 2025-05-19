import React, { useEffect, useState } from 'react'
import Heading from '../../components/ui/Heading'
import BlogTable from '../../components/BlogTable'
import axiosClient from '../../service/axiosClient';
import CircularLoading from '../../components/ui/CircularLoading';

export default function ManageBlog() {
    const [loading, setLoading] = useState(false)
    const [allBlogs, setAllBlogs] = useState([]);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get("/api/admin/blog/getallblog")
                setAllBlogs(response.data.blogs)
                setLoading(false);
            } catch (error) {
                console.log(error)
            }
        }
        fetchBlogs()
    }, [])
    return (
        <>
            <Heading heading={"Manage Blog"} />
            <div className='shadow-sm border border-gray-300 rounded p-4'>
                {loading ? <CircularLoading /> : <BlogTable blogs={allBlogs} />}
            </div>

        </>
    )
}
