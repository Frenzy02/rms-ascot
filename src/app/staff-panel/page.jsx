'use client'
import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import FileGrid from './components/FileGrid'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { appwriteConfig, signOut } from '@/services/api/appwrite'
import { Client, Account } from 'appwrite'
import { useRouter } from 'next/navigation'

const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
const account = new Account(client)

export default function HomePage() {
    const [selectedItem, setSelectedItem] = useState('My Drive')
    const [userId, setUserId] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const user = await account.get()
                if (user) {
                    setUserId(user.$id)
                    setIsLoggedIn(true)
                } else {
                    router.push('/')
                }
            } catch (error) {
                console.error('Error checking auth state:', error)
                router.push('/')
            }
        }

        if (router.isReady) {
            checkLogin()
        }
    }, [router])

    const handleLogoutClick = () => {
        setIsDialogOpen(true)
    }

    const handleLogoutConfirm = async () => {
        const response = await signOut()
        if (response.success) {
            sessionStorage.clear() // Clear session storage to remove user session data
            router.push('/')
            toast.success(response.message)
        } else {
            toast.error(response.error)
        }
        setIsDialogOpen(false) // Close the logout confirmation dialog
    }

    // This function handles the cancellation of the logout process
    const handleLogoutCancel = () => {
        setIsDialogOpen(false)
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 to-blue-100">
            {/* Sidebar */}
            <Sidebar
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onLogout={handleLogoutClick} // Pass the logout handler to the sidebar
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <Header />

                {/* File/Folder Grid */}
                {userId ? (
                    <FileGrid selectedItem={selectedItem} userId={userId} />
                ) : (
                    <p className="p-4">Loading user data...</p>
                )}
            </div>

            {/* Logout Confirmation Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to log out?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end mt-4">
                        <Button
                            onClick={handleLogoutCancel}
                            variant="outline"
                            className="mr-2">
                            Cancel
                        </Button>
                        <Button onClick={handleLogoutConfirm} variant="danger">
                            Logout
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ToastContainer />
        </div>
    )
}
