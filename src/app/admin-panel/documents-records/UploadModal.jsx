'use client'
import React, { useState } from 'react'
import { Button } from '../../../components/ui/button'
import QRCode from 'qrcode.react'
import { uploadFile } from '@/services/api/user-management'

const UploadModal = ({ isOpen, onClose, currentUser }) => {
    // Accept currentUser as prop
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [handleBy, setHandleBy] = useState(currentUser?.displayName || '') // Default to current user's name
    const [classification, setClassification] = useState('')
    const [file, setFile] = useState(null)
    const [qrCodeValue, setQrCodeValue] = useState('')
    const [error, setError] = useState('')

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleUpload = async () => {
        if (!file) {
            setError('Please select a file to upload.')
            return
        }

        const metadata = {
            title,
            description,
            handleBy,
            classification
        }

        try {
            await uploadFile(file, metadata)
            setQrCodeValue(`${metadata.title} - ${handleBy}`)
            resetForm()
        } catch (error) {
            setError(error.message)
        }
    }

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setHandleBy(currentUser?.displayName || '')
        setClassification('')
        setFile(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-auto">
                <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
                {error && <div className="text-red-500 mb-2">{error}</div>}
                <input
                    type="text"
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="block w-full mb-4 border border-gray-600 p-2 rounded bg-gray-700 text-white"
                />
                <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full mb-4 border border-gray-600 p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    placeholder="Handled By"
                    value={handleBy}
                    onChange={(e) => setHandleBy(e.target.value)}
                    className="block w-full mb-4 border border-gray-600 p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="text"
                    placeholder="Classification"
                    value={classification}
                    onChange={(e) => setClassification(e.target.value)}
                    className="block w-full mb-4 border border-gray-600 p-2 rounded bg-gray-700 text-white"
                />
                <input
                    type="file"
                    onChange={handleFileChange}
                    className="block w-full mb-4 border border-gray-600 p-2 rounded bg-gray-700 text-white"
                />
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        variant="solid"
                        size="sm"
                        className="ml-2"
                        onClick={handleUpload}>
                        Upload
                    </Button>
                </div>
                {qrCodeValue && (
                    <div className="mt-4">
                        <h3 className="text-lg font-semibold">
                            Generated QR Code:
                        </h3>
                        <QRCode value={qrCodeValue} size={128} />
                    </div>
                )}
            </div>
        </div>
    )
}

export default UploadModal
