import React from 'react';
import Heading from '../../components/ui/Heading';
import AddVendorForm from '../../components/AddVendorForm';

export default function ManageVendor() {
    return (
        <>
            <Heading heading={"Manage Vendor"} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-100 p-4 rounded shadow">
                    <AddVendorForm />
                </div>
                <div className="bg-gray-100 p-4 rounded shadow">

                </div>
            </div>
        </>
    );
}