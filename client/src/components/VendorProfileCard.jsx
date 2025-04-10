import { Trash, UserCog } from 'lucide-react'
import React from 'react'

export default function VendorProfileCard() {
    return (
        <>
            <div className='shadow p-4 rounded-sm'>
                <div className='flex flex-row gap-4 justify-between items-center'>
                    <img src='./logo/logo72.png' className='w-40 rounded-xl' />
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
                            <span>Tejasvi Kumar</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Phone:- </span>
                            <span>6205731150</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Email:- </span>
                            <span>Email</span>
                        </div>
                    </div>
                    <div>
                        <div>
                            <span className='font-inter font-semibold'>Address:- </span>
                            <span>Email</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>City:- </span>
                            <span>Email</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>State:- </span>
                            <span>Email</span>
                        </div>
                        <div>
                            <span className='font-inter font-semibold'>Pincode:- </span>
                            <span>Email</span>
                        </div>
                    </div>
                </div>
                <div className='flex flex-row items-center justify-between mt-3'>
                    <button className='flex flex-row itemms-center justify-center px-4 py-2 bg-primary rounded text-white hover:bg-transparent hover:text-primary border border-primary cursor-pointer'>
                        <span className='flex flex-row'><UserCog className='mr-2' />Edit</span>
                    </button>
                    <button className='flex flex-row itemms-center justify-center px-4 py-2 bg-red-600 rounded text-white hover:bg-transparent hover:text-red-600 border border-red-600 cursor-pointer'>
                        <span className='flex flex-row'><Trash className='mr-2' />Edit</span>
                    </button>
                </div>
            </div>
        </>
    )
}
