'use client'
import React, { useEffect, useState } from 'react'

const DocumentsPage = () => {
    const [documents, setDocuments] = useState([])
    const [error, setError] = useState(null)

    const fetchDocuments = async () => {
        try {
            const response = await fetch(`/api/documents`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setDocuments(data)
        } catch (error) {
            setError(`Error fetching documents: ${error.message}`)
        }
    }

    useEffect(() => {
        fetchDocuments()
    }, [])

    return (
        <div>
            <h1>Documents</h1>
            {error && <p>{error}</p>}
            <ul>
                {documents.map((doc) => (
                    <li key={doc.id}>
                        <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer">
                            {doc.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default DocumentsPage
