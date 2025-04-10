import React, { useEffect, useState } from 'react';
import Heading from '../../components/ui/Heading';
import AddVendorForm from '../../components/AddVendorForm';
import VendorProfileCard from '../../components/vendorProfileCard';
import { Search } from 'lucide-react';
import { useDispatch, useSelector } from "react-redux"
import axiosClient from '../../service/axiosClient';
import { setVendor } from '../../app/slice/vendorSlice';

export default function ManageVendor() {
    const dispatch = useDispatch();
    const vendors = useSelector((state) => state.vendor.vendors)
    console.log(vendors)
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const getVendor = async () => {
            const response = await axiosClient.get("/api/vendor/getallvendor");
            dispatch(setVendor(response.data.vendors));
        };
        getVendor();

    }, [dispatch]);
    console.log(searchTerm)
    const filteredVendors = vendors.filter(v =>
        v.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return (
        <>
            <Heading heading={"Manage Vendor"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-100 p-4 rounded shadow">
                    <AddVendorForm />
                </div>
                <div className="bg-gray-100 p-4 rounded shadow h-screen overflow-auto">
                    <Heading heading={"All Vendors"} />
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input
                            type='text'
                            placeholder='Search Vendor By Name'
                            className='p-2 pl-10 border-gray-300 w-full my-4 rounded border'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {/* {
                        vendors && vendors.map((v, i) => <VendorProfileCard key={i} vendor={v} />)
                    } */}
                    {
                        filteredVendors.length > 0 ? (
                            filteredVendors.map((v, i) => <VendorProfileCard key={i} vendor={v} />)
                        ) : (
                            <p className="text-gray-500 flex items-center justify-center">No vendors found.</p>
                        )
                    }
                </div>
            </div>
        </>
    );
}