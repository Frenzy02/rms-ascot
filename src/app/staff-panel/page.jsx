'use client'
import { useEffect, useState, useRef } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import { Button } from '@/components/ui/button'
import { toast, ToastContainer } from 'react-toastify'
import {
    appwriteConfig,
    signOut,
    fetchUserFiles
} from '@/services/api/appwrite'
import { Client, Account } from 'appwrite'
import { useRouter } from 'next/navigation'
import { QrCode, History, Bell, FileText, Folder } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import jsQR from 'jsqr'

// Remove the problematic Radix Dialog for now and replace it with a custom modal
const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
const account = new Account(client)

export default function HomePage() {
    const [files, setFiles] = useState([])
    const [userId, setUserId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('mydocuments')
    const [selectedItem, setSelectedItem] = useState('My Drive')
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
    const [isQrScannerOpen, setIsQrScannerOpen] = useState(false)
    const [scannedData, setScannedData] = useState('No result') // State for scanned QR data
    const router = useRouter()

    const videoRef = useRef(null)
    const canvasRef = useRef(null)

    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId')
        if (storedUserId) {
            setUserId(storedUserId)
        } else {
            console.error('No userId found in session storage')
        }
    }, [])

    useEffect(() => {
        const getUserFiles = async () => {
            setLoading(true)
            try {
                if (userId) {
                    const fetchedFiles = await fetchUserFiles(userId)
                    setFiles(fetchedFiles)
                }
            } catch (err) {
                console.error('Error fetching user files:', err)
            } finally {
                setLoading(false)
            }
        }

        if (userId) {
            getUserFiles()
        }
    }, [userId])

    const handleFileClick = (file) => {
        console.log('File clicked:', file)
    }

    const startQRCodeScanner = () => {
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: 'environment' } })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream
                    videoRef.current.setAttribute('playsinline', true) // iOS compatibility
                    videoRef.current.play()
                    videoRef.current.onloadeddata = () => {
                        scanQRCode() // Start scanning after the video is ready
                    }
                }
            })
            .catch((err) => {
                console.error('Error accessing camera: ' + err)
            })
    }

    const scanQRCode = () => {
        if (videoRef.current && canvasRef.current) {
            const canvas = canvasRef.current
            const context = canvas.getContext('2d')
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
                setScannedData(code.data) // Set the QR code result
                setIsQrScannerOpen(false) // Close scanner after successful scan
                toast.success(`QR Code Scanned: ${code.data}`)
                stopQRCodeScanner()
            } else {
                requestAnimationFrame(scanQRCode)
            }
        }
    }

    const stopQRCodeScanner = () => {
        const tracks = videoRef.current?.srcObject?.getTracks()
        tracks?.forEach((track) => track.stop())
    }

    const handleLogoutClick = () => {
        setIsLogoutDialogOpen(true)
    }

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

    const handleLogoutCancel = () => {
        setIsLogoutDialogOpen(false)
    }

    return (
        <div className="flex h-screen bg-gradient-to-br from-purple-100 to-blue-100">
            <Sidebar
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
                onLogout={handleLogoutClick} // Trigger logout modal
                onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            />

            <div className="flex-1 flex flex-col">
                <Header />
                <ScrollArea className="flex-1 p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">
                        My Drive
                    </h2>
                    {loading ? (
                        <p>Loading files...</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {files.length > 0 ? (
                                files.map((file) => (
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

            {/* Mobile Bottom Navigation */}
            <nav
                className={`fixed bottom-0 w-full ${
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

            {/* QR Code Scanner Modal */}
            {isQrScannerOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-lg font-bold mb-4">Scan QR Code</h2>
                        <video ref={videoRef} className="w-full h-auto"></video>
                        <canvas ref={canvasRef} className="hidden"></canvas>
                        <p>{scannedData}</p>
                        <Button
                            onClick={() => {
                                setIsQrScannerOpen(false)
                                stopQRCodeScanner()
                            }}
                            className="mt-4">
                            Close Scanner
                        </Button>
                    </div>
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
