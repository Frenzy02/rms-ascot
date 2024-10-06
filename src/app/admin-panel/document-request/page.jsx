import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
    CheckCircle,
    XCircle,
    Search,
    ChevronLeft,
    ChevronRight,
    Upload,
    Download,
    FileText
} from 'lucide-react'

// Mock data for demonstration
const mockRequests = [
    {
        id: 1,
        type: 'upload',
        staffName: 'John Doe',
        fileName: 'Annual Report 2023.pdf',
        controlNumber: 'DOC-2023-001',
        requestDate: '2023-05-15',
        status: 'pending'
    },
    {
        id: 2,
        type: 'download',
        staffName: 'Jane Smith',
        fileName: 'Financial Statement Q2.xlsx',
        controlNumber: 'DOC-2023-002',
        requestDate: '2023-05-14',
        status: 'pending'
    },
    {
        id: 3,
        type: 'upload',
        staffName: 'Mike Johnson',
        fileName: 'Employee Handbook v2.docx',
        controlNumber: 'DOC-2023-003',
        requestDate: '2023-05-13',
        status: 'approved'
    },
    {
        id: 4,
        type: 'download',
        staffName: 'Sarah Williams',
        fileName: 'Project Proposal.pptx',
        controlNumber: 'DOC-2023-004',
        requestDate: '2023-05-12',
        status: 'rejected'
    }
    // Add more mock data as needed
]

export default function DocumentRequestsTab() {
    const [requests, setRequests] = useState(mockRequests)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5

    const handleSearch = (event) => {
        setSearchTerm(event.target.value)
    }

    const handleFilterChange = (value) => {
        setFilterType(value)
    }

    const handleApprove = (id) => {
        setRequests(
            requests.map((req) =>
                req.id === id ? { ...req, status: 'approved' } : req
            )
        )
    }

    const handleReject = (id) => {
        setRequests(
            requests.map((req) =>
                req.id === id ? { ...req, status: 'rejected' } : req
            )
        )
    }

    const filteredRequests = requests.filter(
        (req) =>
            (filterType === 'all' || req.type === filterType) &&
            (req.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                req.controlNumber
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()))
    )

    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    const handleNextPage = () => {
        if (currentPage * itemsPerPage < filteredRequests.length) {
            setCurrentPage((prevPage) => prevPage + 1)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage((prevPage) => prevPage - 1)
        }
    }

    return (
        <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-lg shadow-lg mb-6">
                <h1 className="text-3xl font-bold">Document Requests</h1>
                <p className="text-purple-100">
                    Manage and review document requests
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
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-100">
                            <TableHead className="font-bold">Type</TableHead>
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
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedRequests.map((request) => (
                            <TableRow
                                key={request.id}
                                className="hover:bg-purple-50 transition-colors">
                                <TableCell>
                                    <Badge
                                        variant="outline"
                                        className={`${
                                            request.type === 'upload'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                        } flex items-center space-x-1`}>
                                        {request.type === 'upload' ? (
                                            <Upload className="w-4 h-4" />
                                        ) : (
                                            <Download className="w-4 h-4" />
                                        )}
                                        <span>{request.type}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell>{request.staffName}</TableCell>
                                <TableCell className="flex items-center space-x-2">
                                    <FileText className="w-4 h-4 text-gray-400" />
                                    <span>{request.fileName}</span>
                                </TableCell>
                                <TableCell>{request.controlNumber}</TableCell>
                                <TableCell>{request.requestDate}</TableCell>
                                <TableCell>
                                    <Badge
                                        variant={
                                            request.status === 'approved'
                                                ? 'success'
                                                : request.status === 'rejected'
                                                ? 'destructive'
                                                : 'default'
                                        }
                                        className={`${
                                            request.status === 'approved'
                                                ? 'bg-green-100 text-green-800'
                                                : request.status === 'rejected'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-yellow-100 text-yellow-800'
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
                                                    handleApprove(request.id)
                                                }
                                                className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700">
                                                <CheckCircle className="w-4 h-4 mr-1" />{' '}
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() =>
                                                    handleReject(request.id)
                                                }
                                                className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700">
                                                <XCircle className="w-4 h-4 mr-1" />{' '}
                                                Reject
                                            </Button>
                                        </div>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
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
