import React from 'react'

import TextField from '@mui/material/TextField';
import { Plus } from 'lucide-react';
export default function AddBikeBrand() {
    return (
        <>
            <div className=''>
                <h1 className='text-kanit font-semibold border-l-4 pl-2 border-primary my-2'>
                    Add Bike Brand
                </h1>
                <div className='flex flex-col gap-4 items-end justify-center mt-6 p-4 border border-gray-300 rounded'>

                    <TextField fullWidth id="outlined-basic" label="Bike Brand" variant="outlined" />
                    <button className=" flex flex-row items-center justify-center space-x-2 font-inter text-bold border py-2 rounded-sm border-primary cursor-pointer hover:bg-primary text-primary hover:text-white px-6 cursor pointer">
                        <span> <Plus /></span><span>Add Brand</span>
                    </button>
                </div>

            </div>
        </>
    )
}
