'use client'
import { useRequireAuth } from '@/utils/auth'

const Home = () => {
    useRequireAuth()

    return (
        <div>
            <h1>Welcome to the App</h1>
            {/* Your main application content */}
        </div>
    )
}

export default Home
