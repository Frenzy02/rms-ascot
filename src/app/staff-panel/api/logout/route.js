import { auth } from '../../../lib/firebase' // Import the Firebase auth instance
import { getAuth } from 'firebase/auth'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const auth = getAuth() // Get the Firebase auth instance

        try {
            // Sign out the user
            await auth.signOut()
            console.log('User signed out successfully')

            // Send success response
            return res.status(200).json({ message: 'Logout successful' })
        } catch (error) {
            console.error('Error during logout:', error)
            return res
                .status(500)
                .json({ message: 'Logout failed', error: error.message })
        }
    } else {
        // Handle unsupported HTTP methods
        res.setHeader('Allow', ['POST'])
        return res.status(405).end(`Method ${req.method} Not Allowed`)
    }
}
