import React, { useEffect, useState } from 'react'
import AllUsersTable from '../../components/AllUserTable'
import axiosClient from '../../service/axiosClient';
import CircularLoading from '../../components/ui/CircularLoading';

export default function EmployeeAllUser() {
    const [loading, setLoading] = useState(false);
    const [users, setAllUsers] = useState([]);
    const [fltereduser, setFilteredUser] = useState([]);

    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get('/api/user/getalluser');
                console.log(response);
                setAllUsers(response.data.users);
                setLoading(false);
            } catch (error) {
                console.log(error);
            }
        }
        fetchAllUsers();
    }, [])
    return (
        <div>
            {loading ? (
                <div className='flex items-center justify-center flex-col space-y-4'>
                    <span>
                        <CircularLoading />
                    </span>
                    <span className='text-sm font-semibold text-gray-600'>
                        Loading Please Wait ......
                    </span>
                </div>
            ) : (
                users && users.length > 0 ? (
                    <AllUsersTable users={users} />
                ) : (
                    <div className='flex items-center justify-center'>No User Found</div>
                )
            )}
        </div>
    )
}
