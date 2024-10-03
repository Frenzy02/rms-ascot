import React, { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card'
import { storage } from '../../lib/firebase' // Ensure this path is correct
import { ref, uploadBytes } from 'firebase/storage'

const Modal = ({ toggleModal, userId }) => {
    const [formData, setFormData] = useState({ fileTitle: '' })
    const [file, setFile] = useState(null)

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!file) {
            Swal.fire('Error', 'Please select a file to upload', 'error')
            return
        }

        // Include the user ID in the file name
        const fileName = `${userId}_${file.name}`
        const storageRef = ref(storage, `uploads/${fileName}`)

        try {
            await uploadBytes(storageRef, file)
            Swal.fire('Success', 'File uploaded successfully', 'success')
            toggleModal()
        } catch (error) {
            console.error('Error uploading file:', error)
            Swal.fire('Error', 'Failed to upload file', 'error')
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <Card className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 mx-4 sm:mx-auto">
                <button
                    className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"
                    onClick={toggleModal}>
                    ✖
                </button>
                <CardHeader className="hidden sm:block">
                    <CardTitle className="text-center text-xl font-bold text-gray-800">
                        Medical File Upload
                    </CardTitle>
                    <CardDescription className="text-center text-gray-500">
                        Please fill in the details below
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <label
                                htmlFor="fileTitle"
                                className="block text-sm font-medium text-gray-600">
                                Title of the File
                            </label>
                            <input
                                type="text"
                                id="fileTitle"
                                name="fileTitle"
                                value={formData.fileTitle}
                                onChange={handleInputChange}
                                className="mt-1 block w-full px-4 py-2 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 border border-gray-300 text-gray-800"
                                placeholder="Enter the title of the file"
                                required
                            />
                        </div>
                        <div className="relative">
                            <label
                                htmlFor="file"
                                className="block text-sm font-medium text-gray-600">
                                Upload File
                            </label>
                            <input
                                type="file"
                                id="file"
                                onChange={handleFileChange}
                                className="mt-1 block w-full text-sm text-gray-800 border border-gray-300 rounded-lg bg-gray-50 file:bg-indigo-600 file:text-white file:mr-4 file:py-2 file:px-4"
                            />
                        </div>
                        <CardFooter className="flex justify-center">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-md hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 text-sm">
                                Submit
                            </button>
                        </CardFooter>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default Modal
