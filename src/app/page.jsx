'use client'

export const Home = (props) => {
    const { user, signOut } = props

    return (
        <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <a
                href="/"
                onClick={() => {
                    signOut()
                }}>
                Sign Out
            </a>
        </main>
    )
}

export default Home
