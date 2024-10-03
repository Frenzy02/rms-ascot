'use client'

import React, { useState, useEffect } from 'react'
import HeroSection from '../HeroSection/HeroSection'
import Features from '../Features/Features'

import Header from '../../../navigations/Header/Header'
import Footer from '../../../navigations/Footer/Footer'

export default function StudentPanel() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [userId, setUserId] = useState('')
    const [profilePicture, setProfilePicture] = useState(null)

    useEffect(() => {
        const loggedInUser = sessionStorage.getItem('isLoggedIn')
        const storedUserId = sessionStorage.getItem('userId')

        if (loggedInUser === 'true' && storedUserId) {
            setIsLoggedIn(true)
            setUserId(storedUserId)
        } else {
            window.location.href = '/components/login'
        }
    }, [])

    const handleUpload = async () => {
        if (!profilePicture) return

        const base64String = await convertToBase64(profilePicture)

        const response = await fetch('/api/uploadProfilePicture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ profilePicture: base64String, userId })
        })

        const data = await response.json()
        if (data.success) {
            console.log('Profile picture uploaded:', data.profilePictureUrl)
            // Update state or notify the user as needed
        } else {
            console.error('Upload failed:', data.message)
        }
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setProfilePicture(file)
        }
    }

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsDataURL(file)
            reader.onload = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
        })
    }

    return (
        <div>
            <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
            <section id="home" className="scroll-animation">
                <HeroSection isLoggedIn={isLoggedIn} userId={userId} />
            </section>
            <section id="features" className="scroll-animation">
                <Features />
            </section>
            <section id="profile" className="scroll-animation">
                <h2>Your Profile</h2>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="image/*"
                />
                <button onClick={handleUpload}>Upload Profile Picture</button>
            </section>

            <Footer />
        </div>
    )
}
