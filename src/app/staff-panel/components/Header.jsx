import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export default function Header() {
    return (
        <header className="bg-white p-4 flex items-center justify-between shadow-md relative z-10">
            <div className="flex items-center w-full max-w-md bg-gray-100 rounded-full overflow-hidden ml-16 lg:ml-0">
                {' '}
                {/* Increased margin-left */}
                <Search className="w-4 h-4 mx-3 text-gray-500" />
                <Input
                    type="text"
                    placeholder="Search in Drive"
                    className="border-none bg-transparent focus:outline-none"
                />
            </div>
        </header>
    )
}
