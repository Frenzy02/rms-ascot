// models/Document.js
import mongoose from 'mongoose'

const DocumentSchema = new mongoose.Schema({
    email: { type: String, required: true },
    filename: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.models.Document ||
    mongoose.model('Document', DocumentSchema)
