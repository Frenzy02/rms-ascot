// server.js
const express = require('express')
const admin = require('firebase-admin')
const cors = require('cors')
require('dotenv').config()

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebaseAdminKey.json')

admin.initializeApp({
    credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
})

const db = admin.firestore() // Initialize Firestore if needed
const app = express()

app.use(cors())
app.use(express.json())

// Sign Up Route
app.post('/api/signup', async (req, res) => {
    const { username, email, password } = req.body

    try {
        // Create user with Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: username
        })

        // Optionally add user details to Firestore
        await db.collection('users').doc(userRecord.uid).set({
            username,
            email,
            role: 'instructor' // Default role
        })

        res.status(201).json({
            message: 'User created successfully',
            userId: userRecord.uid
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body

    try {
        // Verify user email and password using Firebase Authentication
        const user = await admin.auth().getUserByEmail(email)

        // Additional check for role if necessary
        const userDoc = await db.collection('users').doc(user.uid).get()
        if (!userDoc.exists) throw new Error('User not found in Firestore')

        const { role, username } = userDoc.data()
        res.status(200).json({
            message: 'Login successful',
            userId: user.uid,
            role,
            username
        })
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
