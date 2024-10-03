import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import LoginSignupModal from '../../app/components/login/page' // Ensure this path is correct
import './Header.css'

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [user, setUser] = useState(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoginSignupModalOpen, setIsLoginSignupModalOpen] = useState(false)
    const router = useRouter()

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    const handleLinkClick = (event, id) => {
        event.preventDefault()

        const currentPath = window.location.pathname

        if (currentPath !== targetPath) {
            window.location.href = `${targetPath}#${id}`
        } else {
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' })
            }
            if (isMenuOpen) {
                setIsMenuOpen(false)
            }
        }
    }

    const handleLoginClick = (event) => {
        event.preventDefault()
        setIsLoginSignupModalOpen(true)
        if (isMenuOpen) {
            toggleMenu()
        }
    }

    const handleModalClose = () => {
        setIsLoginSignupModalOpen(false)
    }

    const handleProfileClick = () => {
        router.push('/student-panel/my-profile')
    }

    const handleLogoutClick = () => {
        setIsDialogOpen(true)
    }

    const handleLogoutConfirm = () => {
        sessionStorage.removeItem('isLoggedIn')
        sessionStorage.removeItem('username')
        setIsLoggedIn(false)
        setIsDialogOpen(false)
        router.push('/')
    }

    const handleLogoutCancel = () => {
        setIsDialogOpen(false)
    }

    useEffect(() => {
        const loggedInUser = sessionStorage.getItem('isLoggedIn')
        const username = sessionStorage.getItem('username')
        if (loggedInUser) {
            setUser({ username })
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const getInitials = (username) => {
        if (!username) return ''
        const names = username.split(' ')
        return names
            .map((name) => name.charAt(0))
            .join('')
            .toUpperCase()
    }

    return (
        <>
            <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
                <div className="logo-container">
                    <img
                        src="/assets/images/logo.png"
                        alt="Logo"
                        className="logo-img"
                    />
                    <div className="logo">ASCOT RMS</div>
                </div>
                <button
                    className={`menu-toggle ${isMenuOpen ? 'open' : ''}`}
                    onClick={toggleMenu}>
                    {isMenuOpen ? '✖' : '☰'}
                </button>
                <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
                    <button className="close-menu" onClick={toggleMenu}>
                        ✖
                    </button>
                    <div className="profile-section">
                        <DropdownMenu>
                            <DropdownMenuTrigger className="profile-icon-mobile">
                                {/* Removed profile photo */}
                                <div className="profile-initials">
                                    {isLoggedIn && user
                                        ? getInitials(user.username)
                                        : '👤'}
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel>
                                    My Account
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleProfileClick}>
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    Medical Form
                                </DropdownMenuItem>
                                {isLoggedIn && (
                                    <DropdownMenuItem
                                        onClick={handleLogoutClick}>
                                        Logout
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        {!isLoggedIn && (
                            <button
                                className="mobile-login-btn"
                                onClick={handleLoginClick}>
                                Log In
                            </button>
                        )}
                    </div>
                    <ul>
                        <li className="nav-item">
                            <a
                                href="#home"
                                onClick={(e) => handleLinkClick(e, 'home')}>
                                <i className="icon-home"></i> Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#features"
                                onClick={(e) => handleLinkClick(e, 'features')}>
                                <i className="icon-features"></i> Features
                            </a>
                        </li>
                    </ul>
                </nav>
                <div className={`desktop-nav ${isLoggedIn ? 'logged-in' : ''}`}>
                    <ul>
                        <li className="nav-item">
                            <a
                                href="/student-panel#home"
                                onClick={(e) => handleLinkClick(e, 'home')}>
                                <i className="icon-home"></i> Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a
                                href="#features"
                                onClick={(e) => handleLinkClick(e, 'features')}>
                                <i className="icon-features"></i> Features
                            </a>
                        </li>
                    </ul>
                    {!isLoggedIn && (
                        <button
                            className="login-btn"
                            onClick={handleLoginClick}>
                            Log In / Sign Up
                        </button>
                    )}
                    {isLoggedIn && (
                        <div className="profile-dropdown">
                            <DropdownMenu>
                                <DropdownMenuTrigger className="profile-icon-desktop">
                                    {/* Removed profile photo */}
                                    <div className="profile-initials">
                                        {user ? getInitials(user.username) : ''}
                                    </div>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuLabel>
                                        My Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleProfileClick}>
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        Medical Form
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogoutClick}>
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Alert Dialog for Logout Confirmation */}
                <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Are you absolutely sure?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to log out? You will be
                                redirected to the Home Page.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleLogoutCancel}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={handleLogoutConfirm}>
                                Logout
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Login/Signup Modal */}
                {isLoginSignupModalOpen && (
                    <LoginSignupModal
                        onClose={handleModalClose}
                        setIsLoggedIn={setIsLoggedIn}
                    />
                )}
            </header>
        </>
    )
}

export default Header
