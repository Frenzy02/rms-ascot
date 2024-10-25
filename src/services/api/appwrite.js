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

import QRCode from 'qrcode'
import crypto from 'crypto'

export const appwriteConfig = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    storageId: process.env.NEXT_PUBLIC_APPWRITE_STORAGE_ID,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
    userCollectionId: process.env.NEXT_PUBLIC_APPWRITE_USER_COLLECTION_ID,
    uploadsCollectionId: process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_COLLECTION_ID,
    subfoldersCollectionId:
        process.env.NEXT_PUBLIC_APPWRITE_SUBFOLDERS_COLLECTION_ID,
    uploadsfilesCollectionId:
        process.env.NEXT_PUBLIC_APPWRITE_UPLOADSFILES_COLLECTION_ID,
    documentHistoryCollectionId:
        process.env.NEXT_PUBLIC_APPWRITE_DOCUMENT_HISTORY_COLLECTION_ID,
    fileViewsCollectionId:
        process.env.NEXT_PUBLIC_APPWRITE_FILEVIEWS_COLLECTION_ID
}

const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)

const account = new Account(client)
const storage = new Storage(client)
const databases = new Databases(client)

export { client, account, storage, databases }

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
            role: formData.role,
            department: formData.department
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

        // Save the session token
        sessionStorage.setItem('token', session.$id)

        const userData = await getUserData(session.userId)

        if (!userData) {
            throw new Error('User data not found.')
        }

        // Store user data in session storage
        sessionStorage.setItem('isLoggedIn', 'true')
        sessionStorage.setItem('username', userData.username || email)
        sessionStorage.setItem('email', email)
        sessionStorage.setItem('userId', userData.$id) // Ensure userId is stored
        // Store user data in session storage when the user logs in
        sessionStorage.setItem('firstName', userData.firstname)
        sessionStorage.setItem('lastName', userData.lastname)
        sessionStorage.setItem('department', userData.department)

        console.log('User ID stored in session storage:', userData.$id) // Log the user ID

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
// Function to upload a file and create a file document in the database
export const uploadFile = async (
    file,
    folderId,
    fileTitle,
    fileDescription,
    fileHandleBy,
    fileType,
    userId // Ensure userId is passed here
) => {
    try {
        // Step 1: Upload the file to Appwrite storage
        const fileUploaded = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file,
            [
                Permission.read(Role.any()), // Allows anyone to read (optional)
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
        return await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            uid
        )
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

// Fetch user files that have been approved
export const fetchUserFiles = async (userId) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            [
                Query.equal('userId', userId),
                Query.equal('status', 'approved') // Fetch only approved files
            ]
        )

        // Ensure that each file object contains the relevant metadata
        const userFiles = response.documents.map((file) => {
            console.log(
                `File ID: ${file.$id}, Control Number: ${file.controlNumber}`
            )
            return {
                id: file.$id,
                title: file.title || 'Untitled',
                description: file.description || '',
                fileType: file.fileType || 'Unknown',
                size: file.size || '0 KB',
                controlNumber: file.controlNumber || '',
                createdAt: file.createdAt || new Date().toISOString(),
                status: file.status || 'pending' // Add status to display if needed
            }
        })

        return userFiles
    } catch (error) {
        console.error('Error fetching user files:', error)
        throw new Error('Failed to fetch user files.')
    }
}

// Fetch all files from the uploads files collection
export const fetchAllFiles = async () => {
    try {
        // Fetch all files in the collection without any filters
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId // Replace with your actual uploads files collection ID
        )

        // Map the files and ensure controlNumber is included
        const allFiles = response.documents.map((file) => ({
            id: file.$id,
            title: file.title || 'Untitled',
            fileId: file.fileId || file.$id, // Ensure fileId is included
            description: file.description || '',
            fileType: file.fileType || 'Unknown',
            size: file.size || '0 KB',
            controlNumber: file.controlNumber || '', // Ensure controlNumber is mapped
            createdAt: file.createdAt || new Date().toISOString(),
            status: file.status || 'pending' // Include status if needed
        }))

        return allFiles
    } catch (error) {
        console.error('Error fetching all files:', error)
        throw new Error('Failed to fetch files.')
    }
}

export const uploadDocumentRequest = async (file, metadata) => {
    try {
        // Step 1: Upload the file
        console.log('Uploading file: ', file.name) // Log file details
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file,
            [Permission.read(Role.any()), Permission.write(Role.users())]
        )

        if (!uploadedFile.$id) {
            throw new Error('File upload failed, no file ID returned.')
        }

        console.log('File uploaded successfully with ID:', uploadedFile.$id)

        // Step 2: Store file metadata in the database
        const requestData = {
            ...metadata,
            fileId: uploadedFile.$id // Link the uploaded file by its ID
        }

        console.log('Saving metadata to database:', requestData)

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            ID.unique(),
            requestData
        )

        console.log('Metadata saved successfully:', response)

        return {
            fileId: uploadedFile.$id,
            requestData
        }
    } catch (error) {
        console.error('Error uploading document request:', error)
        throw new Error('Failed to upload document request and store metadata.')
    }
}

export const fetchDocumentRequests = async () => {
    try {
        // Fetch all document requests (remove status filter)
        const snapshot = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId // Fetch all document requests regardless of status
        )
        console.log('Document Requests:', snapshot.documents)
        return snapshot.documents // Return all document requests
    } catch (error) {
        console.error('Error fetching document requests:', error)
        throw new Error('Failed to fetch document requests.')
    }
}

export const addDocumentHistory = async ({
    fileId,
    previousHolder,
    currentHolder,
    department,
    status
}) => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.documentHistoryCollectionId,
            ID.unique(),
            {
                fileId,
                previousHolder,
                currentHolder,
                department,
                dateReceived: new Date().toISOString(),
                status
            },
            [
                Permission.read(Role.any()), // Allow any user to read the document
                Permission.write(Role.any()), // Allow any user to write (update) the document
                Permission.update(Role.any()), // Allow any user to update the document
                Permission.delete(Role.any()) // Allow any user to delete the document
            ]
        )
        return response
    } catch (error) {
        console.error('Failed to add document history:', error.message)
        throw new Error('Failed to add document history.')
    }
}

export const fetchDocumentHistory = async (fileId) => {
    try {
        console.log('Fetching history for fileId:', fileId) // Debugging log
        const response = await databases.listDocuments(
            appwriteConfig.databaseId, // Ensure this is correct
            appwriteConfig.documentHistoryCollectionId, // Ensure this is correct
            [Query.equal('fileId', fileId), Query.orderAsc('dateReceived')] // Query to find file history
        )

        if (response.documents.length === 0) {
            throw new Error('No history found for this file.')
        }

        console.log('History fetched:', response.documents) // Log the history for debugging
        return response.documents
    } catch (error) {
        console.error('Error fetching document history:', error.message)
        throw new Error('Failed to fetch document history.')
    }
}

export const fetchFileMetadata = async (fileId) => {
    try {
        const response = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            fileId
        )
        return response
    } catch (error) {
        throw new Error('Failed to fetch file metadata')
    }
}

export const updateHandleBy = async (fileId, newHolder) => {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            fileId,
            {
                handleBy: newHolder // Make sure you are passing the updated holder here
            }
        )
        return response
    } catch (error) {
        console.error('Error updating currentHolder:', error.message)
        throw error
    }
}

export const handleDocumentRequest = async (documentId, action) => {
    try {
        // Fetch the document metadata using documentId
        const document = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            documentId
        )

        if (!document) {
            throw new Error(
                'Document with the requested ID could not be found.'
            )
        }

        // Prepare updated data based on action
        const updatedData = {
            status: action === 'approve' ? 'approved' : 'rejected',
            approvedAt:
                action === 'approve'
                    ? new Date().toISOString()
                    : document.approvedAt,
            rejectedAt:
                action === 'reject'
                    ? new Date().toISOString()
                    : document.rejectedAt
        }

        // Update the document metadata with the new status
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            documentId,
            updatedData
        )

        // Optionally, delete the file from storage if rejected
        if (action === 'reject') {
            const deleteResponse = await deleteFile(document.fileId)
            if (deleteResponse.success === false) {
                console.warn(`File ${document.fileId} could not be deleted.`)
            }
        }

        return response
    } catch (error) {
        console.error('Error handling document request:', error)
        throw new Error('Failed to handle document request.')
    }
}

export const deleteFile = async (fileId) => {
    try {
        const response = await storage.deleteFile(
            appwriteConfig.storageId,
            fileId
        )
        return response
    } catch (error) {
        if (error.code === 404) {
            console.warn(`File with ID ${fileId} not found. Skipping deletion.`)
            return { success: false, message: 'File not found' }
        }
        console.error('Error deleting file:', error)
        throw new Error('Failed to delete file.')
    }
}

export const logFileView = async (fileId, userId, department) => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.fileViewsCollectionId, // Collection for file views
            ID.unique(),
            {
                fileId: fileId,
                userId: userId,
                department: department, // Ensure department is passed correctly
                viewTime: new Date().toISOString() // Log the time of the view
            }
        )
        return response
    } catch (error) {
        console.error('Error logging file view:', error.message)
        throw new Error('Failed to log file view.')
    }
}

export const getFilePreview = async (
    fileId,
    width = 800,
    height = 1200,
    gravity = 'center',
    quality = 100,
    borderWidth = 0,
    borderColor = '#000000',
    borderRadius = 0,
    opacity = 100,
    rotation = 0,
    background = '',
    format = 'jpg' // Change to 'pdf' if previewing PDFs
) => {
    try {
        console.log('Fetching file preview with the following parameters:')
        console.log(`File ID: ${fileId}`)
        console.log(`Width: ${width}, Height: ${height}`)
        console.log(`Gravity: ${gravity}, Quality: ${quality}`)
        console.log(`Border: ${borderWidth}px ${borderColor}`)
        console.log(`Border Radius: ${borderRadius}, Opacity: ${opacity}`)
        console.log(`Rotation: ${rotation}, Background: ${background}`)
        console.log(`Format: ${format}`)

        const result = await storage.getFilePreview(
            appwriteConfig.storageId, // Your storage ID
            fileId,
            width,
            height,
            gravity,
            quality,
            borderWidth,
            borderColor,
            borderRadius,
            opacity,
            rotation,
            background,
            format
        )

        console.log('File preview fetched successfully:', result)
        return result // Return the file preview URL
    } catch (error) {
        console.error('Error fetching file preview:', error)
        throw new Error('Failed to fetch file preview.')
    }
}

export const fetchFilesWithViews = async () => {
    try {
        // Fetch all files from the uploads files collection
        const filesResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId
        )

        const files = filesResponse.documents.map((file) => ({
            fileId: file.$id,
            title: file.title || 'Untitled',
            description: file.description || '',
            fileType: file.fileType || 'Unknown',
            size: file.size || '0 KB',
            createdAt: file.createdAt || new Date().toISOString(),
            views: 0,
            viewers: []
        }))

        // For each file, fetch its views from the fileviews collection
        for (const file of files) {
            const viewsResponse = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.fileViewsCollectionId,
                [Query.equal('fileId', file.fileId)]
            )

            file.views = viewsResponse.documents.length // Number of views

            // Fetch viewer details
            file.viewers = await Promise.all(
                viewsResponse.documents.map(async (view) => {
                    if (!view.userId) {
                        console.warn(
                            `Missing userId for view on fileId: ${file.fileId}`
                        )
                        return null // Skip this viewer if userId is missing
                    }

                    try {
                        const userResponse = await databases.getDocument(
                            appwriteConfig.databaseId,
                            appwriteConfig.userCollectionId,
                            view.userId
                        )

                        // Log to confirm the presence of department field
                        console.log('Viewer Department:', view.department)
                        console.log('User Data:', userResponse)

                        return {
                            userId: view.userId,
                            firstName: userResponse.firstname || 'Unknown',
                            lastName: userResponse.lastname || 'User',
                            department:
                                view.department ||
                                userResponse.department ||
                                'N/A', // Check view first, then user
                            viewTime: view.viewTime
                        }
                    } catch (userError) {
                        console.error(
                            `Error fetching user data for userId ${view.userId}:`,
                            userError
                        )
                        return null // Skip this viewer if fetching fails
                    }
                })
            )

            // Remove null entries from viewers list
            file.viewers = file.viewers.filter((viewer) => viewer !== null)
        }

        return files
    } catch (error) {
        console.error('Error fetching files with views:', error)
        throw new Error('Failed to fetch files with views.')
    }
}

export const getFileView = async (bucketId, fileId) => {
    try {
        const response = await storage.getFileView(bucketId, fileId)

        console.log('File view response:', response) // Log the complete response

        // Ensure the response has the href property
        if (response && response.href) {
            return response.href // Return the view URL
        } else {
            throw new Error('Failed to fetch file view URL.')
        }
    } catch (error) {
        console.error('Error fetching file view:', error)
        throw new Error('Failed to fetch file view.')
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
