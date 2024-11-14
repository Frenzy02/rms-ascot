import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { toast } from 'react-toastify'
import {
    fetchFileMetadata,
    getUserData,
    fetchDocumentHistory,
    logFileView // Import logFileView function
} from '@/services/api/appwrite'
import { appwriteConfig } from '@/services/api/appwrite'

const FileOptionsModal = ({ isOpen, onClose, selectedFile, errorMsg }) => {
    const [localErrorMsg, setLocalErrorMsg] = useState(errorMsg)
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [fileHistory, setFileHistory] = useState([])
    const [currentHolderName, setCurrentHolderName] = useState('')
    const [currentHolderReceivedDateTime, setCurrentHolderReceivedDateTime] =
        useState('')
    const [createdAt, setCreatedAt] = useState('')
    const [path, setPath] = useState('')

    useEffect(() => {
        if (selectedFile) {
            fetchCurrentHolder()
        }
    }, [selectedFile])

    const fetchCurrentHolder = async () => {
        try {
            const fileMetadata = await fetchFileMetadata(
                selectedFile.documentId
            )
            const currentHolderUserId = fileMetadata.handleBy
            const currentHolder = await getUserData(currentHolderUserId)

            setCurrentHolderName(
                `${currentHolder.firstname} ${currentHolder.lastname}`
            )
            setCreatedAt(new Date(fileMetadata.createdAt).toLocaleString())

            // Fetch the path attributes directly from the file metadata
            const constructedPath = fileMetadata.path || 'Root'
            setPath(constructedPath)

            // Fetch the document history to get the received date and time for the current holder
            const history = await fetchDocumentHistory(selectedFile.documentId)
            const currentHolderEntry = history.find(
                (entry) => entry.currentHolder === currentHolderUserId
            )

            // Format date and time if available
            if (currentHolderEntry?.dateReceived) {
                const date = new Date(currentHolderEntry.dateReceived)
                setCurrentHolderReceivedDateTime(date.toLocaleString())
            } else {
                setCurrentHolderReceivedDateTime('Unknown')
            }

            // Map history with user names
            const historyWithNames = await Promise.all(
                history.map(async (entry) => {
                    const previousHolder = await getUserData(
                        entry.previousHolder
                    )
                    return {
                        previousHolder: `${previousHolder.firstname} ${previousHolder.lastname}`,
                        dateReceived: new Date(
                            entry.dateReceived
                        ).toLocaleString()
                    }
                })
            )
            setFileHistory(historyWithNames)
        } catch (error) {
            console.error('Error fetching document history:', error)

            // Clear the previous holders if history fetch fails
            setFileHistory([])

            // Set fallback current holder information
            try {
                const fileMetadata = await fetchFileMetadata(
                    selectedFile.documentId
                )
                const currentHolder = await getUserData(fileMetadata.handleBy)
                setCurrentHolderReceivedDateTime(
                    new Date(fileMetadata.createdAt).toLocaleString()
                )
            } catch (fallbackError) {
                console.error(
                    'Error fetching metadata as fallback:',
                    fallbackError
                )
            }
        }
    }

    const handleViewFile = async () => {
        try {
            const userId = sessionStorage.getItem('userId')
            const department = sessionStorage.getItem('department')

            if (!userId) {
                toast.error('User not authenticated.')
                return
            }

            if (selectedFile) {
                // Fetch file metadata
                const fileMetadata = await fetchFileMetadata(selectedFile.id)
                console.log('File Metadata:', fileMetadata)

                // Check if the user is restricted
                const restrictedUsers = fileMetadata.restrictedUsers
                    ? fileMetadata.restrictedUsers
                          .split(',')
                          .map((id) => id.trim())
                    : []

                if (restrictedUsers.includes(`user:${userId}`)) {
                    // Show toast error if the user is restricted
                    toast.error('You do not have permission to view this file.')
                    return
                }

                // Log the view if the user is not restricted
                await logFileView(selectedFile.id, userId, department)

                // Generate the view URL and open the file
                const viewUrl = `http://localhost/v1/storage/buckets/${appwriteConfig.storageId}/files/${selectedFile.fileId}/view?project=${appwriteConfig.projectId}`
                window.open(viewUrl, '_blank')
            } else {
                toast.error('Selected file does not have a valid fileId.')
            }
        } catch (error) {
            console.error('Error viewing file:', error.message)
            toast.error(
                error.message || 'An error occurred while viewing the file.'
            )
        }
    }

    const handleTrackFileHolder = () => {
        setHistoryDialogOpen(true)
    }

    if (!isOpen || !selectedFile) return null

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                        Options for {selectedFile?.title || 'Untitled'}
                    </h2>
                    <img
                        src={selectedFile?.qrCodeUrl || ''}
                        alt="QR Code"
                        className="mx-auto mb-4 border rounded-md w-40 h-40 object-contain"
                    />

                    {/* View and Track File buttons */}
                    <div className="flex space-x-4 mt-4">
                        <Button
                            onClick={handleViewFile}
                            className="flex-1 bg-gray-700 text-white py-2 rounded-md"
                            disabled={!selectedFile}>
                            View File
                        </Button>
                        <Button
                            onClick={handleTrackFileHolder}
                            className="flex-1 bg-gray-500 text-white py-2 rounded-md"
                            disabled={!selectedFile}>
                            Track File
                        </Button>
                    </div>

                    {/* Display current holder and received date and time */}
                    <div className="mt-4 text-center">
                        <h3 className="text-sm font-semibold">
                            Current Holder:
                        </h3>
                        <p className="text-gray-700">
                            {currentHolderName || 'Unknown'}
                        </p>
                        <p className="text-gray-500 text-sm">
                            Received:{' '}
                            {currentHolderReceivedDateTime || 'Unknown'}
                        </p>
                    </div>

                    {/* Display folder path */}
                    <div className="mt-4 text-center">
                        <h3 className="text-sm font-semibold">Folder Path:</h3>
                        <p className="text-gray-500 text-sm">{path}</p>
                    </div>

                    {/* Display error message if exists */}
                    {(localErrorMsg || errorMsg) && (
                        <p className="text-sm text-red-500 mt-2 text-center">
                            {localErrorMsg || errorMsg}
                        </p>
                    )}

                    {/* Close Button */}
                    <Button
                        onClick={onClose}
                        className="mt-4 w-full bg-gray-300 text-gray-800 py-2 rounded-md hover:bg-gray-400 transition-colors">
                        Close
                    </Button>
                </div>
            </div>

            {/* History Modal */}
            <Dialog
                open={historyDialogOpen}
                onOpenChange={setHistoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            File History for {selectedFile?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Previous holders are on the left, and the current
                            holder is on the right.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-between">
                        <div className="w-1/2 overflow-y-auto max-h-64 pr-2">
                            <h3 className="font-semibold text-left">
                                Previous Holders
                            </h3>
                            <ul className="list-disc pl-5 text-left">
                                {fileHistory.length > 0 ? (
                                    fileHistory.map((h, index) => (
                                        <li key={index}>
                                            {h.previousHolder}
                                            {h.dateReceived && <br />}
                                            <span className="text-gray-500 text-sm">
                                                Received: {h.dateReceived}
                                            </span>
                                        </li>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-500">
                                        No previous holders.
                                    </p>
                                )}
                            </ul>
                        </div>

                        {/* Current Holder Section */}
                        <div className="w-1/2 overflow-y-auto max-h-64 pl-2 border-l border-gray-300">
                            <h3 className="font-semibold text-left">
                                Current Holder
                            </h3>
                            <p className="text-gray-700">
                                {currentHolderName || 'Unknown'}
                            </p>
                            <p className="text-gray-500 text-sm">
                                Received:{' '}
                                {currentHolderReceivedDateTime || 'Unknown'}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setHistoryDialogOpen(false)}
                        className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg">
                        Close History
                    </Button>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default FileOptionsModal
