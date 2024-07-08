'use client'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useAuthUserStore } from '@/store/user'
import { useEffect, useState } from 'react'
import { whiteListedPaths } from '@/constant/whitelist'
import { usePathname, useRouter } from 'next/navigation'
import { toast } from 'react-toastify'
import { auth } from '@/services/api/firebase'

export default function Header() {
    const { user, clearAuthUser } = useAuthUserStore((state) => ({
        user: state.authUser,
        clearAuthUser: state.clearAuthUser
    }))

    const [isClient, setIsClient] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const [isDarkMode, setIsDarkMode] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        if (!user && !whiteListedPaths.includes(pathname)) {
            router.push('/log-in')
        }
        setIsClient(true)
    }, [pathname, user, router])

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

    const getInitials = () => {
        const displayName = user?.displayName || user?.email
        if (!displayName) return null

        const initials = displayName
            .split(' ')
            .map((name) => name.charAt(0))
            .join('')
            .toUpperCase()

        const avatarStyles = {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#3498db',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px'
        }

        return <div style={avatarStyles}>{initials}</div>
    }

    // If the current path is in the whiteListedPaths, do not render the header
    if (whiteListedPaths.includes(pathname)) {
        return null
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 w-full transition-colors opacity-80 duration-300 ${
                isDarkMode
                    ? 'bg-[#1a1b1e] text-white'
                    : 'bg-white text-[#1a1b1e] shadow-md'
            }`}
            style={{ zIndex: 1000 }}>
            <Link href="/" className="flex items-center gap-2" prefetch={false}>
                <MountainIcon className="h-6 w-6" />
                <span className="text-lg font-bold">Gelo</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
                <NavLink
                    href="/"
                    currentPath={pathname}
                    label="Home"
                    isDarkMode={isDarkMode}
                />
                <NavLink
                    href="/rooms"
                    currentPath={pathname}
                    label="Rooms"
                    isDarkMode={isDarkMode}
                />
                <NavLink
                    href="/spa-services"
                    currentPath={pathname}
                    label="Spa Services"
                    isDarkMode={isDarkMode}
                />
                <NavLink
                    href="/dining"
                    currentPath={pathname}
                    label="Dining"
                    isDarkMode={isDarkMode}
                />
                <NavLink
                    href="/activities"
                    currentPath={pathname}
                    label="Activities"
                    isDarkMode={isDarkMode}
                />
                <NavLink
                    href="/venues"
                    currentPath={pathname}
                    label="Venues"
                    isDarkMode={isDarkMode}
                />
                <NavLink
                    href="/concierge-services"
                    currentPath={pathname}
                    label="Concierge Services"
                    isDarkMode={isDarkMode}
                />
            </nav>
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className={`transition-colors duration-300 ${
                        isDarkMode
                            ? 'text-white hover:bg-[#2c2d30]'
                            : 'text-[#1a1b1e] hover:bg-[#f2f2f2]'
                    }`}>
                    {isDarkMode ? (
                        <SunIcon className="h-5 w-5" />
                    ) : (
                        <MoonIcon className="h-5 w-5" />
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Avatar className="h-9 w-9">
                            <AvatarFallback>{getInitials()}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="relative z-50"
                        style={{ zIndex: 1000 }}>
                        <DropdownMenuItem>My Account</DropdownMenuItem>
                        <DropdownMenuItem>Settings</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleSignOut}>
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden focus:outline-none">
                    <BurgerIcon isOpen={isMenuOpen} />
                </button>
            </div>
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg">
                    <nav className="flex flex-col items-start p-4">
                        <NavLink
                            href="/"
                            currentPath={pathname}
                            label="Home"
                            isDarkMode={isDarkMode}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <NavLink
                            href="/about-us"
                            currentPath={pathname}
                            label="Rooms"
                            isDarkMode={isDarkMode}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <NavLink
                            href="/solutions"
                            currentPath={pathname}
                            label="Spa Services"
                            isDarkMode={isDarkMode}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <NavLink
                            href="/news"
                            currentPath={pathname}
                            label="Dining"
                            isDarkMode={isDarkMode}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <NavLink
                            href="/news"
                            currentPath={pathname}
                            label="Activities"
                            isDarkMode={isDarkMode}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <NavLink
                            href="/news"
                            currentPath={pathname}
                            label="Venues"
                            isDarkMode={isDarkMode}
                            onClick={() => setIsMenuOpen(false)}
                        />
                        <NavLink
                            href="/news"
                            currentPath={pathname}
                            label="Concierge Services"
                            isDarkMode={isDarkMode}
                            onClick={() => setIsMenuOpen(false)}
                        />
                    </nav>
                </div>
            )}
        </header>
    )
}

function NavLink({ href, currentPath, label, isDarkMode, onClick }) {
    const isActive = href === currentPath

    return (
        <Link
            href={href}
            className={`text-sm font-medium hover:underline underline-offset-4 transition-colors duration-300 ${
                isActive
                    ? isDarkMode
                        ? 'text-yellow-500'
                        : 'text-blue-600'
                    : isDarkMode
                    ? 'text-white'
                    : 'text-[#1a1b1e]'
            }`}
            prefetch={false}
            onClick={onClick}>
            {label}
        </Link>
    )
}

function BurgerIcon({ isOpen }) {
    return (
        <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            {isOpen ? (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"></path>
            ) : (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"></path>
            )}
        </svg>
    )
}

function MoonIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    )
}

function MountainIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
    )
}

function SunIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    )
}
