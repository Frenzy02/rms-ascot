import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import {
    fetchFileMetadata,
    getUserData,
    fetchDocumentHistory,
    logFileView,
    appwriteConfig
} from '@/services/api/appwrite'

const FileOptionsModal = ({ isOpen, onClose, selectedFile }) => {
    const [errorMsg, setErrorMsg] = useState(null)
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
            // Fetch the file metadata from uploadsCollection
            const fileMetadata = await fetchFileMetadata(
                selectedFile.id || selectedFile.documentId
            )

            // Extract the handleBy and dateReceived from the file metadata
            const currentHolderUserId = fileMetadata.handleBy
            const currentHolder = await getUserData(currentHolderUserId)
            const currentDateReceived = fileMetadata.dateReceived

            // Set the current holder's name and received date
            setCurrentHolderName(
                `${currentHolder.firstname} ${currentHolder.lastname}`
            )
            setCurrentHolderReceivedDateTime(
                currentDateReceived
                    ? new Date(currentDateReceived).toLocaleString()
                    : 'Unknown'
            )

            // Fetch the document history for previous holders
            const history = await fetchDocumentHistory(
                selectedFile.id || selectedFile.documentId
            )

            // Map history to get previous holders and their dateReceived
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
            console.error('Error fetching document history or metadata:', error)
            setFileHistory([])
        }
    }

    const handleViewFile = async () => {
        try {
            const userId = sessionStorage.getItem('userId')
            const department = sessionStorage.getItem('department')

            if (!userId) {
                throw new Error('User not authenticated.')
            }

            if (selectedFile) {
                // Fetch file metadata and check for restrictions
                const fileMetadata = await fetchFileMetadata(selectedFile.id)
                console.log('File Metadata:', fileMetadata)

                // Check if the user is restricted
                const restrictedUsers = fileMetadata.restrictedUsers
                    ? fileMetadata.restrictedUsers
                          .split(',')
                          .map((id) => id.trim())
                    : []

                if (restrictedUsers.includes(`user:${userId}`)) {
                    toast.error('You do not have permission to view this file.')
                    return
                }

                // Log the view if the user is not restricted
                await logFileView(selectedFile.id, userId, department)

                // Generate the view URL and open the file
                const viewUrl = `http://localhost/v1/storage/buckets/${appwriteConfig.storageId}/files/${selectedFile.fileId}/view?project=${appwriteConfig.projectId}`
                window.open(viewUrl, '_blank')
            } else {
                throw new Error('Selected file does not have a valid fileId.')
            }
        } catch (error) {
            console.error('Error viewing file:', error.message)
            setErrorMsg(error.message)
            toast.error(error.message)
        }
    }

    const handleTrackFileHolder = () => {
        setHistoryDialogOpen(true)
    }

    if (!isOpen || !selectedFile) return null

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent className="rounded-lg shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-purple-600">
                            File Options for{' '}
                            {selectedFile
                                ? selectedFile.title
                                : 'No File Selected'}
                        </DialogTitle>
                        <DialogDescription className="text-gray-500">
                            What would you like to do with this file?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-between">
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

                    {errorMsg && (
                        <p className="text-sm text-red-500 mt-2 text-center">
                            {errorMsg}
                        </p>
                    )}
                </DialogContent>
            </Dialog>

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
