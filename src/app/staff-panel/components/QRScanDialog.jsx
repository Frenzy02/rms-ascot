import React from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { fetchFileMetadata, updateHandleBy } from '@/services/api/appwrite'

const QRScanDialog = ({ file, onClose, userId }) => {
    const handleViewMetadata = async () => {
        if (!file) {
            toast.error('No file to show metadata.')
            return
        }
        try {
            console.log('Fetching metadata for File ID:', file.id)
            const metadata = await fetchFileMetadata(file.id)
            console.log('File Metadata:', metadata)

            if (metadata) {
                toast.info(`File Metadata: ${JSON.stringify(metadata)}`)
            } else {
                toast.error('No metadata found for this file.')
            }
        } catch (error) {
            console.error('Failed to fetch file metadata:', error)
            toast.error('Failed to fetch file metadata.')
        }
    }

    const handleTrackFileHolder = async () => {
        if (!file) {
            toast.error('No file to track.')
            return
        }
        try {
            const metadata = await fetchFileMetadata(file.id)
            toast.info(`Current Holder: ${metadata.handleBy}`)
        } catch (error) {
            toast.error('Failed to fetch file holder information')
        }
    }

    const handleReceiveFile = async () => {
        if (!file) {
            toast.error('No file to receive.')
            return
        }
        try {
            const updated = await updateHandleBy(file.id)
            if (updated) {
                toast.success('File received successfully')
            }
        } catch (error) {
            toast.error('Failed to receive file')
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg relative">
                <h2 className="text-lg font-bold mb-4">
                    {file ? `Actions for ${file.title}` : 'File Not Found'}
                </h2>
                {file ? (
                    <>
                        <Button
                            onClick={handleViewMetadata}
                            className="w-full mb-2">
                            View Metadata
                        </Button>
                        <Button
                            onClick={handleTrackFileHolder}
                            className="w-full mb-2">
                            Track File Holder
                        </Button>
                        <Button
                            onClick={handleReceiveFile}
                            className="w-full mb-2 bg-green-500 text-white">
                            Receive File
                        </Button>
                    </>
                ) : (
                    <p className="text-center text-red-500">
                        The scanned file does not exist.
                    </p>
                )}
                <Button
                    onClick={onClose}
                    className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg">
                    Close
                </Button>
            </div>
        </div>
    )
}

export default QRScanDialog
