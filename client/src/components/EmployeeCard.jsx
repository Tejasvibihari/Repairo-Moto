import React from 'react'
import { Trash, UserPen } from 'lucide-react'

export default function EmployeeCard() {
    return (
        <>
            <div className='border border-primary shadow-sm rounded-md p-4 mt-6 w-full'>
                <div className='flex flex-col gap-2 items-center justify-between'>
                    <div>
                        <img src="https://via.placeholder.com/150" alt="Employee" className='w-24 h-24 rounded-full border border-primary shadow-md' />
                    </div>
                    <div className='flex flex-col gap-1 items-center justify-center'>
                        <span className='text-sm font-inter font-semibold'>John Doe</span>
                        <span className='text-sm font-inter font-semibold'>Role</span>
                        <span className='text-sm font-inter'>6205731150</span>
                        <span className='text-sm font-inter'>tejasvibihari2000@gmail.com</span>
                        <span className='text-sm font-inter'>Rating</span>
                    </div>
                    <div className='flex gap-2'>
                        <button className='flex items-center justify-center bg-primary text-white py-2 rounded-md px-8 cursor-pointer hover:bg-transparent hover:text-primary border border-primary'>
                            <UserPen size={18} className='mr-2' /> Edit
                        </button>
                        <button className='flex items-center justify-center bg-transparent text-red-600 py-2 rounded-md px-8 cursor-pointer hover:bg-red-600 hover:text-white border border-primary'>
                            <Trash size={18} className='mr-2' />    Delete
                        </button>
                    </div>
                </div>

            </div>
        </>
    )
}
