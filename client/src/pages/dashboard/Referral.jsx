import React from 'react'
import ReferralTable from '../../components/ReferralTable'
import { useEffect } from 'react'
import axiosClient from '../../service/axiosClient'
import { useState } from 'react'

export default function Referral() {

    const [allUsers, setAlluser] = useState([]);

    useEffect(() => {
        const getAllUser = async () => {
            try {
                const res = await axiosClient.get('/api/user/getalluser');
                console.log(res.data.users);
                setAlluser(res.data.users);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }
        getAllUser();
    }, [])

    return (
        <>
            <ReferralTable users={allUsers} />
        </>
    )
}
