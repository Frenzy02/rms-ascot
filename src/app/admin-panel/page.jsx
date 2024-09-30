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
import { getUserData } from '@/services/api/user-management'
import { auth } from '@/services/api/firebase'
import { ToastContainer, toast } from 'react-toastify'

const AdminPanel = () => {
    const { user, clearAuthUser } = useAuthUserStore((state) => ({
        user: state.authUser,
        clearAuthUser: state.clearAuthUser
    }))
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [activeComponent, setActiveComponent] = useState('dashboard')
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkLogin = async () => {
            const user = auth.currentUser // Check if user is currently authenticated
            if (user) {
                const userData = await getUserData(user.uid)
                if (userData) {
                    setIsLoggedIn(true) // User is logged in
                } else {
                    router.push('/') // Redirect if user data is not found
                }
            } else {
                router.push('/') // Redirect to login if no user is found
            }
        }

        checkLogin()
    }, [router])

    const handleLogoutClick = () => {
        setIsDialogOpen(true)
    }

    const handleLogoutConfirm = async () => {
        try {
            await auth.signOut()
            clearAuthUser()
            router.push('/')
            toast.success('Successfully signed out.')
        } catch (error) {
            toast.error('Error signing out. Please try again.')
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
        </div>
    )
}

export default AdminPanel
