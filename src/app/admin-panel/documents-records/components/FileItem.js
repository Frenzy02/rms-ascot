import React, { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'
import {
    File as FileIcon,
    Eye,
    Edit,
    Trash,
    Download,
    QrCode,
    Calendar,
    MoreHorizontal
} from 'lucide-react'
import { toast } from 'react-toastify'
import ReactSelect from 'react-select'
import {
    editFileMetadata,
    deleteFile,
    getAllUsers,
    fetchFileMetadata
} from '@/services/api/appwrite'

import { getFileView } from '@/services/api/appwrite'

// Main FileItem Component
export default function FileItem({ file, onDelete }) {
    if (file.status !== 'approved') {
        return null
    }

    const [showPreviewModal, setShowPreviewModal] = useState(false)
    const [pdfUrl, setPdfUrl] = useState(null)
    const [showActions, setShowActions] = useState(false)
    const actionMenuRef = useRef(null)
    const buttonRef = useRef(null)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [allUsers, setAllUsers] = useState([])
    const [editData, setEditData] = useState({
        title: file.title || 'Untitled File',
        description: file.description || '',
        controlNumber: file.controlNumber || '',
        restrictedUsers: [] // Initialize restricted users as an empty array
    })
    const [isLoading, setIsLoading] = useState(false) // Loading state for the PDF

    const {
        title = 'Untitled File',
        fileType = 'Unknown Type',
        size = 'Unknown Size',
        createdAt
    } = file || {}

    const pdfViewerOptions = {
        disablePrint: true, // Disable the print button
        disableDownload: true // Disable the download button
    }
    // Function to fetch and preview the PDF
    const handlePreviewClick = async () => {
        try {
            setIsLoading(true) // Show loading state

            if (!file.fileId) {
                throw new Error('File ID is missing or invalid.')
            }

            // Fetch the file view URL
            const url = await getFileView(file.fileId)
            if (url) {
                setPdfUrl(url) // Set the URL for the iframe
                setShowPreviewModal(true) // Show the modal
            } else {
                throw new Error('File view URL is undefined or null')
            }
        } catch (error) {
            console.error('Failed to fetch file view URL:', error)
            toast.error('Failed to load file preview. Please try again.')
        } finally {
            setIsLoading(false) // Hide loading state
        }
    }
    // Close the preview modal
    const closePreviewModal = () => {
        setShowPreviewModal(false)
        setPdfUrl(null) // Clear the URL when the modal is closed
    }

    useEffect(() => {
        if (showEditModal) {
            const fetchData = async () => {
                try {
                    // Fetch all users
                    const users = await getAllUsers()
                    setAllUsers(users)

                    // Fetch file metadata
                    const fileMetadata = await fetchFileMetadata(file.$id)
                    console.log('Fetched File Metadata:', fileMetadata)

                    if (fileMetadata && fileMetadata.restrictedUsers) {
                        // Split the restricted users string into an array
                        const usersArray =
                            fileMetadata.restrictedUsers.split(',')
                        console.log('Users Array from Metadata:', usersArray)

                        // Remove "user:" prefix from each ID
                        const sanitizedUserIds = usersArray.map((id) =>
                            id.replace('user:', '')
                        )

                        // Filter the user options to match the IDs from sanitizedUserIds
                        const selectedUsers = users
                            .filter((user) =>
                                sanitizedUserIds.includes(user.id)
                            )
                            .map((user) => user.id)

                        console.log('Selected Users:', selectedUsers)

                        // Update the editData state with the filtered array
                        setEditData((prevData) => ({
                            ...prevData,
                            restrictedUsers: selectedUsers
                        }))
                    }
                } catch (error) {
                    console.error(
                        'Failed to fetch users or file metadata:',
                        error
                    )
                    toast.error('Failed to load data. Please try again.')
                }
            }
            fetchData()
        }
    }, [showEditModal, file.$id])

    // Pag-handle ng Selection sa ReactSelect kasama ang Select All
    const RestrictAccessUI = ({
        allUsers,
        restrictedUsers,
        setRestrictedUsers
    }) => {
        const userOptions = allUsers.map((user) => ({
            value: user.id,
            label: user.name
        }))

        // Map the restrictedUsers to selected options
        const selectedOptions = userOptions.filter((option) =>
            restrictedUsers.includes(option.value)
        )

        console.log('User Options:', userOptions)
        console.log('Selected Options:', selectedOptions)

        const handleSelectionChange = (selectedOptions) => {
            setRestrictedUsers(selectedOptions.map((option) => option.value))
        }

        // Function to handle "Select All" click
        const handleSelectAll = () => {
            const allUserIds = userOptions.map((option) => option.value)
            setRestrictedUsers(allUserIds)
        }

        // Function to handle "Deselect All" click
        const handleDeselectAll = () => {
            setRestrictedUsers([])
        }

        return (
            <div>
                <label className="block text-gray-600 mb-2">
                    Restricted Users
                </label>
                <div className="flex items-center mb-2">
                    <button
                        className="text-blue-500 hover:underline mr-4"
                        onClick={handleSelectAll}>
                        Select All
                    </button>
                    <button
                        className="text-red-500 hover:underline"
                        onClick={handleDeselectAll}>
                        Deselect All
                    </button>
                </div>
                <ReactSelect
                    options={userOptions}
                    value={selectedOptions}
                    onChange={handleSelectionChange}
                    isMulti
                    placeholder="Select users to restrict"
                    className="border rounded-md"
                />
                {selectedOptions.length > 0 && (
                    <div className="mt-2 text-sm text-gray-500">
                        <strong>Selected Users:</strong>{' '}
                        {selectedOptions
                            .map((option) => option.label)
                            .join(', ')}
                    </div>
                )}
            </div>
        )
    }

    useEffect(() => {
        if (showActions && buttonRef.current) {
            const buttonRect = buttonRef.current.getBoundingClientRect()
            setMenuPosition({
                top: buttonRect.bottom + window.scrollY,
                left: buttonRect.left + window.scrollX
            })
        }
    }, [showActions])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                actionMenuRef.current &&
                !actionMenuRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowActions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () =>
            document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleEditClick = () => {
        setShowEditModal(true)
        setShowActions(false)
    }

    const handleDeleteClick = () => {
        setShowDeleteModal(true)
        setShowActions(false)
    }

    const handleSaveEdit = async () => {
        try {
            // Prepare the updated fields
            const updatedData = {
                title: editData.title,
                description: editData.description,
                controlNumber: editData.controlNumber,
                // Map restrictedUsers to include the "user:" prefix
                restrictedUsers: editData.restrictedUsers
                    .map((id) => `user:${id}`)
                    .join(',')
            }

            // Call the function to update file metadata
            await editFileMetadata(file.$id, updatedData)

            // Update the file metadata in the parent component or re-fetch the data
            file.title = editData.title
            file.description = editData.description
            file.controlNumber = editData.controlNumber

            // Close the modal and show a success message
            setShowEditModal(false)
            toast.success('Updated successfully!')

            // Optionally, you can force a re-render by updating a parent state
            // if your parent component manages a list of files.
        } catch (error) {
            console.error('Failed to update file metadata:', error.message)
            toast.error('Failed to update file metadata. Please try again.')
        }
    }

    const handleConfirmDelete = async () => {
        try {
            await deleteFile(file.fileId, file.$id)
            setShowDeleteModal(false)
            onDelete(file.$id)
            toast.success('File deleted successfully!')
        } catch (error) {
            console.error('Failed to delete file:', error.message)
            toast.error('Failed to delete file. Please try again.')
        }
    }

    return (
        <div className="p-4 rounded-lg shadow-md bg-gray-100 hover:bg-gray-200 transition-transform transform hover:scale-105 relative">
            <div className="flex justify-between items-center mb-2">
                <FileIcon className="w-8 h-8 text-blue-500" />
                <span className="text-sm bg-blue-200 text-blue-700 px-2 py-1 rounded-md">
                    {fileType}
                </span>
            </div>
            <h3 className="text-lg font-semibold truncate">{title}</h3>
            <div className="mt-1 text-xs text-gray-600">
                <span>{size}</span>
                <div className="flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                        {createdAt
                            ? new Date(createdAt).toLocaleDateString()
                            : 'Unknown Date'}
                    </span>
                </div>
            </div>
            <button
                ref={buttonRef}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowActions(!showActions)}>
                <MoreHorizontal className="w-5 h-5" />
            </button>
            {showActions &&
                ReactDOM.createPortal(
                    <div
                        ref={actionMenuRef}
                        className="bg-white shadow-lg rounded-md p-2 z-50 w-40 text-gray-700"
                        style={{
                            position: 'absolute',
                            top: menuPosition.top,
                            left: menuPosition.left
                        }}>
                        <button
                            className="flex items-center w-full py-2 px-3 hover:bg-gray-100"
                            onClick={handlePreviewClick}>
                            <Eye className="w-4 h-4 mr-2 text-blue-500" />{' '}
                            <span>Preview</span>
                        </button>
                        <button
                            className="flex items-center w-full py-2 px-3 hover:bg-gray-100"
                            onClick={handleEditClick}>
                            <Edit className="w-4 h-4 mr-2 text-green-500" />
                            <span>Edit</span>
                        </button>
                        <button
                            className="flex items-center w-full py-2 px-3 hover:bg-gray-100"
                            onClick={handleDeleteClick}>
                            <Trash className="w-4 h-4 mr-2 text-red-500" />
                            <span>Delete</span>
                        </button>
                        <button className="flex items-center w-full py-2 px-3 hover:bg-gray-100">
                            <Download className="w-4 h-4 mr-2 text-blue-500" />
                            <span>Download</span>
                        </button>
                        <button className="flex items-center w-full py-2 px-3 hover:bg-gray-100">
                            <QrCode className="w-4 h-4 mr-2 text-purple-500" />
                            <span>QR Code</span>
                        </button>
                    </div>,
                    document.body
                )}
            {showPreviewModal &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-3xl w-full relative">
                            <h2 className="text-2xl mb-4">File Preview</h2>
                            {isLoading ? (
                                <p>Loading...</p>
                            ) : pdfUrl ? (
                                <div
                                    className="overflow-hidden"
                                    style={{
                                        width: '8000px', // Set the width to match your cropped area
                                        height: '600px', // Set the height to match your cropped area
                                        position: 'relative'
                                    }}>
                                    <iframe
                                        src={pdfUrl}
                                        width="1000px" // Larger width to make sure the content overflows
                                        height="800px" // Larger height to make sure the content overflows
                                        title="PDF Preview"
                                        style={{
                                            position: 'absolute',
                                            top: '-50px', // Adjust the top value to crop the upper area
                                            left: '-50px' // Adjust the left value to crop from the sides
                                        }}
                                        onLoad={() =>
                                            console.log(
                                                'PDF loaded successfully'
                                            )
                                        }></iframe>
                                </div>
                            ) : (
                                <p>Failed to load file preview.</p>
                            )}
                            <button
                                className="mt-4 bg-gray-500 text-white px-4 py-2 rounded"
                                onClick={closePreviewModal}>
                                Close
                            </button>
                        </div>
                    </div>,
                    document.body
                )}

            {showEditModal &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                            <h2 className="text-2xl font-bold mb-4 text-gray-700">
                                Edit File
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-600">
                                        Title
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                title: e.target.value
                                            })
                                        }
                                        className="w-full border rounded-md p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-600">
                                        Description
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.description}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                description: e.target.value
                                            })
                                        }
                                        className="w-full border rounded-md p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-600">
                                        Control Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editData.controlNumber}
                                        onChange={(e) =>
                                            setEditData({
                                                ...editData,
                                                controlNumber: e.target.value
                                            })
                                        }
                                        className="w-full border rounded-md p-2"
                                    />
                                </div>
                                <RestrictAccessUI
                                    allUsers={allUsers}
                                    restrictedUsers={editData.restrictedUsers}
                                    setRestrictedUsers={(users) =>
                                        setEditData({
                                            ...editData,
                                            restrictedUsers: users
                                        })
                                    }
                                />
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
            {showDeleteModal &&
                ReactDOM.createPortal(
                    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                            <h2 className="text-lg font-semibold text-gray-700 mb-4">
                                Delete File
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Are you sure you want to delete this file? This
                                action cannot be undone.
                            </p>
                            <div className="flex justify-end space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>,
                    document.body
                )}
        </div>
    )
}
