'use client'
import { useEffect, useState, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { Button } from '@/components/ui/button'
import { toast, ToastContainer } from 'react-toastify'
import {
    appwriteConfig,
    signOut,
    fetchUserFiles, // Fetch only user-specific files
    fetchAllFiles // Fetch all files for QR code scanning
} from '@/services/api/appwrite'
import { Client, Account } from 'appwrite'
import { useRouter } from 'next/navigation'
import { QrCode, History, Bell, FileText, Folder } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import QRScanDialog from './components/qrScanDialog'

const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
const account = new Account(client)

export default function HomePage() {
    const [files, setFiles] = useState([])
    const [userFiles, setUserFiles] = useState([]) // Store user-specific files
    const [userId, setUserId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('mydocuments')
    const [selectedItem, setSelectedItem] = useState('My Drive')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
    const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
    const [scannedData, setScannedData] = useState('No result')
    const [qrCodeData, setQrCodeData] = useState('')
    const [selectedFile, setSelectedFile] = useState(null)
    const [isQrModalOpen, setIsQrModalOpen] = useState(false)
    const [scannedFile, setScannedFile] = useState(null)
    const [isQrDialogOpen, setIsQrDialogOpen] = useState(false)
    const [userFullName, setUserFullName] = useState('')
    const videoRef = useRef(null)
    const canvasRef = useRef(null)
    const router = useRouter()

    // Fetch userId from session storage
    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId')
        if (storedUserId) {
            setUserId(storedUserId)
        } else {
            console.error('No userId found in session storage')
        }
    }, [])

    // Fetch user-specific files
    useEffect(() => {
        const getUserFiles = async () => {
            if (!userId) return
            setLoading(true)
            try {
                const fetchedUserFiles = await fetchUserFiles(userId) // Fetch only user-specific files
                setUserFiles(fetchedUserFiles) // Set user's files in state
            } catch (err) {
                console.error('Error fetching user files:', err)
            } finally {
                setLoading(false)
            }
        }

        getUserFiles()
    }, [userId])

    // Fetch all files for QR scanning
    useEffect(() => {
        const getAllFiles = async () => {
            try {
                const fetchedFiles = await fetchAllFiles() // Fetch all files for QR scanning
                setFiles(fetchedFiles)
            } catch (err) {
                console.error('Error fetching all files:', err)
            }
        }

        getAllFiles() // Fetch all files on component load
    }, [])

    // Generate QR Code for a file
    const generateQRCode = async (file) => {
        try {
            if (!file.controlNumber) {
                throw new Error('Control number is missing for this file.')
            }

            const qrCodeUrl = await QRCode.toDataURL(file.controlNumber)
            setQrCodeData(qrCodeUrl)
            setSelectedFile(file)
            setIsQrModalOpen(true)
        } catch (err) {
            console.error('Failed to generate QR code:', err)
            toast.error('Failed to generate QR code: ' + err.message)
        }
    }

    // Handle file click to generate QR code
    const handleFileClick = (file) => {
        if (file.controlNumber) {
            generateQRCode(file)
        } else {
            console.warn(
                'Control number is missing for the selected file:',
                file
            )
            toast.error('Control number is missing for the selected file.')
        }
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
                        scanQRCode()
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
                const scannedControlNumber = code.data.trim()
                console.log('Scanned Control Number:', scannedControlNumber)

                // Match the entire control number
                const matchedFile = files.find((f) => {
                    return (
                        f.controlNumber.toLowerCase() ===
                        scannedControlNumber.toLowerCase()
                    )
                })

                if (matchedFile) {
                    console.log('Matched File:', matchedFile)
                    setScannedFile(matchedFile)
                    setIsQrDialogOpen(true)
                } else {
                    toast.error('File not found.')
                    setIsQrDialogOpen(false)
                }
                stopQRCodeScanner()
            } else {
                requestAnimationFrame(scanQRCode)
            }
        }
    }

    // Stop QR Code Scanner
    const stopQRCodeScanner = () => {
        const tracks = videoRef.current?.srcObject?.getTracks()
        tracks?.forEach((track) => track.stop())
    }

    // Handle logout click
    const handleLogoutClick = () => {
        setIsLogoutDialogOpen(true)
    }

    // Confirm logout
    const handleLogoutConfirm = async () => {
        const response = await signOut()
        if (response.success) {
            sessionStorage.clear()
            router.push('/')
            toast.success(response.message)
        } else {
            toast.error(response.error)
        }
        setIsLogoutDialogOpen(false)
    }

    // Cancel logout
    const handleLogoutCancel = () => {
        setIsLogoutDialogOpen(false)
    }

    return (
        <div className="flex h-screen bg-white">
            <Sidebar
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onLogout={handleLogoutClick}
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            />

            <div className="flex-1 flex flex-col">
                <Header />
                <ScrollArea className="flex-1 p-6 pb-20">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        My Drive
                    </h2>
                    {loading ? (
                        <p>Loading files...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {userFiles.length > 0 ? (
                                userFiles.map((file) => (
                                    <Button
                                        key={file.id}
                                        onClick={() => handleFileClick(file)}
                                        variant="outline"
                                        className="h-32 flex flex-col items-center justify-center text-center p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 bg-blue-500 text-white">
                                        <div className="bg-white p-2 rounded-full mb-2">
                                            {file.fileType === 'folder' ? (
                                                <Folder className="w-4 h-4" />
                                            ) : (
                                                <FileText className="w-4 h-4" />
                                            )}
                                        </div>
                                        <span className="mt-2 text-sm font-medium">
                                            {file.title || 'Untitled'}
                                        </span>
                                    </Button>
                                ))
                            ) : (
                                <p>No files uploaded yet.</p>
                            )}
                        </div>
                    )}
                </ScrollArea>
            </div>

            <nav
                className={`fixed bottom-0 w-full z-10 ${
                    isSidebarOpen ? '-translate-y-20' : ''
                } transition-transform duration-300 lg:hidden`}>
                <div className="relative flex justify-around items-center h-20 bg-black/50 backdrop-blur-lg rounded-t-3xl shadow-lg px-4">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`flex flex-col items-center ${
                            activeTab === 'history'
                                ? 'text-white'
                                : 'text-gray-400'
                        } transition-colors duration-200`}>
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
                        onClick={() => setActiveTab('notifications')}
                        className={`flex flex-col items-center ${
                            activeTab === 'notifications'
                                ? 'text-white'
                                : 'text-gray-400'
                        } transition-colors duration-200`}>
                        <Bell size={24} />
                        <span className="text-xs mt-1">Notifications</span>
                    </button>
                </div>
            </nav>

            {/* QR Code Generation Modal */}
            {isQrModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg relative">
                        <h2 className="text-lg font-bold mb-4">
                            QR Code for {selectedFile?.title}
                        </h2>
                        <img
                            src={qrCodeData}
                            alt="QR Code"
                            className="mx-auto mb-4"
                        />
                        <Button
                            onClick={() => setIsQrModalOpen(false)}
                            className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg">
                            Close
                        </Button>
                    </div>
                </div>
            )}

            {/* QR Code Dialog */}
            {isQrDialogOpen && scannedFile && (
                <QRScanDialog
                    file={scannedFile} // Ensure this is the correct file
                    userId={userId}
                    userFullName={userFullName}
                    onClose={() => setIsQrDialogOpen(false)}
                />
            )}

            {/* QR Code Scanner Modal */}

            {isQrScannerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

            {/* Logout Confirmation Modal */}
            {isLogoutDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4">
                            Confirm Logout
                        </h2>
                        <div>Are you sure you want to log out?</div>
                        <div className="flex justify-end mt-4">
                            <Button
                                onClick={handleLogoutCancel}
                                variant="outline"
                                className="mr-2">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleLogoutConfirm}
                                variant="danger">
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <ToastContainer />
        </div>
    )
}
