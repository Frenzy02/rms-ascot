import React from 'react'
import {
    File as FileIcon,
    Eye,
    Edit,
    Trash,
    Download,
    QrCode,
    Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FileItem({ file }) {
    // Ensure destructured values match the expected file object keys.
    const {
        title = 'Untitled File',
        fileType = 'Unknown Type',
        size = 'Unknown Size',
        createdAt
    } = file || {}

    return (
        <div className="group relative bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg overflow-hidden shadow-md transition-all duration-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-200 cursor-pointer">
            {/* File Icon */}
            <div className="aspect-video bg-white/50 flex items-center justify-center p-4">
                <FileIcon className="w-16 h-16 text-blue-500 group-hover:text-purple-700 transition-colors duration-300" />
            </div>

            {/* File Info */}
            <div className="p-4">
                <h2 className="text-lg font-medium truncate text-gray-800">
                    {title}
                </h2>
                <div className="flex items-center text-sm text-gray-600 mt-1 space-x-2">
                    <span className="bg-purple-200 text-purple-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {fileType}
                    </span>
                    <span className="bg-blue-200 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold">
                        {size}
                    </span>
                </div>
            </div>

            {/* File Date */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                        {createdAt
                            ? new Date(createdAt).toLocaleDateString()
                            : 'Unknown Date'}
                    </span>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex space-x-2">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900">
                        <Eye className="h-4 w-4 group-hover:text-white transition-colors duration-300" />
                        <span className="sr-only">View</span>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-green-400 hover:bg-green-500 text-green-900">
                        <Edit className="h-4 w-4 group-hover:text-white transition-colors duration-300" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-red-400 hover:bg-red-500 text-red-900">
                        <Trash className="h-4 w-4 group-hover:text-white transition-colors duration-300" />
                        <span className="sr-only">Delete</span>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-blue-400 hover:bg-blue-500 text-blue-900">
                        <Download className="h-4 w-4 group-hover:text-white transition-colors duration-300" />
                        <span className="sr-only">Download</span>
                    </Button>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="bg-purple-400 hover:bg-purple-500 text-purple-900">
                        <QrCode className="h-4 w-4 group-hover:text-white transition-colors duration-300" />
                        <span className="sr-only">QR Code</span>
                    </Button>
                </div>
            </div>
        </div>
    )
}
