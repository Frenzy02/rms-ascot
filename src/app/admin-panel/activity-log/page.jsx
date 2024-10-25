import { useEffect, useState } from 'react'
import { Eye, Search, User, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { fetchFilesWithViews } from '@/services/api/appwrite'

const ActivityLog = () => {
    const [filesData, setFilesData] = useState([])
    const [filter, setFilter] = useState('')
    const [expandedRows, setExpandedRows] = useState([])

    useEffect(() => {
        const getFilesData = async () => {
            try {
                const data = await fetchFilesWithViews()
                console.log('Fetched files data:', data)
                setFilesData(data)
            } catch (error) {
                console.error('Failed to load activity log:', error)
            }
        }
        getFilesData()
    }, [])

    const toggleRow = (fileId) => {
        setExpandedRows((prev) =>
            prev.includes(fileId)
                ? prev.filter((id) => id !== fileId)
                : [...prev, fileId]
        )
    }

    const filteredData = filter
        ? filesData.filter((file) =>
              file.title.toLowerCase().includes(filter.toLowerCase())
          )
        : filesData

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
                Activity Log
            </h1>

            <div className="flex items-center space-x-2 bg-white p-3 rounded-lg shadow-md mb-6 max-w-2xl mx-auto">
                <Input
                    type="text"
                    placeholder="Search by file name, user, or date"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-grow border-2 border-gray-300 focus:border-blue-500 rounded-lg p-2"
                />
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-blue-600 text-white hover:bg-blue-500 p-3 rounded-full">
                    <Search className="h-5 w-5" />
                </Button>
            </div>

            <Card className="overflow-hidden bg-white shadow-lg rounded-lg max-w-4xl mx-auto">
                <CardHeader className="bg-blue-700 text-white p-4 rounded-t-lg">
                    <CardTitle className="text-lg grid grid-cols-12 gap-4 items-center">
                        <span className="col-span-6 font-semibold">
                            File Name
                        </span>
                        <span className="col-span-3 text-center font-semibold">
                            Views
                        </span>
                        <span className="col-span-3 text-center font-semibold">
                            Last Viewed
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {filteredData.length > 0 ? (
                        filteredData.map((file) => (
                            <div
                                key={file.fileId}
                                className="border-b last:border-b-0">
                                <div
                                    className="grid grid-cols-12 gap-4 items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                    onClick={() => toggleRow(file.fileId)}>
                                    <span className="col-span-6 font-medium flex items-center text-gray-800">
                                        <FileText className="h-6 w-6 mr-3 text-blue-600" />
                                        {file.title}
                                    </span>
                                    <span className="col-span-3 text-center flex items-center justify-center text-gray-800">
                                        <Eye className="h-5 w-5 mr-1 text-blue-600" />
                                        {file.views}
                                    </span>
                                    <span className="col-span-3 text-center text-sm text-gray-600">
                                        {file.viewers.length > 0
                                            ? new Date(
                                                  file.viewers[
                                                      file.viewers.length - 1
                                                  ].viewTime
                                              ).toLocaleString()
                                            : 'Never'}
                                    </span>
                                </div>
                                {expandedRows.includes(file.fileId) && (
                                    <div className="bg-blue-50 p-4 border-t border-blue-200">
                                        <div className="grid grid-cols-3 gap-4 p-2 font-semibold text-gray-700 border-b border-gray-300">
                                            <span>Viewer</span>
                                            <span className="text-center">
                                                Department
                                            </span>
                                            <span className="text-right">
                                                View Date
                                            </span>
                                        </div>
                                        {file.viewers.length > 0 ? (
                                            file.viewers.map(
                                                (viewer, index) => (
                                                    <div
                                                        key={index}
                                                        className="grid grid-cols-3 gap-4 text-sm bg-white p-3 rounded-lg shadow-sm border-b border-gray-200">
                                                        <span className="font-medium text-gray-800">
                                                            {`${viewer.firstName} ${viewer.lastName}`}
                                                        </span>
                                                        <span className="text-gray-600 flex items-center justify-center">
                                                            {viewer.department}
                                                        </span>
                                                        <span className="text-gray-600 text-right flex items-center justify-end">
                                                            <Calendar className="h-4 w-4 mr-1" />
                                                            {new Date(
                                                                viewer.viewTime
                                                            ).toLocaleString()}
                                                        </span>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p className="text-gray-600 p-4">
                                                No viewers found.
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-600 p-6">
                            No activity logs found.
                        </p>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default ActivityLog
