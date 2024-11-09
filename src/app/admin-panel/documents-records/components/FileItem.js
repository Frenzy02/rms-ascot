import React, { useState, useRef, useEffect } from 'react'
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
import { Button } from '@/components/ui/button'
import { editFileMetadata, deleteFile } from '@/services/api/appwrite'
import { toast } from 'react-toastify'

export default function FileItem({ file, onDelete }) {
    // If the file status is not 'approved', return null to hide the file
    if (file.status !== 'approved') {
        return null
    }

    const [showActions, setShowActions] = useState(false)
    const actionMenuRef = useRef(null)
    const buttonRef = useRef(null)
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editData, setEditData] = useState({
        title: file.title || 'Untitled File',
        description: file.description || '',
        controlNumber: file.controlNumber || ''
    })

    const {
        title = 'Untitled File',
        fileType = 'Unknown Type',
        size = 'Unknown Size',
        createdAt
    } = file || {}

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
            await editFileMetadata(file.$id, editData)
            setShowEditModal(false)
            console.log('File metadata updated successfully')
        } catch (error) {
            console.error('Failed to update file metadata:', error.message)
        }
    }

    const handleConfirmDelete = async () => {
        console.log('Deleting file with ID:', file.$id) // Add this for debugging
        try {
            await deleteFile(file.fileId, file.$id) // Ensure both fileId and documentId are passed
            setShowDeleteModal(false)
            onDelete(file.$id) // Callback to update UI after deletion
            toast.success('File deleted successfully!')
        } catch (error) {
            console.error('Failed to delete file:', error.message)
            toast.error('Failed to delete file. Please try again.')
        }
    }

    const actionMenu = (
        <div
            ref={actionMenuRef}
            className="bg-white shadow-lg rounded-md p-2 z-50 w-32 text-gray-700"
            style={{
                position: 'absolute',
                top: menuPosition.top,
                left: menuPosition.left,
                zIndex: 50
            }}>
            <Button
                size="icon"
                variant="ghost"
                className="flex items-center w-full hover:bg-gray-100">
                <Eye className="h-4 w-4 mr-2 text-blue-500" />
                <span>View</span>
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="flex items-center w-full hover:bg-gray-100"
                onClick={handleEditClick}>
                <Edit className="h-4 w-4 mr-2 text-green-500" />
                <span>Edit</span>
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="flex items-center w-full hover:bg-gray-100"
                onClick={handleDeleteClick}>
                <Trash className="h-4 w-4 mr-2 text-red-500" />
                <span>Delete</span>
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="flex items-center w-full hover:bg-gray-100">
                <Download className="h-4 w-4 mr-2 text-blue-500" />
                <span>Download</span>
            </Button>
            <Button
                size="icon"
                variant="ghost"
                className="flex items-center w-full hover:bg-gray-100">
                <QrCode className="h-4 w-4 mr-2 text-purple-500" />
                <span>QR Code</span>
            </Button>
        </div>
    )

    const editModal = (
        <div
            className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${
                showEditModal ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}>
            <div
                className={`transform transition-transform duration-300 ${
                    showEditModal
                        ? 'translate-y-0 opacity-100'
                        : 'translate-y-10 opacity-0'
                } bg-white p-8 rounded-xl shadow-2xl max-w-md w-full`}>
                <h2 className="text-2xl font-bold mb-6 text-gray-700">
                    Edit File
                </h2>
                <div className="space-y-4">
                    <label className="block">
                        <span className="text-gray-600">Title</span>
                        <input
                            type="text"
                            value={editData.title}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    title: e.target.value
                                })
                            }
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-600">Description</span>
                        <input
                            type="text"
                            value={editData.description}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    description: e.target.value
                                })
                            }
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </label>
                    <label className="block">
                        <span className="text-gray-600">Control Number</span>
                        <input
                            type="text"
                            value={editData.controlNumber}
                            onChange={(e) =>
                                setEditData({
                                    ...editData,
                                    controlNumber: e.target.value
                                })
                            }
                            className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </label>
                </div>
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={() => setShowEditModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition">
                        Save
                    </button>
                </div>
            </div>
        </div>
    )

    const deleteModal = (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full transform transition-all duration-300">
                <h2 className="text-lg font-semibold text-gray-700 mb-4">
                    Delete File
                </h2>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to delete this file? This action
                    cannot be undone.
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={() => setShowDeleteModal(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 focus:ring-2 focus:ring-gray-400 focus:outline-none transition">
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:outline-none transition">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="p-4 rounded-lg shadow-md bg-gradient-to-br from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400 transition-transform transform hover:scale-105 relative">
            <div className="flex justify-between items-center mb-2">
                <FileIcon className="w-8 h-8 text-blue-600" />
                <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-md">
                    {fileType}
                </span>
            </div>
            <h3 className="text-lg font-semibold truncate">{title}</h3>

            <div className="mt-1 text-xs text-gray-600">
                <span className="block">{size}</span>
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
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={() => setShowActions(!showActions)}>
                <MoreHorizontal className="w-5 h-5" />
            </button>

            {showActions && ReactDOM.createPortal(actionMenu, document.body)}
            {showEditModal && ReactDOM.createPortal(editModal, document.body)}
            {showDeleteModal &&
                ReactDOM.createPortal(deleteModal, document.body)}
        </div>
    )
}
