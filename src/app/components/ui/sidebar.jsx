'use client'

import Link from 'next/link'
import React, { useState, createContext, useContext } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
    IconMenu2,
    IconX,
    IconHome,
    IconFileText,
    IconMedicalCross,
    IconUser,
    IconChartPie,
    IconLogout
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

const SidebarContext = createContext(undefined)

export const useSidebar = () => {
    const context = useContext(SidebarContext)
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider')
    }
    return context
}

export const SidebarProvider = ({
    children,
    open: openProp,
    setOpen: setOpenProp,
    animate = true
}) => {
    const [openState, setOpenState] = useState(false)

    const open = openProp !== undefined ? openProp : openState
    const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState

    return (
        <SidebarContext.Provider value={{ open, setOpen, animate: animate }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const Sidebar = ({ children, open, setOpen, animate }) => {
    return (
        <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
            {children}
        </SidebarProvider>
    )
}

export const SidebarBody = (props) => {
    return (
        <>
            <DesktopSidebar {...props} />
            <MobileSidebar {...props} />
        </>
    )
}

export const DesktopSidebar = ({ className, children, ...props }) => {
    const { open, setOpen, animate } = useSidebar()
    return (
        <motion.div
            className={cn(
                'fixed top-0 left-0 h-full bg-neutral-900 dark:bg-neutral-900 w-[300px] flex flex-col',
                className
            )}
            animate={{
                width: animate ? (open ? '300px' : '60px') : '300px'
            }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            {...props}>
            <div className="flex items-center justify-center h-16 bg-neutral-800 dark:bg-neutral-800">
                <div className="flex items-center space-x-2">
                    <img
                        src="/logo.svg"
                        alt="ASCOT Clinic Logo"
                        className="h-8 w-8"
                    />
                    {open && (
                        <span className="text-xl font-bold text-neutral-200">
                            ASCOT Clinic
                        </span>
                    )}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto">{children}</div>
            {/* User Profile Section */}
            {open && (
                <div className="flex items-center p-4 border-t border-neutral-800">
                    <img
                        src="/path/to/profile-image.jpg"
                        alt="User Profile"
                        className="h-8 w-8 rounded-full mr-2"
                    />
                    <span className="text-sm text-neutral-300">Clinic App</span>
                </div>
            )}
        </motion.div>
    )
}

export const MobileSidebar = ({ className, children, ...props }) => {
    const { open, setOpen } = useSidebar()
    return (
        <div
            className={cn(
                'h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-neutral-900 dark:bg-neutral-900 w-full'
            )}
            {...props}>
            <div className="flex justify-end z-20 w-full">
                <IconMenu2
                    className="text-neutral-200"
                    onClick={() => setOpen(!open)}
                />
            </div>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{
                            duration: 0.3,
                            ease: 'easeInOut'
                        }}
                        className={cn(
                            'fixed h-full w-full inset-0 bg-neutral-900 dark:bg-neutral-900 p-10 z-[100] flex flex-col justify-between',
                            className
                        )}>
                        <div
                            className="absolute right-10 top-10 z-50 text-neutral-200"
                            onClick={() => setOpen(!open)}>
                            <IconX />
                        </div>
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex items-center space-x-2">
                                <img
                                    src="/logo.svg"
                                    alt="ASCOT Clinic Logo"
                                    className="h-8 w-8"
                                />
                                <span className="text-xl font-bold text-neutral-200">
                                    ASCOT Clinic
                                </span>
                            </div>
                        </div>
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export const SidebarLink = ({ link, className, ...props }) => {
    const { open, animate } = useSidebar()
    const handleClick = (e) => {
        e.preventDefault()
        window.location.href = link.href
    }

    return (
        <Link
            href={link.href}
            onClick={handleClick}
            className={cn(
                'flex items-center justify-start gap-3 group/sidebar py-3 px-4 rounded-md hover:bg-neutral-800 dark:hover:bg-neutral-700',
                className
            )}
            {...props}>
            <span className="text-xl text-white dark:text-white">
                {link.icon}
            </span>
            <motion.span
                animate={{
                    display: animate
                        ? open
                            ? 'inline-block'
                            : 'none'
                        : 'inline-block',
                    opacity: animate ? (open ? 1 : 0) : 1
                }}
                className="text-lg text-neutral-200 group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0">
                {link.label}
            </motion.span>
        </Link>
    )
}
