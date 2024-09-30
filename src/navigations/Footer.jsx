'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Footer() {
    const [isClient, setIsClient] = useState(false)
    const pathname = usePathname()

    const whiteListedPaths = ['/admin-panel', '/staff-panel', '/viewer-panel']
    const hideFooter = whiteListedPaths.includes(pathname)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient || hideFooter) return null
    return (
        <footer className="bg-muted py-6 px-4 md:px-6">
            <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
                <p className="text-sm text-muted-foreground">
                    &copy; 2024 ASCOT RMS. All rights reserved.
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
