import React from 'react'
import VendorProfileCard2 from '../../components/vendor/VendorProfileCard2'
import { useSelector } from 'react-redux';

export default function VendorProfile() {
    const vendor = useSelector((state) => state.vendorAuth.vendor);
    return (
        <>
            <VendorProfileCard2 vendor={vendor} />
        </>
    )
}
