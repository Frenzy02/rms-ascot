'use client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuthUserStore } from '@/store/user'
import { whiteListedPaths } from '@/constant/whitelist'

export const useRequireAuth = () => {
    const { user, isLoading } = useAuthUserStore((state) => ({
        user: state.authUser,
        isLoading: state.isLoading
    }))
    const [initialized, setInitialized] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (!initialized && !isLoading) {
            setInitialized(true)
        }
    }, [isLoading])

    useEffect(() => {
        if (initialized) {
            // Check if user is logged in
            const isLoggedIn = Boolean(user)

            if (!isLoggedIn && !whiteListedPaths.includes(router.pathname)) {
                router.push('/log-in') // Redirect to login page
            }
        }
    }, [initialized, user, router])
}
