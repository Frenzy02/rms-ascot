import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { CheckCircle, XCircle, Upload, Download, FileText } from 'lucide-react'
import {
    fetchDocumentRequests,
    handleDocumentRequest
} from '@/services/api/appwrite'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify' // Import toast for notifications
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

const DocumentRequestsTab = () => {
    const [requests, setRequests] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false) // Loading state
    const itemsPerPage = 5

    useEffect(() => {
        const loadRequests = async () => {
            setLoading(true)
            try {
                const data = await fetchDocumentRequests()
                console.log('Fetched Document Requests:', data) // Log the fetched requests
                setRequests(data) // Ensure data is correctly formatted
            } catch (error) {
                console.error('Failed to load document requests:', error)
                toast.error(
                    'Failed to load document requests: ' + error.message
                ) // Display the error message
            } finally {
                setLoading(false)
            }
        }
        loadRequests()
    }, [])

    const handleApprove = async (id) => {
        try {
            setLoading(true)
            await handleDocumentRequest(id, 'approve')
            updateRequestStatus(id, 'approved')
            toast.success('Request approved successfully!')
        } catch (error) {
            console.error('Error approving request:', error)
            toast.error('Failed to approve request.')
        } finally {
            setLoading(false)
        }
    }

    const handleReject = async (id) => {
        try {
            setLoading(true)
            await handleDocumentRequest(id, 'reject')
            updateRequestStatus(id, 'rejected')
            toast.success('Request rejected successfully!')
        } catch (error) {
            console.error('Error rejecting request:', error)
            toast.error('Failed to reject request.')
        } finally {
            setLoading(false)
        }
    }

    const updateRequestStatus = (id, status) => {
        setRequests((prevRequests) =>
            prevRequests.map((req) =>
                req.fileId === id ? { ...req, status } : req
            )
        )
    }

    const handleSearch = (e) => setSearchTerm(e.target.value)
    const handleFilterChange = (value) => setFilterType(value)

    const filteredRequests = requests.filter(
        (req) =>
            (filterType === 'all' || req.fileType === filterType) &&
            (req.handleBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.controlNumber
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()))
    )

    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleNextPage = () => {
        if (currentPage * itemsPerPage < filteredRequests.length) {
            setCurrentPage((prev) => prev + 1)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
        }
    }

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-3xl font-bold">Document Requests</h1>
                <p className="text-purple-100">
                    Manage and review document requests.
                </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <Input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full sm:w-64 bg-white"
                    />
                    <Button variant="outline" className="bg-white">
                        <Search className="text-gray-400" />
                        <span className="sr-only">Search</span>
                    </Button>
                </div>
                <Select onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                        <SelectItem value="download">Download</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {loading ? (
                    <p className="text-center p-4">Loading requests...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead className="font-bold">
                                    Type
                                </TableHead>
                                <TableHead className="font-bold">
                                    Staff Name
                                </TableHead>
                                <TableHead className="font-bold">
                                    File Name
                                </TableHead>
                                <TableHead className="font-bold">
                                    Control Number
                                </TableHead>
                                <TableHead className="font-bold">
                                    Request Date
                                </TableHead>
                                <TableHead className="font-bold">
                                    Status
                                </TableHead>
                                <TableHead className="font-bold">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRequests.map((request) => (
                                <TableRow
                                    key={request.fileId}
                                    className="hover:bg-purple-50">
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`${
                                                request.fileType === 'upload'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            } flex items-center space-x-1`}>
                                            {request.fileType === 'upload' ? (
                                                <Upload className="w-4 h-4" />
                                            ) : (
                                                <Download className="w-4 h-4" />
                                            )}
                                            <span className="ml-2">
                                                {request.fileType}
                                            </span>
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{request.handleBy}</TableCell>
                                    <TableCell>
                                        <FileText className="mr-2" />
                                        {request.title}
                                    </TableCell>
                                    <TableCell>
                                        {request.controlNumber}
                                    </TableCell>
                                    <TableCell>{request.requestDate}</TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`${
                                                request.status === 'approved'
                                                    ? 'bg-green-100'
                                                    : request.status ===
                                                      'rejected'
                                                    ? 'bg-red-100'
                                                    : 'bg-yellow-100'
                                            }`}>
                                            {request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleApprove(
                                                            request.fileId
                                                        )
                                                    }
                                                    className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700">
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleReject(
                                                            request.fileId
                                                        )
                                                    }
                                                    className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-500">
                    Showing {paginatedRequests.length} of{' '}
                    {filteredRequests.length} requests
                </div>
                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}>
                        <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white"
                        onClick={handleNextPage}
                        disabled={
                            currentPage * itemsPerPage >=
                            filteredRequests.length
                        }>
                        Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default DocumentRequestsTab
