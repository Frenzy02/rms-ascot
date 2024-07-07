'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAuthUserStore } from '@/store/user'
import { whiteListedPaths } from '@/constant/whitelist'

export const useRequireAuth = () => {
    const { user } = useAuthUserStore((state) => ({
        user: state.authUser
    }))

    const router = useRouter()

    useEffect(() => {
        // Check if user is logged in
        const isLoggedIn = Boolean(user)

        if (!isLoggedIn && !whiteListedPaths.includes(router.pathname)) {
            router.push('/log-in') // Redirect to login page
        }
    }, [user, router])
}
