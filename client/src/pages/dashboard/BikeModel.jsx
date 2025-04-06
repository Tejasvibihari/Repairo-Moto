import React from 'react'
import AddBikeBrand from '../../components/AddBikeBrand'
import AddBikeModel from '../../components/AddBikeModel'

export default function BikeModel() {
    return (
        <>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <div>
                        <AddBikeBrand />
                    </div>
                    <div className='mt-4'>
                        <AddBikeModel />
                    </div>
                </div>

                <div>
                    hELLO
                </div>
            </div>
        </>
    )
}
