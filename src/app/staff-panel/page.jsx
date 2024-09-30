'use client'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import FileGrid from './components/FileGrid'
import { auth } from '@/services/api/firebase'

export default function HomePage() {
    const [selectedItem, setSelectedItem] = useState('My Drive')
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        // Listen for changes in the authentication state
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (user) {
                setUserId(user.uid) // Set userId state with the authenticated user's ID
            } else {
                console.error('User not logged in')
            }
        })

        // Cleanup the listener on component unmount
        return () => unsubscribe()
    }, [])

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 to-blue-100">
            {/* Sidebar */}
            <Sidebar
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header />

                {/* File/Folder Grid */}
                {/* Pass the userId to FileGrid to fetch the files for the logged-in user */}
                {userId ? (
                    <FileGrid selectedItem={selectedItem} userId={userId} />
                ) : (
                    <p className="p-4">Loading user data...</p>
                )}
            </div>
        </div>
    )
}
