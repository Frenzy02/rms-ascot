// src/components/DocumentsTab.js
import React, { useState } from 'react'
import { Search, Plus, Grid, List, Filter, Trash2, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'

// Import separated components
import CardView from './components/CardView'
import ListView from './components/ListView'
import FileItem from './components/FileItem'

// Mock data for folders and files with nested structure
const initialFolders = [
    {
        id: 1,
        name: 'Reports',
        color: 'bg-blue-500',
        icon: '📊',
        subfolders: [],
        files: []
    },
    {
        id: 2,
        name: 'Financials',
        color: 'bg-green-500',
        icon: '💰',
        subfolders: [],
        files: []
    },
    {
        id: 3,
        name: 'Projects',
        color: 'bg-purple-500',
        icon: '🏗️',
        subfolders: [],
        files: []
    },
    {
        id: 4,
        name: 'HR Documents',
        color: 'bg-yellow-500',
        icon: '👥',
        subfolders: [],
        files: []
    },
    {
        id: 5,
        name: 'Marketing',
        color: 'bg-red-500',
        icon: '📣',
        subfolders: [],
        files: []
    },
    {
        id: 6,
        name: 'Legal',
        color: 'bg-indigo-500',
        icon: '⚖️',
        subfolders: [],
        files: []
    }
]

export default function DocumentsTab() {
    const [view, setView] = useState('card')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [folders, setFolders] = useState(initialFolders)
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [showAddFolderModal, setShowAddFolderModal] = useState(false)
    const [showAddFileModal, setShowAddFileModal] = useState(false)
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
    const [folderToDelete, setFolderToDelete] = useState(null)
    const [newFolderName, setNewFolderName] = useState('')
    const [newFileName, setNewFileName] = useState('')
    const [newFileType, setNewFileType] = useState('PDF')
    const [newFileTitle, setNewFileTitle] = useState('') // Define newFileTitle state
    const [newFileDescription, setNewFileDescription] = useState('') // Define newFileDescription state
    const [newFileHandleBy, setNewFileHandleBy] = useState('') // Define newFileHandleBy state
    const [uploadedFile, setUploadedFile] = useState(null) // Define uploadedFile state

    // Search and Filter
    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Find the folder in the folder structure recursively
    const findFolderById = (folderId, currentFolders) => {
        for (let folder of currentFolders) {
            if (folder.id === folderId) {
                return folder
            }
            const foundInSubfolder = findFolderById(folderId, folder.subfolders)
            if (foundInSubfolder) {
                return foundInSubfolder
            }
        }
        return null
    }

    // Add Folder Handler
    const handleAddFolder = () => {
        const newFolder = {
            id: Date.now(),
            name: newFolderName,
            color: 'bg-gray-500',
            icon: '📁',
            subfolders: [],
            files: []
        }
        if (selectedFolder) {
            const updatedFolders = [...folders]
            const parentFolder = findFolderById(
                selectedFolder.id,
                updatedFolders
            )
            parentFolder.subfolders.push(newFolder)
            setFolders(updatedFolders)
        } else {
            setFolders([...folders, newFolder])
        }
        setShowAddFolderModal(false)
        setNewFolderName('')
    }

    // Add File Handler
    const handleAddFile = () => {
        const newFile = {
            id: Date.now(),
            name: newFileName,
            title: newFileTitle,
            description: newFileDescription,
            handleBy: newFileHandleBy,
            type: newFileType,
            size: '1 MB',
            date: new Date().toISOString().split('T')[0]
        }
        if (selectedFolder) {
            const updatedFolders = [...folders]
            const parentFolder = findFolderById(
                selectedFolder.id,
                updatedFolders
            )
            parentFolder.files.push(newFile)
            setFolders(updatedFolders)
        }
        setShowAddFileModal(false)
        resetFileForm()
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

    // Delete Folder Handler
    const handleDeleteFolder = (folderId, currentFolders) => {
        return currentFolders.filter((folder) => {
            if (folder.id === folderId) {
                return false // Remove the folder
            }
            folder.subfolders = handleDeleteFolder(folderId, folder.subfolders)
            return true
        })
    }

    // Open Delete Confirmation Modal
    const openDeleteConfirm = (folder) => {
        setFolderToDelete(folder)
        setShowDeleteConfirmModal(true)
    }

    // Confirm Delete Folder
    const confirmDeleteFolder = () => {
        if (folderToDelete) {
            setFolders(handleDeleteFolder(folderToDelete.id, folders))
            setFolderToDelete(null)
            setShowDeleteConfirmModal(false)
            setSelectedFolder(null)
        }
    }

    // Cancel Delete Folder
    const cancelDeleteFolder = () => {
        setFolderToDelete(null)
        setShowDeleteConfirmModal(false)
    }

    // Select folder to view its contents
    const selectFolder = (folder) => {
        setSelectedFolder(folder)
    }

    // Recursive folder rendering
    const renderFolders = (currentFolders) => {
        return currentFolders.map((folder) => (
            <div
                key={folder.id}
                className="relative group cursor-pointer"
                onClick={() => selectFolder(folder)}>
                {view === 'card' ? (
                    <CardView folder={folder} />
                ) : (
                    <ListView folder={folder} />
                )}
                {/* Delete icon on hover */}
                <Trash2
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 cursor-pointer"
                    onClick={(e) => {
                        e.stopPropagation() // Prevent selecting the folder
                        openDeleteConfirm(folder)
                    }}
                />
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

                {/* Folder and File Display */}
                {selectedFolder ? (
                    <div>
                        <Button
                            onClick={() => setSelectedFolder(null)}
                            className="mb-4">
                            Back to Folders
                        </Button>
                        <h2 className="text-2xl font-semibold mb-4">
                            {selectedFolder.name}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {renderFolders(selectedFolder.subfolders)}
                            {selectedFolder.files.map((file) => (
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
                        {renderFolders(filteredFolders)}
                    </div>
                )}
            </div>

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
    )
}
