import React from 'react'

import TextField from '@mui/material/TextField';
import { Plus } from 'lucide-react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
export default function AddBikeModel() {
    return (
        <>
            <div className=''>
                <h1 className='text-kanit font-semibold border-l-4 pl-2 border-primary my-2'>
                    Add Bike Model
                </h1>
                <div className='flex flex-col gap-4 items-end justify-center mt-6 p-4 border border-gray-300 rounded'>
                    <FormControl fullWidth>
                        <InputLabel id="demo-simple-select-label">Select Brand</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            label="Select Brand"
                            sx={{ marginBottom: 2 }} // Adds margin below the Select component
                        >
                            <MenuItem value={10}>Ten</MenuItem>
                            <MenuItem value={20}>Twenty</MenuItem>
                            <MenuItem value={30}>Thirty</MenuItem>
                        </Select>
                        <TextField fullWidth id="outlined-basic" label="Bike Model" variant="outlined" />
                    </FormControl>
                    <button className=" flex flex-row items-center justify-center space-x-2 font-inter text-bold border py-2 rounded-sm border-primary cursor-pointer hover:bg-primary text-primary hover:text-white px-6 cursor pointer">
                        <span> <Plus /></span><span>Add Model</span>
                    </button>
                </div>

            </div>
        </>
    )
}
