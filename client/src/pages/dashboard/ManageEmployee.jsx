import React, { useEffect } from 'react'
import AddEmployeeForm from '../../components/AddEmployeeForm'
import EmployeeCard from '../../components/EmployeeCard'
import axiosClient from '../../service/axiosClient'

export default function ManageEmployee() {

    useEffect(() => {
        const fetchEmployees = async () => {
            const response = await axiosClient.get('/api/admin/employee/getallemployee');
            console.log(response.data.employees);
        }
        fetchEmployees()
    }, [])
    return (
        <>
            <AddEmployeeForm />
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <EmployeeCard />
                <EmployeeCard />
                <EmployeeCard />
                <EmployeeCard />
                <EmployeeCard />
            </div>
        </>
    )
}
