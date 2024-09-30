import { useState, useEffect } from 'react'
import { Button } from '../../../../components/ui/button'
import { db, storage } from '../../../../services/api/firebase' // Adjust the import based on your Firebase setup
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { addDoc, collection } from 'firebase/firestore'
import QRCode from 'qrcode.react'

export default function ModalContent({ onClose }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [handleBy, setHandleBy] = useState('')
    const [classification, setClassification] = useState('')
    const [file, setFile] = useState(null)
    const [qrCodeValue, setQrCodeValue] = useState('')
    const [userId, setUserId] = useState(null)

    useEffect(() => {
        // Fetch userId from sessionStorage
        const storedUserId = sessionStorage.getItem('userId')
        if (storedUserId) {
            setUserId(storedUserId)
        } else {
            console.error('User not logged in or userId missing')
        }
    }, [])

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleUpload = async () => {
        if (!file) return

        const storageRef = ref(storage, `uploads/${file.name}`)

        try {
            await uploadBytes(storageRef, file)
            const fileUrl = await getDownloadURL(storageRef)

            const metadata = {
                title,
                description,
                handleBy,
                dateOfUpload: new Date(),
                classification,
                fileUrl,
                userId // Add userId to metadata
            }

            await addDoc(collection(db, 'uploads'), metadata)

            setQrCodeValue(`${metadata.title} - ${metadata.handleBy}`)

            // Reset form fields
            setTitle('')
            setDescription('')
            setHandleBy('')
            setClassification('')
            setFile(null)
            onClose()
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Upload failed, please try again.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg relative max-w-md mx-auto w-full">
                <h2 className="text-2xl font-bold text-white mb-4">
                    Upload Document
                </h2>
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full mb-4 p-2 rounded bg-gray-700 text-white"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full mb-4 p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    placeholder="Handled By"
                    value={handleBy}
                    onChange={(e) => setHandleBy(e.target.value)}
                    className="block w-full mb-4 p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    placeholder="Classification"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="block w-full mb-4 p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full mb-4 p-2 rounded bg-gray-700 text-white"
                />
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="ml-2"
                        onClick={handleUpload}>
                        Upload
                    </Button>
                </div>

                {qrCodeValue && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold text-white">
                            Generated QR Code:
                        </h3>
                        <QRCode value={qrCodeValue} size={128} />
                    </div>
                )}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-white hover:text-gray-300">
                    ✖
                </button>
            </div>
        </div>
    )
}
