import { Folder as FolderIcon } from 'lucide-react' // Import a folder icon

const CardView = ({ folder }) => (
    <div className="p-4 rounded-lg shadow-md bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-pink-500 hover:to-yellow-500 transition-transform transform hover:scale-105">
        <div className="flex justify-between items-center mb-2">
            <FolderIcon className="w-8 h-8 text-white" /> {/* Folder icon */}
            <span className="text-sm bg-white text-purple-500 px-2 py-1 rounded-md">
                {folder.files ? folder.files.length : 0} Files
            </span>
        </div>
        <h3 className="text-lg font-semibold">{folder.name}</h3>
    </div>
)

export default CardView
