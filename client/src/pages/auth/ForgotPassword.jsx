import React from 'react'
import UserSignInForm from '../../components/auth/UserSiginInForm'
import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm'

export default function ForgotPassword() {
    return (
        <>
            <div className='gradient-background h-screen flex items-center justify-center'>

                <ForgotPasswordForm />
            </div>
        </>
    )
}
