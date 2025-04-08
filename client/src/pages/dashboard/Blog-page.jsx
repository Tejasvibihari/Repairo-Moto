import React from 'react'
import BlogEditor from './blog-editor'
import Heading from '../../components/ui/Heading'

export default function Blog() {
    return (
        <div>
            <Heading heading={"Blog"} />
            <BlogEditor />
        </div>
    )
}
