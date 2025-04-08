import React, { useEffect, useState } from 'react';
import Heading from './ui/Heading';
import AlertSnackBar from './ui/AlertSnackBar';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Phone, CircleHelp, IndianRupee, Bug } from 'lucide-react';
import Select from '@mui/material/Select';
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
import axiosClient from '../service/axiosClient';
import { Divider } from '@mui/material';

export default function BookingForm() {
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        contactNo: '',
        city: 'Patna',
        selectedBrand: '',
        selectedModel: '',
        // modelName: '',
        cc: '',
        services: [],
        otherService: '',
        preferredDate: null,
        preferredTime: null,
        estimatedBudget: '',
        issues: '',
    });

    useEffect(() => {
        const getBrands = async () => {
            try {
                const response = await axiosClient.get('/api/admin/brands/getBrands');
                setBrands(response.data);
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };
        getBrands();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleBrandChange = (e) => {
        const brandId = e.target.value;
        setFormData((prev) => ({ ...prev, selectedBrand: brandId, selectedModel: '' }));

        const selectedBrandData = brands.find((brand) => brand.brandName === brandId);
        setModels(selectedBrandData ? selectedBrandData.models : []);
    };

    const handleServiceChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            services: checked
                ? [...prev.services, value]
                : prev.services.filter((service) => service !== value),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form Data:', formData);
        // Submit the form data to the server
    };

    return (
        <>
            <AlertSnackBar />
            <div>
                <Heading heading={'Booking Form'} />
                <form className='my-6 p-4 border shadow border-gray-300' onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                        <div>
                            <TextField
                                fullWidth
                                name="name"
                                label="Name"
                                variant="outlined"
                                placeholder="Enter Name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
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
                                name="contactNo"
                                label="Contact No."
                                variant="outlined"
                                placeholder="Contact No."
                                required
                                value={formData.contactNo}
                                onChange={handleInputChange}
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
                                name="city"
                                label="City"
                                variant="outlined"
                                placeholder="Enter City"
                                value={formData.city}
                                onChange={handleInputChange}
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
                                name="selectedBrand"
                                value={formData.selectedBrand}
                                onChange={handleBrandChange}
                                fullWidth
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select Brand' }}
                            >
                                <MenuItem value="">
                                    <em>Select a Brand</em>
                                </MenuItem>
                                {brands.map((brand) => (
                                    <MenuItem key={brand._id} value={brand.brandName}>
                                        {brand.brandName}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select Brand Name from the dropdown</FormHelperText>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-6'>
                        <div>
                            <Select
                                name="selectedModel"
                                value={formData.selectedModel}
                                onChange={handleInputChange}
                                fullWidth
                                displayEmpty
                                inputProps={{ 'aria-label': 'Select Model' }}
                            >
                                <MenuItem value="">
                                    <em>Select a Model</em>
                                </MenuItem>
                                {models.map((model) => (
                                    <MenuItem key={model._id} value={model.name}>
                                        {model.name}
                                    </MenuItem>
                                ))}
                                <Divider />
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                            <FormHelperText>Select Model Name from the dropdown</FormHelperText>
                        </div>
                        <div>
                            <TextField
                                fullWidth
                                name="modelName"
                                label="Model Name"
                                variant="outlined"
                                placeholder="Enter Model Name"
                                required
                                disabled={formData.selectedModel !== 'other'}
                                value={formData.selectedModel === 'other' ? formData.modelName : ''}
                                onChange={handleInputChange}
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
                            <FormLabel id="cc-label">CC</FormLabel>
                            <RadioGroup
                                name="cc"
                                value={formData.cc}
                                onChange={handleInputChange}
                                row
                                aria-labelledby="cc-label"
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
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value="Servicing"
                                            checked={formData.services.includes('Servicing')}
                                            onChange={handleServiceChange}
                                        />
                                    }
                                    label="Servicing"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value="Repairing"
                                            checked={formData.services.includes('Repairing')}
                                            onChange={handleServiceChange}
                                        />
                                    }
                                    label="Repairing"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value="Full Engine"
                                            checked={formData.services.includes('Full Engine')}
                                            onChange={handleServiceChange}
                                        />
                                    }
                                    label="Full Engine"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value="Inspection"
                                            checked={formData.services.includes('Inspection')}
                                            onChange={handleServiceChange}
                                        />
                                    }
                                    label="Inspection"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            value="Other"
                                            checked={formData.services.includes('Other')}
                                            onChange={handleServiceChange}
                                        />
                                    }
                                    label="Other"
                                />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    id="outlined-basic"
                                    name="otherService" // Corrected name to match the key in formData
                                    label="Other Service"
                                    variant="outlined"
                                    placeholder="Enter Other Service"
                                    disabled={!formData.services.includes('Other')} // Enable only if "Other" is selected
                                    value={formData.otherService}
                                    onChange={handleInputChange}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <CircleHelp className="mr-1 text-gray-600" />
                                            ),
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['DatePicker']}>
                                    <DatePicker
                                        label="Preferred Date"
                                        value={formData.preferredDate}
                                        onChange={(newValue) =>
                                            setFormData((prev) => ({ ...prev, preferredDate: newValue }))
                                        }
                                        className="w-full"
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                        <div>
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DemoContainer components={['TimePicker']}>
                                    <TimePicker
                                        label="Preferred Time"
                                        value={formData.preferredTime}
                                        onChange={(newValue) =>
                                            setFormData((prev) => ({ ...prev, preferredTime: newValue }))
                                        }
                                        required
                                        className="w-full"
                                    />
                                </DemoContainer>
                            </LocalizationProvider>
                        </div>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                        <div>
                            <TextField
                                fullWidth
                                name="estimatedBudget"
                                label="Estimated Budget"
                                variant="outlined"
                                placeholder="Estimated Budget"
                                required
                                value={formData.estimatedBudget}
                                onChange={handleInputChange}
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
                                name="issues"
                                label="Elaborate your Two wheeler's Issues"
                                variant="outlined"
                                placeholder="Elaborate your Two wheeler Issues"
                                required
                                value={formData.issues}
                                onChange={handleInputChange}
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
                    <button
                        type="submit"
                        className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </>
    );
}