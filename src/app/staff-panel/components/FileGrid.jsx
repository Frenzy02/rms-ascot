import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { File, Folder } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { fetchUserFiles } from '@/services/api/user-management'

export default function FileGrid({ selectedItem, userId }) {
    const [files, setFiles] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const getFiles = async () => {
            setLoading(true) // Start loading
            setError(null) // Clear previous errors
            try {
                const userFiles = await fetchUserFiles(userId) // Use helper function
                setFiles(userFiles)
            } catch (err) {
                console.error('Error fetching files:', err)
                setError('Failed to load files')
            } finally {
                setLoading(false) // End loading
            }
        }

        if (userId) {
            getFiles()
        }
    }, [userId]) // Run this effect only when userId changes

    if (loading) {
        return <p>Loading files...</p>
    }

    if (error) {
        return <p>{error}</p>
    }

    return (
        <ScrollArea className="flex-1 p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {selectedItem}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {files.length > 0 ? (
                    files.map((item) => (
                        <Button
                            key={item.id}
                            variant="outline"
                            className="h-32 flex flex-col items-center justify-center text-center p-2 rounded-lg shadow-md transition-all duration-300 ease-in-out transform hover:scale-105 bg-blue-500 text-white">
                            <div className="bg-white p-2 rounded-full mb-2">
                                {item.type === 'file' ? (
                                    <File className="w-4 h-4" />
                                ) : (
                                    <Folder className="w-4 h-4" />
                                )}
                            </div>
                            <span className="mt-2 text-sm font-medium">
                                {item.title || 'Untitled'}
                            </span>
                        </Button>
                    ))
                ) : (
                    <p>No files uploaded yet.</p>
                )}
            </div>
        </ScrollArea>
    )
}
