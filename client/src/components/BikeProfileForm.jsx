import { useEffect, useState } from 'react';
import { Bike, User, Settings, CheckCircle } from 'lucide-react';
import axiosClient from '../service/axiosClient';
import { useSelector } from 'react-redux'
import AlertSnackBar from './ui/AlertSnackBar';

export default function BikeProfileForm() {
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        cc: '',
        bs: ''
    });
    const user = useSelector((state) => state.user.user);
    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoadingBrands, setIsLoadingBrands] = useState(true);
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');

    useEffect(() => {
        const getBrands = async () => {
            try {
                setIsLoadingBrands(true);
                const response = await axiosClient.get('/api/admin/brands/getBrands');
                setBrands(response.data);
            } catch (error) {
                console.error('Error fetching brands:', error);
            } finally {
                setIsLoadingBrands(false);
            }
        };
        getBrands();
    }, []);

    const handleBrandChange = (e) => {
        const brandName = e.target.value;
        setFormData(prev => ({
            ...prev,
            brand: brandName,
            model: '' // Reset model when brand changes
        }));

        // Find selected brand and set its models
        const selectedBrandData = brands.find(brand => brand.brandName === brandName);
        setModels(selectedBrandData ? selectedBrandData.models : []);

        // Clear errors
        if (errors.brand) {
            setErrors(prev => ({ ...prev, brand: '' }));
        }
        if (errors.model) {
            setErrors(prev => ({ ...prev, model: '' }));
        }
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.brand.trim()) {
            newErrors.brand = 'Brand is required';
        }

        if (!formData.model.trim()) {
            newErrors.model = 'Model is required';
        }

        if (!formData.cc || formData.cc <= 0) {
            newErrors.cc = 'Engine displacement (CC) must be a positive number';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const newErrors = validateForm();

            if (Object.keys(newErrors).length > 0) {
                setErrors(newErrors);
                return;
            }

            // Here you would typically send the data to your backend
            console.log('Bike Profile Data:', formData);
            const response = await axiosClient.post(`/api/bike-profiles/create/${user.id}`, formData);
            setIsSubmitted(true);
            setSnackBarMessage(response.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true); // Open the Snackbar
            // Reset form after successful submission
            setTimeout(() => {
                setIsSubmitted(false);
                setFormData({
                    brand: '',
                    model: '',
                    cc: '',
                    bs: ''
                });
                setModels([]); // Reset models when form is reset
            }, 2000);
        } catch (error) {
            console.log(error)
            setSnackBarMessage(error.message); // Set the message to display in the Snackbar
            setSnackBarSeverity("error"); // Set the message to display in the Snackbar
            setSnackBarOpen(true);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Success!</h2>
                    <p className="text-gray-600">Your bike profile has been created successfully.</p>
                </div>
            </div>
        );
    }
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


            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <Bike className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold">Bike Profile</h1>
                                <p className="text-blue-100">Add your motorcycle details</p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="p-6 space-y-6">
                        {/* Brand */}
                        <div className="space-y-2">
                            <label htmlFor="brand" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Settings className="w-4 h-4" />
                                <span>Brand *</span>
                            </label>
                            <select
                                id="brand"
                                name="brand"
                                value={formData.brand}
                                onChange={handleBrandChange}
                                disabled={isLoadingBrands}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${errors.brand ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    } ${isLoadingBrands ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">
                                    {isLoadingBrands ? 'Loading brands...' : 'Select a brand'}
                                </option>
                                {brands.map((brand) => (
                                    <option key={brand.brandName} value={brand.brandName}>
                                        {brand.brandName}
                                    </option>
                                ))}
                            </select>
                            {errors.brand && (
                                <p className="text-red-500 text-sm flex items-center space-x-1">
                                    <span>⚠</span>
                                    <span>{errors.brand}</span>
                                </p>
                            )}
                        </div>

                        {/* Model */}
                        <div className="space-y-2">
                            <label htmlFor="model" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Bike className="w-4 h-4" />
                                <span>Model *</span>
                            </label>
                            <select
                                id="model"
                                name="model"
                                value={formData.model}
                                onChange={handleInputChange}
                                disabled={!formData.brand || models.length === 0}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white ${errors.model ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    } ${!formData.brand ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <option value="">
                                    {!formData.brand
                                        ? 'Select a brand first'
                                        : models.length === 0
                                            ? 'No models available'
                                            : 'Select a model'
                                    }
                                </option>
                                {models.map((model) => (
                                    <option key={model._id || model.name || model} value={model.name || model}>
                                        {model.name || model}
                                    </option>
                                ))}
                            </select>
                            {errors.model && (
                                <p className="text-red-500 text-sm flex items-center space-x-1">
                                    <span>⚠</span>
                                    <span>{errors.model}</span>
                                </p>
                            )}
                        </div>

                        {/* Engine Displacement (CC) */}
                        <div className="space-y-2">
                            <label htmlFor="cc" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <span className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center text-xs text-white font-bold">CC</span>
                                <span>Engine Displacement (CC) *</span>
                            </label>
                            <input
                                type="number"
                                id="cc"
                                name="cc"
                                value={formData.cc}
                                onChange={handleInputChange}
                                placeholder="e.g., 650, 400, 150"
                                min="1"
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${errors.cc ? 'border-red-500 bg-red-50' : 'border-gray-300'
                                    }`}
                            />
                            {errors.cc && (
                                <p className="text-red-500 text-sm flex items-center space-x-1">
                                    <span>⚠</span>
                                    <span>{errors.cc}</span>
                                </p>
                            )}
                        </div>

                        {/* BS Standard */}
                        <div className="space-y-2">
                            <label htmlFor="bs" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-xs text-white font-bold">BS</span>
                                <span>BS Standard *</span>
                            </label>
                            <select
                                id="bs"
                                name="bs"
                                value={formData.bs}
                                required
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none bg-white"
                            >
                                <option value="">Select BS Standard (Optional)</option>
                                <option value="I">BS 1</option>
                                <option value="II">BS 2</option>
                                <option value="III">BS 3</option>
                                <option value="IV">BS 4</option>
                                <option value="V">BS 5</option>
                                <option value="VI">BS 6</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-blue-200 shadow-lg"
                        >
                            Create Bike Profile
                        </button>

                        {/* Additional Info */}
                        <div className="text-center text-sm text-gray-500 mt-4">
                            <p>* Required fields</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}