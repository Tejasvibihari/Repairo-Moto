import React from 'react'
import AddEmployeeForm from '../../components/AddEmployeeForm'
import EmployeeCard from '../../components/EmployeeCard'

export default function ManageEmployee() {
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
