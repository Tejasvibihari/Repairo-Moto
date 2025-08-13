import React from 'react'
import { useParams } from 'react-router-dom'
import ResetPasswordForm from '../../components/auth/ResetPasswordForm'

export default function ResetPassword() {
    const { userType, token } = useParams();
    console.log(userType, token);
    return (
        <>
            <div className='gradient-background h-screen flex items-center justify-center'>
                <ResetPasswordForm userType={userType} token={token} />
            </div>
        </>
    )
}
