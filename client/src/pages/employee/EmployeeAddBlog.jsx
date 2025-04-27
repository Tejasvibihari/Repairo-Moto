import React, { useState } from 'react'
import BlogEditor from '../../components/BlogEditor'
import Heading from "../../components/ui/Heading"
import BlogLivePreview from '../../components/BlogLivePreview'

export default function EmployeeAddBlog() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [banner, setBanner] = useState(null);

    return (
        <>
            <Heading heading={"Add Blog"} />
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
    )
}
