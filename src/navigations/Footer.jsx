'use client'
import React from 'react'
import Link from 'next/link'
import { useAuthUserStore } from '@/store/user'
import { useEffect, useState } from 'react'
import { whiteListedPaths } from '@/constant/whitelist'
import { usePathname, useRouter } from 'next/navigation'

export default function Footer() {
    const { user, clearAuthUser } = useAuthUserStore((state) => ({
        user: state.authUser,
        clearAuthUser: state.clearAuthUser
    }))

    const [isClient, setIsClient] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    useEffect(() => {
        if (!user && !whiteListedPaths.includes(pathname)) {
            router.push('/log-in')
        }
        setIsClient(true)
    }, [pathname, user, router])

    // If the current path is in the whiteListedPaths, do not render the header
    if (whiteListedPaths.includes(pathname)) {
        return null
    }

    return (
        <footer className="bg-muted py-6 px-4 md:px-6">
            <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                    &copy; 2024 Resort Appointment. All rights reserved.
                </p>
                <nav className="flex items-center gap-4">
                    <Link
                        href="#"
                        className="text-sm font-medium hover:underline underline-offset-4"
                        prefetch={false}>
                        Privacy Policy
                    </Link>
                    <Link
                        href="#"
                        className="text-sm font-medium hover:underline underline-offset-4"
                        prefetch={false}>
                        Terms of Service
                    </Link>
                </nav>
            </div>
        </footer>
    )
}
