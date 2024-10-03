'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Eye, EyeOff } from 'lucide-react'
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { cardio } from 'ldrs'
cardio.register()

// Main Modal Component
export default function ModalComponent({ onClose }) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [isOpen, setIsOpen] = useState(true)
    const [formData, setFormData] = useState({
        username: '',
        firstname: '',
        lastname: '',
        gender: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'instructor'
    })
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    // Handle input change for the form fields
    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    // Handle sign up form submission
    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    firstname: formData.firstname,
                    lastname: formData.lastname,
                    gender: formData.gender,
                    username: formData.username // Add username
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.message)
            toast.success(data.message)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password
                })
            })

            const data = await response.json()
            if (!data.success) throw new Error(data.message || 'Login failed')

            sessionStorage.setItem('isLoggedIn', 'true')
            sessionStorage.setItem('username', data.username)
            sessionStorage.setItem('email', formData.email)
            sessionStorage.setItem('userId', data.userId)

            toast.success('You have successfully logged in!')
            router.push('/student-panel')
        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleFlip = () => {
        setIsFlipped((prev) => !prev)
        setError('')
    }

    const closeModal = () => {
        setIsOpen(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <ToastContainer />
            <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
                <div className="flip-card-inner">
                    {/* Sign Up Card */}
                    <div className="flip-card-front">
                        <Card className="w-[350px] bg-gray-800 text-white relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">
                                    Sign Up
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Create a new account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[300px] pr-4">
                                    <form
                                        className="space-y-4"
                                        onSubmit={handleSignup}>
                                        <InputField
                                            label="Username"
                                            name="username"
                                            placeholder="johndoe123"
                                            value={formData.username}
                                            onChange={handleInputChange}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <InputField
                                                label="First Name"
                                                name="firstname"
                                                placeholder="John"
                                                value={formData.firstname}
                                                onChange={handleInputChange}
                                            />
                                            <InputField
                                                label="Last Name"
                                                name="lastname"
                                                placeholder="Doe"
                                                value={formData.lastname}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <GenderSelect
                                            formData={formData}
                                            setFormData={setFormData}
                                        />
                                        <InputField
                                            label="Email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                        />
                                        <InputField
                                            label="Password"
                                            name="password"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            endAdornment={
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    {showPassword ? (
                                                        <EyeOff />
                                                    ) : (
                                                        <Eye />
                                                    )}
                                                </button>
                                            }
                                        />
                                        <InputField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            type={
                                                showPassword
                                                    ? 'text'
                                                    : 'password'
                                            }
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            endAdornment={
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowPassword(
                                                            !showPassword
                                                        )
                                                    }
                                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                    {showPassword ? (
                                                        <EyeOff />
                                                    ) : (
                                                        <Eye />
                                                    )}
                                                </button>
                                            }
                                        />
                                        {error && (
                                            <p className="text-red-500">
                                                {error}
                                            </p>
                                        )}
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600 flex items-center justify-center"
                                            disabled={loading}>
                                            {loading ? (
                                                <l-cardio
                                                    size="24"
                                                    stroke="4"
                                                    speed="2"
                                                    color="white"
                                                />
                                            ) : (
                                                'Sign Up'
                                            )}
                                        </Button>
                                    </form>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <p className="text-gray-400">
                                    Already have an account?
                                </p>
                                <Button
                                    onClick={handleFlip}
                                    className="text-blue-600">
                                    Log In
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    {/* Log In Card */}
                    <div className="flip-card-back">
                        <Card className="w-[350px] bg-gray-800 text-white relative">
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white">
                                <X size={24} />
                            </button>
                            <CardHeader>
                                <CardTitle className="text-2xl font-bold">
                                    Log In
                                </CardTitle>
                                <CardDescription className="text-gray-400">
                                    Access your account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    className="space-y-4"
                                    onSubmit={handleLogin}>
                                    <InputField
                                        label="Email"
                                        name="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                    <InputField
                                        label="Password"
                                        name="password"
                                        type={
                                            showPassword ? 'text' : 'password'
                                        }
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        endAdornment={
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword
                                                    )
                                                }
                                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                {showPassword ? (
                                                    <EyeOff />
                                                ) : (
                                                    <Eye />
                                                )}
                                            </button>
                                        }
                                    />
                                    {error && (
                                        <p className="text-red-500">{error}</p>
                                    )}
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 flex items-center justify-center"
                                        disabled={loading}>
                                        {loading ? (
                                            <l-cardio
                                                size="24"
                                                stroke="4"
                                                speed="2"
                                                color="white"
                                            />
                                        ) : (
                                            'Log In'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter className="flex justify-between">
                                <p className="text-gray-400">
                                    Don't have an account?
                                </p>
                                <Button
                                    onClick={handleFlip}
                                    className="text-blue-600">
                                    Sign Up
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
                <style jsx>{`
                    .flip-card {
                        width: 350px;
                        height: 500px;
                        perspective: 1000px;
                    }
                    .flip-card-inner {
                        position: relative;
                        width: 100%;
                        height: 100%;
                        transition: transform 0.6s;
                        transform-style: preserve-3d;
                    }
                    .flip-card.flipped .flip-card-inner {
                        transform: rotateY(180deg);
                    }
                    .flip-card-front,
                    .flip-card-back {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        backface-visibility: hidden;
                    }
                    .flip-card-back {
                        transform: rotateY(180deg);
                    }
                    input[type='radio'] {
                        accent-color: white;
                    }
                `}</style>
            </div>
        </div>
    )
}

// Reusable InputField Component
const InputField = ({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    endAdornment
}) => (
    <div className="relative">
        <Label htmlFor={name} className="text-gray-400">
            {label}
        </Label>
        <Input
            name={name}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="mt-1 bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        {endAdornment}
    </div>
)

// Reusable GenderSelect Component
const GenderSelect = ({ formData, setFormData }) => (
    <div>
        <Label className="text-gray-400">Gender</Label>
        <div className="flex space-x-4 mt-1">
            <label className="flex items-center cursor-pointer">
                <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === 'Male'}
                    onChange={() =>
                        setFormData((prev) => ({ ...prev, gender: 'Male' }))
                    }
                    className="hidden peer"
                />
                <span className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 w-full text-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition duration-200">
                    Male
                </span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === 'Female'}
                    onChange={() =>
                        setFormData((prev) => ({ ...prev, gender: 'Female' }))
                    }
                    className="hidden peer"
                />
                <span className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 w-full text-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition duration-200">
                    Female
                </span>
            </label>
            <label className="flex items-center cursor-pointer">
                <input
                    type="radio"
                    name="gender"
                    value="Other"
                    checked={formData.gender === 'Other'}
                    onChange={() =>
                        setFormData((prev) => ({ ...prev, gender: 'Other' }))
                    }
                    className="hidden peer"
                />
                <span className="bg-gray-700 text-white border border-gray-600 rounded-md p-2 w-full text-center peer-checked:bg-blue-500 peer-checked:border-blue-500 transition duration-200">
                    Other
                </span>
            </label>
        </div>
    </div>
)
