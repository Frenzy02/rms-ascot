import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, Upload, FileUp } from 'lucide-react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import {
    uploadDocumentRequest,
    fetchParentAndSubFolders
} from '@/services/api/appwrite'

export default function ModalContent({ onClose }) {
    const [folders, setFolders] = useState([])
    const [breadcrumbPath, setBreadcrumbPath] = useState([])
    const [currentSubfolders, setCurrentSubfolders] = useState([])
    const [parentFolderId, setParentFolderId] = useState('')
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [fileType, setFileType] = useState('')
    const [file, setFile] = useState(null)
    const [controlNumber, setControlNumber] = useState('')
    const [userId, setUserId] = useState('')
    const [dragActive, setDragActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const loadFolders = async () => {
            try {
                const { folders } = await fetchParentAndSubFolders()
                setFolders(folders || [])

                if (folders && folders.length > 0) {
                    setCurrentSubfolders(folders)
                }
            } catch (error) {
                console.error('Error fetching folders:', error)
                toast.error('Failed to fetch folders. Please try again later.')
            }
        }

        loadFolders()

        const storedUserId =
            sessionStorage.getItem('uid') || sessionStorage.getItem('userId')
        if (storedUserId) {
            setUserId(storedUserId)
        } else {
            console.error('No uid found in session storage.')
            alert('Session expired or not found. Please log in again.')
        }
    }, [])

    // Handle breadcrumb navigation
    const handleBreadcrumbClick = (index) => {
        const newPath = breadcrumbPath.slice(0, index + 1)
        setBreadcrumbPath(newPath)
        const lastItem = newPath[newPath.length - 1]
        setCurrentSubfolders(lastItem.folders)
        setParentFolderId(newPath[0]?.folderId || '')
    }

    // Handle folder selection and update breadcrumb
    const handleFolderChange = (e) => {
        const selectedFolderId = e.target.value
        const selectedFolder = currentSubfolders.find(
            (folder) => folder.$id === selectedFolderId
        )

        if (selectedFolder) {
            setParentFolderId(breadcrumbPath[0]?.folderId || '')
            setBreadcrumbPath((prev) => [
                ...prev,
                {
                    name: selectedFolder.name,
                    folderId: selectedFolder.$id,
                    folders: selectedFolder.subfolders || []
                }
            ])
            setCurrentSubfolders(selectedFolder.subfolders || [])
        }
    }

    // Reset the folder selection
    const resetFolderSelection = () => {
        setBreadcrumbPath([])
        setCurrentSubfolders(folders)
        setParentFolderId('')
    }

    const handleFileChange = (e) => setFile(e.target.files[0])

    const handleUpload = async () => {
        if (!title || !description || !fileType || !file || !controlNumber) {
            toast.error('Please fill out all required fields.')
            return
        }

        // Build the `path` string from breadcrumbPath
        const path = breadcrumbPath.map((crumb) => crumb.name).join('/')

        const parentFolderIdToSave = breadcrumbPath[0]?.folderId || ''
        const lastBreadcrumb = breadcrumbPath[breadcrumbPath.length - 1]
        const folderIdToSave = lastBreadcrumb?.folderId || ''

        setIsLoading(true)

        try {
            // Prepare the metadata, including the new `dateReceived` field
            const response = await uploadDocumentRequest(file, {
                title,
                description,
                handleBy: userId,
                userId,
                fileType,
                folderId: folderIdToSave,
                parentFolderId: parentFolderIdToSave,
                controlNumber,
                path, // Add the path string to your metadata
                status: 'pending',
                createdAt: new Date().toISOString(),
                dateReceived: new Date().toISOString(), // Add the `dateReceived` field
                requestDate: new Date().toLocaleDateString()
            })

            if (response && response.fileId) {
                toast.success('Document request submitted successfully.')
                resetForm()
            } else {
                toast.error('Failed to store metadata in the database.')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            toast.error('Upload failed, please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setFile(null)
        setParentFolderId('')
        setBreadcrumbPath([])
        setCurrentSubfolders(folders)
        setFileType('')
        setControlNumber('')
        onClose()
    }

    const renderFolderOptions = (folders) => [
        <option key="default" value="" disabled>
            Choose a folder
        </option>,
        ...folders.map((folder) => (
            <option key={folder.$id} value={folder.$id}>
                {folder.name}
            </option>
        ))
    ]

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl relative max-w-md w-full mx-auto overflow-hidden">
                <div className="p-6 space-y-4 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]">
                    <div className="flex justify-between items-center bg-orange-500 -mx-6 -mt-6 px-6 py-4 mb-4">
                        <h2 className="text-2xl font-bold text-white">
                            Upload Document
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-orange-600 rounded-full">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <Label htmlFor="title" className="text-orange-600">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        placeholder="Enter document title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Label htmlFor="description" className="text-orange-600">
                        Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Enter document description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <Label htmlFor="fileType" className="text-orange-600">
                        File Type <span className="text-red-500">*</span>
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
                    </select>
                    <Label htmlFor="controlNumber" className="text-orange-600">
                        Control Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="controlNumber"
                        placeholder="Enter control number"
                        value={controlNumber}
                        onChange={(e) => setControlNumber(e.target.value)}
                    />
                    <Label htmlFor="folder" className="text-orange-600">
                        Folder Path <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center space-x-2">
                        {breadcrumbPath.map((crumb, index) => (
                            <button
                                key={index}
                                onClick={() => handleBreadcrumbClick(index)}
                                className="text-orange-600 hover:underline">
                                {crumb.name}
                            </button>
                        ))}
                    </div>
                    <select
                        id="folder"
                        value=""
                        onChange={handleFolderChange}
                        className="w-full p-2 border rounded-md mt-2">
                        {renderFolderOptions(currentSubfolders)}
                    </select>
                    <div className="flex justify-end mt-2">
                        <Button
                            variant="outline"
                            onClick={resetFolderSelection}>
                            Reset Folder Selection
                        </Button>
                    </div>
                    <Label htmlFor="file" className="text-orange-600">
                        Attach File <span className="text-red-500">*</span>
                    </Label>
                    <div
                        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                            dragActive
                                ? 'border-orange-500'
                                : 'border-orange-300'
                        }`}
                        onDragOver={(e) => {
                            e.preventDefault()
                            setDragActive(true)
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={(e) => {
                            e.preventDefault()
                            setDragActive(false)
                            setFile(e.dataTransfer.files[0])
                        }}>
                        <div className="space-y-1 text-center">
                            <FileUp className="mx-auto h-12 w-12 text-orange-500" />
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="file"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600">
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
                    {isLoading && (
                        <div className="flex justify-center mt-4">
                            <div className="w-6 h-6 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
