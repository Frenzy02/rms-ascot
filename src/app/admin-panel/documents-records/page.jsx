'use client'
import React, { useState, useEffect } from 'react'
import { Plus, Grid, List, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

import CardView from './components/CardView'
import ListView from './components/ListView'
import FileItem from './components/FileItem'
import {
    createFolder,
    fetchFoldersAndFiles,
    uploadFile
} from '@/services/api/appwrite'
import { toast } from 'react-toastify'

async function encryptFile(file) {
    const key = await window.crypto.subtle.generateKey(
        {
            name: 'AES-GCM',
            length: 256
        },
        true,
        ['encrypt', 'decrypt']
    )

    // Convert file to ArrayBuffer
    const fileBuffer = await file.arrayBuffer()
    const iv = window.crypto.getRandomValues(new Uint8Array(12)) // Generate a random IV

    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: 'AES-GCM',
            iv: iv
        },
        key,
        fileBuffer
    )

    return { encryptedData, key, iv } // Return the encrypted file data, key, and IV
}

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

    // Add File Handler
    const handleAddFile = async () => {
        if (!uploadedFile) {
            alert('Please select a file to upload.')
            return
        }

        try {
            const newFile = await uploadFile(
                uploadedFile,
                selectedFolder ? selectedFolder.$id : null,
                newFileTitle,
                newFileDescription,
                newFileHandleBy,
                newFileType
            )

            toast.success('File uploaded successfully!')

            // Update the state with the new file without refetching
            setFolders((prevFolders) => {
                const updatedFolders = [...prevFolders]
                const parentFolder = findFolderById(
                    selectedFolder ? selectedFolder.$id : '',
                    updatedFolders
                )

                if (parentFolder) {
                    parentFolder.files.push(newFile) // Add the new file directly
                }

                return updatedFolders
            })

            resetFileForm() // Reset the form
            setShowAddFileModal(false) // Close the modal
        } catch (error) {
            console.error('Error adding file:', error)
            alert('Failed to upload the file.')
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

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (file) {
            const encryptedFileData = await encryptFile(file) // Ensure encryptFile works properly
            // Now you can create a new file instance if needed
            const encryptedBlob = new Blob([encryptedFileData.encryptedData], {
                type: file.type
            })
            const newFile = new File([encryptedBlob], file.name, {
                type: file.type,
                lastModified: file.lastModified
            })

            setUploadedFile(newFile)
        }
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
                key={folder.$id || folder.id} // Ensure unique key for each folder
                className="relative group cursor-pointer"
                onClick={() => selectFolder(folder)} // Handle folder selection
            >
                {/* Display Folder as Card or List View */}
                {view === 'card' ? (
                    <CardView folder={folder} />
                ) : (
                    <ListView folder={folder} />
                )}

                {/* Folder Trash Icon (for deletion) */}
                <Trash2
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation() // Prevent click from selecting folder
                        openDeleteConfirm(folder) // Open delete confirmation
                    }}
                />

                {/* Render Subfolders Recursively */}
                {folder.subfolders && folder.subfolders.length > 0 && (
                    <div className="pl-4 mt-2">
                        {renderFolders(folder.subfolders)}
                    </div>
                )}

                {/* Render Files in the Folder */}
                {folder.files && folder.files.length > 0 && (
                    <div className="pl-4 mt-2">
                        {folder.files.map((file) => (
                            <FileItem
                                key={file.$id || file.id} // Ensure unique key for each file
                                file={file} // Pass the entire file object
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
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                            <h2 className="text-xl mb-4">Add New File</h2>
                            <Input
                                type="text"
                                placeholder="File Title"
                                value={newFileTitle}
                                onChange={(e) =>
                                    setNewFileTitle(e.target.value)
                                }
                                className="mb-4"
                            />
                            <Input
                                type="text"
                                placeholder="File Name"
                                value={newFileName}
                                onChange={(e) => setNewFileName(e.target.value)}
                                className="mb-4"
                            />
                            <Input
                                type="text"
                                placeholder="Description"
                                value={newFileDescription}
                                onChange={(e) =>
                                    setNewFileDescription(e.target.value)
                                }
                                className="mb-4"
                            />
                            <Input
                                type="text"
                                placeholder="Handle By"
                                value={newFileHandleBy}
                                onChange={(e) =>
                                    setNewFileHandleBy(e.target.value)
                                }
                                className="mb-4"
                            />
                            <Select
                                value={newFileType}
                                onValueChange={setNewFileType}>
                                <SelectTrigger className="w-full mb-4">
                                    <SelectValue placeholder="File Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PDF">PDF</SelectItem>
                                    <SelectItem value="Word">Word</SelectItem>
                                    <SelectItem value="Excel">Excel</SelectItem>
                                    <SelectItem value="PowerPoint">
                                        PowerPoint
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <div className="mb-4">
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                />
                                {uploadedFile && (
                                    <p className="text-sm mt-2">
                                        Selected file: {uploadedFile.name}
                                    </p>
                                )}
                            </div>
                            <Button
                                onClick={handleAddFile}
                                className="bg-green-500 text-white mt-4">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload File
                            </Button>
                            <Button
                                onClick={() => setShowAddFileModal(false)}
                                className="ml-4 mt-4">
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
