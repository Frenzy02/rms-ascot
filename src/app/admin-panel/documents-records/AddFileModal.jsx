import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import ReactSelect from 'react-select'
import { Upload, X, FileUp } from 'lucide-react'

export default function AddFileModal({
    show,
    onClose,
    newFileTitle,
    setNewFileTitle,
    newFileDescription,
    setNewFileDescription,
    newFileType,
    setNewFileType,
    restrictedUsers,
    setRestrictedUsers,
    allUsers,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    uploadedFile,
    isLoading,
    handleAddFile
}) {
    if (!show) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto overflow-hidden">
                <div className="p-6 space-y-4 max-h-[90vh]">
                    <div className="flex justify-between items-center bg-orange-600 px-6 py-4 mb-4">
                        <h2 className="text-2xl font-bold text-white">
                            Upload Document
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-white hover:bg-orange-700 rounded-full">
                            <X className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="title" className="text-orange-600">
                                Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="Enter document title"
                                value={newFileTitle}
                                onChange={(e) =>
                                    setNewFileTitle(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="description"
                                className="text-orange-600">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                placeholder="Enter document description"
                                value={newFileDescription}
                                onChange={(e) =>
                                    setNewFileDescription(e.target.value)
                                }
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="fileType"
                                className="text-orange-600">
                                File Type
                            </Label>
                            <select
                                id="fileType"
                                value={newFileType}
                                onChange={(e) => setNewFileType(e.target.value)}
                                className="w-full p-2 border rounded-md border-orange-300 focus:ring-orange-500">
                                <option value="PDF">PDF</option>
                                <option value="DOC">DOC</option>
                            </select>
                        </div>
                        <div>
                            <Label
                                htmlFor="restrictedUsers"
                                className="text-orange-600">
                                Restrict Access
                            </Label>
                            <ReactSelect
                                id="restrictedUsers"
                                options={allUsers.map((user) => ({
                                    value: user.id,
                                    label: user.name
                                }))}
                                value={allUsers.filter((user) =>
                                    restrictedUsers.includes(user.id)
                                )}
                                onChange={(selectedOptions) =>
                                    setRestrictedUsers(
                                        selectedOptions.map(
                                            (option) => option.value
                                        )
                                    )
                                }
                                isMulti
                                placeholder="Select users to restrict"
                            />
                        </div>
                        <div className="col-span-2">
                            <Label htmlFor="file" className="text-orange-600">
                                Attach File
                            </Label>
                            <div
                                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                                    dragActive
                                        ? 'border-orange-500'
                                        : 'border-orange-300'
                                }`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}>
                                <div className="space-y-1 text-center">
                                    <FileUp className="mx-auto h-12 w-12 text-orange-500" />
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="file-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none">
                                            <span>Attach a file</span>
                                            <input
                                                id="file-upload"
                                                name="file-upload"
                                                type="file"
                                                className="sr-only"
                                                onChange={handleFileUpload}
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        PDF, DOC, DOCX, ISO up to 10MB
                                    </p>
                                    {uploadedFile && (
                                        <p className="text-xs text-green-500 mt-2">
                                            Attached: {uploadedFile.name}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            className="text-orange-600 border-orange-600">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddFile}
                            disabled={isLoading}
                            className="bg-orange-500 hover:bg-orange-600 text-white">
                            {isLoading ? (
                                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                                <Upload className="w-4 h-4 mr-2" />
                            )}
                            {isLoading ? 'Uploading...' : 'Upload'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
