'use client'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useAuthUserStore } from '@/store/user'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
    GoogleAuthProvider,
    GithubAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    onAuthStateChanged
} from 'firebase/auth'
import { auth } from '@/services/api/firebase'

export default function LogIn() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')

    const { setAuthUser } = useAuthUserStore((state) => ({
        setAuthUser: state.setAuthUser
    }))

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const userData = {
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid
                    // Add other user properties if needed
                }
                setAuthUser(userData)
                router.push('/')
            }
        })
        return () => unsubscribe()
    }, [router, setAuthUser])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            )
            const user = userCredential.user
            if (user) {
                const userData = {
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid
                }
                setAuthUser(userData)
                router.push('/')
                toast.success('You have successfully logged in.')
            }
        } catch (error) {
            switch (error.code) {
                case 'auth/user-not-found':
                    toast.error('User not found.')
                    break
                case 'auth/wrong-password':
                    toast.error('Incorrect password.')
                    break
                case 'auth/too-many-requests':
                    toast.error('Too many requests. Try again later.')
                    break
                default:
                    toast.error('An error occurred during sign-in.')
                    console.error('Sign-in error:', error)
                    break
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogle = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const provider = new GoogleAuthProvider()

        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user
            if (user) {
                const userData = {
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid
                }
                setAuthUser(userData)
                router.push('/')
                toast.success('You have successfully logged in.')
            }
        } catch (error) {
            if (
                error.code === 'auth/cancelled-popup-request' ||
                error.code === 'auth/popup-closed-by-user'
            ) {
                toast.error('Popup closed before completing sign in.')
            } else {
                toast.error('An error occurred during Google sign-in.')
                console.error('Google sign-in error:', error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    const handleGithub = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        const provider = new GithubAuthProvider()

        try {
            const result = await signInWithPopup(auth, provider)
            const user = result.user
            if (user) {
                const userData = {
                    email: user.email,
                    displayName: user.displayName,
                    uid: user.uid
                }
                setAuthUser(userData)
                router.push('/')
                toast.success('You have successfully logged in.')
            }
        } catch (error) {
            if (
                error.code === 'auth/cancelled-popup-request' ||
                error.code === 'auth/popup-closed-by-user'
            ) {
                toast.error('Popup closed before completing sign in.')
            } else {
                toast.error('An error occurred during Github sign-in.')
                console.error('Github sign-in error:', error)
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
            <div className="relative hidden lg:block">
                <img
                    src="/pokemon.jpg"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-primary/10" />
            </div>
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <h2 className="mt-6 text-center text-3xl text-white font-bold tracking-tight text-foreground">
                            Sign in to your account
                        </h2>
                        <p className="mt-2 text-center text-sm text-muted-foreground text-white">
                            Or{' '}
                            <Link
                                href="/sign-up"
                                className="font-medium text-white text-primary hover:underline"
                                prefetch={false}>
                                sign up for a new account
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="relative block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center"></div>
                            <div className="text-sm">
                                <Link
                                    href="/resetPassword"
                                    id="reset"
                                    className="font-medium text-primary text-white hover:underline"
                                    prefetch={false}>
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex w-full justify-center rounded-md bg-gray-400 py-2 px-4 text-sm font-medium text-primary-foreground text-gray-900 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            {isLoading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or sign in with
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            onClick={handleGithub}
                            variant="outline"
                            className="flex items-center justify-center">
                            <GithubIcon className="mr-2 h-5 w-5" />
                            GitHub
                        </Button>
                        <Button
                            onClick={handleGoogle}
                            variant="outline"
                            className="flex items-center justify-center">
                            <ChromeIcon className="mr-2 h-5 w-5" />
                            Google
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function ChromeIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="4" />
            <line x1="21.17" x2="12" y1="8" y2="8" />
            <line x1="3.95" x2="8.54" y1="6.06" y2="14" />
            <line x1="10.88" x2="15.46" y1="21.94" y2="14" />
        </svg>
    )
}

function GithubIcon(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    )
}
