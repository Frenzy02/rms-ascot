const crypto = require('crypto')

const generateKey = () => {
    return crypto.randomBytes(32).toString('hex') // Generates a 32-byte key
}

console.log('Your secure encryption key is:', generateKey())
