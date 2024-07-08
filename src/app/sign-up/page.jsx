'use client'
import React, { useState } from 'react'
import { auth } from '@/services/api/firebase'
import {
    createUserWithEmailAndPassword,
    sendEmailVerification
} from 'firebase/auth'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { notification } from '@/utils/notifications'
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
    const router = useRouter()

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

            try {
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    userInfo.email,
                    userInfo.password
                )

                const user = userCredential.user
                await sendEmailVerification(user)

                notification(
                    'success',
                    'Registration successful! Please check your email to verify your account.'
                )

                // Redirect to log-in after a slight delay to allow notification to be seen
                setTimeout(() => {
                    router.push('/log-in')
                }, 2000)

                // Reset the form
                setUserInfo(defaultFields)
            } catch (error) {
                if (error.code === 'auth/weak-password') {
                    notification(
                        'error',
                        'Password should be at least 6 characters.'
                    )
                } else {
                    notification('error', error.message)
                }
            } finally {
                setIsLoading(false)
            }
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
                            {isLoading ? 'Registering...' : 'Register'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
