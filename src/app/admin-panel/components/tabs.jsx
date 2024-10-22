// components/ui/tabs.jsx

import React from 'react'
import { useState } from 'react'

export function Tabs({ value, onValueChange, children }) {
    const [activeTab, setActiveTab] = useState(value)

    const handleTabChange = (newValue) => {
        setActiveTab(newValue)
        if (onValueChange) onValueChange(newValue)
    }

    return (
        <div>
            {React.Children.map(children, (child) =>
                React.cloneElement(child, { activeTab, handleTabChange })
            )}
        </div>
    )
}

export function TabsList({ children, activeTab }) {
    return <div className="flex space-x-2">{children}</div>
}

export function TabsTrigger({ value, children, activeTab, handleTabChange }) {
    return (
        <button
            onClick={() => handleTabChange(value)}
            className={`py-2 px-4 rounded-lg ${
                activeTab === value
                    ? 'bg-gray-100 text-gray-800'
                    : 'text-gray-600 hover:bg-gray-50'
            }`}>
            {children}
        </button>
    )
}

export function TabsContent({ value, activeTab, children }) {
    if (value !== activeTab) return null
    return <div>{children}</div>
}
