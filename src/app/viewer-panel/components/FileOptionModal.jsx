import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    getFileView,
    logFileView,
    appwriteConfig
} from '@/services/api/appwrite'

const FileOptionsModal = ({ isOpen, onClose, selectedFile, onTrackFile }) => {
    const [errorMsg, setErrorMsg] = useState(null) // Handle errors

    const handleViewFile = async () => {
        try {
            const userId = sessionStorage.getItem('userId') // Get user ID from session
            const department = sessionStorage.getItem('department') // Get user department from session
            if (selectedFile) {
                console.log('Fetching view for file ID:', selectedFile.fileId) // Log file ID
                await logFileView(selectedFile.id, userId, department) // Log file view with department

                // Directly construct the view URL
                const viewUrl = `http://localhost/v1/storage/buckets/${appwriteConfig.storageId}/files/${selectedFile.fileId}/view?project=${appwriteConfig.projectId}`

                console.log('Fetched view URL:', viewUrl) // Log the fetched view URL

                // Open the view URL in a new tab
                window.open(viewUrl, '_blank') // Open in new tab
            } else {
                throw new Error('Selected file does not have a fileId.')
            }
        } catch (error) {
            console.error('Error viewing file:', error.message)
            setErrorMsg(error.message) // Set error message if any error occurs
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-purple-600">
                        File Options for{' '}
                        {selectedFile ? selectedFile.title : 'No File Selected'}
                    </DialogTitle>
                    <DialogDescription className="text-gray-500">
                        What would you like to do with this file?
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-between">
                    <Button
                        onClick={handleViewFile} // Call the handleViewFile function
                        variant="primary"
                        disabled={!selectedFile}>
                        View File
                    </Button>
                    <Button
                        onClick={onTrackFile}
                        variant="outline"
                        disabled={!selectedFile}>
                        Track File
                    </Button>
                </div>

                {/* Display error message */}
                {errorMsg && <p className="text-red-600">{errorMsg}</p>}
            </DialogContent>
        </Dialog>
    )
}

export default FileOptionsModal
