const express = require('express')
const router = express.Router()

// Middleware to ensure the user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next()
    }
    return res.status(401).json({ message: 'Unauthorized' }) // User is not authenticated
}

// Logout route
router.post('/logout', isAuthenticated, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err)
            return res.status(500).json({ message: 'Logout failed' })
        }
        res.clearCookie('connect.sid') // Clear session cookie
        console.log('Logout successful') // Log success message
        return res.status(200).json({ message: 'Logout successful' })
    })
})

module.exports = router
