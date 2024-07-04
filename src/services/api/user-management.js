import {
    onSnapshot,
    setDoc,
    doc,
    getDoc,
    updateDoc,
    deleteDoc,
    collection,
    getDocs
} from 'firebase/firestore'
import { firedb } from './firebase'

export const registerUser = async (payload) => {
    try {
        const documentReferences = doc(firedb, 'users', payload.email)
        const res = await setDoc(documentReferences, payload)
        return payload
    } catch (error) {
        console.error('Registration Error: ', error)
    }
}

export const updateUser = async (payload) => {
    try {
        const docRef = doc(firedb, 'users', payload.email)
        const res = await updateDoc(docRef, payload, { merge: true })
        return res
    } catch (error) {
        console.error('Updating User Error: ', error)
    }
}

export const checkIfEmailExist = async (email) => {
    const docRef = doc(firedb, 'users', email)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : false
}

export const getDocumentData = async (collection, payload, errorMessage) => {
    try {
        const docRef = doc(firedb, collection, payload)
        const docSnap = await getDoc(docRef)
        return docSnap.exists() ? docSnap.data() : false
    } catch (error) {
        console.error(errorMessage, error)
        return false
    }
}

export const getDbCollection = async (table, errorMessage) => {
    try {
        const collectionRef = collection(firedb, table)
        const collectionSnap = await getDocs(collectionRef)
        let res = []
        collectionSnap.forEach((doc) => {
            res = [
                ...res,
                {
                    id: doc.id,
                    ...doc.data()
                }
            ]
        })

        return res
    } catch (error) {
        console.error(errorMessage, error)
        return false
    }
}

export const refreshUserData = async (email) => {
    const docRef = doc(firedb, 'users', email)
    const docSnap = await getDoc(docRef)
    return docSnap.exists() ? docSnap.data() : false
}
