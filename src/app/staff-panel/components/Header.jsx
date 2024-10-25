import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Header({ searchTerm, setSearchTerm, selectedItem }) {
    // Determine the placeholder text based on the active tab (selectedItem)
    const placeholderText =
        selectedItem === 'Search Documents'
            ? 'Search in uploaded files' // Placeholder for "Search Documents" tab
            : 'Search your documents' // Placeholder for "My Documents" tab

    // Handle search term change
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value) // Update the search term based on user input
    }

    return (
        <header className="bg-white p-4 flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center w-full max-w-md bg-gray-100 rounded-full overflow-hidden ml-16 lg:ml-0">
                <Search className="w-4 h-4 mx-3 text-gray-500" />
                <Input
                    type="text"
                    placeholder={placeholderText} // Dynamic placeholder based on the active tab
                    value={searchTerm}
                    onChange={handleSearchChange} // Handle the search input change
                    className="border-none bg-transparent focus:outline-none"
                />
            </div>
        </header>
    )
}
