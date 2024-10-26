import React, { useState, useEffect } from 'react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'
import {
    fetchUploadsByParentFolder,
    fetchUploadsByStatusAndMonth
} from '@/services/api/appwrite'

export default function DocumentsAnalytics() {
    const [activeTab, setActiveTab] = useState('Parent Folder')
    const [year, setYear] = useState(new Date().getFullYear())
    const [month, setMonth] = useState(null) // Add month state
    const [folderData, setFolderData] = useState([])
    const [statusData, setStatusData] = useState([])

    const months = [
        { label: 'All', value: null },
        { label: 'January', value: 1 },
        { label: 'February', value: 2 },
        { label: 'March', value: 3 },
        { label: 'April', value: 4 },
        { label: 'May', value: 5 },
        { label: 'June', value: 6 },
        { label: 'July', value: 7 },
        { label: 'August', value: 8 },
        { label: 'September', value: 9 },
        { label: 'October', value: 10 },
        { label: 'November', value: 11 },
        { label: 'December', value: 12 }
    ]

    useEffect(() => {
        const fetchFolderData = async () => {
            if (activeTab === 'Parent Folder') {
                try {
                    const data = await fetchUploadsByParentFolder(year, month)
                    const formattedData = Object.keys(data).map((folderId) => {
                        const folder = data[folderId]
                        return { name: folder.name, ...folder.months }
                    })
                    console.log('Formatted Folder Data:', formattedData) // Debug log
                    setFolderData(formattedData)
                } catch (error) {
                    console.error('Failed to fetch folder data:', error)
                }
            } else if (activeTab === 'Uploads') {
                try {
                    const data = await fetchUploadsByStatusAndMonth(year)
                    const formattedStatusData = Object.keys(data).map(
                        (month) => ({
                            month,
                            approved: data[month].approved,
                            rejected: data[month].rejected
                        })
                    )
                    console.log('Formatted Status Data:', formattedStatusData) // Debug log
                    setStatusData(formattedStatusData)
                } catch (error) {
                    console.error('Failed to fetch status data:', error)
                }
            }
        }
        fetchFolderData()
    }, [year, month, activeTab])

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
                <h1 className="text-3xl font-bold">Document Analytics</h1>
                <p className="text-gray-600">
                    Insights into your document management system
                </p>
            </div>

            <div className="flex space-x-4 mb-6">
                {['Parent Folder', 'Uploads', 'File Types'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`p-2 rounded-lg ${
                            activeTab === tab ? 'bg-gray-300' : 'bg-gray-200'
                        } font-semibold`}>
                        {tab}
                    </button>
                ))}
                <select
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    value={year}
                    className="p-2 border rounded-lg bg-white">
                    {[2023, 2024, 2025].map((yr) => (
                        <option key={yr} value={yr}>
                            {yr}
                        </option>
                    ))}
                </select>
                <select
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                    value={month}
                    className="p-2 border rounded-lg bg-white">
                    {months.map((m) => (
                        <option key={m.value} value={m.value}>
                            {m.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                {activeTab === 'Parent Folder' && (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={folderData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {Object.keys(folderData[0] || {}).map(
                                (monthLabel) =>
                                    monthLabel !== 'name' ? (
                                        <Bar
                                            key={monthLabel}
                                            dataKey={monthLabel}
                                            fill={`#${Math.floor(
                                                Math.random() * 16777215
                                            ).toString(16)}`}
                                        />
                                    ) : null
                            )}
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {activeTab === 'Uploads' && (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={statusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="approved" fill="#00C49F" />
                            <Bar dataKey="rejected" fill="#FF8042" />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {activeTab === 'File Types' && (
                    <div>
                        <p>File Types Analytics Coming Soon!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
