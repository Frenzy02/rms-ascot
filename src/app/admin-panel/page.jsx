'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar, SidebarBody, SidebarLink } from '../components/ui/sidebar'
import {
    IconHome,
    IconFileText,
    IconMedicalCross,
    IconUser,
    IconChartPie,
    IconLogout
} from '@tabler/icons-react'
import { useAuthUserStore } from '@/store/user'
import Dashboard from '../admin-panel/dashboard/page'
import DocumentsRecords from '../admin-panel/documents-records/page'
import MedicalRequest from '../admin-panel/medical-request/page'
import Users from '../admin-panel/users/page'
import Analytics from '../admin-panel/analytics/page'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Client, Account } from 'appwrite'
import { appwriteConfig, signOut } from '@/services/api/appwrite'
import { ToastContainer, toast } from 'react-toastify'

// Initialize Appwrite Client
const client = new Client()
client.setEndpoint(appwriteConfig.endpoint).setProject(appwriteConfig.projectId)
const account = new Account(client)

const AdminPanel = () => {
    const { clearAuthUser } = useAuthUserStore((state) => ({
        clearAuthUser: state.clearAuthUser
    }))
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeComponent, setActiveComponent] = useState('dashboard')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkLogin = async () => {
            try {
                const user = await account.get() // Check for current Appwrite session
                if (user) {
                    setIsLoggedIn(true) // User is logged in
                } else {
                    router.push('/') // Redirect if no user is found
                }
            } catch (error) {
                console.error('Error checking auth state:', error)
                router.push('/') // Redirect to login if an error occurs
            }
        }

        checkLogin()
    }, [router])

    const handleLogoutClick = () => {
        setIsDialogOpen(true)
    }

    const handleLogoutConfirm = async () => {
        const response = await signOut() // Use the logout function
        if (response.success) {
            clearAuthUser() // Clear user data in your local store
            router.push('/') // Redirect to the login page
            toast.success(response.message)
        } else {
            toast.error(response.error)
        }
    }

    const handleLogoutCancel = () => {
        setIsDialogOpen(false)
    }

    const renderContent = () => {
        switch (activeComponent) {
            case 'dashboard':
                return <Dashboard />
            case 'documentsRecords':
                return <DocumentsRecords />
            case 'medicalRequest':
                return <MedicalRequest />
            case 'users':
                return <Users />
            case 'analytics':
                return <Analytics />
            default:
                return <Dashboard />
        }
    }

    if (!isLoggedIn) {
        return null // Optionally return a loading indicator or message
    }

    return (
        <div className="flex min-h-screen bg-neutral-900">
            <Sidebar open={sidebarOpen} setOpen={setSidebarOpen}>
                <SidebarBody>
                    <SidebarLink
                        link={{
                            href: '#',
                            label: 'Dashboard',
                            icon: <IconHome />
                        }}
                        onClick={() => setActiveComponent('dashboard')}
                    />
                    <SidebarLink
                        link={{
                            href: '#',
                            label: 'Documents Records',
                            icon: <IconFileText />
                        }}
                        onClick={() => setActiveComponent('documentsRecords')}
                    />
                    <SidebarLink
                        link={{
                            href: '#',
                            label: 'Document Request',
                            icon: <IconMedicalCross />
                        }}
                        onClick={() => setActiveComponent('medicalRequest')}
                    />
                    <SidebarLink
                        link={{
                            href: '#',
                            label: 'Users',
                            icon: <IconUser />
                        }}
                        onClick={() => setActiveComponent('users')}
                    />
                    <SidebarLink
                        link={{
                            href: '#',
                            label: 'Analytics',
                            icon: <IconChartPie />
                        }}
                        onClick={() => setActiveComponent('analytics')}
                    />
                    <SidebarLink
                        link={{
                            href: '#',
                            label: 'Log Out',
                            icon: <IconLogout />
                        }}
                        onClick={handleLogoutClick}
                    />
                </SidebarBody>
            </Sidebar>

            <div
                className={`flex-grow p-4 transition-all duration-300 ${
                    sidebarOpen ? 'ml-[300px]' : 'ml-[70px]'
                }`}>
                <div>{renderContent()}</div>
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to log out? You will be
                            redirected to the Home Page.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleLogoutCancel}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleLogoutConfirm}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <ToastContainer />
        </div>
    )
}

export default AdminPanel
