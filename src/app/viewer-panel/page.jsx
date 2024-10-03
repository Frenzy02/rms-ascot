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

// Import Appwrite modules
import { Client, Account, Databases, Storage, Query } from 'appwrite'
import { appwriteConfig, signOut } from '@/services/api/appwrite'

// Initialize Appwrite Client
const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
const account = new Account(client)
const databases = new Databases(client)
const storage = new Storage(client)

// Mock file system data
const fileSystem = [
    {
        id: 1,
        name: 'Documents',
        type: 'folder',
        color: 'bg-blue-500',
        children: [
            {
                id: 2,
                name: 'Project Proposal.docx',
                type: 'file',
                content: 'This is the content of the project proposal...',
                color: 'bg-blue-400'
            },
            {
                id: 3,
                name: 'Budget.xlsx',
                type: 'file',
                content: 'Financial data and projections...',
                color: 'bg-green-400'
            }
        ]
    },
    {
        id: 4,
        name: 'Images',
        type: 'folder',
        color: 'bg-yellow-500',
        children: [
            {
                id: 5,
                name: 'Logo.png',
                type: 'file',
                content: 'Binary image data...',
                color: 'bg-yellow-400'
            }
        ]
    },
    {
        id: 6,
        name: 'Notes.txt',
        type: 'file',
        content: 'Important notes for the project...',
        color: 'bg-purple-400'
    },
    {
        id: 7,
        name: 'Presentation.pptx',
        type: 'file',
        content: 'Slide deck for the upcoming meeting...',
        color: 'bg-red-400'
    }
]

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
                const user = await account.get() // Check for current Appwrite session
                if (user) {
                    setIsLoggedIn(true)
                } else {
                    router.push('/') // Redirect to login if not authenticated
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
        const response = await signOut() // Use the logout function
        if (response.success) {
            clearAuthUser() // Clear user data in your local store
            router.push('/') // Redirect to the login page
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
        <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center flex-grow mr-4">
                    <Input
                        type="text"
                        placeholder="Search files..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow mr-2"
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
                    className="mb-4">
                    Back
                </Button>
            )}

            <ScrollArea className="flex-grow mb-4 bg-white rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.map((item) => (
                        <Button
                            key={item.id}
                            variant="outline"
                            className={`h-24 flex flex-col items-center justify-center text-center p-2 ${item.color} text-white`}
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
                    ))}
                </div>
            </ScrollArea>

            <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Scan QR Code to View on Mobile
                        </DialogTitle>
                        <DialogDescription>
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Logout</DialogTitle>
                        <DialogDescription>
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
