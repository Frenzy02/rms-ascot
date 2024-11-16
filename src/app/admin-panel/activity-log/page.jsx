'use client'

import { useEffect, useState } from 'react'
import { Eye, Search, User, Calendar, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { fetchFilesWithViews } from '@/services/api/appwrite'

const ActivityLog = () => {
    const [filesData, setFilesData] = useState([])
    const [filter, setFilter] = useState('')
    const [sortOption, setSortOption] = useState('mostViewed')
    const [expandedRows, setExpandedRows] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(true) // Loading state
    const itemsPerPage = 7 // Number of items per page

    useEffect(() => {
        const getFilesData = async () => {
            setLoading(true) // Start loading
            try {
                const data = await fetchFilesWithViews()
                console.log('Fetched files data:', data)
                setFilesData(data)
            } catch (error) {
                console.error('Failed to load activity log:', error)
            } finally {
                setLoading(false) // Stop loading
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

    // Filtering logic
    const filteredData = filter
        ? filesData.filter((file) =>
              file.title.toLowerCase().includes(filter.toLowerCase())
          )
        : filesData

    // Sorting logic
    const sortedData = [...filteredData].sort((a, b) => {
        if (sortOption === 'mostViewed') {
            return b.views - a.views
        } else if (sortOption === 'leastViewed') {
            return a.views - b.views
        } else if (sortOption === 'fileNameAZ') {
            return a.title.localeCompare(b.title)
        }
        return 0
    })

    // Pagination logic
    const totalPages = Math.ceil(sortedData.length / itemsPerPage)
    const paginatedData = sortedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage)
    }

    const renderPageNumbers = () => {
        const pageNumbers = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`mx-1 px-4 py-2 rounded-md ${
                            currentPage === i
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}>
                        {i}
                    </button>
                )
            }
        } else {
            if (currentPage > 3) {
                pageNumbers.push(
                    <button
                        key={1}
                        onClick={() => handlePageChange(1)}
                        className="mx-1 px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400">
                        1
                    </button>
                )
                pageNumbers.push(<span key="ellipsis1">...</span>)
            }

            const startPage = Math.max(2, currentPage - 1)
            const endPage = Math.min(totalPages - 1, currentPage + 1)
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(
                    <button
                        key={i}
                        onClick={() => handlePageChange(i)}
                        className={`mx-1 px-4 py-2 rounded-md ${
                            currentPage === i
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}>
                        {i}
                    </button>
                )
            }

            if (currentPage < totalPages - 2) {
                pageNumbers.push(<span key="ellipsis2">...</span>)
                pageNumbers.push(
                    <button
                        key={totalPages}
                        onClick={() => handlePageChange(totalPages)}
                        className="mx-1 px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400">
                        {totalPages}
                    </button>
                )
            }
        }
        return pageNumbers
    }

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen">
            <h1 className="text-4xl font-bold mb-8 text-center text-orange-800">
                Activity Log
            </h1>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 bg-white p-3 rounded-lg shadow-md mb-6 max-w-2xl mx-auto">
                <Input
                    type="text"
                    placeholder="Search by file name, user, or date"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="flex-grow border-2 border-gray-300 focus:border-orange-500 rounded-lg p-2"
                />
                <Button
                    variant="outline"
                    size="icon"
                    className="bg-orange-600 text-white hover:bg-orange-500 p-3 rounded-full">
                    <Search className="h-5 w-5" />
                </Button>
                <Select onValueChange={setSortOption}>
                    <SelectTrigger className="bg-white border-gray-300 rounded-lg p-2">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="mostViewed">Most Viewed</SelectItem>
                        <SelectItem value="leastViewed">
                            Least Viewed
                        </SelectItem>
                        <SelectItem value="fileNameAZ">
                            File Name A-Z
                        </SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="w-12 h-12 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
                </div>
            ) : (
                <Card className="overflow-hidden bg-white shadow-lg rounded-lg max-w-4xl mx-auto">
                    <CardHeader className="bg-orange-700 text-white p-4 rounded-t-lg">
                        <CardTitle className="text-lg grid grid-cols-12 gap-4 items-center">
                            <span className="col-span-1 font-semibold text-center">
                                #
                            </span>
                            <span className="col-span-5 font-semibold">
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
                        {paginatedData.length > 0 ? (
                            paginatedData.map((file, index) => (
                                <div
                                    key={file.fileId}
                                    className="border-b last:border-b-0">
                                    <div
                                        className="grid grid-cols-12 gap-4 items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                                        onClick={() => toggleRow(file.fileId)}>
                                        <span className="col-span-1 text-center font-medium text-gray-800">
                                            {(currentPage - 1) * itemsPerPage +
                                                index +
                                                1}
                                        </span>
                                        <span className="col-span-5 font-medium flex items-center text-gray-800">
                                            <FileText className="h-6 w-6 mr-3 text-orange-600" />
                                            {file.title}
                                        </span>
                                        <span className="col-span-3 text-center flex items-center justify-center text-gray-800">
                                            <Eye className="h-5 w-5 mr-1 text-orange-600" />
                                            {file.views}
                                        </span>
                                        <span className="col-span-3 text-center text-sm text-gray-600">
                                            {file.viewers.length > 0
                                                ? new Date(
                                                      file.viewers[
                                                          file.viewers.length -
                                                              1
                                                      ].viewTime
                                                  ).toLocaleString()
                                                : 'Never'}
                                        </span>
                                    </div>
                                    {expandedRows.includes(file.fileId) && (
                                        <div className="bg-orange-50 p-4 border-t border-orange-200">
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
                                                    (viewer, viewerIndex) => (
                                                        <div
                                                            key={viewerIndex}
                                                            className="grid grid-cols-3 gap-4 text-sm bg-white p-3 rounded-lg shadow-sm border-b border-gray-200">
                                                            <span className="font-medium text-gray-800">
                                                                {`${viewer.firstName} ${viewer.lastName}`}
                                                            </span>
                                                            <span className="text-gray-600 flex items-center justify-center">
                                                                {
                                                                    viewer.department
                                                                }
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
            )}

            {/* Pagination Controls */}
            <div className="flex justify-center mt-6">
                {renderPageNumbers()}
            </div>
        </div>
    )
}

export default ActivityLog
