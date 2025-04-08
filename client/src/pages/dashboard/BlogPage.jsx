import React from 'react'
import BlogEditor from '../../components/BlogEditor'
import Heading from "../../components/ui/Heading"

export default function BlogPage() {
    return (
        <div>
            <Heading heading={"Add Blog"} />
            <BlogEditor />
        </div>
    )
}
