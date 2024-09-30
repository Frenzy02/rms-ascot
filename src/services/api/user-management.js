import { auth, firedb, storage } from '@/services/api/firebase'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword
} from 'firebase/auth'
import {
    collection,
    query,
    where,
    getDocs,
    addDoc,
    setDoc,
    getDoc,
    doc
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

// Function to sign up a new user and save their data to Firestore
export const signUpUser = async (formData) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
        )

        const user = userCredential.user

        // Save user data to Firestore with user.uid as the document ID
        const userDoc = {
            username: formData.username,
            firstname: formData.firstname,
            lastname: formData.lastname,
            gender: formData.gender,
            email: user.email,
            role: formData.role
        }

        // Use setDoc to create the document with the UID as the ID
        await setDoc(doc(firedb, 'users', user.uid), userDoc)

        return {
            success: true,
            user: {
                email: user.email,
                displayName: formData.username,
                uid: user.uid,
                role: formData.role
            }
        }
    } catch (error) {
        return {
            success: false,
            error:
                error.code === 'auth/weak-password'
                    ? 'Password should be at least 6 characters.'
                    : error.message
        }
    }
}

// Function to sign in a user
export const signInUser = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            email,
            password
        )
        const user = userCredential.user

        // Fetch user data to get the role
        const userData = await getUserData(user.uid)

        if (!userData) {
            throw new Error('User data not found.')
        }

        return {
            success: true,
            user: {
                email: user.email,
                uid: user.uid,
                role: userData.role // Get role from userData
            }
        }
    } catch (error) {
        console.error('SignIn Error: ', error) // Log the error for debugging
        return {
            success: false,
            error:
                error.code === 'auth/user-not-found'
                    ? 'User not found.'
                    : error.code === 'auth/wrong-password'
                    ? 'Incorrect password.'
                    : error.message || 'An error occurred during sign-in.'
        }
    }
}

// Function to fetch user data based on UID
export const getUserData = async (uid) => {
    const userRef = doc(firedb, 'users', uid)
    const userDoc = await getDoc(userRef)
    return userDoc.exists() ? userDoc.data() : null
}

// New function to fetch all users and their count
export const fetchUsers = async () => {
    try {
        const usersRef = collection(firedb, 'users')
        const snapshot = await getDocs(usersRef)
        const users = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))

        return {
            success: true,
            users,
            count: users.length
        }
    } catch (error) {
        console.error('Error fetching users from Firestore:', error)
        return {
            success: false,
            error: 'Failed to fetch users.'
        }
    }
}

// Function to upload a file and store metadata in Firestore
export const uploadFile = async (file, metadata) => {
    const storageRef = ref(storage, `uploads/${file.name}`)

    try {
        // Upload the file to Firebase Storage
        await uploadBytes(storageRef, file)
        // Get the file URL for storing in Firestore
        const fileUrl = await getDownloadURL(storageRef)

        // Store metadata in Firestore
        const data = {
            ...metadata,
            fileUrl,
            dateOfUpload: new Date()
        }

        await addDoc(collection(firedb, 'uploads'), data)
        return { success: true, fileUrl }
    } catch (error) {
        console.error('Error uploading file:', error)
        throw new Error('Upload failed, please try again.')
    }
}

export const fetchRecords = async () => {
    const records = []
    try {
        const querySnapshot = await getDocs(collection(firedb, 'uploads'))
        querySnapshot.forEach((doc) => {
            records.push({
                id: doc.id,
                ...doc.data()
            })
        })
        return records
    } catch (error) {
        console.error('Error fetching records:', error)
        throw new Error('Failed to fetch records, please try again.')
    }
}

// Helper function to fetch files uploaded by the current user
export const fetchUserFiles = async (userId) => {
    try {
        const uploadsCollection = collection(firedb, 'uploads')
        const q = query(uploadsCollection, where('userId', '==', userId))
        const querySnapshot = await getDocs(q)
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }))
    } catch (error) {
        console.error('Error fetching files:', error)
        throw new Error('Failed to load files')
    }
}
