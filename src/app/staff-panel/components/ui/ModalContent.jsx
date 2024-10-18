import { useState, useEffect, Fragment } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Upload, FileUp } from 'lucide-react'
import QRCode from 'qrcode'
import {
    uploadDocumentRequest,
    fetchFoldersAndFiles,
    storage, // Import storage from Appwrite services
    databases,
    appwriteConfig
} from '@/services/api/appwrite'
import { ID } from 'appwrite'

export default function ModalContent({ onClose }) {
    const [folders, setFolders] = useState([])
    const [folderId, setFolderId] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [handleBy, setHandleBy] = useState('')
    const [fileType, setFileType] = useState('')
    const [file, setFile] = useState(null)
    const [userId, setUserId] = useState('')
    const [dragActive, setDragActive] = useState(false)
    const [qrCodeUrl, setQrCodeUrl] = useState('')

    useEffect(() => {
        const loadFolders = async () => {
            try {
                const { folders } = await fetchFoldersAndFiles()
                setFolders(folders)
            } catch (error) {
                console.error('Error fetching folders:', error)
            }
        }
        loadFolders()

        const storedUserId =
            sessionStorage.getItem('uid') || sessionStorage.getItem('userId')
        if (storedUserId) {
            console.log('User ID from session:', storedUserId)
            setUserId(storedUserId)
        } else {
            console.error('No uid found in session storage.')
            alert('Session expired or not found. Please log in again.')
        }
    }, [])

    const handleFileChange = (e) => setFile(e.target.files[0])

    const handleUpload = async () => {
        if (!file) return alert('Please attach a valid file.')
        if (!folderId) return alert('Please select a folder.')
        if (!fileType) return alert('Please select a file type.')

        try {
            // Step 1: Upload the document file and get the fileId
            const response = await uploadDocumentRequest(file, {
                title,
                description,
                handleBy,
                userId,
                folderId,
                fileType,
                status: 'pending',
                createdAt: new Date().toISOString(),
                requestDate: new Date().toLocaleDateString()
            })

            const fileId = response.fileId

            // Step 2: Generate a QR code as a base64 string
            const fileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/files/${fileId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
            const qrCodeBase64 = await QRCode.toDataURL(fileUrl) // Generate base64 QR code

            // Step 3: Upload the QR code to Appwrite Storage
            const qrCodeBlob = await fetch(qrCodeBase64).then((res) =>
                res.blob()
            )
            const qrCodeFile = new File([qrCodeBlob], `${fileId}-qrcode.png`, {
                type: 'image/png'
            })

            const qrCodeUploadResponse = await storage.createFile(
                appwriteConfig.storageId,
                ID.unique(),
                qrCodeFile
            )

            if (!qrCodeUploadResponse) {
                console.error('Failed to upload QR code.')
                return alert('QR code upload failed.')
            }

            const qrCodeFileUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/files/${qrCodeUploadResponse.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`

            console.log('QR Code URL:', qrCodeFileUrl)

            // Step 4: Generate URL for the uploaded QR code image

            // Step 5: Store file metadata along with the QR code image URL in the database
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                ID.unique(),
                {
                    title,
                    description,
                    handleBy,
                    userId,
                    folderId,
                    fileType,
                    fileId,
                    status: 'pending',
                    createdAt: new Date().toISOString(),
                    requestDate: new Date().toLocaleDateString(),
                    qrCodeUrl: qrCodeFileUrl // Store the URL to the uploaded QR code image
                }
            )

            console.log('Document and QR code created successfully')

            // Update the state to display the QR code in the UI
            setQrCodeUrl(qrCodeFileUrl)

            alert('Document request submitted successfully.')
            // Reset fields
            setTitle('')
            setDescription('')
            setHandleBy('')
            setFile(null)
            setFolderId('')
            setFileType('')
            onClose()
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Upload failed, please try again.')
        }
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => setDragActive(false)

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        setFile(e.dataTransfer.files[0])
    }

    const renderFolderOptions = (folders, prefix = '') =>
        folders.map((folder) => (
            <Fragment key={folder.$id}>
                <option value={folder.$id}>{`${prefix}${folder.name}`}</option>
                {folder.subfolders &&
                    renderFolderOptions(folder.subfolders, `${prefix}-- `)}
            </Fragment>
        ))

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl relative max-w-md w-full mx-auto overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]">
                    {/* Scrollable area */}
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
                        </Button>
                    </div>
                    <Label htmlFor="title" className="text-purple-600">
                        Title
                    </Label>
                    <Input
                        id="title"
                        placeholder="Enter document title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Label htmlFor="description" className="text-blue-600">
                        Description
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Enter document description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Label htmlFor="handleBy" className="text-green-600">
                        Handled By
                    </Label>
                    <Input
                        id="handleBy"
                        placeholder="Enter handler's name"
                        value={handleBy}
                        onChange={(e) => setHandleBy(e.target.value)}
                    />
                    <Label htmlFor="fileType" className="text-red-600">
                        File Type
                    </Label>
                    <select
                        id="fileType"
                        value={fileType}
                        onChange={(e) => setFileType(e.target.value)}
                        className="w-full p-2 border rounded-md">
                        <option value="" disabled>
                            Select File Type
                        </option>
                        <option value="PDF">PDF</option>
                        <option value="DOC">DOC</option>
                        <option value="DOCX">DOCX</option>
                        <option value="ISO">ISO</option>
                    </select>
                    <Label htmlFor="folder" className="text-orange-600">
                        Select Folder
                    </Label>
                    <select
                        id="folder"
                        value={folderId}
                        onChange={(e) => setFolderId(e.target.value)}
                        className="w-full p-2 border rounded-md">
                        <option value="" disabled>
                            Choose a folder
                        </option>
                        {renderFolderOptions(folders)}
                    </select>
                    <Label htmlFor="file" className="text-pink-600">
                        Attach File
                    </Label>
                    <div
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                            dragActive ? 'border-pink-500' : 'border-pink-300'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}>
                        <div className="space-y-1 text-center">
                            <FileUp className="mx-auto h-12 w-12 text-pink-500" />
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="file"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600">
                                    <span>Attach a file</span>
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
                                PDF, DOC, DOCX, ISO up to 10MB
                            </p>
                            {file && (
                                <p className="text-xs text-green-500">
                                    Attached: {file.name}
                                </p>
                            )}
                        </div>
                    </div>
                    {qrCodeUrl && (
                        <div className="mt-4">
                            <Label className="text-purple-600">QR Code</Label>
                            <img
                                src={qrCodeUrl}
                                alt="QR Code"
                                className="w-32 h-32 mx-auto"
                            />
                        </div>
                    )}
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                        <Button variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload}>
                            <Upload className="w-4 h-4 mr-2" /> Upload
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
