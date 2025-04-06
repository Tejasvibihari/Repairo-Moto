import React, { useEffect } from 'react'
import AddBikeBrand from '../../components/AddBikeBrand'
import AddBikeModel from '../../components/AddBikeModel'
import BrandCard from '../../components/BrandCard';
import axiosClient from '../../service/axiosClient';
import CircularLoading from '../../components/ui/CircularLoading';
import { useSelector, useDispatch } from 'react-redux';
import { setBrands } from '../../app/slice/brandSlice';

export default function BikeModel() {
    const dispatch = useDispatch();
    const { brands } = useSelector((state) => state.brand)
    const [loading, setLoading] = React.useState(false);
    const [models, setModels] = React.useState({});
    console.log(brands)

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true)
            try {
                const response = await axiosClient.get('/api/admin/brands/getBrands');
                dispatch(setBrands(response.data))
                setLoading(false)
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
            setLoading(false)
        }
        fetchBrands()
    }, [])
    return (
        <>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <div>
                        <AddBikeBrand />
                    </div>
                    <div className='mt-4'>
                        <AddBikeModel />
                    </div>
                </div>
                <div>
                    {loading ? (
                        <div className='flex items-center justify-center w-full'>
                            <CircularLoading size={30} />
                        </div>
                    ) : (
                        <BrandCard brands={brands} />
                    )}
                </div>
            </div>
        </>
    )
}
