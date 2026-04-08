import React, { useEffect, useState } from 'react';
import Heading from './ui/Heading';
import AlertSnackBar from './ui/AlertSnackBar';
import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { Phone, CircleHelp, IndianRupee, Bug, Plus, Mail } from 'lucide-react';
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

export default function ManualBookingForm({ coupon }) {
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        coupon: coupon || '',
        name: '',
        contactNo: '',
        email: '',
        city: 'Patna',
        selectedBrand: '',
        selectedModel: '',
        modelName: '',
        cc: '',
        bs: '',
        services: [],
        serviceType: 'Schedule Repair', // default
        otherService: '',
        preferredDate: null,
        preferredTime: null,
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Convert dayjs objects to ISO strings or as needed
            const payload = {
                ...formData,
                preferredDate: formData.preferredDate ? formData.preferredDate.toISOString() : null,
                preferredTime: formData.preferredTime ? formData.preferredTime.format('HH:mm') : null,
            };
            const response = await axiosClient.post('/api/admin/order/manualorder', payload);
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);
            setLoading(false);
            // Reset form
            setFormData({
                coupon: '',
                name: '',
                contactNo: '',
                email: '',
                city: 'Patna',
                selectedBrand: '',
                selectedModel: '',
                modelName: '',
                cc: '',
                bs: '',
                services: [],
                serviceType: 'Schedule Repair',
                otherService: '',
                preferredDate: null,
                preferredTime: null,
                issues: '',
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
            setSnackBarMessage(errorMessage);
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
            setLoading(false);
        }
    };

    const handleCloseSnackBar = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackBarOpen(false);
    };

    return (
        <>
            <AlertSnackBar
                open={snackBarOpen}
                message={snackBarMessage}
                severity={snackBarSeverity}
                onClose={handleCloseSnackBar}
            />
            <div>
                <Heading heading={'Booking Form'} />
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
                                    startAdornment: <AccountCircle sx={{ color: 'action.active', mr: 1 }} />,
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
                                    startAdornment: <Phone className='mr-1 text-gray-600' />,
                                },
                            }}
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                        <TextField
                            fullWidth
                            name="email"
                            label="Email (Optional)"
                            variant="outlined"
                            placeholder="Enter Email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            slotProps={{
                                input: {
                                    startAdornment: <Mail className='mr-1 text-gray-600' />,
                                },
                            }}
                        />
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
                                    startAdornment: <LocationCityIcon sx={{ color: 'action.active', mr: 1 }} />,
                                },
                            }}
                        />
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-6'>
                        <div>
                            <Select
                                name="selectedBrand"
                                value={formData.selectedBrand}
                                onChange={handleBrandChange}
                                fullWidth
                                required
                                displayEmpty
                            >
                                <MenuItem value=""><em>Select a Brand</em></MenuItem>
                                {brands.map((brand) => (
                                    <MenuItem key={brand._id} value={brand.brandName}>
                                        {brand.brandName}
                                    </MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Select Brand Name from the dropdown</FormHelperText>
                        </div>
                        <div>
                            <Select
                                name="selectedModel"
                                value={formData.selectedModel}
                                onChange={handleInputChange}
                                fullWidth
                                displayEmpty
                                required
                            >
                                <MenuItem value=""><em>Select a Model</em></MenuItem>
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
                                disabled={formData.selectedModel !== 'other'}
                                value={formData.selectedModel === 'other' ? formData.modelName : ''}
                                onChange={handleInputChange}
                                slotProps={{
                                    input: {
                                        startAdornment: <CircleHelp className='mr-1 text-gray-600' />,
                                    },
                                }}
                            />
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-6'>
                        <div>
                            <Select
                                name="bs"
                                value={formData.bs}
                                onChange={handleInputChange}
                                fullWidth
                                displayEmpty
                                required
                            >
                                <MenuItem value=""><em>Select BS</em></MenuItem>
                                <MenuItem value="I">BS 1</MenuItem>
                                <MenuItem value="II">BS II</MenuItem>
                                <MenuItem value="III">BS III</MenuItem>
                                <MenuItem value="IV">BS IV</MenuItem>
                                <MenuItem value="V">BS V</MenuItem>
                                <MenuItem value="VI">BS VI</MenuItem>
                            </Select>
                            <FormHelperText>Select BS from the dropdown</FormHelperText>
                        </div>
                        <div>
                            <FormLabel id="cc-label">CC</FormLabel>
                            <RadioGroup
                                name="cc"
                                value={formData.cc}
                                onChange={handleInputChange}
                                required
                                row
                            >
                                <FormControlLabel value="100CC to 150CC" control={<Radio />} label="100CC to 150CC" />
                                <FormControlLabel value="151CC to 180CC" control={<Radio />} label="151CC to 180CC" />
                                <FormControlLabel value="181CC to 220CC" control={<Radio />} label="181CC to 220CC" />
                                <FormControlLabel value="221CC to 350CC" control={<Radio />} label="221CC to 350CC" />
                                <FormControlLabel value="350CC to 500CC" control={<Radio />} label="350CC to 500CC" />
                                <FormControlLabel value="500CC & Above" control={<Radio />} label="500CC & Above" />
                            </RadioGroup>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-6'>
                        <div>
                            <FormLabel component="legend">Service Type</FormLabel>
                            <RadioGroup
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleInputChange}
                                row
                            >
                                <FormControlLabel value="Schedule Repair" control={<Radio />} label="Schedule Repair" />
                                <FormControlLabel value="Emergency Repair" control={<Radio />} label="Emergency Repair" />
                            </RadioGroup>
                        </div>
                        <div className='flex flex-col gap-2'>
                            <div>
                                <FormControlLabel
                                    control={<Checkbox value="Servicing" checked={formData.services.includes('Servicing')} onChange={handleServiceChange} />}
                                    label="Servicing"
                                />
                                <FormControlLabel
                                    control={<Checkbox value="Repairing" checked={formData.services.includes('Repairing')} onChange={handleServiceChange} />}
                                    label="Repairing"
                                />
                                <FormControlLabel
                                    control={<Checkbox value="Full Engine" checked={formData.services.includes('Full Engine')} onChange={handleServiceChange} />}
                                    label="Full Engine"
                                />
                                <FormControlLabel
                                    control={<Checkbox value="Inspection" checked={formData.services.includes('Inspection')} onChange={handleServiceChange} />}
                                    label="Inspection"
                                />
                                <FormControlLabel
                                    control={<Checkbox value="Other" checked={formData.services.includes('Other')} onChange={handleServiceChange} />}
                                    label="Other"
                                />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    name="otherService"
                                    label="Other Service"
                                    variant="outlined"
                                    placeholder="Enter Other Service"
                                    disabled={!formData.services.includes('Other')}
                                    value={formData.otherService}
                                    onChange={handleInputChange}
                                    slotProps={{
                                        input: {
                                            startAdornment: <CircleHelp className="mr-1 text-gray-600" />,
                                        },
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['DatePicker']}>
                                <DatePicker
                                    label="Preferred Date"
                                    value={formData.preferredDate}
                                    required
                                    onChange={(newValue) => setFormData((prev) => ({ ...prev, preferredDate: newValue }))}
                                    className="w-full"
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DemoContainer components={['TimePicker']}>
                                <TimePicker
                                    label="Preferred Time"
                                    value={formData.preferredTime}
                                    onChange={(newValue) => setFormData((prev) => ({ ...prev, preferredTime: newValue }))}
                                    required
                                    className="w-full"
                                />
                            </DemoContainer>
                        </LocalizationProvider>
                    </div>

                    <div className='mb-6'>
                        <TextField
                            fullWidth
                            name="issues"
                            label="Elaborate your Two wheeler's Issues"
                            variant="outlined"
                            placeholder="Describe the issues"
                            value={formData.issues}
                            onChange={handleInputChange}
                            slotProps={{
                                input: {
                                    startAdornment: <Bug className='mr-1 text-gray-600' />,
                                },
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="bg-primary mt-4 font-semibold hover:bg-transparent hover:text-primary border-primary border text-white px-4 py-2 rounded cursor-pointer"
                    >
                        {loading ? (
                            <div className='flex items-center justify-center'>
                                <CircularLoading size={20} />
                            </div>
                        ) : (
                            <span className='flex flex-row items-center justify-center'>
                                <Plus className='mr-2' /> Create Order
                            </span>
                        )}
                    </button>
                </form>
            </div>
        </>
    );
}