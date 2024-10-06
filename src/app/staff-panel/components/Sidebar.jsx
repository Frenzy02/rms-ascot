import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Home,
    Plus,
    Bell,
    LogOut,
    Menu,
    X,
    FileText,
    Settings
} from 'lucide-react'
import ModalContent from './ui/ModalContent'
import { motion, AnimatePresence } from 'framer-motion'

export default function Sidebar({ selectedItem, setSelectedItem, onLogout }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(true)
            } else {
                setIsSidebarOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize() // Call on initial render

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const sidebarItems = [
        {
            name: 'My Documents',
            icon: <Home className="w-5 h-5" />,
            color: 'from-blue-500 to-cyan-500'
        }
    ]

    return (
        <div className="relative h-full">
            {/* Toggle Button for Mobile View */}
            <Button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`fixed top-4 z-50 bg-gradient-to-r from-indigo-500 to-purple-600 
                    text-white shadow-lg transition-all duration-300 ease-in-out
                    ${isSidebarOpen ? 'left-[260px]' : 'left-4'} lg:hidden`}
                aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}>
                {isSidebarOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
            </Button>

            {/* Sidebar */}
            <AnimatePresence>
                {(isSidebarOpen || window.innerWidth >= 1024) && (
                    <motion.div
                        initial={{ x: -300 }}
                        animate={{ x: 0 }}
                        exit={{ x: -300 }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 30
                        }}
                        className="fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-purple-700 via-purple-800 to-blue-900 p-6 shadow-2xl overflow-hidden lg:relative lg:h-full">
                        <div className="flex flex-col h-full">
                            {/* New Button to open Modal */}
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="mb-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 shadow-md transition-all duration-300 transform hover:scale-105">
                                <Plus className="w-5 h-5 mr-2" />
                                New Document
                            </Button>

                            {/* Sidebar Items */}
                            <ScrollArea className="flex-grow -mx-2 px-2">
                                {sidebarItems.map((item) => (
                                    <Button
                                        key={item.name}
                                        variant="ghost"
                                        className={`w-full justify-start mb-3 text-left transition-all duration-300 ${
                                            selectedItem === item.name
                                                ? `bg-gradient-to-r ${item.color} text-white shadow-md`
                                                : 'text-gray-200 hover:text-white hover:bg-white/10'
                                        }`}
                                        onClick={() => {
                                            setSelectedItem(item.name)
                                            if (window.innerWidth < 1024)
                                                setIsSidebarOpen(false)
                                        }}>
                                        <div className="p-2 rounded-full bg-white/20 mr-3">
                                            {item.icon}
                                        </div>
                                        <span className="font-medium">
                                            {item.name}
                                        </span>
                                    </Button>
                                ))}
                            </ScrollArea>

                            {/* Notification Button */}
                            <Button
                                variant="ghost"
                                className="w-full justify-start mt-auto mb-4 text-gray-200 hover:text-white hover:bg-white/10">
                                <Bell className="w-5 h-5 mr-3" />
                                Notifications
                            </Button>

                            {/* Logout Button */}
                            <Button
                                onClick={onLogout}
                                variant="ghost"
                                className="w-full justify-start text-red-300 hover:text-red-100 hover:bg-red-500/30">
                                <LogOut className="w-5 h-5 mr-3" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Overlay for mobile view */}
            <AnimatePresence>
                {isSidebarOpen && window.innerWidth < 1024 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black z-30 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Modal Component */}
            {isModalOpen && (
                <ModalContent onClose={() => setIsModalOpen(false)} />
            )}
        </div>
    )
}
