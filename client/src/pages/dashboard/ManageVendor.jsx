import React from 'react';
import Heading from '../../components/ui/Heading';
import AddVendorForm from '../../components/AddVendorForm';
import VendorProfileCard from '../../components/vendorProfileCard';
import { Search } from 'lucide-react';

export default function ManageVendor() {
    return (
        <>
            <Heading heading={"Manage Vendor"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-100 p-4 rounded shadow">
                    <AddVendorForm />
                </div>
                <div className="bg-gray-100 p-4 rounded shadow">
                    <Heading heading={"All Vendors"} />
                    <div className='relative'>
                        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500' />
                        <input
                            type='text'
                            placeholder='Search Vendor By Name'
                            className='p-2 pl-10 border-gray-300 w-full my-4 rounded border'
                        />
                    </div>
                    <VendorProfileCard />
                </div>
            </div>
        </>
    );
}