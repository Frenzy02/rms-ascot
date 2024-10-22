'use client'

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
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash2, UserPlus } from 'lucide-react'

// Define initial users as a constant JavaScript object
const initialUsers = [
    {
        id: 1,
        name: 'Christian Vallejos',
        email: 'christian@gmail.com',
        role: 'Admin'
    },
    {
        id: 2,
        name: 'Mikey Del Rosario',
        email: 'mikey@gmail.com',
        role: 'Staff'
    },
    { id: 3, name: 'Krita Cluag', email: 'kritagmail.com', role: 'Staff' },
    { id: 4, name: 'Juan Dela Cruz', email: 'juangmail.com', role: 'Viewer' }
]

export default function Component() {
    const [users, setUsers] = useState(initialUsers)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredUsers = users.filter(
        (user) =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.role.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleDelete = (id) => {
        setUsers(users.filter((user) => user.id !== id))
    }

    const getRoleBadgeColor = (role) => {
        switch (role) {
            case 'Admin':
                return 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
            case 'Editor':
                return 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600'
            case 'Viewer':
                return 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600'
            default:
                return 'bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600'
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-100">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 shadow-md">
                <div className="container mx-auto">
                    <h1 className="text-4xl font-bold mb-4 text-white">
                        User Management
                    </h1>
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <Input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="max-w-sm bg-white/20 text-white placeholder-white/70 border-white/30"
                        />
                        <Button className="bg-green-500 hover:bg-green-600 text-white">
                            <UserPlus className="mr-2 h-4 w-4" /> Add New User
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-auto p-6">
                <div className="container mx-auto bg-white rounded-lg shadow-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="text-lg font-bold text-gray-800">
                                    Name
                                </TableHead>
                                <TableHead className="text-lg font-bold text-gray-800">
                                    Email
                                </TableHead>
                                <TableHead className="text-lg font-bold text-gray-800">
                                    Role
                                </TableHead>
                                <TableHead className="text-lg font-bold text-gray-800">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow
                                    key={user.id}
                                    className="hover:bg-gray-50 transition-colors">
                                    <TableCell className="font-medium text-gray-900">
                                        {user.name}
                                    </TableCell>
                                    <TableCell className="text-gray-700">
                                        {user.email}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={`${getRoleBadgeColor(
                                                user.role
                                            )} text-white font-semibold px-3 py-1`}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="text-blue-500 hover:text-blue-600 hover:border-blue-600">
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() =>
                                                    handleDelete(user.id)
                                                }
                                                className="text-red-500 hover:text-red-600 hover:border-red-600">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
