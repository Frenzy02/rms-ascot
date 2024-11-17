'use client'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import {
    File,
    Folder,
    Search,
    LogOut,
    QrCode,
    History,
    Bell
} from 'lucide-react'
import QRCode from 'qrcode.react'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuthUserStore } from '@/store/user'
import { useRouter } from 'next/navigation'
import { Client, Account } from 'appwrite'
import { appwriteConfig, signOut, fetchAllFiles } from '@/services/api/appwrite'
import jsQR from 'jsqr'
import QRScanDialog from './components/QRScanDialog' // Include the QRScanDialog component
import { Spinner } from './components/Spinner' // Import a Spinner for loading
import FileOptionsModal from './components/FileOptionModal'

const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
const account = new Account(client)

export default function ViewerPanel() {
    const [showQRCode, setShowQRCode] = useState(false)
    const [qrValue, setQRValue] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
    const [scannedFile, setScannedFile] = useState(null)
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false)
    const [scannedData, setScannedData] = useState('No result')
    const [userId, setUserId] = useState(null) // Add userId state
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const [filteredFiles, setFilteredFiles] = useState([]) // Filtered search results
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPath, setCurrentPath] = useState([]) // Removed back button dependency
    const [selectedFile, setSelectedFile] = useState(null) // Track selected file
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false) // Add this line
    const [searchSuggestions, setSearchSuggestions] = useState([])
    const [currentFiles, setCurrentFiles] = useState([]) // Holds all files
    const router = useRouter()
    const clearAuthUser = useAuthUserStore((state) => state.clearAuthUser)
    const [isLoading, setIsLoading] = useState(false) // Loading state for search

    // Fetch userId from session storage
    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId')
        if (storedUserId) {
            setUserId(storedUserId)
        } else {
            console.error('No userId found in session storage')
        }
    }, [])

    // Fetch user login status
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

    // Fetch all files initially but don't display them in the UI
    useEffect(() => {
        const getAllFiles = async () => {
            try {
                const fetchedFiles = await fetchAllFiles() // Fetch all files
                setCurrentFiles(fetchedFiles) // Use currentFiles as the source for both features
            } catch (err) {
                console.error('Error fetching all files:', err)
            }
        }
        getAllFiles() // Fetch all files on component load
    }, [])

    // Handle search input
    const handleSearch = (e) => {
        setSearchTerm(e.target.value)
        const lowerSearchTerm = e.target.value.toLowerCase()

        if (lowerSearchTerm === '') {
            setSearchSuggestions([])
            return
        }

        const suggestions = currentFiles.filter(
            (file) =>
                file.title.toLowerCase().includes(lowerSearchTerm) ||
                file.description.toLowerCase().includes(lowerSearchTerm)
        )
        setSearchSuggestions(suggestions)
    }

    // When user clicks on a suggestion
    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion.title)
        setSelectedFile(suggestion) // Set only the selected file to display
        setSearchSuggestions([]) // Hide suggestions after selection
    }

    // Only display the selected file
    const handleItemClick = (item) => {
        if (item.fileId) {
            console.log('Item clicked:', item) // Debugging: Ensure fileId is logged
            setSelectedFile(item) // Store selected file with fileId
            setIsModalOpen(true) // Open modal if fileId is available
        } else {
            console.error('File ID is missing for selected file:', item)
            // Optionally display an error or prevent modal from opening
            toast.error('File data is incomplete. Cannot view the file.')
        }
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

    // Start QR Code Scanner
    const startQRCodeScanner = () => {
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.setAttribute('playsinline', true)
                    videoRef.current.play()
                    videoRef.current.onloadeddata = () => {
                        scanQRCode() // Start scanning
                    }
                }
            })
            .catch((err) => {
                console.error('Error accessing camera: ' + err)
                toast.error(
                    'Failed to access camera. Please check permissions.'
                )
            })
    }

    // Scan QR Code and find the matching file
    const scanQRCode = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const context = canvas.getContext('2d', {
                willReadFrequently: true
            })
            canvas.height = videoRef.current.videoHeight
            canvas.width = videoRef.current.videoWidth
            context.drawImage(
                videoRef.current,
                0,
                0,
                canvas.width,
                canvas.height
            )

            const imageData = context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            )
            const code = jsQR(imageData.data, canvas.width, canvas.height)

            if (code) {
                const scannedControlNumber = code.data.trim() // Get the control number
                console.log('Scanned Control Number:', scannedControlNumber) // Debugging log

                // Log all control numbers in currentFiles for comparison
                console.log(
                    'Available Control Numbers:',
                    currentFiles.map((file) => file.controlNumber)
                )

                // Match the scanned control number with files in currentFiles
                const matchedFile = currentFiles.find(
                    (file) => file.controlNumber.trim() === scannedControlNumber
                )

                if (matchedFile) {
                    setScannedFile(matchedFile)
                    setIsQrDialogOpen(true)
                } else {
                    console.error('File not found:', scannedControlNumber)
                    toast.error('File not found.')
                }
                stopQRCodeScanner()
            } else {
                requestAnimationFrame(scanQRCode) // Keep scanning
            }
        }
    }

    // Stop QR Code Scanner
    const stopQRCodeScanner = () => {
        const tracks = videoRef.current?.srcObject?.getTracks()
        tracks?.forEach((track) => track.stop())
    }

    return (
        <div className="relative flex flex-col h-screen bg-gradient-to-br from-indigo-100 to-purple-100 p-6">
            {/* Logo Overlay */}
            <div className="absolute inset-0 flex items-center justify-center z-0">
                <Image
                    src="/ascot.png" // Make sure the path starts with "/"
                    alt="Logo"
                    className="w-1/2 opacity-10"
                    width={500} // Specify width
                    height={500} // Specify height
                    priority // Use this for important images
                />
            </div>

            {/* Display selected file if it exists */}
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="relative flex items-center flex-grow mr-4">
                    <Input
                        type="text"
                        placeholder="Search document by title or description..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="flex-grow mr-2 rounded-lg border-2 border-purple-500 shadow-sm"
                    />
                    <Search className="w-5 h-5 text-gray-500" />
                    {searchSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-50 mt-2 max-h-60 overflow-auto">
                            <ScrollArea className="max-h-60">
                                {searchSuggestions.map((suggestion) => (
                                    <div
                                        key={suggestion.id}
                                        onClick={() =>
                                            handleSuggestionClick(suggestion)
                                        }
                                        className="cursor-pointer px-4 py-2 hover:bg-gray-100">
                                        <p className="font-medium text-gray-700">
                                            {suggestion.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {suggestion.description}
                                        </p>
                                    </div>
                                ))}
                            </ScrollArea>
                        </div>
                    )}
                </div>
                <Button
                    onClick={handleLogoutClick}
                    variant="outline"
                    className="flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                </Button>
            </div>

            {/* Update the z-index for the ScrollArea to be lower */}
            <ScrollArea className="relative z-0 flex-grow mb-4 bg-white bg-opacity-50 rounded-lg shadow-lg p-6">
                {isLoading ? (
                    <div className="flex justify-center items-center">
                        <Spinner />
                    </div>
                ) : selectedFile ? (
                    <Button
                        key={selectedFile.id}
                        onClick={() => handleItemClick(selectedFile)}
                        className="h-32 flex flex-col items-center justify-center text-center p-4 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-white rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-300">
                        {selectedFile.type === 'folder' ? (
                            <Folder className="w-16 h-16 mb-3 text-white" />
                        ) : (
                            <File className="w-16 h-16 mb-3 text-white" />
                        )}
                        <span className="text-lg font-semibold truncate w-full">
                            {selectedFile.title}
                        </span>
                    </Button>
                ) : (
                    <p className="text-gray-500 text-center">
                        Search for a file to display here.
                    </p>
                )}

                {/* File Options Modal */}
                <FileOptionsModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    selectedFile={selectedFile} // Pass the selected file here
                    onViewFile={() => {
                        setIsModalOpen(false)
                        console.log(`Viewing file: ${selectedFile.title}`)
                    }}
                    onTrackFile={() => {
                        setIsModalOpen(false)
                        console.log(`Tracking file: ${selectedFile.title}`)
                    }}
                />
            </ScrollArea>

            {/* QR Code Scanner Modal */}
            {isQrScannerOpen && (
                <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
                    {/* Full-Screen Camera Video */}
                    <div className="fixed inset-0 flex items-center justify-center">
                        <video
                            ref={videoRef}
                            className="w-full h-full object-cover"></video>

                        {/* Scanning Frame Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-64 h-64 border-4 border-orange-500 rounded-lg relative">
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500"></div>
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500"></div>
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500"></div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Close Scanner Button */}
                        <div className="absolute bottom-4 w-full flex justify-center">
                            <Button
                                onClick={() => {
                                    setIsQrScannerOpen(false)
                                    stopQRCodeScanner()
                                }}
                                className="bg-orange-500 text-white px-6 py-2 rounded-lg">
                                Close Scanner
                            </Button>
                        </div>
                    </div>

                    <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
            )}
            {/* QR Code Dialog */}
            {isQrDialogOpen && scannedFile && (
                <QRScanDialog
                    file={scannedFile}
                    userId={userId} // Pass the userId correctly
                    onClose={() => setIsQrDialogOpen(false)}
                />
            )}
            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 w-full z-10 transition-transform duration-300 bg-black/50 backdrop-blur-lg rounded-t-3xl shadow-lg">
                <div className="relative flex justify-around items-center h-20">
                    <button
                        onClick={() => {}}
                        className={`flex flex-col items-center text-gray-400 transition-colors duration-200`}>
                        <History size={24} />
                        <span className="text-xs mt-1">History</span>
                    </button>
                    <div className="absolute -top-10 p-4 rounded-full shadow-lg transform translate-y-2">
                        <button
                            onClick={() => {
                                setIsQrScannerOpen(true)
                                startQRCodeScanner()
                            }}
                            className="flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-16 h-16 hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 text-white">
                            <QrCode size={32} />
                        </button>
                    </div>
                    <button
                        onClick={() => {}}
                        className={`flex flex-col items-center text-gray-400 transition-colors duration-200`}>
                        <Bell size={24} />
                        <span className="text-xs mt-1">Notifications</span>
                    </button>
                </div>
            </nav>
            <ToastContainer />
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
        </div>
    )
}
