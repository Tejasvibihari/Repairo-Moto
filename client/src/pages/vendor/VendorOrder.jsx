import React from 'react'
import OrderCard from '../../components/vendor/OrderCard'

export default function VendorOrder() {
    return (
        <div className='grid grid-cols-1 md:grid-cols-2'>
            <OrderCard />
            <OrderCard />
            {/* <OrderCard /> */}
            {/* <OrderCard /> */}
        </div>
    )
}
