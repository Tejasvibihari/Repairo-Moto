import React from 'react'
import Heading from './ui/Heading'

export default function BrandCard({ brands }) {

    return (
        <>
            <div className='border border-gray-300 rounded p-4 shadow-sm h-[100vh] overflow-y-auto'>
                <Heading heading={"Bike Brand & Model"} />
                <div>
                    {brands && brands.map((brand) => (
                        <fieldset key={brand._id} className='border border-gray-300 rounded p-4 my-4'>
                            <legend className='text-kanit font-semibold border-l-4 border-r-4 px-2 border-primary my-2'>
                                {brand.brandName}
                            </legend>
                            <div className='flex flex-row flex-wrap items-center justify-start gap-2'>
                                {brand.models.map((model) => (
                                    <span key={model._id} className='border border-gray-300 rounded p-2 m-2 w-auto'>
                                        {model.name.charAt(0).toUpperCase() + model.name.slice(1)}
                                    </span>
                                ))}
                            </div>

                        </fieldset>
                    ))}
                </div>
            </div>
        </>
    )
}
