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
    fetchDocumentHistory
} from '@/services/api/appwrite'
import { appwriteConfig, databases } from '@/services/api/appwrite'

const FileOptionsModal = ({ isOpen, onClose, selectedFile, errorMsg }) => {
    const [localErrorMsg, setLocalErrorMsg] = useState(errorMsg)
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [fileHistory, setFileHistory] = useState([])
    const [currentHolderName, setCurrentHolderName] = useState('')
    const [currentHolderReceivedDateTime, setCurrentHolderReceivedDateTime] =
        useState('')
    const [createdAt, setCreatedAt] = useState('')
    const [parentFolderId, setParentFolderId] = useState('')
    const [subFolderId, setSubFolderId] = useState('')

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

            // Fetch folder names using correct IDs and collections
            const parentFolderName = fileMetadata.parentFolderId
                ? await getFolderNameById(fileMetadata.parentFolderId, true)
                : 'None'

            const subFolderName = fileMetadata.folderId
                ? await getFolderNameById(fileMetadata.folderId, false)
                : 'None'

            setParentFolderId(parentFolderName)
            setSubFolderId(subFolderName)

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
        } catch (error) {
            console.error('Error fetching current holder:', error)
            toast.error('Failed to fetch current holder.')
        }
    }

    const getFolderNameById = async (folderId, isParentFolder) => {
        try {
            const collectionId = isParentFolder
                ? appwriteConfig.uploadsCollectionId
                : appwriteConfig.subfoldersCollectionId

            console.log(
                'Fetching folder name for ID:',
                folderId,
                'in collection:',
                collectionId
            )

            const folder = await databases.getDocument(
                appwriteConfig.databaseId,
                collectionId,
                folderId
            )

            return folder.name || 'Unknown'
        } catch (error) {
            console.error(
                `Error fetching folder name for ID ${folderId}:`,
                error
            )
            if (
                error.message.includes(
                    'Document with the requested ID could not be found'
                )
            ) {
                console.warn(
                    `Folder with ID ${folderId} was not found in the database.`
                )
            }
            return 'Folder Not Found'
        }
    }

    const handleTrackFileHolder = async () => {
        if (!selectedFile) {
            toast.error('No file selected to track.')
            return
        }
        try {
            console.log(
                'Fetching history for documentId:',
                selectedFile.documentId
            )

            const history = await fetchDocumentHistory(selectedFile.documentId)

            if (history && history.length > 0) {
                const historyWithNames = await Promise.all(
                    history.map(async (entry, index) => {
                        const previousHolder = await getUserData(
                            entry.previousHolder
                        )
                        return {
                            previousHolder: `${previousHolder.firstname} ${previousHolder.lastname}`,
                            dateReceived:
                                index === 0
                                    ? new Date(
                                          selectedFile.createdAt
                                      ).toLocaleString()
                                    : new Date(
                                          entry.dateReceived
                                      ).toLocaleString()
                        }
                    })
                )
                setFileHistory(historyWithNames)
                setCurrentHolderReceivedDateTime(
                    historyWithNames[historyWithNames.length - 1].dateReceived
                )
            } else {
                console.warn('No history found for this file.')
                const metadata = await fetchFileMetadata(
                    selectedFile.documentId
                )
                const currentHolder = await getUserData(metadata.handleBy)
                setFileHistory([
                    {
                        previousHolder: `${currentHolder.firstname} ${currentHolder.lastname}`,
                        dateReceived: new Date(
                            metadata.createdAt
                        ).toLocaleString()
                    }
                ])
                setCurrentHolderReceivedDateTime(
                    new Date(metadata.createdAt).toLocaleString()
                )
            }

            setHistoryDialogOpen(true)
        } catch (error) {
            console.error('Error fetching document history:', error)
            toast.error('Failed to fetch document history.')

            try {
                const metadata = await fetchFileMetadata(
                    selectedFile.documentId
                )
                const currentHolder = await getUserData(metadata.handleBy)
                setFileHistory([
                    {
                        previousHolder: `${currentHolder.firstname} ${currentHolder.lastname}`,
                        dateReceived: new Date(
                            metadata.createdAt
                        ).toLocaleString()
                    }
                ])
                setCurrentHolderReceivedDateTime(
                    new Date(metadata.createdAt).toLocaleString()
                )
                setHistoryDialogOpen(true)
            } catch (metaError) {
                console.error('Error fetching metadata as fallback:', metaError)
                toast.error('Failed to fetch file metadata. Please try again.')
            }
        }
    }

    const handleViewFile = async () => {
        try {
            if (selectedFile && selectedFile.fileId) {
                const viewUrl = `http://localhost/v1/storage/buckets/${appwriteConfig.storageId}/files/${selectedFile.fileId}/view?project=${appwriteConfig.projectId}`
                window.open(viewUrl, '_blank')
            } else {
                throw new Error(
                    'Selected file does not have a valid storage fileId.'
                )
            }
        } catch (error) {
            console.error('Error viewing file:', error.message)
            toast.error(error.message)
        }
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

                    {/* Display parentFolderId and subFolderId */}
                    <div className="mt-4 text-center">
                        <h3 className="text-sm font-semibold">Folder Info:</h3>
                        <p className="text-gray-500 text-sm">
                            Parent Folder ID: {parentFolderId}
                        </p>
                        <p className="text-gray-500 text-sm">
                            Subfolder ID: {subFolderId}
                        </p>
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
                                {fileHistory.map((h, index) => (
                                    <li key={index}>
                                        {h.previousHolder}
                                        {h.dateReceived && <br />}
                                        <span className="text-gray-500 text-sm">
                                            Received: {h.dateReceived}
                                        </span>
                                    </li>
                                ))}
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
