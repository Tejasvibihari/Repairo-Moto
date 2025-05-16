import React, { useState } from 'react'
import Heading from './ui/Heading'
import { X, Trash, Edit, Check } from 'lucide-react'
import axiosClient from '../service/axiosClient'
import AlertSnackBar from './ui/AlertSnackBar'
import { useDispatch } from 'react-redux'
import { setBrands } from '../app/slice/brandSlice'

export default function BrandCard({ brands }) {
    const [isEditMode, setIsEditMode] = useState(false)
    const [showDeleteModelConfirm, setShowDeleteModelConfirm] = useState(null)
    const [showDeleteBrandConfirm, setShowDeleteBrandConfirm] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [snackBarOpen, setSnackBarOpen] = useState(false);
    const [snackBarMessage, setSnackBarMessage] = useState('');
    const [snackBarSeverity, setSnackBarSeverity] = useState('success');
    const dispatch = useDispatch()


    const handleDeleteModel = async (brandId, modelId) => {
        try {
            setIsLoading(true)
            const response = await axiosClient.delete(`/api/admin/brands/delete/${brandId}/models/${modelId}`)
            console.log(response)
            setSnackBarMessage(response.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true);
            dispatch(setBrands(response.data.brands))
        } catch (error) {
            console.error('Error deleting model:', error)
            alert('Failed to delete model. Please try again.')
        } finally {
            setIsLoading(false)
            setShowDeleteModelConfirm(null)
        }
    }

    const handleDeleteBrand = async (brandId) => {
        try {
            setIsLoading(true)
            const response = await axiosClient.delete(`/api/admin/brands/delete/${brandId}`)
            console.log(response)
            setSnackBarMessage(response.data.message); // Set the message to display in the Snackbar
            setSnackBarSeverity('success'); // Set severity to success
            setSnackBarOpen(true);
            dispatch(setBrands(response.data.brands))
        } catch (error) {
            console.error('Error deleting brand:', error)
            alert('Failed to delete brand. Please try again.')
        } finally {
            setIsLoading(false)
            setShowDeleteBrandConfirm(null)
        }
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
            <div className='border border-gray-300 rounded p-4 shadow-sm h-[100vh] overflow-y-auto'>
                <div className="flex justify-between items-center mb-4">
                    <Heading heading={"Bike Brand & Model"} />
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`flex items-center gap-2 px-4 py-2 rounded ${isEditMode ? 'bg-green-500' : 'bg-primary'} text-white`}
                    >
                        {isEditMode ? (
                            <>
                                <Check size={16} />
                                Done
                            </>
                        ) : (
                            <>
                                <Edit size={16} />
                                Edit
                            </>
                        )}
                    </button>
                </div>
                <div>
                    {brands && brands.map((brand) => (
                        <fieldset key={brand._id} className='border border-gray-300 rounded p-4 my-4'>
                            <div className="flex justify-between items-center">
                                <legend className='text-kanit font-semibold border-l-4 border-r-4 px-2 border-primary my-2'>
                                    {brand.brandName}
                                </legend>
                                {isEditMode && (
                                    <button
                                        onClick={() => setShowDeleteBrandConfirm(brand._id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash size={18} />
                                    </button>
                                )}
                            </div>
                            <div className='flex flex-row flex-wrap items-center justify-start gap-2'>
                                {brand.models.map((model) => (
                                    <span key={model._id} className='border border-gray-300 rounded p-2 m-2 w-auto flex items-center'>
                                        {model.name.charAt(0).toUpperCase() + model.name.slice(1)}
                                        {isEditMode && (
                                            <button
                                                onClick={() => setShowDeleteModelConfirm({ brandId: brand._id, modelId: model._id })}
                                                className="ml-2 text-red-500 hover:text-red-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                        </fieldset>
                    ))}
                </div>
            </div>

            {/* Delete Model Confirmation Modal */}
            {showDeleteModelConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-medium mb-4">Delete Model</h3>
                        <p className="mb-6">Are you sure you want to delete this model? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteModelConfirm(null)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteModel(showDeleteModelConfirm.brandId, showDeleteModelConfirm.modelId)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Brand Confirmation Modal */}
            {showDeleteBrandConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h3 className="text-lg font-medium mb-4">Delete Brand</h3>
                        <p className="mb-6">Are you sure you want to delete this brand and all its models? This action cannot be undone.</p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowDeleteBrandConfirm(null)}
                                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDeleteBrand(showDeleteBrandConfirm)}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-red-300"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}