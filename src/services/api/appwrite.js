import { Client, Account, Databases, Storage, Query } from 'appwrite'

export const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: '66fbb1c3002b793d9e26',
    storageId: '66fd06700033326ede52',
    databaseId: '66fd06eb0016cdc0dafd',
    userCollectionId: '66fd09a00027f5737fa0',
    uploadsCollectionId: 'uploads'
}

const client = new Client()

client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)

const account = new Account(client)
const storage = new Storage(client)
const databases = new Databases(client)

export const signUpUser = async (formData) => {
    try {
        // Create a new user with email and password
        const user = await account.create(
            'unique()',
            formData.email,
            formData.password
        )

        // Save user data to Appwrite Database with user ID
        const userDoc = {
            username: formData.username,
            firstname: formData.firstname,
            lastname: formData.lastname,
            gender: formData.gender,
            email: user.email,
            role: formData.role
        }

        // Store user data in Appwrite database
        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            user.$id,
            userDoc
        )

        return {
            success: true,
            user: {
                email: user.email,
                displayName: formData.username,
                uid: user.$id,
                role: formData.role
            }
        }
    } catch (error) {
        return {
            success: false,
            error: error.message.includes('password')
                ? 'Password should be at least 6 characters.'
                : error.message
        }
    }
}

export const signInUser = async (email, password) => {
    try {
        // Log in user with email and password
        const session = await account.createEmailPasswordSession(
            email,
            password
        )

        // Fetch user data from Appwrite Database
        const userData = await getUserData(session.userId)

        if (!userData) {
            throw new Error('User data not found.')
        }

        return {
            success: true,
            user: {
                email: email,
                uid: session.userId,
                role: userData.role // Get role from userData
            }
        }
    } catch (error) {
        console.error('SignIn Error: ', error) // Log the error for debugging
        return {
            success: false,
            error: error.message || 'An error occurred during sign-in.'
        }
    }
}

export const getUserData = async (uid) => {
    try {
        const userDoc = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            uid
        )
        return userDoc
    } catch (error) {
        console.error('Error fetching user data:', error)
        return null
    }
}

export const fetchUsers = async () => {
    try {
        const snapshot = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId
        )
        const users = snapshot.documents.map((doc) => ({
            id: doc.$id,
            ...doc
        }))

        return {
            success: true,
            users,
            count: users.length
        }
    } catch (error) {
        console.error('Error fetching users from Appwrite:', error)
        return {
            success: false,
            error: 'Failed to fetch users.'
        }
    }
}

export const uploadFile = async (file, metadata) => {
    try {
        // Upload the file to Appwrite Storage
        const storageResponse = await storage.createFile(
            appwriteConfig.storageId,
            'unique()',
            file
        )

        // Get the file URL
        const fileUrl = storage.getFileView(
            appwriteConfig.storageId,
            storageResponse.$id
        )

        // Store metadata in Appwrite Database
        const data = {
            ...metadata,
            fileUrl,
            dateOfUpload: new Date().toISOString()
        }

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsCollectionId,
            'unique()',
            data
        )

        return { success: true, fileUrl }
    } catch (error) {
        console.error('Error uploading file:', error)
        throw new Error('Upload failed, please try again.')
    }
}

export const fetchRecords = async () => {
    try {
        const snapshot = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsCollectionId
        )
        return snapshot.documents.map((doc) => ({
            id: doc.$id,
            ...doc
        }))
    } catch (error) {
        console.error('Error fetching records:', error)
        throw new Error('Failed to fetch records, please try again.')
    }
}

export const fetchUserFiles = async (userId) => {
    try {
        const snapshot = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsCollectionId,
            [Query.equal('userId', userId)]
        )

        return snapshot.documents.map((doc) => ({
            id: doc.$id,
            ...doc
        }))
    } catch (error) {
        console.error('Error fetching files:', error)
        throw new Error('Failed to load files.')
    }
}

// Sign Out
export async function signOut() {
    try {
        await account.deleteSession('current') // Attempt to delete the current session
        return {
            success: true,
            message: 'Successfully logged out.'
        }
    } catch (error) {
        console.error('Error signing out:', error.message)
        // Check if the error is due to the user not being logged in
        if (
            error.message.includes('missing scope') ||
            error.message.includes('Invalid session')
        ) {
            return {
                success: true, // Treat this as a successful logout
                message: 'No active session found. Considered logged out.'
            }
        }
        return {
            success: false,
            error: error.message || 'An error occurred during logout.'
        }
    }
}
