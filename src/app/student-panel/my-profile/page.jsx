//student-panel/my-profile/page.jsx

'use client'
import React, { useState, useEffect } from 'react'
import { FaEdit } from 'react-icons/fa'
import Header from '../../../navigations/Header/Header'
import Footer from '../../../navigations/Footer/Footer'
import { WavyBackground } from './WavyBackground'

const ProfilePage = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState(null)

    useEffect(() => {
        const loggedInUser = sessionStorage.getItem('isLoggedIn')
        const storedUsername = sessionStorage.getItem('username')

        if (loggedInUser === 'true' && storedUsername) {
            setIsLoggedIn(true)
            setUser({ username: storedUsername })
        } else {
            window.location.href = '/login'
        }
    }, [])

    const handleLogout = () => {
        sessionStorage.clear()
        setIsLoggedIn(false)
        window.location.href = '/'
    }

    const getInitials = (username) => {
        return username
            ? username
                  .split(' ')
                  .map((name) => name.charAt(0))
                  .join('')
                  .toUpperCase()
            : ''
    }

    return (
        <div>
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <WavyBackground
                className="flex items-center justify-center text-center"
                containerClassName="relative h-screen"
                colors={['#38bdf8', '#818cf8', '#c084fc', '#e879f9', '#22d3ee']}
                waveWidth={50}
                backgroundFill="#111827"
                blur={10}
                speed="fast"
                waveOpacity={0.5}>
                <main className="profile-content max-w-xl relative z-10">
                    <div className="relative flex flex-col items-center mb-6">
                        <div className="profile-icon bg-gray-500 text-white rounded-full h-24 w-24 md:h-32 md:w-32 flex items-center justify-center text-4xl font-bold shadow-md transition-transform duration-300 transform hover:scale-105">
                            {user ? getInitials(user.username) : 'U'}
                        </div>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                        My Profile
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 mb-6">
                        Welcome, {user ? user.username : 'Guest'}!
                    </p>
                    <button
                        onClick={handleLogout}
                        className="inline-flex h-12 items-center justify-center rounded-md bg-red-500 hover:bg-red-600 text-white px-6 py-3 font-semibold transition-colors duration-300">
                        Log Out
                    </button>
                </main>
            </WavyBackground>
            <Footer />
        </div>
    )
}

export default ProfilePage
