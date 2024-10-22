import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Folder, File, Search } from 'lucide-react'

const MainContent = ({
    searchTerm,
    setSearchTerm,
    currentPath,
    handleItemClick
}) => {
    const filteredItems = currentPath.filter(
        (item) =>
            item.name &&
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center flex-grow mr-4">
                    <Input
                        type="text"
                        placeholder="Search document you want to view..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow mr-2 rounded-lg border-2 border-purple-500 shadow-sm"
                    />
                    <Search className="w-5 h-5 text-gray-500" />
                </div>
            </div>

            <ScrollArea className="relative z-10 flex-grow mb-4 bg-white bg-opacity-50 rounded-lg shadow-lg p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <Button
                                key={item.id}
                                variant="outline"
                                className={`h-24 flex flex-col items-center justify-center text-center p-2 ${item.color} text-white rounded-lg shadow-md hover:shadow-xl transform hover:scale-105 transition duration-300`}
                                onClick={() => handleItemClick(item)}>
                                {item.type === 'folder' ? (
                                    <Folder className="w-8 h-8 mb-2" />
                                ) : (
                                    <File className="w-8 h-8 mb-2" />
                                )}
                                <span className="text-sm font-medium truncate w-full">
                                    {item.name}
                                </span>
                            </Button>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center col-span-4">
                            No documents found.
                        </p>
                    )}
                </div>
            </ScrollArea>
        </>
    )
}

export default MainContent
