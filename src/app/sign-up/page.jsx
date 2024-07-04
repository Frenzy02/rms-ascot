'use client'
import React, { useState } from 'react'
import {
    checkIfEmailExist,
    registerUser,
    updateUser
} from '@/services/api/user-management'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { notification } from '@/utils/notifications'
import { hashPassword } from '@/utils/user'
import { useRouter } from 'next/navigation'

const defaultFields = {
    email: '',
    password: '',
    confirmPassword: ''
}

export default function SignUp() {
    const [userInfo, setUserInfo] = useState(defaultFields)
    const userInfoFieldsKeys = Object.keys(defaultFields)
    const [isLoading, setIsLoading] = useState(false)

    const registerUsers = async (e) => {
        e.preventDefault()

        if (
            userInfoFieldsKeys.filter((field) => userInfo[field] === '')
                .length === 0
        ) {
            if (userInfo.password !== userInfo.confirmPassword) {
                notification('error', 'Passwords do not match.')
                return
            }

            setIsLoading(true)
            // Check if the email already exists
            const existingUser = await checkIfEmailExist(userInfo.email)

            if (existingUser) {
                // Update the user information
                const payload = userInfo
                delete payload.confirmPassword // Remove confirmPassword field

                await updateUser(existingUser.email, payload).then((res) => {
                    try {
                        if (res) {
                            notification(
                                'success',
                                res.email +
                                    ' Successfully! Update Information ',
                                {
                                    onClose: () => {
                                        setTimeout(() => router.push('/'), 2000)
                                    }
                                }
                            )
                        }
                    } catch (err) {
                        notification(
                            'error',
                            'An error encountered while user is trying to update user information.'
                        )
                    }
                    setIsLoading(false)
                })
            } else {
                // Register a new user
                const payload = userInfo
                payload.userType = 'user'
                payload.password = await hashPassword(payload.password)
                delete payload.confirmPassword // Remove confirmPassword field

                notification('info', 'Submitting user information...')

                await registerUser(payload).then((res) => {
                    try {
                        if (res) {
                            notification(
                                'success',
                                res.email + ' registered successfully!',
                                {
                                    onClose: () => {
                                        setTimeout(
                                            () =>
                                                (window.location.href =
                                                    '/log-in'),
                                            2000
                                        )
                                    }
                                }
                            )
                        }
                    } catch (err) {
                        notification(
                            'error',
                            'An error encountered while user is trying to register.'
                        )
                    }
                    setIsLoading(false)
                })
            }

            // Reset the form
            setUserInfo(defaultFields)
        } else {
            notification('error', 'Some fields are empty.')
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
                            Create a new account
                        </h2>
                        <p className="mt-2 text-center text-sm text-muted-foreground text-white">
                            Or{' '}
                            <Link
                                href="/log-in"
                                className="font-medium text-white text-primary hover:underline"
                                prefetch={false}>
                                sign in to your existing account
                            </Link>
                        </p>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={registerUsers}>
                        <Input
                            value={userInfo.email}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    email: e.target.value
                                })
                            }
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                            placeholder="Email address"
                        />
                        <Input
                            value={userInfo.password}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    password: e.target.value
                                })
                            }
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="relative block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                            placeholder="Password"
                        />
                        <Input
                            value={userInfo.confirmPassword}
                            onChange={(e) =>
                                setUserInfo({
                                    ...userInfo,
                                    confirmPassword: e.target.value
                                })
                            }
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            className="relative block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-foreground placeholder-muted-foreground focus:z-10 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                            placeholder="Confirm Password"
                        />
                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center">
                                <Checkbox
                                    id="terms"
                                    name="terms"
                                    className="h-4 w-4 rounded checkbox-custom-white"
                                />
                                <Label
                                    htmlFor="terms"
                                    className="ml-2 block text-sm text-muted-foreground">
                                    I agree to the terms and conditions
                                </Label>
                            </div>
                        </div>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="relative flex w-full justify-center rounded-md bg-gray-400 py-2 px-4 text-sm font-medium text-primary-foreground text-gray-900 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                            {isLoading ? 'Loading...' : 'Register'}
                        </Button>
                    </form>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-background px-2 text-muted-foreground">
                                Or sign up with
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            variant="outline"
                            className="flex items-center justify-center">
                            <GithubIcon className="mr-2 h-5 w-5" />
                            GitHub
                        </Button>
                        <Button
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
