// firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import dynamic from 'next/dynamic'

// Your web app's Firebase configuration
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
export const firedb = getFirestore(app)
export const auth = getAuth(app)

// Conditionally initialize analytics if in the browser
export const analytics =
    typeof window !== 'undefined'
        ? dynamic(
              () =>
                  import('firebase/analytics').then((module) =>
                      module.getAnalytics(app)
                  ),
              { ssr: false }
          )
        : null
