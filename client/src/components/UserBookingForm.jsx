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
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import axiosClient from '../service/axiosClient';
import { Divider } from '@mui/material';
import CircularLoading from './ui/CircularLoading';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

// Service center coordinates (Patna example - replace with your actual center)
const SERVICE_CENTER = {
    lat: 25.4739264,
    lng: 84.9552607
};
const SERVICE_RADIUS_METERS = 30000; // 30 km radius

// Haversine formula to calculate distance in meters
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // distance in meters
};

export default function UserBookingForm() {
    const user = useSelector((state) => state.user.user.user);
    const [locationError, setLocationError] = useState('');
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [bikeProfile, setBikeProfile] = useState([]);
    const [bike, setBike] = useState("");
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState({ lat: null, lng: null });
    const [isLocationFetched, setIsLocationFetched] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        contactNo: '',
        email: user?.email || '',
        city: 'Patna',
        selectedBrand: '',
        selectedModel: '',
        modelName: '',
        cc: '',
        bs: '',
        services: [],
        otherService: '',
        preferredDate: null,
        preferredTime: null,
        issues: '',
    });

    // Get Bike Profile
    useEffect(() => {
        const getBikeProfile = async () => {
            try {
                const response = await axiosClient.get(`/api/bike-profiles/get-bike-profile`);
                setBikeProfile(response.data);
            } catch (error) {
                console.log(error);
            }
        };
        getBikeProfile();
    }, []);

    // Get user's location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    setLocation({ lat, lng });
                    setIsLocationFetched(true);
                    setLocationError('');
                },
                error => {
                    setLocationError('Unable to retrieve location. Please enable location services.');
                    console.error(error);
                    setIsLocationFetched(false);
                }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
            setIsLocationFetched(false);
        }
    }, []);

    // Get brands
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

    const handleBikeProfileChange = (e) => {
        const selectedBikeId = e.target.value;
        setBike(selectedBikeId);
        const selectedBike = bikeProfile.find(bike => bike?._id === selectedBikeId);
        if (selectedBike) {
            setFormData(prev => ({
                ...prev,
                selectedBrand: selectedBike.brand || '',
                selectedModel: selectedBike.model || '',
                modelName: selectedBike.model || '',
                bs: selectedBike.bs || ''
            }));
        }
    };

    const handleBrandChange = (e) => {
        const brandId = e.target.value;
        setFormData((prev) => ({ ...prev, selectedBrand: brandId, selectedModel: '', modelName: '' }));
        const selectedBrandData = brands.find((brand) => brand.brandName === brandId);
        setModels(selectedBrandData ? selectedBrandData.models : []);
    };

    const handleModelChange = (e) => {
        const modelValue = e.target.value;
        setFormData(prev => ({
            ...prev,
            selectedModel: modelValue,
            modelName: modelValue === 'other' ? '' : modelValue
        }));
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

        // Validate location
        if (!isLocationFetched || !location.lat || !location.lng) {
            setSnackBarMessage('Location is required. Please enable location services and reload the page.');
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
            return;
        }

        try {
            setLoading(true);

            // Calculate distance and service area status
            const distance = calculateDistance(location.lat, location.lng, SERVICE_CENTER.lat, SERVICE_CENTER.lng);
            const isWithinServiceArea = distance <= SERVICE_RADIUS_METERS;

            // Prepare userLocation GeoJSON (longitude, latitude order)
            const userLocation = {
                type: "Point",
                coordinates: [location.lng, location.lat]
            };

            // Format preferred date and time
            let formattedDate = null;
            if (formData.preferredDate) {
                formattedDate = dayjs(formData.preferredDate).toISOString();
            }

            let formattedTime = '';
            if (formData.preferredTime) {
                formattedTime = dayjs(formData.preferredTime).format('hh:mm A');
            }

            // Build payload according to backend expectations
            const payload = {
                name: formData.name,
                contactNo: formData.contactNo,
                email: formData.email,
                city: formData.city.toUpperCase(),
                userLocation,
                isWithinServiceArea,
                distanceFromCenter: distance,
                selectedBrand: formData.selectedBrand,
                selectedModel: formData.selectedModel,
                modelName: formData.modelName,
                cc: formData.cc,
                bs: formData.bs,
                services: formData.services,
                otherService: formData.services.includes('Other') ? formData.otherService : '',
                preferredDate: formattedDate,
                preferredTime: formattedTime,
                issues: formData.issues,
                status: "Pending",
                referralProcessed: false
            };

            const response = await axiosClient.post('/api/admin/order/userorder', payload);
            setSnackBarMessage(response.data.message);
            setSnackBarSeverity('success');
            setSnackBarOpen(true);

            // Reset form
            setFormData({
                name: '',
                contactNo: '',
                email: user?.email || '',
                city: 'Patna',
                selectedBrand: '',
                selectedModel: '',
                modelName: '',
                cc: '',
                bs: '',
                services: [],
                otherService: '',
                preferredDate: null,
                preferredTime: null,
                issues: '',
            });
            setBike('');

        } catch (error) {
            console.error('Error submitting form:', error);
            if (error.response) {
                setSnackBarMessage(error.response.data.message || `Error: ${error.response.status}`);
            } else if (error.request) {
                setSnackBarMessage('No response from the server. Please try again later.');
            } else {
                setSnackBarMessage(error.message || 'An unexpected error occurred.');
            }
            setSnackBarSeverity('error');
            setSnackBarOpen(true);
        } finally {
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

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-6'>
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
                                name="bikeProfile"
                                value={bike}
                                onChange={handleBikeProfileChange}
                                fullWidth
                                displayEmpty
                            >
                                <MenuItem value="">
                                    <em>Select a Bike Profile</em>
                                </MenuItem>
                                {bikeProfile.length > 0 ? bikeProfile.map((bike) => (
                                    <MenuItem key={bike._id} value={bike._id}>
                                        {bike.brand} {bike.model} {bike.cc} BS {bike.bs}
                                    </MenuItem>
                                )) : (
                                    <MenuItem disabled>First Create Bike Profile</MenuItem>
                                )}
                            </Select>
                            <FormHelperText>Select Bike Profile from the dropdown (optional)</FormHelperText>
                        </div>
                        <div>
                            <Select
                                name="selectedBrand"
                                value={formData.selectedBrand}
                                onChange={handleBrandChange}
                                fullWidth
                                required
                                displayEmpty
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
                            <FormHelperText>Select Brand Name</FormHelperText>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 my-6'>
                        <div>
                            <Select
                                name="selectedModel"
                                value={formData.selectedModel}
                                onChange={handleModelChange}
                                fullWidth
                                displayEmpty
                                required
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
                                disabled={formData.selectedModel !== 'other' && formData.selectedModel !== ''}
                                value={formData.modelName}
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
                        <div>
                            <Select
                                name="bs"
                                value={formData.bs}
                                onChange={handleInputChange}
                                fullWidth
                                displayEmpty
                                required
                            >
                                <MenuItem value="">
                                    <em>Select BS</em>
                                </MenuItem>
                                <MenuItem value="I">BS I</MenuItem>
                                <MenuItem value="II">BS II</MenuItem>
                                <MenuItem value="III">BS III</MenuItem>
                                <MenuItem value="IV">BS IV</MenuItem>
                                <MenuItem value="V">BS V</MenuItem>
                                <MenuItem value="VI">BS VI</MenuItem>
                            </Select>
                            <FormHelperText>Select BS from the dropdown</FormHelperText>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 my-6'>
                        <div>
                            <TextField
                                fullWidth
                                name="cc"
                                label="CC (e.g., 125, 150, 200)"
                                variant="outlined"
                                placeholder="Enter Engine CC"
                                required
                                value={formData.cc}
                                onChange={handleInputChange}
                                type="number"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <CircleHelp className='mr-1 text-gray-600' />
                                        ),
                                    },
                                }}
                            />
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
                                    name="otherService"
                                    label="Other Service"
                                    variant="outlined"
                                    placeholder="Enter Other Service"
                                    disabled={!formData.services.includes('Other')}
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

                    <div className='grid grid-cols-1 gap-4 mb-6'>
                        <TextField
                            fullWidth
                            name="issues"
                            label="Elaborate your Two wheeler's Issues"
                            variant="outlined"
                            placeholder="Elaborate your Two wheeler Issues"
                            value={formData.issues}
                            onChange={handleInputChange}
                            multiline
                            rows={3}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <Bug className='mr-1 text-gray-600' />
                                    ),
                                },
                            }}
                        />
                    </div>

                    {locationError && (
                        <div className="text-red-500 text-sm mb-4">{locationError}</div>
                    )}

                    <button
                        type="submit"
                        className="bg-primary mt-4 font-semibold hover:bg-transparent hover:text-primary border-primary border text-white px-4 py-2 rounded cursor-pointer"
                        disabled={loading || !isLocationFetched}
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