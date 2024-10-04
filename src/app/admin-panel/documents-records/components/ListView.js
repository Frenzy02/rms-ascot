// src/components/ListView.js
const ListView = ({ folder }) => (
    <div className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:bg-gray-50">
        <div
            className={`${folder.color} w-10 h-10 rounded-full flex items-center justify-center text-white mr-4`}>
            {folder.icon}
        </div>
        <h3 className="text-lg font-medium">{folder.name}</h3>
    </div>
)

export default ListView
