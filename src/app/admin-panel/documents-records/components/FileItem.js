// src/components/FileItem.js
import React from 'react';
import { EyeIcon, QrCodeIcon, EditIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const FileItem = ({ file, onView, onEdit, onGenerateQR, onDelete }) => {
    return (
        <Card className="group bg-gray-700 border border-gray-600 rounded-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-lg w-64">
            <div className="relative h-32 overflow-hidden">
                <img
                    src="/placeholder.svg" // Placeholder for file thumbnail
                    alt="File thumbnail"
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
                        className="bg-gray-600 text-white hover:bg-gray-500"
                        onClick={onView}
                    >
                        <EyeIcon className="h-4 w-4" />
                        <span className="sr-only">View file</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 bg-gray-600 text-white hover:bg-gray-500"
                        onClick={onGenerateQR}
                    >
                        <QrCodeIcon className="h-4 w-4" />
                        <span className="sr-only">Generate QR Code</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 bg-gray-600 text-white hover:bg-gray-500"
                        onClick={onEdit}
                    >
                        <EditIcon className="h-4 w-4" />
                        <span className="sr-only">Edit file</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="ml-2 bg-gray-600 text-white hover:bg-gray-500"
                        onClick={onDelete}
                    >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete file</span>
                    </Button>
                </div>
            </div>
            <div className="p-3">
                <div className="text-sm font-medium text-white truncate">{file.name}</div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{file.type}</span> • <span>{file.size}</span>
                </div>
                <div className="mt-1 text-xs text-gray-400">
                    {new Date(file.date).toLocaleDateString()}
                </div>
            </div>
        </Card>
    );
};

export default FileItem;
