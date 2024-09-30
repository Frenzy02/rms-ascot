// firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import dynamic from 'next/dynamic'
import { getStorage } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: 'AIzaSyAx5u8SIDSeloujN6Yip3l45aJEuNJTtLg',
    authDomain: 'ascot-rms-78426.firebaseapp.com',
    databaseURL: 'https://ascot-rms-78426-default-rtdb.firebaseio.com',
    projectId: 'ascot-rms-78426',
    storageBucket: 'ascot-rms-78426.appspot.com',
    messagingSenderId: '834402236727',
    appId: '1:834402236727:web:ab340596f6738191f2c2b2',
    measurementId: 'G-VDE0JCPMMD'
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const firedb = getFirestore(app)
export const auth = getAuth(app)
// Initialize Storage
export const storage = getStorage(app)

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
