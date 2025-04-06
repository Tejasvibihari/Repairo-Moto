import React from 'react'

export default function BrandCard({ brands }) {
    // console.log(brands)
    return (
        <>
            <div className='border border-gray-300 rounded p-4 shadow-sm'>
                <h1 className='text-kanit font-semibold border-l-4 pl-2 border-primary my-2'>
                    Bike Brand & Model
                </h1>
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
