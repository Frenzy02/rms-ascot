const mongoose = require('mongoose')

const medicalRecordSchema = new mongoose.Schema(
    {
        name: String,
        email: String,
        contact: String,
        symptoms: [String],
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Reference to User model
    },
    { timestamps: true }
)

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema)
