import React from 'react'

export default function Heading({ heading }) {
    return (
        <>
            <h1 className='text-kanit font-semibold border-l-4 pl-2 border-primary my-2'>
                {heading}
            </h1>
        </>
    )
}
