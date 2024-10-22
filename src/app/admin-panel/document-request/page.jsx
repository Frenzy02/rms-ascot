import { useState, useEffect } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { CheckCircle, XCircle, Upload, FileText } from 'lucide-react'
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
import { toast } from 'react-toastify'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

const DocumentRequestsTab = () => {
    const [requests, setRequests] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const [loading, setLoading] = useState(false)
    const itemsPerPage = 5

    // Fetch document requests
    useEffect(() => {
        const loadRequests = async () => {
            setLoading(true)
            try {
                const data = await fetchDocumentRequests()
                setRequests(data)
                toast.success('Requests loaded successfully')
            } catch (error) {
                console.error('Failed to load document requests:', error)
                toast.error('Failed to load document requests')
            } finally {
                setLoading(false)
            }
        }
        loadRequests()
    }, [])

    // Handle approve
    const handleApprove = async (documentId) => {
        setLoading(true)
        try {
            await handleDocumentRequest(documentId, 'approve')
            updateRequestStatus(documentId, 'approved')
            toast.success('Request approved successfully!')
        } catch (error) {
            toast.error('Failed to approve request')
        } finally {
            setLoading(false)
        }
    }

    // Handle reject
    const handleReject = async (documentId, fileId) => {
        setLoading(true)
        try {
            await handleDocumentRequest(documentId, 'reject')
            updateRequestStatus(documentId, 'rejected')
            toast.success('Request rejected successfully!')
        } catch (error) {
            toast.error('Failed to reject request')
        } finally {
            setLoading(false)
        }
    }

    // Update request status in local state
    const updateRequestStatus = (documentId, status) => {
        setRequests((prevRequests) =>
            prevRequests.map((req) =>
                req.$id === documentId ? { ...req, status } : req
            )
        )
    }

    // Handle search input
    const handleSearch = (e) => setSearchTerm(e.target.value)

    // Handle filter change
    const handleFilterChange = (value) => setFilterType(value)

    // Filter and search logic
    const filteredRequests = requests.filter((req) => {
        const matchesSearch =
            req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.handleBy?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            req.controlNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesFilter =
            filterType === 'all' || req.fileType === filterType
        return matchesSearch && matchesFilter
    })

    // Pagination logic
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Navigate to next page
    const handleNextPage = () => {
        if (currentPage * itemsPerPage < filteredRequests.length) {
            setCurrentPage((prev) => prev + 1)
        }
    }

    // Navigate to previous page
    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prev) => prev - 1)
        }
    }

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-3xl font-bold">Document Requests</h1>
                <p className="text-purple-100">
                    Manage and review document requests.
                </p>
            </div>

            {/* Search and Filter Section */}
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
                    </Button>
                </div>
                <Select onValueChange={handleFilterChange}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-white">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="upload">Upload Request</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Document Requests Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {loading ? (
                    <p className="text-center p-4">Loading requests...</p>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-100">
                                <TableHead>Request Type</TableHead>
                                <TableHead>Staff Name</TableHead>
                                <TableHead>File Name</TableHead>
                                <TableHead>Control Number</TableHead>
                                <TableHead>Request Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Approved/Rejection Date</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRequests.map((request) => (
                                <TableRow
                                    key={request.$id}
                                    className="hover:bg-purple-50">
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className="bg-green-500 text-white flex items-center space-x-1">
                                            Upload Request
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
                                    <TableCell>
                                        {new Date(
                                            request.requestDate
                                        ).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`${
                                                request.status === 'approved'
                                                    ? 'bg-green-500 text-white'
                                                    : request.status ===
                                                      'rejected'
                                                    ? 'bg-red-500 text-white'
                                                    : 'bg-yellow-500 text-white'
                                            }`}>
                                            {request.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'approved' &&
                                        request.approvedAt
                                            ? new Date(
                                                  request.approvedAt
                                              ).toLocaleString()
                                            : request.status === 'rejected' &&
                                              request.rejectedAt
                                            ? new Date(
                                                  request.rejectedAt
                                              ).toLocaleString()
                                            : 'Pending'}
                                    </TableCell>
                                    <TableCell>
                                        {request.status === 'pending' && (
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        handleApprove(
                                                            request.$id
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
                                                            request.$id,
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

            {/* Pagination */}
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
