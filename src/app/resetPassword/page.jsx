'use client'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/services/api/firebase'
import { useRouter } from 'next/navigation'

export default function ResetPassword() {
    const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter() // Next.js router instance

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            await sendPasswordResetEmail(auth, forgotPasswordEmail)
            toast.success('Password reset email sent successfully.')
        } catch (error) {
            toast.error('Error sending password reset email.')
            console.error('Password reset error:', error.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBackToLogin = () => {
        router.push('/log-in')
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
                        Forgot Password
                    </h2>
                    <form onSubmit={handleForgotPassword}>
                        <Input
                            id="forgotPasswordEmail"
                            name="forgotPasswordEmail"
                            type="email"
                            autoComplete="email"
                            required
                            className="block w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-primary sm:text-sm mb-4"
                            placeholder="Enter your email"
                            value={forgotPasswordEmail}
                            onChange={(e) =>
                                setForgotPasswordEmail(e.target.value)
                            }
                        />

                        <div className="flex justify-end mt-6">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover focus:outline-none mr-2">
                                {isLoading ? 'Sending...' : 'Reset Password'}
                            </Button>
                            <Button
                                variant="text"
                                onClick={handleBackToLogin}
                                className="text-gray-400 hover:text-gray-600 focus:outline-none">
                                Cancel
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
