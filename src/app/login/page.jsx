'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import './LoginSignup.css'
import { cardio } from 'ldrs'

// Register the loader component
cardio.register()

const MIN_LOADER_DURATION = 3000 // Minimum duration for the loader in milliseconds

const LoginSignup = ({ closeModal }) => {
    const [isSignUp, setIsSignUp] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [loaderStartTime, setLoaderStartTime] = useState(null)
    const router = useRouter()

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = ''
        }
    }, [])

    const handleToggle = () => {
        setIsSignUp(!isSignUp)
    }

    const waitForLoader = () => {
        return new Promise((resolve) => {
            const elapsed = Date.now() - loaderStartTime
            const remaining = Math.max(0, MIN_LOADER_DURATION - elapsed)
            setTimeout(resolve, remaining)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        setLoaderStartTime(Date.now()) // Set the start time of the loader

        const endpoint = isSignUp ? '/api/signup' : '/api/login'
        const payload = isSignUp
            ? { email, password, username }
            : { email, password }

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            // Wait for the loader to be displayed for at least MIN_LOADER_DURATION
            await waitForLoader()

            if (response.ok) {
                if (isSignUp) {
                    setIsSignUp(false) // Switch to login view after successful sign up
                } else {
                    // Save login state, username, userId, and role, then redirect based on role
                    sessionStorage.setItem('isLoggedIn', 'true')
                    sessionStorage.setItem('username', data.username) // Save username
                    sessionStorage.setItem('userId', data.userId) // Save userId
                    sessionStorage.setItem('role', data.role) // Save user role

                    // Role-based redirection
                    if (data.role === 'admin') {
                        router.push('/admin-panel')
                    } else if (data.role === 'staff') {
                        router.push('/staff-panel')
                    } else if (data.role === 'viewer') {
                        router.push('/viewer-panel')
                    } else {
                        router.push('/student-panel') // Fallback to student panel if no role
                    }

                    closeModal()
                }
            } else {
                setError(data.message || 'Something went wrong')
            }
        } catch (error) {
            console.error('Error:', error)
            setError('Something went wrong')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="login-signup-container">
                    <div className="card-wrapper">
                        <div
                            className={`card ${
                                isSignUp ? 'sign-up' : 'log-in'
                            }`}>
                            <div className="card-front">
                                <div className="form-container">
                                    <h4>Log In</h4>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <input
                                                type="email"
                                                className="form-style"
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="password"
                                                className="form-style"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn">
                                            {isLoading ? (
                                                <l-cardio
                                                    size="30"
                                                    stroke="4"
                                                    speed="2"
                                                    color="black"></l-cardio>
                                            ) : (
                                                'Log In'
                                            )}
                                        </button>
                                        <p
                                            className="link"
                                            onClick={handleToggle}>
                                            Don't have an account? Sign Up
                                        </p>
                                        {error && (
                                            <p className="error">{error}</p>
                                        )}
                                    </form>
                                </div>
                            </div>
                            <div className="card-back">
                                <div className="form-container">
                                    <h4>Sign Up</h4>
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <input
                                                type="text"
                                                className="form-style"
                                                placeholder="Full Name"
                                                value={username}
                                                onChange={(e) =>
                                                    setUsername(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="email"
                                                className="form-style"
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="password"
                                                className="form-style"
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(e.target.value)
                                                }
                                                required
                                            />
                                        </div>
                                        <button type="submit" className="btn">
                                            {isLoading ? (
                                                <l-cardio
                                                    size="30"
                                                    stroke="4"
                                                    speed="2"
                                                    color="black"></l-cardio>
                                            ) : (
                                                'Sign Up'
                                            )}
                                        </button>
                                        <p
                                            className="link"
                                            onClick={handleToggle}>
                                            Already have an account? Log In
                                        </p>
                                        {error && (
                                            <p className="error">{error}</p>
                                        )}
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginSignup
