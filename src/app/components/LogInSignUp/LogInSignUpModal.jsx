'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthUserStore } from '@/store/user'
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
import { Account, Client } from 'appwrite'
import {
    appwriteConfig,
    getUserData,
    signInUser,
    signUpUser
} from '@/services/api/appwrite'

// Initialize Appwrite Account
const account = new Account(
    new Client()
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId)
)

export default function LogInSignUpModal({ onClose }) {
    const [showPassword, setShowPassword] = useState(false)
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
        department: '', // Added department field
        role: 'viewer'
    })
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const { setAuthUser } = useAuthUserStore((state) => ({
        setAuthUser: state.setAuthUser
    }))

    useEffect(() => {
        const checkAuthState = async () => {
            try {
                const user = await account.get()
                if (user) {
                    const userData = await getUserData(user.$id)
                    setAuthUser(userData)
                    redirectUser(userData.role)
                }
            } catch (error) {
                console.error('Error checking auth state:', error)
            }
        }
        checkAuthState()
    }, [router, setAuthUser])

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match.')
            return
        }
        setLoading(true)
        const response = await signUpUser(formData)
        setLoading(false)
        response.success
            ? (toast.success('Registration successful!'),
              setAuthUser(response.user),
              redirectUser(response.user.role))
            : toast.error(response.error)
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        const response = await signInUser(formData.email, formData.password)
        setLoading(false)
        response.success
            ? (toast.success('You have successfully logged in.'),
              setAuthUser(response.user),
              redirectUser(response.user.role))
            : toast.error(response.error)
    }

    const redirectUser = (role) => {
        const routes = {
            admin: '/admin-panel',
            staff: '/staff-panel',
            viewer: '/viewer-panel'
        }
        router.push(routes[role] || '/')
    }

    const handleFlip = () => setIsFlipped((prev) => !prev)
    const closeModal = () => setIsOpen(false)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <ToastContainer />
            <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
                <div className="flip-card-inner">
                    {/* Sign Up Card */}
                    <div className="flip-card-front">
                        <Card className="w-full max-w-[350px] bg-gray-800 text-white relative">
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
                                <ScrollArea className="h-[300px] overflow-y-auto pr-2">
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
                                        <DepartmentSelect
                                            formData={formData}
                                            setFormData={setFormData}
                                        />
                                        <PasswordInput
                                            name="password"
                                            label="Password"
                                            value={formData.password}
                                            showPassword={showPassword}
                                            onToggle={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            onChange={handleInputChange}
                                        />
                                        <PasswordInput
                                            name="confirmPassword"
                                            label="Confirm Password"
                                            value={formData.confirmPassword}
                                            showPassword={showPassword}
                                            onToggle={() =>
                                                setShowPassword(!showPassword)
                                            }
                                            onChange={handleInputChange}
                                        />
                                        <Button
                                            type="submit"
                                            className="w-full bg-blue-600"
                                            disabled={loading}>
                                            {loading ? (
                                                <LoadingSpinner />
                                            ) : (
                                                'Sign Up'
                                            )}
                                        </Button>
                                    </form>
                                </ScrollArea>
                            </CardContent>
                            <CardFooter>
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
                        <Card className="w-full max-w-[350px] bg-gray-800 text-white relative">
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
                                    <PasswordInput
                                        name="password"
                                        label="Password"
                                        value={formData.password}
                                        showPassword={showPassword}
                                        onToggle={() =>
                                            setShowPassword(!showPassword)
                                        }
                                        onChange={handleInputChange}
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600"
                                        disabled={loading}>
                                        {loading ? (
                                            <LoadingSpinner />
                                        ) : (
                                            'Log In'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                            <CardFooter>
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
            </div>
            <style jsx>{`
                .flip-card {
                    width: 100%;
                    max-width: 350px;
                    height: 500px;
                    perspective: 1000px;
                    position: relative;
                }
                .flip-card-inner {
                    position: absolute;
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
                    overflow-y: auto;
                    z-index: 1;
                }
                .flip-card-back {
                    transform: rotateY(180deg);
                    z-index: 0;
                }
                @media (max-width: 768px) {
                    .flip-card {
                        max-width: 90%;
                    }
                }
            `}</style>
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

// Loading Spinner
const LoadingSpinner = () => (
    <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
    </div>
)

// GenderSelect Component
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

// DepartmentSelect Component for Department Selection
const DepartmentSelect = ({ formData, setFormData }) => (
    <div className="relative">
        <Label className="text-gray-400">Department</Label>
        <select
            name="department"
            value={formData.department}
            onChange={(e) =>
                setFormData((prev) => ({ ...prev, department: e.target.value }))
            }
            className="mt-1 w-full bg-gray-700 text-white border border-gray-600 rounded-md">
            <option value="">Select Department</option>
            <option value="Information Technology">
                Information Technology
            </option>
            <option value="Agriculture">Agriculture</option>
            <option value="Education">Education</option>
            <option value="Engineering">Engineering</option>
        </select>
    </div>
)

// PasswordInput Component
const PasswordInput = ({
    name,
    label,
    value,
    showPassword,
    onToggle,
    onChange
}) => (
    <div className="relative">
        <Label htmlFor={name} className="text-gray-400">
            {label}
        </Label>
        <Input
            name={name}
            type={showPassword ? 'text' : 'password'}
            placeholder={label}
            value={value}
            onChange={onChange}
            className="mt-1 bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
        />
        <button
            type="button"
            onClick={onToggle}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            {showPassword ? <EyeOff /> : <Eye />}
        </button>
    </div>
)
