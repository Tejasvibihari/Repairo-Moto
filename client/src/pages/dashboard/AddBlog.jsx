import React from 'react'
import BlogEditor from '../../components/BlogEditor'
import Heading from "../../components/ui/Heading"
import BlogLivePreview from '../../components/BlogLivePreview'

export default function AddBlog() {
    return (
        <>
            <Heading heading={"Add Blog"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">

                <div>
                    <BlogEditor />
                </div>
                <div>
                    <BlogLivePreview />
                </div>

            </div>
        </>

    )
}
