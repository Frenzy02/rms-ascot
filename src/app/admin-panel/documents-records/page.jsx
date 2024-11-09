'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Grid, List, Trash2, Upload, X, FileUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label' // Add this import
import CardView from './components/CardView'
import ListView from './components/ListView'
import FileItem from './components/FileItem'
import {
    createFolder,
    fetchFoldersAndFiles,
    uploadFile
} from '@/services/api/appwrite'
import { toast } from 'react-toastify'
import { ToastContainer } from 'react-toastify'

// Import the deleteFolderAndContents function
import { deleteFolderAndContents } from '@/services/api/appwrite'

export default function DocumentsTab() {
    const [view, setView] = useState('card')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [folders, setFolders] = useState([])
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [showAddFolderModal, setShowAddFolderModal] = useState(false)
    const [showAddFileModal, setShowAddFileModal] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [newFileName, setNewFileName] = useState('')
    const [newFileType, setNewFileType] = useState('PDF')
    const [newFileTitle, setNewFileTitle] = useState('')
    const [newFileDescription, setNewFileDescription] = useState('')
    const [newFileHandleBy, setNewFileHandleBy] = useState('')
    const [uploadedFile, setUploadedFile] = useState(null)
    const [dragActive, setDragActive] = useState(false) // Added dragActive state
    const [isLoading, setIsLoading] = useState(false)

    // Filter folders based on the search term
    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Fetch initial folders on component mount
    useEffect(() => {
        fetchInitialFolders()
    }, [])

    // Fetch folders and files from Appwrite
    const fetchInitialFolders = async () => {
        try {
            const { folders, files } = await fetchFoldersAndFiles(null)
            const nestedFolders = buildNestedFolderStructure(folders, files)
            setFolders(nestedFolders || [])
        } catch (error) {
            console.error('Error fetching folders:', error)
        }
    }

    // Fetch subfolders and files when selecting a folder
    const selectFolder = async (folder) => {
        setSelectedFolder(folder)
        try {
            const { folders: subfolders, files } = await fetchFoldersAndFiles(
                folder.$id
            )
            const updatedFolders = [...folders]
            const parentFolder = findFolderById(folder.$id, updatedFolders)
            if (parentFolder) {
                parentFolder.subfolders = subfolders
                parentFolder.files = files // Attach files to the folder
            }
            setFolders(updatedFolders)
        } catch (error) {
            console.error('Error fetching subfolders and files:', error)
        }
    }

    // Helper function to build nested folder structure and attach files
    const buildNestedFolderStructure = (folders, files) => {
        const folderMap = {}
        const rootFolders = []

        // Initialize folder map
        folders.forEach((folder) => {
            folderMap[folder.$id] = { ...folder, subfolders: [], files: [] }
        })

        // Attach files to their respective folders
        files.forEach((file) => {
            if (folderMap[file.folderId]) {
                folderMap[file.folderId].files.push(file)
            }
        })

        // Populate subfolders
        folders.forEach((folder) => {
            if (folder.parentId) {
                if (folderMap[folder.parentId]) {
                    folderMap[folder.parentId].subfolders.push(
                        folderMap[folder.$id]
                    )
                }
            } else {
                rootFolders.push(folderMap[folder.$id])
            }
        })

        return rootFolders
    }

    const handleFileUpload = (event) => {
        const file = event.target.files[0]
        if (file) setUploadedFile(file)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        setDragActive(true)
    }

    const handleDragLeave = () => setDragActive(false)

    const handleDrop = (e) => {
        e.preventDefault()
        setDragActive(false)
        const file = e.dataTransfer.files[0]
        if (file) setUploadedFile(file)
    }

    const handleAddFile = async () => {
        if (!uploadedFile) {
            alert('Please select a file to upload.')
            return
        }

        setIsLoading(true) // Start loading

        try {
            const titleInitials = newFileTitle
                .split(' ')
                .map((word) => word[0])
                .join('')
                .toUpperCase()

            const currentDate = new Date()
            const datePart = `${(currentDate.getMonth() + 1)
                .toString()
                .padStart(2, '0')}${currentDate
                .getDate()
                .toString()
                .padStart(2, '0')}${currentDate.getFullYear()}`
            const timePart = `${currentDate
                .getHours()
                .toString()
                .padStart(2, '0')}${currentDate
                .getMinutes()
                .toString()
                .padStart(2, '0')}${currentDate
                .getSeconds()
                .toString()
                .padStart(2, '0')}`
            const controlNumber = `CN-${titleInitials}-${datePart}-${timePart}`
            const userId = sessionStorage.getItem('userId') || ''

            // Add parentFolderId here
            const parentFolderId = selectedFolder
                ? selectedFolder.parentId || selectedFolder.$id
                : null

            const fileMetadata = {
                title: newFileTitle,
                description: newFileDescription,
                handleBy: userId,
                userId,
                fileType: newFileType,
                controlNumber,
                status: 'approved',
                createdAt: currentDate.toISOString(),
                approvedAt: currentDate.toISOString(),
                parentFolderId: parentFolderId || '' // Ensure parentFolderId is part of metadata
            }

            const newFile = await uploadFile(
                uploadedFile,
                selectedFolder ? selectedFolder.$id : null,
                parentFolderId, // Pass parentFolderId
                fileMetadata.title,
                fileMetadata.description,
                fileMetadata.handleBy,
                fileMetadata.fileType,
                fileMetadata.userId,
                fileMetadata.controlNumber
            )

            setFolders((prevFolders) => {
                const updatedFolders = [...prevFolders]
                const parentFolder = findFolderById(
                    selectedFolder ? selectedFolder.$id : '',
                    updatedFolders
                )
                if (parentFolder) parentFolder.files.push(newFile)
                return updatedFolders
            })

            toast.success('File uploaded successfully!')
            resetFileForm()
            setShowAddFileModal(false)
        } catch (error) {
            console.error('Error adding file:', error)
            alert('Failed to upload the file. Please try again.')
        } finally {
            setIsLoading(false) // End loading
        }
    }

    // Add Folder Handler
    const handleAddFolder = async () => {
        if (!newFolderName.trim()) {
            alert('Please enter a valid folder name.')
            return
        }

        try {
            const folder = await createFolder(
                newFolderName,
                selectedFolder ? selectedFolder.$id : null
            )

            if (selectedFolder) {
                const updatedFolders = [...folders]
                const parentFolder = findFolderById(
                    selectedFolder.$id,
                    updatedFolders
                )
                if (parentFolder) {
                    parentFolder.subfolders = parentFolder.subfolders || []
                    parentFolder.subfolders.push({ ...folder, subfolders: [] })
                }
                setFolders(updatedFolders)
            } else {
                setFolders([...folders, { ...folder, subfolders: [] }])
            }

            setShowAddFolderModal(false)
            setNewFolderName('')
        } catch (error) {
            console.error('Error creating folder:', error)
            alert('Failed to create folder.')
        }
    }

    const resetFileForm = () => {
        setNewFileName('')
        setNewFileTitle('')
        setNewFileDescription('')
        setNewFileHandleBy('')
        setNewFileType('PDF')
        setUploadedFile(null)
    }

    const findFolderById = (folderId, folders) => {
        for (let folder of folders) {
            if (folder.$id === folderId) {
                return folder
            }
            if (folder.subfolders) {
                const foundInSubfolder = findFolderById(
                    folderId,
                    folder.subfolders
                )
                if (foundInSubfolder) {
                    return foundInSubfolder
                }
            }
        }
        return null
    }

    // Clear subfolders when navigating back to the root
    const handleBackToFolders = () => {
        setSelectedFolder(null)
        fetchInitialFolders() // Refresh to show only root folders
    }

    // Recursive folder and file rendering
    // Recursive folder and file rendering
    const renderFolders = (currentFolders) => {
        if (!Array.isArray(currentFolders)) return null

        return currentFolders.map((folder) => (
            <div
                key={folder.$id || folder.id}
                className="relative group cursor-pointer"
                onClick={() => selectFolder(folder)}>
                {view === 'card' ? (
                    <CardView folder={folder} />
                ) : (
                    <ListView folder={folder} />
                )}
                <Trash2
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation()
                        openDeleteConfirm(folder)
                    }}
                />
                {folder.subfolders && folder.subfolders.length > 0 && (
                    <div className="pl-4 mt-2">
                        {renderFolders(folder.subfolders)}
                    </div>
                )}
                {folder.files && folder.files.length > 0 && (
                    <div className="pl-4 mt-2">
                        {folder.files
                            .filter((file) => file.status === 'approved') // Filter to show only approved files
                            .map((file) => (
                                <FileItem
                                    key={file.$id || file.id}
                                    file={file}
                                    onView={() =>
                                        console.log(`Viewing ${file.name}`)
                                    }
                                    onEdit={() =>
                                        console.log(`Editing ${file.name}`)
                                    }
                                    onGenerateQR={() =>
                                        console.log(
                                            `Generating QR for ${file.name}`
                                        )
                                    }
                                    onDelete={() =>
                                        console.log(`Deleting ${file.name}`)
                                    }
                                />
                            ))}
                    </div>
                )}
            </div>
        ))
    }
    const openDeleteConfirm = async (folder) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to delete the folder "${folder.name}" and all its contents? This action cannot be undone.`
        )
        if (confirmDelete) {
            try {
                // Call the deleteFolderAndContents function
                await deleteFolderAndContents(folder.$id)
                toast.success(
                    `Folder "${folder.name}" and all its contents have been deleted.`
                )
                fetchInitialFolders() // Refresh folders list
            } catch (error) {
                toast.error('Failed to delete folder. Please try again.')
                console.error('Failed to delete folder:', error) // Log the error for debugging
            }
        }
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
                    <h1 className="text-3xl font-bold">Documents</h1>
                    <div className="flex items-center space-x-4">
                        <Button
                            onClick={() => setView('card')}
                            variant={view === 'card' ? 'default' : 'outline'}>
                            <Grid className="w-4 h-4 mr-2" />
                            Card
                        </Button>
                        <Button
                            onClick={() => setView('list')}
                            variant={view === 'list' ? 'default' : 'outline'}>
                            <List className="w-4 h-4 mr-2" />
                            List
                        </Button>
                        <Button
                            onClick={() => setShowAddFolderModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Folder
                        </Button>
                        {selectedFolder && (
                            <Button
                                onClick={() => setShowAddFileModal(true)}
                                className="bg-green-500 hover:bg-green-600 text-white">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Files
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search and Sort Section */}
                <div className="flex mb-6">
                    <Input
                        type="text"
                        placeholder="Search folders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mr-4"
                    />
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-full md:w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Folder and File Display */}
                {selectedFolder ? (
                    <div>
                        <Button onClick={handleBackToFolders} className="mb-4">
                            Back to Folders
                        </Button>
                        <h2 className="text-2xl font-semibold mb-4">
                            {selectedFolder.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderFolders(selectedFolder.subfolders || [])}
                            {(selectedFolder.files || []).map((file) => (
                                <FileItem
                                    key={file.id}
                                    file={file}
                                    onView={() =>
                                        console.log(`Viewing ${file.name}`)
                                    }
                                    onEdit={() =>
                                        console.log(`Editing ${file.name}`)
                                    }
                                    onGenerateQR={() =>
                                        console.log(
                                            `Generating QR for ${file.name}`
                                        )
                                    }
                                    onDelete={() =>
                                        console.log(`Deleting ${file.name}`)
                                    }
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div
                        className={`grid ${
                            view === 'card'
                                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                                : 'grid-cols-1'
                        } gap-6`}>
                        {renderFolders(folders)}
                    </div>
                )}

                {/* Add Folder Modal */}
                {showAddFolderModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded shadow-md">
                            <h2 className="text-xl mb-4">Add New Folder</h2>
                            <Input
                                type="text"
                                placeholder="Folder Name"
                                value={newFolderName}
                                onChange={(e) =>
                                    setNewFolderName(e.target.value)
                                }
                                className="mb-4"
                            />
                            <Button
                                onClick={handleAddFolder}
                                className="bg-blue-500 text-white">
                                Add
                            </Button>
                            <Button
                                onClick={() => setShowAddFolderModal(false)}
                                className="ml-4">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* Add File Modal */}
                {showAddFileModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-xl relative max-w-md w-full mx-auto overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto max-h-[90vh] sm:max-h-[80vh]">
                                <div className="flex justify-between items-center bg-purple-600 -mx-6 -mt-6 px-6 py-4 mb-4">
                                    <h2 className="text-2xl font-bold text-white">
                                        Upload Document
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setShowAddFileModal(false)
                                        }
                                        className="text-white hover:bg-purple-700 rounded-full">
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>
                                <Label
                                    htmlFor="title"
                                    className="text-purple-600">
                                    Title
                                </Label>
                                <Input
                                    id="title"
                                    placeholder="Enter document title"
                                    value={newFileTitle}
                                    onChange={(e) =>
                                        setNewFileTitle(e.target.value)
                                    }
                                />
                                <Label
                                    htmlFor="description"
                                    className="text-blue-600">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Enter document description"
                                    value={newFileDescription}
                                    onChange={(e) =>
                                        setNewFileDescription(e.target.value)
                                    }
                                />
                                <Label
                                    htmlFor="fileType"
                                    className="text-red-600">
                                    File Type
                                </Label>
                                <select
                                    id="fileType"
                                    value={newFileType}
                                    onChange={(e) =>
                                        setNewFileType(e.target.value)
                                    }
                                    className="w-full p-2 border rounded-md">
                                    <option value="" disabled>
                                        Select File Type
                                    </option>
                                    <option value="PDF">PDF</option>
                                    <option value="DOC">DOC</option>
                                </select>
                                <Label htmlFor="file" className="text-pink-600">
                                    Attach File
                                </Label>
                                <div
                                    className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                                        dragActive
                                            ? 'border-pink-500'
                                            : 'border-pink-300'
                                    }`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}>
                                    <div className="space-y-1 text-center">
                                        <FileUp className="mx-auto h-12 w-12 text-pink-500" />
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none">
                                                <span>Attach a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    onChange={handleFileUpload}
                                                />
                                            </label>
                                            <p className="pl-1">
                                                or drag and drop
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            PDF, DOC, DOCX, ISO up to 10MB
                                        </p>
                                        {uploadedFile && (
                                            <p className="text-xs text-green-500 mt-2">
                                                Attached: {uploadedFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowAddFileModal(false)
                                        }>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddFile}
                                        disabled={isLoading}>
                                        {isLoading ? (
                                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                                        ) : (
                                            <Upload className="w-4 h-4 mr-2" />
                                        )}
                                        {isLoading ? 'Uploading...' : 'Upload'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer />
        </div>
    )
}
