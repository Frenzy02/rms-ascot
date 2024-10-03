// src/app/api/login/route.js
import { NextResponse } from 'next/server';
import { auth, db } from '../../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(request) {
    const { email, password } = await request.json();

    try {
        // Sign in user with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();

            // Include additional user data if needed
            return NextResponse.json({
                success: true,
                userId: user.uid,
                username: userData.username,
                role: userData.role, // Return role
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'User data not found.',
            });
        }
    } catch (error) {
        return NextResponse.json({ success: false, message: error.message });
    }
}
