// src/app/api/admin-api/user/route.js
import { db } from '../../../lib/firebase' // Make sure the path is correct
import { collection, getDocs } from 'firebase/firestore'

// Define a handler for GET requests
export async function GET(req) {
    try {
        const usersRef = collection(db, 'users')
        const snapshot = await getDocs(usersRef)
        const users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))

        return new Response(JSON.stringify({ users, count: users.length }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error('Error fetching users from Firestore:', error)
        return new Response(
            JSON.stringify({ error: 'Failed to fetch users.' }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }
}
