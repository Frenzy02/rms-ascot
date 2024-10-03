'use client'

import { motion } from 'framer-motion'
import { useSidebar } from './sidebar' // Ensure this path is correct
import { cn } from '../../lib/utils'
import {
    IconDashboard,
    IconFileText,
    IconClipboard,
    IconBarChart,
    IconLogout
} from '@tabler/icons-react'
import SidebarLink from './SidebarLink' // Ensure this path is correct

const DesktopSidebar = ({ className, ...props }) => {
    const { open, setOpen, animate } = useSidebar()

    return (
        <motion.div
            className={cn(
                'h-full px-4 py-4 hidden md:flex md:flex-col bg-neutral-100 dark:bg-neutral-800 w-[300px] flex-shrink-0',
                className
            )}
            animate={{ width: animate ? (open ? '300px' : '60px') : '300px' }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}>
            <div className="flex items-center justify-start gap-2 mb-8">
                <div className="bg-white rounded-full w-8 h-8"></div>
                <motion.span
                    animate={{
                        display: animate
                            ? open
                                ? 'inline-block'
                                : 'none'
                            : 'inline-block',
                        opacity: animate ? (open ? 1 : 0) : 1
                    }}
                    className="text-neutral-700 dark:text-neutral-200 text-lg font-semibold">
                    Acet Labs
                </motion.span>
            </div>
            <SidebarLink
                link={{
                    href: '/dashboard',
                    label: 'Dashboard',
                    icon: <IconDashboard size={20} />
                }}
            />
            <SidebarLink
                link={{
                    href: '/medical-records',
                    label: 'Medical Records',
                    icon: <IconFileText size={20} />
                }}
            />
            <SidebarLink
                link={{
                    href: '/request',
                    label: 'Request',
                    icon: <IconClipboard size={20} />
                }}
            />
            <SidebarLink
                link={{
                    href: '/analytics',
                    label: 'Analytics',
                    icon: <IconBarChart size={20} />
                }}
            />
            <SidebarLink
                link={{
                    href: '/logout',
                    label: 'Logout',
                    icon: <IconLogout size={20} />
                }}
            />
        </motion.div>
    )
}

export default DesktopSidebar
