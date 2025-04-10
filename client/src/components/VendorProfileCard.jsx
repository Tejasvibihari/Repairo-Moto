import { Trash, UserCog } from 'lucide-react'
import React from 'react'

export default function VendorProfileCard({ vendor }) {

    const profileImage = vendor.profileImage;

    return (
        <>
            <div className='shadow p-4 rounded-sm'>
                <div className='flex flex-row gap-4 justify-between items-center'>
                    <img src={`${import.meta.env.VITE_API_URL}/${profileImage}`} className='w-40 rounded-xl' />
                    <div className='flex flex-col gap-1'>
                        <div>
                            <span className='font-inter font-semibold'>Business Name:- </span>
                            <span>Tejasvi Kumar</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>GST No.:- </span>
                            <span>Tejasvi Kumar</span>
                        </div>
                    </div>
                </div>
                <div className='border border-gray-300 rounded p-3 mt-4 flex flex-row itms-center justify-between'>
                    <div>
                        <div>
                            <span className='font-inter font-semibold'>Name:- </span>
                            <span>{vendor.firstName} {vendor.lastName}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Phone:- </span>
                            <span>{vendor.phone}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Email:- </span>
                            <span>{vendor.email}</span>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span className='font-inter font-semibold'>Address:- </span>
                            <span>{vendor.address}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>City:- </span>
                            <span>{vendor.city}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>State:- </span>
                            <span>{vendor.state}</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Pincode:- </span>
                            <span>{vendor.pincode}</span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row items-center justify-between mt-3'>
                    <button className='flex flex-row itemms-center justify-center px-4 py-2 bg-primary rounded text-white hover:bg-transparent hover:text-primary border border-primary cursor-pointer'>
                        <span className='flex flex-row'><UserCog className='mr-2' />Edit</span>
                    </button>
                    <button className='flex flex-row itemms-center justify-center px-4 py-2 bg-red-600 rounded text-white hover:bg-transparent hover:text-red-600 border border-red-600 cursor-pointer'>
                        <span className='flex flex-row'><Trash className='mr-2' />Delete</span>
                    </button>
                </div>
            </div>
        </>
    )
}
