import { AES, enc } from 'crypto-js'
const staticSecret = 'iot-web-app' //!Bad example, this static secret should be saved on .env

export const hashPassword = async (password) => {
    return await AES.encrypt(password, staticSecret).toString()
}

export const validatePassword = async (password, hashedPassword) => {
    const hashed = AES.decrypt(hashedPassword, staticSecret).toString(enc.Utf8)
    return password === hashed
}
