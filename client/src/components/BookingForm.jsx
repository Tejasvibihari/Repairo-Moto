import React from 'react'
import Heading from './ui/Heading'
import AlertSnackBar from './ui/AlertSnackBar'
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Phone, CircleHelp, IndianRupee, Bug } from 'lucide-react';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import FormHelperText from '@mui/material/FormHelperText';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import Checkbox from '@mui/material/Checkbox';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
export default function BookingForm() {
    return (
        <>
            <AlertSnackBar />
            <div>
                <Heading heading={"Booking Form"} />
                <form className='my-6 p-4 border shadow border-gray-300'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' >
                        <div>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Name"
                                variant="outlined"
                                placeholder='Enter Name'
                                required
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <AccountCircle sx={{ color: 'action.active', mr: 1 }} />
                                        ),
                                    },
                                }}
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Contact No."
                                required
                                variant="outlined"
                                placeholder='Contact No.'
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <Phone className='mr-1 text-gray-600' />
                                        ),
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-6'>
                        <div>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="City"
                                variant="outlined"
                                placeholder='Enter Name'
                                value="Patna"
                                required
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <LocationCityIcon sx={{ color: 'action.active', mr: 1 }} />
                                        ),
                                    },
                                }}
                            />
                        </div>
                        <div>
                            <Select
                                // value={age} // Bind the state value
                                // onChange={handleChange} // Handle changes
                                fullWidth
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value="">
                                    <em>Select an option</em> {/* Placeholder text */}
                                </MenuItem>
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                            <FormHelperText>Select Brand Name from the dropdown</FormHelperText>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-6'>
                        <div>
                            <Select
                                // value={age} // Bind the state value
                                // onChange={handleChange} // Handle changes
                                fullWidth
                                displayEmpty
                                inputProps={{ 'aria-label': 'Without label' }}
                            >
                                <MenuItem value="">
                                    <em>Select an option</em> {/* Placeholder text */}
                                </MenuItem>
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                            <FormHelperText>Select Model Name from the dropdown</FormHelperText>
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Model Name"
                                variant="outlined"
                                placeholder='Enter Model Name'
                                // value="Patna"
                                required
                                slotProps={{
                                    input: {
                                        startAdornment: (

                                            <CircleHelp className='mr-1 text-gray-600' />
                                        ),
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-6'>
                        <div>
                            <FormLabel id="demo-row-radio-buttons-group-label">CC</FormLabel>
                            <RadioGroup
                                required
                                row
                                aria-labelledby="demo-row-radio-buttons-group-label"
                                name="row-radio-buttons-group"
                            >
                                <FormControlLabel value="100CC to 150CC" control={<Radio />} label="100CC to 150CC" />
                                <FormControlLabel value="151CC to 180CC" control={<Radio />} label="151CC to 180CC" />
                                <FormControlLabel value="181CC to 220CC" control={<Radio />} label="181CC to 220CC" />
                                <FormControlLabel value="221CC to 350CC" control={<Radio />} label="221CC to 350CC" />
                                <FormControlLabel value="350CC to 500CC" control={<Radio />} label="350CC to 500CC" />
                                <FormControlLabel value="500CC & Above" control={<Radio />} label="500CC & Above" />

                            </RadioGroup>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div>
                                <FormControlLabel control={<Checkbox />} label="Servicing" />
                                <FormControlLabel control={<Checkbox />} label="Repairing" />
                                <FormControlLabel control={<Checkbox />} label="Full Engine" />
                                <FormControlLabel control={<Checkbox />} label="Inspection" />
                                <FormControlLabel control={<Checkbox />} label="Other" />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    id="outlined-basic"
                                    label="Model Name"
                                    disabled
                                    variant="outlined"
                                    placeholder='Enter Model Name'
                                    // value="Patna"
                                    required
                                    slotProps={{
                                        input: {
                                            startAdornment: (

                                                <CircleHelp className='mr-1 text-gray-600' />
                                            ),
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' >
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker']}>
                                    <DatePicker label="Preferred Date" className='w-full' />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['TimePicker']}>
                                    <TimePicker label="Preferred Time" required className='w-full' />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6' >
                        <div>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Estimated Budget"
                                variant="outlined"
                                placeholder='Estimated Budget'
                                required
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <IndianRupee className='mr-1 text-gray-600' />
                                        ),
                                    },
                                }}
                            />
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                id="outlined-basic"
                                label="Elaborate your Two wheeler's Issues"
                                variant="outlined"
                                placeholder='Elaborate your Two wheeler Issues'
                                required
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <Bug className='mr-1 text-gray-600' />
                                        ),
                                    },
                                }}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </>
    )
}
