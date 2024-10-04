// src/components/CardView.js
const CardView = ({ folder }) => (
    <div
        className={`${folder.color} p-6 rounded-lg shadow-md text-white transition-transform hover:scale-105`}>
        <div className="text-4xl mb-2">{folder.icon}</div>
        <h3 className="text-xl font-semibold">{folder.name}</h3>
    </div>
)

export default CardView
