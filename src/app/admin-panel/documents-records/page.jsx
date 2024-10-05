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

export default function DocumentsTab() {
    const [view, setView] = useState('card')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [folders, setFolders] = useState([])
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [showAddFolderModal, setShowAddFolderModal] = useState(false)
    const [showAddFileModal, setShowAddFileModal] = useState(false)
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
    const [folderToDelete, setFolderToDelete] = useState(null)
    const [newFolderName, setNewFolderName] = useState('')
    const [newFileName, setNewFileName] = useState('')
    const [newFileType, setNewFileType] = useState('PDF')
    const [newFileTitle, setNewFileTitle] = useState('')
    const [newFileDescription, setNewFileDescription] = useState('')
    const [newFileHandleBy, setNewFileHandleBy] = useState('')
    const [uploadedFile, setUploadedFile] = useState(null)

    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    useEffect(() => {
        fetchInitialFolders()
    }, [])

    // Fetch folders and files from Appwrite
    const fetchInitialFolders = async () => {
        try {
            const { folders } = await fetchFoldersAndFiles(null)
            const nestedFolders = buildNestedFolderStructure(folders)
            setFolders(nestedFolders || [])
        } catch (error) {
            console.error('Error fetching folders:', error)
        }
    }

    // Fetch subfolders when selecting a folder
    const selectFolder = async (folder) => {
        setSelectedFolder(folder)
        try {
            const { folders: subfolders } = await fetchFoldersAndFiles(
                folder.$id
            )
            const updatedFolders = [...folders]
            const parentFolder = findFolderById(folder.$id, updatedFolders)
            if (parentFolder) {
                parentFolder.subfolders = subfolders
            }
            setFolders(updatedFolders)
        } catch (error) {
            console.error('Error fetching subfolders:', error)
        }
    }

    // Helper function to build nested folder structure
    const buildNestedFolderStructure = (folders) => {
        const folderMap = {}
        const rootFolders = []

        // Initialize folder map
        folders.forEach((folder) => {
            folderMap[folder.$id] = { ...folder, subfolders: [], files: [] }
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
        }
    }

    // Add File Handler
    const handleAddFile = async () => {
        if (!uploadedFile || !selectedFolder) {
            alert('Please select a file and folder.')
            return
        }

        const metadata = {
            name: newFileName,
            title: newFileTitle,
            description: newFileDescription,
            handleBy: newFileHandleBy,
            type: newFileType
        }

        try {
            const response = await uploadFile(
                uploadedFile,
                metadata,
                selectedFolder.$id
            )
            if (response.success) {
                const updatedFolders = [...folders]
                const parentFolder = findFolderById(
                    selectedFolder.$id,
                    updatedFolders
                )
                if (parentFolder) {
                    parentFolder.files = parentFolder.files || []
                    parentFolder.files.push({
                        id: Date.now(),
                        name: newFileName,
                        title: newFileTitle,
                        description: newFileDescription,
                        handleBy: newFileHandleBy,
                        type: newFileType,
                        fileUrl: response.fileUrl,
                        size: uploadedFile.size,
                        date: new Date().toISOString().split('T')[0]
                    })
                }
                setFolders(updatedFolders)
                resetFileForm()
                setShowAddFileModal(false)
            } else {
                alert('Failed to upload file.')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
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

    const handleFileUpload = (event) => {
        setUploadedFile(event.target.files[0])
    }

    // Find the folder in the folder structure recursively
    const findFolderById = (folderId, currentFolders) => {
        if (!Array.isArray(currentFolders)) return null

        for (let folder of currentFolders) {
            if (folder.$id === folderId) {
                return folder
            }
            const foundInSubfolder = findFolderById(folderId, folder.subfolders)
            if (foundInSubfolder) {
                return foundInSubfolder
            }
        }
        return null
    }

    // Clear subfolders when navigating back to the root
    const handleBackToFolders = () => {
        setSelectedFolder(null)
        fetchInitialFolders() // Refresh to show only root folders
    }

    // Delete Folder Handler
    const handleDeleteFolder = (folderId, currentFolders) => {
        if (!Array.isArray(currentFolders)) return []

        return currentFolders.filter((folder) => {
            if (folder.$id === folderId) {
                return false
            }
            folder.subfolders = handleDeleteFolder(folderId, folder.subfolders)
            return true
        })
    }

    const openDeleteConfirm = (folder) => {
        setFolderToDelete(folder)
        setShowDeleteConfirmModal(true)
    }

    const confirmDeleteFolder = () => {
        if (folderToDelete) {
            setFolders(handleDeleteFolder(folderToDelete.$id, folders))
            setFolderToDelete(null)
            setShowDeleteConfirmModal(false)
            setSelectedFolder(null)
        }
    }

    const cancelDeleteFolder = () => {
        setFolderToDelete(null)
        setShowDeleteConfirmModal(false)
    }

    // Recursive folder rendering
    const renderFolders = (currentFolders) => {
        if (!Array.isArray(currentFolders)) return null

        return currentFolders.map((folder) => (
            <div
                key={folder.$id}
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
                {/* Render subfolders recursively */}
                {folder.subfolders && (
                    <div className="pl-4 mt-2">
                        {renderFolders(folder.subfolders)}
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

                {/* Delete Confirmation Modal */}
                {showDeleteConfirmModal && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded shadow-md">
                            <h2 className="text-xl mb-4">Confirm Delete</h2>
                            <p>
                                Are you sure you want to delete the folder "
                                {folderToDelete?.name}"?
                            </p>
                            <Button
                                onClick={confirmDeleteFolder}
                                className="bg-red-500 text-white mt-4">
                                Delete
                            </Button>
                            <Button
                                onClick={cancelDeleteFolder}
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
