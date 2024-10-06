import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { db, storage } from '@/services/api/firebase' // Adjust the import based on your Firebase setup
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { addDoc, collection } from 'firebase/firestore'
import QRCode from 'qrcode.react'
import { X, Upload, FileUp } from 'lucide-react'

export default function ModalContent({ onClose }) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [handleBy, setHandleBy] = useState('')
    const [classification, setClassification] = useState('')
    const [file, setFile] = useState(null)
    const [qrCodeValue, setQrCodeValue] = useState('')
    const [userId, setUserId] = useState(null)

    useEffect(() => {
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
                userId
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl relative max-w-md w-full mx-auto overflow-hidden">
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center bg-purple-600 -mx-6 -mt-6 px-6 py-4 mb-4">
                        <h2 className="text-2xl font-bold text-white">
                            Upload Document
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-purple-700 rounded-full">
                            <X className="h-6 w-6" />
                            <span className="sr-only">Close</span>
                        </Button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title" className="text-purple-600">
                                Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="Enter document title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="border-purple-300 focus:border-purple-500 focus:ring-purple-500"
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="description"
                                className="text-blue-600">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Enter document description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="handleBy"
                                className="text-green-600">
                                Handled By
                            </Label>
                            <Input
                                id="handleBy"
                                placeholder="Enter handler's name"
                                value={handleBy}
                                onChange={(e) => setHandleBy(e.target.value)}
                                className="border-green-300 focus:border-green-500 focus:ring-green-500"
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="classification"
                                className="text-orange-600">
                                Classification
                            </Label>
                            <Input
                                id="classification"
                                placeholder="Enter document classification"
                                value={classification}
                                onChange={(e) =>
                                    setClassification(e.target.value)
                                }
                                className="border-orange-300 focus:border-orange-500 focus:ring-orange-500"
                            />
                        </div>

                        <div>
                            <Label htmlFor="file" className="text-pink-600">
                                Upload File
                            </Label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-pink-300 border-dashed rounded-md hover:border-pink-500 transition-colors">
                                <div className="space-y-1 text-center">
                                    <FileUp className="mx-auto h-12 w-12 text-pink-500" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500">
                                            <span>Upload a file</span>
                                            <input
                                                id="file"
                                                name="file"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PDF, DOC, DOCX up to 10MB
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="border-red-500 text-red-500 hover:bg-red-50">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpload}
                            className="bg-green-500 text-white hover:bg-green-600">
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </Button>
                    </div>

                    {qrCodeValue && (
                        <div className="mt-4 p-4 bg-yellow-100 rounded-lg">
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                Generated QR Code:
                            </h3>
                            <div className="flex justify-center bg-white p-2 rounded">
                                <QRCode value={qrCodeValue} size={128} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
