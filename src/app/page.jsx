'use client'
import { useRequireAuth } from '@/utils/auth'

export default function Home() {
    useRequireAuth()

    return (
        <div>
            <h1>Welcome to the App</h1>
            {/* Your main application content */}
        </div>
    )
}
