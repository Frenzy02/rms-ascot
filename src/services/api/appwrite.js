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
// Add the checkFolderExists function here
export const checkFolderExists = async (folderId, collectionId) => {
    try {
        const folder = await databases.getDocument(
            appwriteConfig.databaseId,
            collectionId,
            folderId
        )
        return folder ? true : false
    } catch (error) {
        console.error(`Folder with ID ${folderId} does not exist:`, error)
        return false
    }
}
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

export const getAllUsers = async () => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId
        )
        const users = response.documents.map((user) => ({
            id: user.$id,
            name: `${user.firstname} ${user.lastname}`, // Adjust this based on your data structure
            email: user.email,
            role: user.role // Ensure that `role` is available here
        }))
        return users
    } catch (error) {
        console.error('Error fetching users from Appwrite:', error)
        return []
    }
}

export const uploadFile = async (
    file,
    folderId,
    parentFolderId,
    fileTitle,
    fileDescription,
    fileHandleBy,
    fileType,
    userId,
    controlNumber,
    restrictedUsers = [],
    breadcrumbPath
) => {
    try {
        // Ensure user is authenticated
        const session = await account.get()
        if (!session) {
            throw new Error(
                'User session is invalid or expired. Please log in again.'
            )
        }

        // Set the MIME type manually
        const fileMimeType =
            fileType === 'PDF'
                ? 'application/pdf'
                : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        // Upload file to Appwrite storage with the correct MIME type
        const fileUploaded = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file,
            [
                Permission.read(Role.user(userId)),
                Permission.write(Role.user(userId))
            ],
            fileMimeType
        )

        // Construct breadcrumb path and metadata
        const breadcrumbString = breadcrumbPath
            .map((folder) => folder.name)
            .join('/')
        console.log('Breadcrumb path to save:', breadcrumbString)

        const currentDate = new Date().toISOString()
        const fileData = {
            title: fileTitle || file.name,
            description: fileDescription || '',
            handleBy: fileHandleBy || '',
            size: `${file.size} KB`,
            fileType: fileType || file.type,
            folderId: folderId || '',
            parentFolderId: parentFolderId || '',
            controlNumber: controlNumber || 'N/A',
            userId: userId,
            fileId: fileUploaded.$id,
            path: breadcrumbString,
            restrictedUsers: restrictedUsers.join(','),
            status: 'approved',
            createdAt: currentDate,
            dateReceived: currentDate, // Set receivedAt to the current date and time
            approvedAt: currentDate // Set approvedAt to the current date and time
        }

        const permissions = [
            Permission.read(Role.user(userId)),
            Permission.update(Role.user(userId)),
            Permission.delete(Role.user(userId)),
            Permission.write(Role.user(userId))
        ]

        // Create the document with the prepared metadata and permissions
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            ID.unique(),
            fileData,
            permissions
        )

        console.log('File metadata saved successfully:', response)
        return response
    } catch (error) {
        console.error('Error in uploadFile function:', error)
        throw new Error(
            `Failed to upload file and save metadata: ${error.message}`
        )
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
export const fetchParentAndSubFolders = async () => {
    try {
        // Fetch all parent folders from the uploads collection
        const foldersResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsCollectionId
        )

        // Fetch all subfolders from the subfolders collection
        const subfoldersResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.subfoldersCollectionId
        )

        // Combine all folders and subfolders into one array
        const allFolders = [
            ...foldersResponse.documents,
            ...subfoldersResponse.documents
        ]

        // Create a folder map to organize folders by their ID
        const folderMap = {}
        allFolders.forEach((folder) => {
            folderMap[folder.$id] = { ...folder, subfolders: [] }
        })

        // Populate the subfolders into their respective parent folders
        allFolders.forEach((folder) => {
            if (folder.parentId && folderMap[folder.parentId]) {
                folderMap[folder.parentId].subfolders.push(
                    folderMap[folder.$id]
                )
            }
        })

        // Extract the root folders (those without a parentId)
        const rootFolders = Object.values(folderMap).filter(
            (folder) => !folder.parentId
        )

        // Return the constructed folder structure
        console.log('Constructed Folder Structure:', rootFolders)
        return { folders: rootFolders }
    } catch (error) {
        console.error('Error fetching folders and subfolders:', error)
        throw new Error('Failed to fetch folders and subfolders.')
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

        // Map documents to include both `documentId` and `fileId` if available
        const userFiles = response.documents.map((file) => {
            console.log(
                `Document ID: ${file.$id}, File ID (storage): ${file.fileId}, Control Number: ${file.controlNumber}`
            )
            return {
                documentId: file.$id, // Document's unique ID
                fileId: file.fileId, // Storage file ID (add condition if nested)
                title: file.title || 'Untitled',
                description: file.description || '',
                fileType: file.fileType || 'Unknown',
                size: file.size || '0 KB',
                controlNumber: file.controlNumber || '',
                createdAt: file.createdAt || new Date().toISOString(),
                status: file.status || 'pending'
            }
        })

        return userFiles
    } catch (error) {
        console.error('Error fetching user files:', error)
        throw new Error('Failed to fetch user files.')
    }
}
export const getFileView = async (fileId) => {
    try {
        // Construct the file view URL properly
        const viewUrl = `http://localhost/v1/storage/buckets/${appwriteConfig.storageId}/files/${fileId}/view?project=${appwriteConfig.projectId}`

        // Fetch the file view response
        const response = await fetch(viewUrl)

        // Check if the response is OK
        if (!response.ok) {
            throw new Error('Failed to fetch the file view URL.')
        }

        return viewUrl // Return the constructed URL
    } catch (error) {
        console.error('Error fetching file view URL:', error)
        throw new Error('Failed to fetch file view URL.')
    }
}

// Fetch all files from the uploads files collection with pagination
export const fetchAllFiles = async () => {
    try {
        const allFiles = [] // Array to store all files
        let offset = 0
        const limit = 5000 // Limit per batch (adjust if needed)

        // Fetch the first batch of documents
        let firstBatch = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            [Query.limit(limit), Query.offset(offset)]
        )

        // Map the documents from the first batch and push to allFiles
        const mapFiles = firstBatch.documents.map((file) => ({
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
        allFiles.push(...mapFiles)

        // Check if more documents need to be fetched
        while (firstBatch.documents.length === limit) {
            offset += limit // Increase the offset for the next batch

            // Fetch the next batch using updated offset
            const nextBatch = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                [Query.limit(limit), Query.offset(offset)]
            )

            // Map the documents from the next batch and push to allFiles
            const nextBatchFiles = nextBatch.documents.map((file) => ({
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
            allFiles.push(...nextBatchFiles)

            // If the next batch is smaller than the limit, break the loop
            if (nextBatch.documents.length < limit) break

            // Update firstBatch for the next iteration
            firstBatch = nextBatch
        }

        return allFiles
    } catch (error) {
        console.error('Error fetching all files:', error)
        throw new Error('Failed to fetch all files.')
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
        const allFiles = [] // Array to store all files
        let offset = 0
        const limit = 5000 // Limit per batch (adjust if needed)
        let firstBatch

        // Fetch documents in batches
        do {
            firstBatch = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                [Query.limit(limit), Query.offset(offset)]
            )

            // Add fetched documents to the allFiles array
            allFiles.push(...firstBatch.documents)

            // Update offset for next batch
            offset += limit

            console.log('Fetched documents batch:', firstBatch.documents)
        } while (firstBatch.documents.length === limit) // Continue fetching if the batch is full

        console.log('All Document Requests:', allFiles)
        return allFiles // Return all documents after fetching all batches
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
    dateReceived,
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
                dateReceived: dateReceived || new Date().toISOString(), // Use provided date or current time
                status
            },
            [
                Permission.read(Role.any()),
                Permission.write(Role.any()),
                Permission.update(Role.any()),
                Permission.delete(Role.any())
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

export const updateHandleBy = async (fileId, newHolder, newDateReceived) => {
    try {
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            fileId,
            {
                handleBy: newHolder,
                dateReceived: newDateReceived
            }
        )
        return response
    } catch (error) {
        console.error('Error updating current holder and dateReceived:', error)
        throw error
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

export const fetchFilesWithViews = async () => {
    try {
        const allFiles = [] // Array to store all files
        let offset = 0
        const limit = 5000 // Limit per batch (adjust if needed)
        let firstBatch

        // Fetch files in batches
        do {
            firstBatch = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                [Query.limit(limit), Query.offset(offset)]
            )

            const files = firstBatch.documents.map((file) => ({
                fileId: file.$id,
                title: file.title || 'Untitled',
                description: file.description || '',
                fileType: file.fileType || 'Unknown',
                size: file.size || '0 KB',
                createdAt: file.createdAt || new Date().toISOString(),
                views: 0,
                viewers: []
            }))

            allFiles.push(...files) // Combine the fetched files

            offset += limit // Update offset for the next batch
        } while (firstBatch.documents.length === limit) // Continue fetching if the batch is full

        // Now, for each file, fetch its views from the fileviews collection
        for (const file of allFiles) {
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

        return allFiles // Return all files with their view data
    } catch (error) {
        console.error('Error fetching files with views:', error)
        throw new Error('Failed to fetch files with views.')
    }
}

export const fetchUploadsByParentFolder = async (year, month = null) => {
    try {
        // Step 1: Fetch all parent folders
        const parentFoldersResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsCollectionId
        )

        // Step 2: Fetch all subfolders
        const subfoldersResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.subfoldersCollectionId
        )

        // Step 3: Fetch all files and filter by the selected year and month (if provided)
        const filesResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId
        )
        const filesByYearAndMonth = filesResponse.documents.filter((file) => {
            const fileDate = new Date(file.createdAt)
            const fileYear = fileDate.getFullYear()
            const fileMonth = fileDate.getMonth() + 1 // 0-based index, so +1

            // Filter by year and optionally by month if provided
            return fileYear === year && (month ? fileMonth === month : true)
        })

        // Step 4: Create a structure to hold the count of files per parent folder
        const uploadsByParentFolder = parentFoldersResponse.documents.reduce(
            (acc, folder) => {
                const folderId = folder.$id
                acc[folderId] = { name: folder.name, count: 0, months: {} }
                return acc
            },
            {}
        )

        // Step 5: Group subfolders by parent folder ID
        const subfoldersByParent = subfoldersResponse.documents.reduce(
            (acc, subfolder) => {
                const parentId = subfolder.parentId
                if (!acc[parentId]) acc[parentId] = []
                acc[parentId].push(subfolder.$id)
                return acc
            },
            {}
        )

        // Step 6: Count files in each parent folder (including subfolder files)
        filesByYearAndMonth.forEach((file) => {
            const folderId = file.folderId
            const monthLabel = new Date(file.createdAt).toLocaleString(
                'default',
                { month: 'short' }
            )

            // Find the parent folder of each file (either direct or via subfolder)
            for (const [parentId, subfolderIds] of Object.entries(
                subfoldersByParent
            )) {
                if (folderId === parentId || subfolderIds.includes(folderId)) {
                    if (!uploadsByParentFolder[parentId].months[monthLabel]) {
                        uploadsByParentFolder[parentId].months[monthLabel] = 0
                    }
                    uploadsByParentFolder[parentId].months[monthLabel] += 1
                    uploadsByParentFolder[parentId].count += 1
                }
            }
        })

        console.log('Uploads by Parent Folder:', uploadsByParentFolder) // Debug log
        return uploadsByParentFolder
    } catch (error) {
        console.error('Error fetching uploads by parent folder:', error)
        throw new Error('Failed to fetch uploads by parent folder.')
    }
}

export const fetchUploadsByStatusAndMonth = async (year) => {
    try {
        const allFiles = [] // Array to store all files
        let offset = 0
        const limit = 5000 // Limit per batch (adjust if needed)
        let firstBatch

        // Fetch documents in batches
        do {
            firstBatch = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                [Query.limit(limit), Query.offset(offset)]
            )

            allFiles.push(...firstBatch.documents)
            offset += limit
        } while (firstBatch.documents.length === limit)

        // Filter files by year and group them by month based on `approvedAt` and `rejectedAt`
        const uploadsByStatus = allFiles.reduce((acc, file) => {
            const fileDate = new Date(file.createdAt)
            const fileYear = fileDate.getFullYear()
            const month = fileDate.toLocaleString('default', { month: 'short' })

            if (fileYear === year) {
                if (!acc[month]) {
                    acc[month] = { approved: 0, rejected: 0 }
                }

                // Increment count based on `approvedAt` and `rejectedAt`
                if (file.approvedAt) {
                    acc[month].approved += 1
                }
                if (file.rejectedAt) {
                    acc[month].rejected += 1
                }
            }
            return acc
        }, {})

        console.log('Uploads by Status:', uploadsByStatus) // Debug log
        return uploadsByStatus
    } catch (error) {
        console.error('Error fetching uploads by status and month:', error)
        throw new Error('Failed to fetch uploads by status and month.')
    }
}

export const editFileMetadata = async (fileId, updatedFields) => {
    try {
        // Log the fields being updated
        console.log('Updating file metadata:', fileId, updatedFields)

        // Update the document in the Appwrite database
        const response = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            fileId,
            updatedFields // Pass the updatedFields object directly
        )

        console.log('File metadata updated successfully:', response)
        return response
    } catch (error) {
        console.error('Error updating file metadata:', error.message)
        throw new Error('Failed to update file metadata.')
    }
}

export const deleteFile = async (fileId, documentId) => {
    if (!fileId || !documentId) {
        console.error('Error: Missing fileId or documentId parameter')
        throw new Error('fileId and documentId are required')
    }
    try {
        // Step 1: Delete the file from the storage bucket
        console.log('Attempting to delete file with ID:', fileId)
        await storage.deleteFile(appwriteConfig.storageId, fileId)
        console.log('File deleted from storage successfully')

        // Step 2: Delete the metadata from the uploadsfiles collection
        console.log('Attempting to delete document with ID:', documentId)
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.uploadsfilesCollectionId,
            documentId
        )
        console.log(
            'Metadata deleted from uploadsfiles collection successfully'
        )
    } catch (error) {
        console.error('Failed to delete file or metadata:', error.message)
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

        // Log success message
        console.log(
            `Document ${documentId} status updated to ${updatedData.status}.`
        )

        return response
    } catch (error) {
        console.error('Error handling document request:', error)
        throw new Error('Failed to handle document request.')
    }
}

export const deleteFolderAndContents = async (folderId) => {
    try {
        console.log(`Attempting to delete folder with ID: ${folderId}`)

        // Fetch subfolders and files
        const { folders: subfolders, files } = await fetchFoldersAndFiles(
            folderId
        )
        console.log(
            `Fetched ${subfolders.length} subfolders and ${files.length} files.`
        )

        // Delete all files in the folder
        for (const file of files) {
            try {
                console.log(`Deleting file with ID: ${file.fileId}`)
                // Attempt to delete file from storage
                await storage.deleteFile(appwriteConfig.storageId, file.fileId)
                console.log(
                    `File ${file.fileId} deleted successfully from storage.`
                )

                // Delete file metadata from uploadsfilesCollection
                await databases.deleteDocument(
                    appwriteConfig.databaseId,
                    appwriteConfig.uploadsfilesCollectionId,
                    file.$id
                )
                console.log(
                    `Metadata for file ${file.fileId} deleted from uploadsfiles collection.`
                )
            } catch (error) {
                if (error.code === 404) {
                    console.warn(
                        `File or metadata not found, skipping: ${file.fileId}`
                    )
                } else {
                    throw error
                }
            }
        }

        // Recursively delete all subfolders
        for (const subfolder of subfolders) {
            console.log(
                `Recursively deleting subfolder with ID: ${subfolder.$id}`
            )
            await deleteFolderAndContents(subfolder.$id)
        }

        // Delete parent folder metadata from uploadsfilesCollection
        try {
            console.log(
                `Deleting parent folder metadata from uploadsfiles collection: ${folderId}`
            )
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.uploadsfilesCollectionId,
                folderId
            )
            console.log(
                `Parent folder metadata ${folderId} deleted from uploadsfiles collection.`
            )
        } catch (error) {
            if (error.code === 404) {
                console.warn(
                    `Parent folder metadata ${folderId} not found in uploadsfiles collection.`
                )
            } else {
                throw error
            }
        }

        // Delete parent folder metadata from subfoldersCollection (if it exists)
        try {
            console.log(
                `Attempting to delete parent folder metadata from subfolders collection: ${folderId}`
            )
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.subfoldersCollectionId,
                folderId
            )
            console.log(
                `Parent folder metadata ${folderId} deleted from subfolders collection.`
            )
        } catch (error) {
            if (error.code === 404) {
                console.warn(
                    `Parent folder metadata ${folderId} not found in subfolders collection, skipping deletion.`
                )
            } else {
                throw error
            }
        }
    } catch (error) {
        console.error('Error deleting folder and its contents:', error)
        throw new Error('Failed to delete folder and its contents.')
    }
}

export const deleteFolder = async (folderId, isParentFolder = true) => {
    try {
        console.log(`Attempting to delete folder with ID: ${folderId}`)

        // Fetch subfolders and files
        const { folders, files } = await fetchFoldersAndFiles(folderId)
        console.log(
            `Fetched ${folders.length} subfolders and ${files.length} files.`
        )

        // Delete all files in the folder
        for (const file of files) {
            try {
                console.log(`Deleting file with ID: ${file.fileId}`)
                await deleteFile(file.fileId, file.$id)
                console.log(`File ${file.fileId} deleted successfully.`)
            } catch (error) {
                console.error(`Failed to delete file ${file.fileId}:`, error)
                throw new Error(`Failed to delete file ${file.fileId}`)
            }
        }

        // Recursively delete all subfolders
        for (const subfolder of folders) {
            try {
                console.log(
                    `Recursively deleting subfolder with ID: ${subfolder.$id}`
                )
                await deleteFolder(subfolder.$id, false)
            } catch (error) {
                console.error(
                    `Failed to delete subfolder ${subfolder.$id}:`,
                    error
                )
                throw new Error(`Failed to delete subfolder ${subfolder.$id}`)
            }
        }

        // Delete the folder itself
        const collectionId = isParentFolder
            ? appwriteConfig.uploadsCollectionId
            : appwriteConfig.subfoldersCollectionId
        console.log(`Deleting folder from collection: ${collectionId}`)
        await databases.deleteDocument(
            appwriteConfig.databaseId,
            collectionId,
            folderId
        )

        console.log(`Folder ${folderId} deleted successfully.`)
    } catch (error) {
        console.error('Error deleting folder and its contents:', error)
        throw new Error('Failed to delete folder and its contents.')
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
