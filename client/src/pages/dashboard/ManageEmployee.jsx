import React, { useEffect } from 'react'
import AddEmployeeForm from '../../components/AddEmployeeForm'
import EmployeeCard from '../../components/EmployeeCard'
import axiosClient from '../../service/axiosClient'
import { useDispatch, useSelector } from 'react-redux'
import { setEmployee } from '../../app/slice/employeeSlice'


export default function ManageEmployee() {
    const dispatch = useDispatch()
    const employees = useSelector((state) => state.employee.employee)
    console.log(employees);


    useEffect(() => {
        const fetchEmployees = async () => {
            const response = await axiosClient.get('/api/admin/employee/getallemployee');
            // console.log(response.data.employees);
            dispatch(setEmployee(response.data.employees));
        }
        fetchEmployees()
    }, [])
    return (
        <>
            <AddEmployeeForm />
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                {
                    employees ? employees.map((employee) => (
                        <EmployeeCard
                            key={employee._id}
                            id={employee._id}
                            firstName={employee.firstName}
                            lastName={employee.lastName}
                            role={employee.role}
                            phone={employee.phone}
                            email={employee.email}
                            profileImage={employee.profileImage}
                        />
                    )) : <div className='flex items-center justify-center'>Loading...</div>
                }
            </div>
        </>
    )
}
