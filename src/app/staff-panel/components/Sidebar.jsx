import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Folder,
    File,
    Trash,
    Home,
    Star,
    Cloud,
    Plus,
    Settings,
    LogOut
} from 'lucide-react'
import ModalContent from './ui/ModalContent'

export default function Sidebar({ selectedItem, setSelectedItem }) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const sidebarItems = [
        {
            name: 'My Documents',
            icon: <Home className="w-4 h-4" />,
            color: 'bg-blue-500'
        },
        {
            name: 'Starred',
            icon: <Star className="w-4 h-4" />,
            color: 'bg-yellow-500'
        },
        {
            name: 'Shared with me',
            icon: <Cloud className="w-4 h-4" />,
            color: 'bg-green-500'
        },
        {
            name: 'Trash',
            icon: <Trash className="w-4 h-4" />,
            color: 'bg-red-500'
        }
    ]
    const handleLogout = async () => {
        try {
            const response = await fetch('/api/logout', {
                method: 'POST',
                credentials: 'include' // Include cookies with the request
            })

            if (response.ok) {
                console.log('Logout successful')
                window.location.href = '/' // Redirect to main page after logout
            } else {
                const data = await response.json() // Get the JSON response
                console.error('Logout failed:', data)
            }
        } catch (error) {
            console.error('An error occurred during logout:', error)
        }
    }

    return (
        <div className="w-64 bg-white p-4 flex flex-col shadow-lg">
            {/* New Button to open Modal */}
            <Button
                onClick={() => setIsModalOpen(true)}
                className="mb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                New
            </Button>

            {/* Sidebar Items */}
            <ScrollArea className="flex-grow">
                {sidebarItems.map((item) => (
                    <Button
                        key={item.name}
                        variant="ghost"
                        className={`w-full justify-start mb-2 ${
                            selectedItem === item.name
                                ? item.color + ' text-white'
                                : ''
                        }`}
                        onClick={() => setSelectedItem(item.name)}>
                        <div
                            className={`p-1 rounded-full ${item.color} text-white mr-2`}>
                            {item.icon}
                        </div>
                        <span>{item.name}</span>
                    </Button>
                ))}
            </ScrollArea>

            {/* Logout Button */}
            <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start mt-4 text-red-500">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
            </Button>

            {/* Settings Button */}
            <Button variant="ghost" className="w-full justify-start mt-auto">
                <Settings className="w-4 h-4 mr-2" />
                Settings
            </Button>

            {/* Modal Component */}
            {isModalOpen && (
                <ModalContent onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    )
}
