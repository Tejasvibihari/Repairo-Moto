import React, { useEffect, useState } from 'react';
import BlogEditor from '../../components/BlogEditor';
import Heading from "../../components/ui/Heading";
import BlogLivePreview from '../../components/BlogLivePreview';
import { useParams } from 'react-router-dom';
import axiosClient from '../../service/axiosClient';

export default function EmployeeEditBlog() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [banner, setBanner] = useState(null);
    const { id } = useParams();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/api/admin/blog/blogbyid/${id}`);
                const data = response.data;

                // Set initial form values
                setTitle(data.title || '');
                setContent(data.content || '');
                setBanner(data.banner || null);
                setLoading(false);
            } catch (error) {
                console.log("Error fetching blog:", error);
                setLoading(false);
            }
        };
        fetchBlog();
    }, []);
    console.log(banner)
    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <>
            <Heading heading={"Edit Blog"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <BlogEditor
                    title={title}
                    setTitle={setTitle}
                    content={content}
                    setContent={setContent}
                    banner={banner}
                    setBanner={setBanner}
                />
                <BlogLivePreview
                    title={title}
                    content={content}
                    banner={banner}
                />
            </div>
        </>
    );
}
