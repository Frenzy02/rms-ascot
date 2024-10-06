import { getAuth } from 'firebase/auth'

// Named export for the POST method
export async function POST(req) {
    const authInstance = getAuth() // Initialize Firebase Auth

    try {
        // Sign out the user
        await authInstance.signOut()
        console.log('User signed out successfully')

        // Return a success response
        return new Response(JSON.stringify({ message: 'Logout successful' }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json'
            }
        })
    } catch (error) {
        console.error('Error during logout:', error)
        return new Response(
            JSON.stringify({ message: 'Logout failed', error: error.message }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        )
    }
}
