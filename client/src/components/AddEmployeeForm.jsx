import React from 'react'
import Heading from './ui/Heading'
import TextField from '@mui/material/TextField';

export default function AddEmployeeForm() {
    return (
        <>
            <div className=''>
                <Heading heading="Add Employee" />
                <form className='grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 shadow-sm border border-gray-300 rounded p-4'>
                    <div className=''>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>
                            First Name
                        </label>
                        <input
                            type='text'
                            className='border-2 border-gray-300 rounded-md p-2 w-full'
                            required
                            placeholder='First Name'
                        />
                    </div>
                    <div className=''>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>
                            Last Name
                        </label>
                        <input
                            type='text'
                            className='border-2 border-gray-300 rounded-md p-2 w-full'
                            required
                            placeholder='Last Name'
                        />
                    </div>
                    <div className=''>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>
                            Phone Number
                        </label>
                        <input
                            type='email'
                            className='border-2 border-gray-300 rounded-md p-2 w-full'
                            required
                            placeholder='0000000000'
                        />
                    </div>
                    <div className=''>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>
                            Email
                        </label>
                        <input
                            type='email'
                            className='border-2 border-gray-300 rounded-md p-2 w-full'
                            required
                            placeholder='Email'
                        />
                    </div>
                    <div className=''>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>
                            Role
                        </label>
                        <select className='border-2 border-gray-300 rounded-md p-2 w-full'>
                            <option disabled value="" selected>Select One</option>
                            <option value="admin">Operation Manager</option>
                            <option value="employee">Mechanic</option>
                            <option value="employee">Delivery</option>
                            <option value="manager">Manager</option>
                            <option value="hr">HR</option>
                            <option value="accountant">Accountant</option>
                        </select>
                    </div>
                    <div className=''>
                        <label className='text-gray-700 font-semibold mb-2 block text-sm'>
                            Profile Image
                        </label>
                        <input
                            type='file'
                            className='border-2 border-gray-300 rounded-md p-2 w-full'
                            required
                            placeholder='Email'
                        />
                    </div>
                    <button className='bg-primary text-white font-semibold py-2 px-4 rounded-md mt-4 col-span-1 md:col-span-3 cursor-pointer'>
                        Add Employee
                    </button>
                </form>
            </div>
        </>
    )
}
