// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: 'AIzaSyBNVP0zMDrZBtvabqcNTqSxwoJtEcb9mC0',
    authDomain: 'iot-web-app-7476f.firebaseapp.com',
    projectId: 'iot-web-app-7476f',
    storageBucket: 'iot-web-app-7476f.appspot.com',
    messagingSenderId: '283577621558',
    appId: '1:283577621558:web:bdf96c89c366bd739e8c97',
    measurementId: 'G-ZK70BJCDZG'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

const analytics = getAnalytics(app)

export const firedb = getFirestore(app)

export const auth = getAuth(app)

export const firestore = getFirestore(app)
