import React, { useEffect } from 'react'
import AddBikeBrand from '../../components/AddBikeBrand'
import AddBikeModel from '../../components/AddBikeModel'
import BrandCard from '../../components/BrandCard';
import axiosClient from '../../service/axiosClient';
import CircularLoading from '../../components/ui/CircularLoading';

export default function BikeModel() {
    const [brands, setBrands] = React.useState({});
    const [models, setModels] = React.useState({});
    const [loading, setLoading] = React.useState(true);

    useEffect(() => {
        const fetchBrands = async () => {
            setLoading(true)
            try {
                const response = await axiosClient.get('/api/admin/brands/getBrands');
                setBrands(response.data)
                console.log(response.data)
            } catch (error) {
                console.error("Error fetching brands:", error);
            }
            setLoading(false)
        }
        fetchBrands()
    }, [])
    return (
        <>
            <div className='grid grid-cols-2 gap-4'>
                <div>
                    <div>
                        <AddBikeBrand />
                    </div>
                    <div className='mt-4'>
                        <AddBikeModel />
                    </div>
                </div>

                <div>
                    {loading ? <CircularLoading size={30} /> : <BrandCard brands={brands} />}

                </div>
            </div>
        </>
    )
}
