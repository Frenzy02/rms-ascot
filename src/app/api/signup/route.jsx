// src/app/api/signup/route.js
import { NextResponse } from 'next/server'
import { auth, db } from '../../lib/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

// API handler function for POST requests
export async function POST(req) {
    try {
        // Parse the request body
        const {
            email,
            password,
            role = 'staff',
            ...additionalData
        } = await req.json() // Default role is 'viewer'

        // Create a new user with email and password
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        )
        const user = userCredential.user

        // Store additional user data in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            uid: user.uid,
            role, // Store the role
            ...additionalData
        })

        // Return a successful response
        return NextResponse.json(
            {
                message: 'User registered successfully',
                userId: user.uid,
                role // Include role in the response
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Error during signup:', error) // Log the error for debugging
        return NextResponse.json({ message: error.message }, { status: 400 })
    }
}
