import { Folder as FolderIcon } from 'lucide-react' // Import a folder icon

const ListView = ({ folder }) => (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-md hover:bg-gradient-to-r from-green-400 to-blue-500 transition">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500 text-white mr-4">
            <FolderIcon className="w-6 h-6 text-white" /> {/* Folder icon */}
        </div>
        <div className="flex-grow">
            <h3 className="text-lg font-medium">{folder.name}</h3>
            <p className="text-sm text-gray-500">
                Created on: {folder.createdAt}
            </p>
        </div>
        <span className="text-sm bg-blue-500 text-white px-2 py-1 rounded-md">
            {folder.files ? folder.files.length : 0} Files
        </span>
    </div>
)

export default ListView
