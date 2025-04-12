import React, { useEffect, useState } from 'react'
import AddEmployeeForm from '../../components/AddEmployeeForm'
import EmployeeCard from '../../components/EmployeeCard'
import axiosClient from '../../service/axiosClient'
import { useDispatch, useSelector } from 'react-redux'
import { setEmployee } from '../../app/slice/employeeSlice'
import AlertSnackBar from '../../components/ui/AlertSnackBar'


export default function ManageEmployee() {
    const dispatch = useDispatch()
    const employees = useSelector((state) => state.employee.employee)
    const [snackBarOpen, setSnackBarOpen] = useState(false); // State to control Snackbar visibility
    const [snackBarMessage, setSnackBarMessage] = useState(''); // State to store Snackbar message
    const [snackBarSeverity, setSnackBarSeverity] = useState('success'); // State to store Snackbar severity



    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const response = await axiosClient.get('/api/admin/employee/getallemployee');
                // console.log(response.data.employees);
                dispatch(setEmployee(response.data.employees));
            } catch (error) {
                setSnackBarMessage(error.response?.data?.message || "Unauthorized Access"); // Set the message to display in the Snackbar
                setSnackBarSeverity('error');
                setSnackBarOpen(true);
            }
        }
        fetchEmployees()
    }, [])
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
                            address={employee.address}
                            city={employee.city}
                            state={employee.state}
                            pinCode={employee.pinCode}
                            referralCode={employee.referralCode}
                        />
                    )) : <div className='flex items-center justify-center'>Loading...</div>
                }
            </div>
        </>
    )
}
