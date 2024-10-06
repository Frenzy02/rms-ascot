'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { File, Folder, Search, LogOut, Smartphone } from 'lucide-react'
import QRCode from 'qrcode.react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthUserStore } from '@/store/user'
import { useRouter } from 'next/navigation'

import { Client, Account, Databases, Storage } from 'appwrite'
import { appwriteConfig, signOut } from '@/services/api/appwrite'

const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
const account = new Account(client)
const databases = new Databases(client)
const storage = new Storage(client)

const fileSystem = [] // Empty file system for a cleaner UI

export default function Component() {
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPath, setCurrentPath] = useState([])
    const [selectedFile, setSelectedFile] = useState(null)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [showQRCode, setShowQRCode] = useState(false)
    const [qrValue, setQRValue] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()
    const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser)

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const user = await account.get()
                if (user) {
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

    const getCurrentFolder = () => {
        let current = fileSystem
        for (let folder of currentPath) {
            current = current.find((item) => item.id === folder.id).children
        }
        return current
    }

    const handleItemClick = (item) => {
        if (item.type === 'folder') {
            setCurrentPath([...currentPath, item])
        } else {
            setSelectedFile(item)
            const fileInfo = JSON.stringify({
                id: item.id,
                name: item.name,
                content: item.content
            })
            const encodedFileInfo = encodeURIComponent(fileInfo)
            const url = `https://example.com/view-file?data=${encodedFileInfo}`
            setQRValue(url)
            setShowQRCode(true)
        }
    }

    const handleBackClick = () => {
        setCurrentPath(currentPath.slice(0, -1))
        setSelectedFile(null)
    }

    const handleLogoutClick = () => {
        setIsDialogOpen(true)
    }

    const handleLogoutConfirm = async () => {
        const response = await signOut()
        if (response.success) {
            clearAuthUser()
            router.push('/')
            toast.success(response.message)
        } else {
            toast.error(response.error)
        }
    }

    const handleLogoutCancel = () => {
        setIsDialogOpen(false)
    }

    const filteredItems = getCurrentFolder().filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setShowQRCode(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

    return (
        <div className="relative flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
            {/* Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <img
                    src="ascot.png" // Replace with your logo path
                    alt="Logo"
                    className="w-1/2 opacity-10"
                />
            </div>

            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center flex-grow mr-4">
                    <Input
                        type="text"
                        placeholder="Search document you want to view..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow mr-2 rounded-lg border-2 border-purple-500 shadow-sm"
                    />
                    <Search className="w-5 h-5 text-gray-500" />
                </div>
                <Button
                    onClick={handleLogoutClick}
                    variant="outline"
                    className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>

            {currentPath.length > 0 && (
                <Button
                    onClick={handleBackClick}
                    variant="outline"
                    className="mb-4 bg-purple-500 text-white hover:bg-purple-600">
                    Back
                </Button>
            )}

            <ScrollArea className="relative z-10 flex-grow mb-4 bg-white bg-opacity-50 rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <Button
                                key={item.id}
                                variant="outline"
                                className={`h-24 flex flex-col items-center justify-center text-center p-2 ${item.color} text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300`}
                                onClick={() => handleItemClick(item)}>
                                {item.type === 'folder' ? (
                                    <Folder className="w-8 h-8 mb-2" />
                                ) : (
                                    <File className="w-8 h-8 mb-2" />
                                )}
                                <span className="text-sm font-medium truncate w-full">
                                    {item.name}
                                </span>
                            </Button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center col-span-4">
                            No documents found.
                        </p>
                    )}
                </div>
            </ScrollArea>

            <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                <DialogContent className="rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-purple-600">
                            Scan QR Code to View on Mobile
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Use your mobile device to scan this QR code and view
                            the file details.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col items-center justify-center p-4">
                        <QRCode
                            value={qrValue}
                            size={200}
                            level="H"
                            includeMargin={true}
                        />
                        <p className="mt-4 text-sm text-gray-600 flex items-center">
                            <Smartphone className="w-4 h-4 mr-2" />
                            Scan with your phone's camera
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-purple-600">
                            Confirm Logout
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            Are you sure you want to log out?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end">
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
