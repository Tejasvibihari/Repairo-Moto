import React, { useEffect, useState } from 'react';
import Heading from './ui/Heading';
import AlertSnackBar from './ui/AlertSnackBar';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Phone, CircleHelp, IndianRupee, Bug, Plus } from 'lucide-react';
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
import CircularLoading from './ui/CircularLoading';
import { useSelector } from 'react-redux';


export default function UserBookingForm() {
    const user = useSelector((state) => state.user.user);
    console.log(user)
    console.log(user)
    const [location, setLocation] = useState({ lat: '', lng: '' });
    const [locationError, setLocationError] = useState('');
    console.log('Location:', location);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity
    const [loading, setLoading] = useState(false); // State to control loading spinner
    const [formData, setFormData] = useState({
        userId: user.id,
        name: '',
        contactNo: '',
        email: user.email,
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
    console.log(user._id)
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    setLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                error => {
                    setLocationError('Unable to retrieve location.');
                    console.error(error);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
        }
    }, []);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axiosClient.post('/api/admin/order/userorder', formData);
            console.log('Form submitted successfully:', response.data);
            console.log('Form submitted successfully:', response.data.message);
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true); // Open the Snackbar
            setLoading(false); // Stop loading state
            setFormData({
                userId: user._id,
                name: '',
                contactNo: '',
                email: user.email,
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
            }); // Reset form data
        } catch (error) {
            console.log('Error submitting form:', error);

            // Check if the error is an AxiosError and has a response
            if (error.response) {
                // Extract the error message from the response
                const errorMessage = error.response.data.message || `Error: ${error.response.status}`;
                setSnackBarMessage(errorMessage); // Set the message to display in the Snackbar
            } else if (error.request) {
                // Handle errors where the request was made but no response was received
                setSnackBarMessage('No response from the server. Please try again later.');
            } else {
                // Handle other errors (e.g., network issues)
                setSnackBarMessage(error.message || 'An unexpected error occurred.');
            }

            setSnackBarSeverity('error'); // Set severity to error
            setSnackBarOpen(true); // Open the Snackbar
            setLoading(false); // Stop loading state
        }
        // Submit the form data to the server
    };
    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setSnackBarOpen(false);
    }
    return (
        <>

            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar} // Close function for the Snackbar
            />
            <div className='my-4'>
                <Heading heading={'User Booking Form'} />
                <form className='my-6 p-4 border shadow border-gray-300 max-w-full' onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
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
                                required
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
                                required
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
                                required
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
                                        required
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
                        className="bg-primary mt-4  font-semibold hover:bg-transparent hover:text-primary  border-primary border text-white px-4 py-2 rounded cursor-pointer hover:bg-primary-dark"
                    >
                        {loading ? (
                            <div className='flex items-center justify-center'>
                                <CircularLoading size={20} />
                            </div>
                        ) : (
                            <span className='flex flex-row items-center justify-center'><Plus className='mr-2' /> Create Order</span>
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}