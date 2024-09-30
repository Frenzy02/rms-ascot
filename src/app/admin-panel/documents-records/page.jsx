import React, { useState, useEffect } from 'react'
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import UploadModal from './UploadModal'

import {
    CalendarIcon,
    EditIcon,
    EyeIcon,
    QrCodeIcon,
    UploadIcon,
    FilterIcon
} from '@/components/ui/icons'
import { fetchRecords } from '@/services/api/user-management'

const DocumentsRecords = () => {
    const [selectedView, setSelectedView] = useState('card')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [records, setRecords] = useState([])
    const [error, setError] = useState(null) // State to hold error messages

    useEffect(() => {
        const fetchDocumentRecords = async () => {
            console.log('Fetching document records...')
            try {
                const fetchedRecords = await fetchRecords()
                console.log('Fetched records:', fetchedRecords)
                setRecords(fetchedRecords) // Set the fetched records to state
            } catch (error) {
                console.error('Error fetching document records:', error)
                setError('Failed to fetch document records') // Set an error message
            }
        }

        fetchDocumentRecords()
    }, [])

    return (
        <div className="w-full mx-auto py-8 px-4 md:px-6 bg-gray-800 text-white">
            <header className="flex items-center justify-between mb-6">
                <h1 className="font-semibold text-lg md:text-xl">Documents</h1>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-black hover:bg-gray-700">
                                <FilterIcon className="h-4 w-4 text-black" />
                                <span className="text-black">Filter</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="bg-gray-700">
                            <DropdownMenuLabel className="text-gray-200">
                                Filter by
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuCheckboxItem
                                className="text-gray-200"
                                checked>
                                Shared with me
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem className="text-gray-200">
                                Owned by me
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem className="text-gray-200">
                                Archived
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                        variant="solid"
                        size="sm"
                        className="bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setIsModalOpen(true)} // Open the modal
                    >
                        <UploadIcon className="h-4 w-4" />
                        <span>Upload</span>
                    </Button>
                </div>
            </header>
            {/* Error Message */}
            {error && <div className="text-red-500">{error}</div>}
            {/* View Selection */}
            <div className="mb-6">
                <label className="mr-2 text-sm">View as:</label>
                <select
                    value={selectedView}
                    onChange={(e) => setSelectedView(e.target.value)}
                    className="p-2 bg-gray-700 text-white rounded border border-gray-600">
                    <option value="card">Card Type</option>
                    <option value="document">Document Type</option>
                </select>
            </div>
            {/* Conditionally Render View Based on Selected Type */}
            {selectedView === 'card' ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {records.map((record) => (
                        <Card
                            key={record.id} // Use document ID as the key
                            className="group bg-gray-700 border border-gray-600 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg">
                            <div className="relative h-40 md:h-48 overflow-hidden">
                                <img
                                    src="/placeholder.svg" // Placeholder for document thumbnail
                                    alt="Document thumbnail"
                                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    style={{
                                        aspectRatio: '400/300',
                                        objectFit: 'cover'
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-gray-600 text-white hover:bg-gray-500">
                                        <EyeIcon className="h-5 w-5" />
                                        <span className="sr-only">
                                            View document
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="ml-2 bg-gray-600 text-white hover:bg-gray-500">
                                        <QrCodeIcon className="h-5 w-5" />
                                        <span className="sr-only">
                                            Generate QR Code
                                        </span>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="ml-2 bg-gray-600 text-white hover:bg-gray-500">
                                        <EditIcon className="h-5 w-5" />
                                        <span className="sr-only">
                                            Edit Document
                                        </span>
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-4 flex items-center justify-between">
                                <div className="text-sm font-medium">
                                    {record.title}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>
                                        {new Date(
                                            record.dateOfUpload
                                        ).toLocaleDateString()}
                                    </span>{' '}
                                    {/* Format date appropriately */}
                                </div>
                            </div>
                            <div className="mt-1 text-sm text-gray-400">
                                {record.handleBy}
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <table className="min-w-full bg-gray-700 text-white border border-gray-600">
                    <thead>
                        <tr className="border-b border-gray-600">
                            <th className="p-3 text-left">Title</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Shared With</th>
                            <th className="p-3 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((record) => (
                            <tr
                                key={record.id}
                                className="border-b border-gray-600">
                                <td className="p-3">{record.title}</td>
                                <td className="p-3">
                                    {new Date(
                                        record.dateOfUpload
                                    ).toLocaleDateString()}
                                </td>
                                <td className="p-3">{record.handleBy}</td>
                                <td className="p-3">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className="bg-gray-600 text-white hover:bg-gray-500">
                                        <EyeIcon className="h-5 w-5" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <UploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}

export default DocumentsRecords
