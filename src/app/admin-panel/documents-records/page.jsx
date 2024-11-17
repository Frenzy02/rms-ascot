'use client'
import React, { useState, useEffect } from 'react'
import {
    Plus,
    Grid,
    List,
    Trash2,
    Upload,
    X,
    FileUp,
    ChevronLeft
} from 'lucide-react'
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
import { Label } from '@/components/ui/label'
import CardView from './components/CardView'
import ListView from './components/ListView'
import FileItem from './components/FileItem'
import {
    createFolder,
    fetchFoldersAndFiles,
    getAllUsers,
    uploadFile,
    deleteFolderAndContents
} from '@/services/api/appwrite'
import { toast, ToastContainer } from 'react-toastify'
import ReactSelect from 'react-select'

function Breadcrumb({ path, onBack }) {
    return (
        <div className="flex items-center text-sm text-gray-600 mb-4">
            <ChevronLeft className="cursor-pointer mr-2" onClick={onBack} />
            {path.map((folder, index) => (
                <React.Fragment key={folder.$id || folder.id}>
                    <span className="text-gray-500">{folder.name}</span>
                    {index < path.length - 1 && <span className="mx-2">/</span>}
                </React.Fragment>
            ))}
        </div>
    )
}

function RestrictAccessUI({ allUsers, restrictedUsers, setRestrictedUsers }) {
    const [options, setOptions] = useState([])

    useEffect(() => {
        const filteredUsers = allUsers.filter(
            (user) => user.role === 'staff' || user.role === 'viewer'
        )
        const userOptions = filteredUsers.map((user) => ({
            value: user.id,
            label: user.name
        }))
        setOptions([
            { value: 'all', label: 'Select All Users' },
            ...userOptions
        ])
    }, [allUsers])

    const handleSelectionChange = (selectedOptions) => {
        if (selectedOptions.some((option) => option.value === 'all')) {
            setRestrictedUsers(allUsers.map((user) => user.id))
        } else {
            setRestrictedUsers(selectedOptions.map((option) => option.value))
        }
    }

    const selectedOptions = options.filter((option) =>
        restrictedUsers.includes(option.value)
    )

    return (
        <div>
            <Label htmlFor="restrictedUsers" className="text-orange-600">
                Restrict Access
            </Label>
            <ReactSelect
                id="restrictedUsers"
                options={options}
                value={selectedOptions}
                onChange={handleSelectionChange}
                isMulti
                placeholder="Select users to restrict"
            />
            {selectedOptions.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                    <strong>Selected Users:</strong>{' '}
                    {selectedOptions.map((option) => option.label).join(', ')}
                </div>
            )}
        </div>
    )
}

const DocumentsRecords = () => {
    const [view, setView] = useState('card')
    const [searchTerm, setSearchTerm] = useState('')
    const [sortBy, setSortBy] = useState('name')
    const [folders, setFolders] = useState([])
    const [selectedFolder, setSelectedFolder] = useState(null)
    const [showAddFolderModal, setShowAddFolderModal] = useState(false)
    const [showAddFileModal, setShowAddFileModal] = useState(false)
    const [newFolderName, setNewFolderName] = useState('')
    const [newFileTitle, setNewFileTitle] = useState('')
    const [newFileDescription, setNewFileDescription] = useState('')
    const [newFileType, setNewFileType] = useState('PDF')
    const [uploadedFile, setUploadedFile] = useState(null)
    const [dragActive, setDragActive] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [allUsers, setAllUsers] = useState([])
    const [restrictedUsers, setRestrictedUsers] = useState([])
    const [controlNumber, setControlNumber] = useState('')
    const [breadcrumbPath, setBreadcrumbPath] = useState([])

    useEffect(() => {
        const loadUsers = async () => {
            try {
                const users = await getAllUsers()
                setAllUsers(users)
            } catch (error) {
                console.error('Error loading users:', error)
            }
        }

        const fetchInitialFolders = async () => {
            try {
                const { folders, files } = await fetchFoldersAndFiles(null)
                setFolders(buildNestedFolderStructure(folders, files))
                setBreadcrumbPath([])
                setSelectedFolder(null)
            } catch (error) {
                console.error('Error fetching folders:', error)
            }
        }

        loadUsers()
        fetchInitialFolders()
    }, [])

    const buildNestedFolderStructure = (folders, files) => {
        const folderMap = {}
        const rootFolders = []

        folders.forEach((folder) => {
            folderMap[folder.$id] = { ...folder, subfolders: [], files: [] }
        })

        files.forEach((file) => {
            if (folderMap[file.folderId]) {
                folderMap[file.folderId].files.push(file)
            }
        })

        folders.forEach((folder) => {
            if (folder.parentId) {
                folderMap[folder.parentId]?.subfolders.push(
                    folderMap[folder.$id]
                )
            } else {
                rootFolders.push(folderMap[folder.$id])
            }
        })

        return rootFolders
    }

    const selectFolder = async (folder) => {
        setSelectedFolder(folder)
        setBreadcrumbPath((prev) => [...prev, folder])

        try {
            const { folders: subfolders, files } = await fetchFoldersAndFiles(
                folder.$id
            )
            setFolders((prev) => {
                const updatedFolders = [...prev]
                const parentFolder = findFolderById(folder.$id, updatedFolders)
                if (parentFolder) {
                    parentFolder.subfolders = subfolders
                    parentFolder.files = files
                }
                return updatedFolders
            })
        } catch (error) {
            console.error('Error fetching subfolders and files:', error)
        }
    }

    // Helper function to find a folder by its ID
    const findFolderById = (folderId, folders) => {
        for (let folder of folders) {
            if (folder.$id === folderId) return folder
            if (folder.subfolders) {
                const foundInSubfolder = findFolderById(
                    folderId,
                    folder.subfolders
                )
                if (foundInSubfolder) return foundInSubfolder
            }
        }
        return null
    }

    const handleBack = () => {
        if (breadcrumbPath.length > 1) {
            const newPath = breadcrumbPath.slice(0, -1)
            setBreadcrumbPath(newPath)
            selectFolder(newPath[newPath.length - 1])
        } else {
            setBreadcrumbPath([])
            setSelectedFolder(null)
        }
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
        if (!uploadedFile || !controlNumber.trim()) {
            toast.error('Please select a file and provide a control number.')
            return
        }

        setIsLoading(true)
        try {
            const userId = sessionStorage.getItem('userId')
            const parentFolderId = selectedFolder ? selectedFolder.$id : null
            const breadcrumbString = breadcrumbPath
                .map((folder) => folder.name)
                .join('/')

            const fileMetadata = {
                title: newFileTitle,
                description: newFileDescription,
                handleBy: userId,
                fileType: newFileType,
                controlNumber,
                status: 'approved',
                createdAt: new Date().toISOString(),
                parentFolderId,
                path: breadcrumbString
            }

            const permissions = restrictedUsers.map((id) => `user:${id}`)
            await uploadFile(
                uploadedFile,
                selectedFolder?.$id,
                parentFolderId,
                fileMetadata,
                permissions
            )

            toast.success('File uploaded successfully!')
            fetchInitialFolders()
            resetFileForm()
            setShowAddFileModal(false)
        } catch (error) {
            console.error('Error adding file:', error)
            toast.error('Failed to upload the file. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const resetFileForm = () => {
        setNewFileTitle('')
        setNewFileDescription('')
        setNewFileType('PDF')
        setUploadedFile(null)
        setControlNumber('')
        setRestrictedUsers([])
    }
    const openDeleteConfirm = async (folder) => {
        if (
            window.confirm(
                `Are you sure you want to delete "${folder.name}" and all its contents?`
            )
        ) {
            try {
                await deleteFolderAndContents(folder.$id)
                toast.success(`Folder "${folder.name}" deleted.`)
                fetchInitialFolders()
            } catch (error) {
                console.error('Failed to delete folder:', error)
                toast.error('Failed to delete folder.')
            }
        }
    }

    const renderFolders = (folders) => {
        return folders.map((folder) => (
            <div
                key={folder.$id}
                className="relative group"
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
                {renderFolders(folder.subfolders)}
                {folder.files.map((file) => (
                    <FileItem key={file.$id} file={file} />
                ))}
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

                {selectedFolder && (
                    <Breadcrumb path={breadcrumbPath} onBack={handleBack} />
                )}

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

                {showAddFileModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto">
                            <div className="p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                                {/* Modal Header */}
                                <div className="flex justify-between items-center bg-orange-600 px-6 py-4 mb-4">
                                    <h2 className="text-2xl font-bold text-white">
                                        Upload Document
                                    </h2>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            setShowAddFileModal(false)
                                        }
                                        className="text-white hover:bg-orange-700 rounded-full">
                                        <X className="h-6 w-6" />
                                    </Button>
                                </div>

                                {/* Form Fields */}
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Document Title */}
                                    <div>
                                        <Label
                                            htmlFor="title"
                                            className="text-orange-600">
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
                                    </div>

                                    {/* Document Description */}
                                    <div>
                                        <Label
                                            htmlFor="description"
                                            className="text-orange-600">
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Enter document description"
                                            value={newFileDescription}
                                            onChange={(e) =>
                                                setNewFileDescription(
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>

                                    {/* File Type Selection */}
                                    <div>
                                        <Label
                                            htmlFor="fileType"
                                            className="text-orange-600">
                                            File Type
                                        </Label>
                                        <select
                                            id="fileType"
                                            value={newFileType}
                                            onChange={(e) =>
                                                setNewFileType(e.target.value)
                                            }
                                            className="w-full p-2 border rounded-md border-orange-300 focus:ring-orange-500">
                                            <option value="PDF">PDF</option>
                                            <option value="DOCX">DOCX</option>
                                        </select>
                                    </div>

                                    {/* Control Number Input */}
                                    <div>
                                        <Label
                                            htmlFor="controlNumber"
                                            className="text-orange-600">
                                            Control Number
                                        </Label>
                                        <Input
                                            id="controlNumber"
                                            placeholder="Enter control number"
                                            value={controlNumber}
                                            onChange={(e) =>
                                                setControlNumber(e.target.value)
                                            }
                                        />
                                    </div>

                                    {/* Restrict Access Dropdown */}
                                    <div className="col-span-2">
                                        <RestrictAccessUI
                                            allUsers={allUsers}
                                            restrictedUsers={restrictedUsers}
                                            setRestrictedUsers={
                                                setRestrictedUsers
                                            }
                                        />
                                    </div>

                                    {/* File Upload */}
                                    <div className="col-span-2">
                                        <Label
                                            htmlFor="file"
                                            className="text-orange-600">
                                            Attach File
                                        </Label>
                                        <div
                                            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                                                dragActive
                                                    ? 'border-orange-500'
                                                    : 'border-orange-300'
                                            }`}
                                            onDragOver={handleDragOver}
                                            onDragLeave={handleDragLeave}
                                            onDrop={handleDrop}>
                                            <div className="space-y-1 text-center">
                                                <FileUp className="mx-auto h-12 w-12 text-orange-500" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                                                        <span>
                                                            Attach a file
                                                        </span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            accept=".pdf, .docx" // Accept .pdf and .docx files
                                                            onChange={
                                                                handleFileUpload
                                                            }
                                                        />
                                                    </label>
                                                    <p className="pl-1">
                                                        or drag and drop
                                                    </p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PDF, and DOCX up to 20MB
                                                </p>
                                                {uploadedFile && (
                                                    <p className="text-xs text-green-500 mt-2">
                                                        Attached:{' '}
                                                        {uploadedFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowAddFileModal(false)
                                        }
                                        className="text-orange-600 border-orange-600">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAddFile}
                                        disabled={isLoading}
                                        className="bg-orange-500 hover:bg-orange-600 text-white">
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
export default DocumentsRecords
