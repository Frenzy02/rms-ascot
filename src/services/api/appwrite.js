import {
    Client,
    Account,
    Databases,
    Storage,
    Query,
    ID,
    Permission,
    Role
} from 'appwrite'

import QRCode from 'qrcode' // Import QRCode for generating QR codes
import crypto from 'crypto' // Import crypto for encryption

export const appwriteConfig = {
    endpoint: 'http://localhost/v1',
    projectId: '6703f198003d36f002fc',
    storageId: '67009d7a001d832768e4',
    databaseId: '66fd06eb0016cdc0dafd',
    userCollectionId: '66fd09a00027f5737fa0',
    uploadsCollectionId: '67009c84000c8738130e',
    subfoldersCollectionId: '67009c300034ee85834f',
    uploadsfilesCollectionId: '67048f630027104a9967'
}

const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)

const account = new Account(client)
const storage = new Storage(client)
const databases = new Databases(client)

// User signup
export const signUpUser = async (formData) => {
    try {
        const user = await account.create(
            ID.unique(),
            formData.email,
            formData.password
        )
        const userDoc = {
            username: formData.username,
            firstname: formData.firstname,
            lastname: formData.lastname,
            gender: formData.gender,
            email: user.email,
            role: formData.role
        }

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
        console.error('Error during sign-up:', error)
        return {
            success: false,
            error: error.message.includes('password')
                ? 'Password should be at least 6 characters.'
                : error.message
        }
    }
}

// User sign-in
export const signInUser = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(
            email,
            password
        )
        const userData = await getUserData(session.userId)

        if (!userData) {
            throw new Error('User data not found.')
        }

        return {
            success: true,
            user: {
                email: email,
                uid: session.userId,
                role: userData.role
            }
        }
    } catch (error) {
        console.error('SignIn Error: ', error)
        return {
            success: false,
            error: error.message || 'An error occurred during sign-in.'
        }
    }
}

// Function to upload a file and create a file document in the database
export const uploadFile = async (
    file,
    folderId,
    fileTitle,
    fileDescription,
    fileHandleBy,
    fileType
) => {
    try {
        // Step 1: Upload the file to Appwrite storage
        const fileUploaded = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file,
            [
                Permission.read(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
                Permission.write(Role.users())
            ]
        )

        // Step 2: Prepare the file metadata and ensure 'size' is a string
        const fileData = {
            title: fileTitle || file.name,
            description: fileDescription || '',
            handleBy: fileHandleBy || '',
            size: `${file.size} KB`, // Convert size to string
            fileType: fileType || file.type,
            folderId: folderId || '', // If no folder, keep it empty
            fileId: fileUploaded.$id, // Link the uploaded file by its ID
            createdAt: new Date().toISOString() // Timestamp for creation
        }

        // Step 3: Create a document with the metadata
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            ID.unique(),
            fileData
        )

        return response
    } catch (error) {
        console.error('Error uploading file:', error.response || error)
        throw new Error('Failed to upload file and save metadata.')
    }
}

// Get user data
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

// Fetch all users
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

// Create a folder in the database
export const createFolder = async (folderName, parentFolderId = null) => {
    try {
        const folderData = {
            name: folderName,
            type: 'folder',
            parentId: parentFolderId || '', // Use empty string for root folder
            createdAt: new Date().toISOString()
        }

        const permissions = [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
            Permission.write(Role.users())
        ]

        let folderResponse

        if (parentFolderId) {
            // Create a subfolder in the subfolder collection
            folderResponse = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.subfoldersCollectionId, // Subfolder collection ID
                ID.unique(),
                folderData,
                permissions
            )
        } else {
            // Create a root folder in the uploads collection
            folderResponse = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsCollectionId, // Main uploads collection ID
                ID.unique(),
                folderData,
                permissions
            )
        }

        return folderResponse
    } catch (error) {
        console.error('Error creating folder:', error)
        throw new Error('Failed to create folder.')
    }
}

// Helper function to build a nested folder structure
const buildFolderTree = (folders) => {
    const folderMap = {}

    folders.forEach((folder) => {
        folder.subfolders = []
        folderMap[folder.$id] = folder
    })

    const rootFolders = []

    folders.forEach((folder) => {
        if (folder.parentId) {
            if (folderMap[folder.parentId]) {
                folderMap[folder.parentId].subfolders.push(folder)
            }
        } else {
            rootFolders.push(folder)
        }
    })

    return rootFolders
}

export const fetchFoldersAndFiles = async (parentFolderId = null) => {
    try {
        let foldersResponse, filesResponse

        if (parentFolderId) {
            // Fetch subfolders
            foldersResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.subfoldersCollectionId,
                [Query.equal('parentId', parentFolderId)]
            )

            // Fetch files in the folder
            filesResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                [Query.equal('folderId', parentFolderId)]
            )
        } else {
            // Fetch root folders
            foldersResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsCollectionId,
                [Query.equal('type', 'folder'), Query.equal('parentId', '')]
            )

            // Fetch files in the root folder
            filesResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                [Query.equal('folderId', '')]
            )
        }

        console.log('Fetched Folders: ', foldersResponse.documents)
        console.log('Fetched Files: ', filesResponse.documents) // Log the file data

        return {
            folders: foldersResponse.documents.map((doc) => ({
                ...doc,
                subfolders: []
            })),
            files: filesResponse.documents
        }
    } catch (error) {
        console.error('Error fetching folders and files:', error)
        throw new Error('Failed to fetch data.')
    }
}

// Fetch records
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

// Fetch user files
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

// Sign out
export async function signOut() {
    try {
        await account.deleteSession('current')
        return {
            success: true,
            message: 'Successfully logged out.'
        }
    } catch (error) {
        console.error('Error signing out:', error.message)
        if (
            error.message.includes('missing scope') ||
            error.message.includes('Invalid session')
        ) {
            return {
                success: true,
                message: 'No active session found. Considered logged out.'
            }
        }
        return {
            success: false,
            error: error.message || 'An error occurred during logout.'
        }
    }
}
