'use client'
import React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { auth } from '@/services/api/firebase'
import { useAuthUserStore } from '@/store/user'
import { Button } from '@/components/ui/button'

export default function Dashboard() {
    const router = useRouter()
    const { clearAuthUser } = useAuthUserStore((state) => ({
        clearAuthUser: state.clearAuthUser
    }))

    const handleSignOut = async () => {
        try {
            await auth.signOut()
            clearAuthUser()
            router.push('/log-in')
            toast.success('Successfully signed out.')
        } catch (error) {
            toast.error('Error signing out. Please try again.')
        }
    }

    return (
        <div className="dashboard">
            <Button onClick={handleSignOut} className="sign-out-button">
                Sign Out
            </Button>
        </div>
    )
}
