import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import {
    fetchFileMetadata,
    addDocumentHistory,
    fetchDocumentHistory,
    updateHandleBy,
    getUserData
} from '@/services/api/appwrite'

const QRScanDialog = ({ file, onClose, userId }) => {
    const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
    const [fileHistory, setFileHistory] = useState([])
    const [currentHolderName, setCurrentHolderName] = useState('')
    const [isCurrentHolder, setIsCurrentHolder] = useState(false)

    useEffect(() => {
        if (file) {
            checkIfCurrentHolder()
        }
    }, [file])

    // Check if the user is the current holder
    const checkIfCurrentHolder = async () => {
        try {
            const fileMetadata = await fetchFileMetadata(file.id)
            const currentHolderUserId = fileMetadata.handleBy

            // Fetch the user's first and last name for display
            const currentHolder = await getUserData(currentHolderUserId)
            setCurrentHolderName(
                `${currentHolder.firstname} ${currentHolder.lastname}`
            )

            // Check if the current user is the current holder
            if (currentHolderUserId === userId) {
                setIsCurrentHolder(true)
            } else {
                setIsCurrentHolder(false)
            }
        } catch (error) {
            console.error('Error checking current holder:', error)
        }
    }

    // Fetch and display file holder history
    const handleTrackFileHolder = async () => {
        if (!file) {
            alert('No file to track.')
            return
        }
        try {
            const history = await fetchDocumentHistory(file.id)
            if (history.length > 0) {
                const historyWithNames = await Promise.all(
                    history.map(async (entry) => {
                        const previousHolder = await getUserData(
                            entry.previousHolder
                        )
                        return {
                            previousHolder: `${previousHolder.firstname} ${previousHolder.lastname}`,
                            dateReceived: entry.dateReceived
                        }
                    })
                )
                setFileHistory(historyWithNames)
            } else {
                // If no history, show the current holder from file metadata
                const metadata = await fetchFileMetadata(file.id)
                const currentHolder = await getUserData(metadata.handleBy)

                setFileHistory([
                    {
                        previousHolder: `${currentHolder.firstname} ${currentHolder.lastname}`,
                        dateReceived: 'No previous history available'
                    }
                ])
            }

            setHistoryDialogOpen(true)
        } catch (error) {
            console.error('Error fetching document history:', error)
            // If history fetching fails, display current holder from metadata
            try {
                const metadata = await fetchFileMetadata(file.id)
                const currentHolder = await getUserData(metadata.handleBy)

                setFileHistory([
                    {
                        previousHolder: `${currentHolder.firstname} ${currentHolder.lastname}`,
                        dateReceived: 'No history found, showing current holder'
                    }
                ])
                setHistoryDialogOpen(true)
            } catch (metaError) {
                alert('Failed to fetch current holder from metadata.')
            }
        }
    }

    // Handle receiving the file and updating the current holder
    // Handle receiving the file and updating the current holder
    const handleReceiveFile = async () => {
        if (!file) {
            alert('No file to receive.')
            return
        }
        try {
            const metadata = await fetchFileMetadata(file.id)
            const previousHolderUserId = metadata.handleBy

            if (previousHolderUserId === userId) {
                alert('You are already the current holder of this file.')
                return
            }

            const updated = await updateHandleBy(file.id, userId)

            if (updated) {
                await addDocumentHistory({
                    fileId: file.id,
                    previousHolder: previousHolderUserId,
                    currentHolder: userId,
                    department: 'IT Department',
                    status: 'received'
                })

                // Directly update the current holder state without refresh
                const currentUser = await getUserData(userId)
                setCurrentHolderName(
                    `${currentUser.firstname} ${currentUser.lastname}`
                )
                setIsCurrentHolder(true) // Now the current user is the holder

                alert('File received and history updated successfully.')
            }
        } catch (error) {
            alert('Failed to receive file.')
        }
    }

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg relative">
                    <h2 className="text-lg font-bold mb-4">
                        {file ? `Actions for ${file.title}` : 'File Not Found'}
                    </h2>
                    {file ? (
                        <>
                            <Button
                                onClick={handleTrackFileHolder}
                                className="w-full mb-2">
                                Track File Holder
                            </Button>
                            <Button
                                onClick={handleReceiveFile}
                                disabled={isCurrentHolder}
                                className={`w-full mb-2 ${
                                    isCurrentHolder
                                        ? 'bg-gray-400'
                                        : 'bg-green-500'
                                } text-white`}>
                                {isCurrentHolder
                                    ? 'You Are the Current Holder'
                                    : 'Receive File'}
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

            {/* History Modal */}
            <Dialog
                open={historyDialogOpen}
                onOpenChange={setHistoryDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>File History for {file.title}</DialogTitle>
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
                                        {h.previousHolder} <br />
                                        <span className="text-gray-500 text-sm">
                                            Received:{' '}
                                            {h.dateReceived !==
                                                'No previous history available' &&
                                            h.dateReceived !==
                                                'No history found, showing current holder'
                                                ? new Date(
                                                      h.dateReceived
                                                  ).toLocaleString()
                                                : h.dateReceived}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-1/2 text-right">
                            <h3 className="font-semibold">Current Holder</h3>
                            <div className="text-right">
                                {currentHolderName}
                            </div>
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

export default QRScanDialog