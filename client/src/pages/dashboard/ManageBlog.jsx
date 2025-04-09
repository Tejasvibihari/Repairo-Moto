import React from 'react'
import Heading from '../../components/ui/Heading'
import BlogTable from '../../components/BlogTable'

export default function ManageBlog() {
    return (
        <>
            <Heading heading={"Manage Blog"} />
            <div className='shadow-sm border border-gray-300 rounded p-4'>
                <BlogTable/>
            </div>

        </>
    )
}
