import React from 'react'
import EmployeeSignInForm from '../../components/auth/EmployeeSignInForm'
import VendorSignInForm from '../../components/auth/VendorSignInForm'

export default function VendorSignIn() {
    return (
        <>
            <div className='gradient-background h-screen flex items-center justify-center'>

                <VendorSignInForm />

            </div>
        </>
    )
}
