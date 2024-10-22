import React, { useState } from 'react'
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts'

const data = [
    { month: 'Jan', uploads: 60, downloads: 30, active: 105 },
    { month: 'Feb', uploads: 55, downloads: 50, active: 100 },
    { month: 'Mar', uploads: 80, downloads: 40, active: 130 },
    { month: 'Apr', uploads: 81, downloads: 67, active: 130 },
    { month: 'May', uploads: 60, downloads: 50, active: 120 },
    { month: 'Jun', uploads: 70, downloads: 55, active: 110 },
    { month: 'Jul', uploads: 50, downloads: 45, active: 95 }
]

export default function DocumentsAnalytics() {
    const [activeTab, setActiveTab] = useState('Overview')

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            {/* Header */}
            <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
                <h1 className="text-3xl font-bold">Document Analytics</h1>
                <p className="text-gray-600">
                    Insights into your document management system
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 mb-6">
                {['Overview', 'Uploads', 'File Types'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`p-2 rounded-lg ${
                            activeTab === tab ? 'bg-gray-300' : 'bg-gray-200'
                        } font-semibold`}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
                {activeTab === 'Overview' && (
                    <ResponsiveContainer width="100%" height={400}>
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="uploads"
                                stroke="#00C49F"
                                activeDot={{ r: 8 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="downloads"
                                stroke="#FF8042"
                            />
                            <Line
                                type="monotone"
                                dataKey="active"
                                stroke="#0088FE"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                )}

                {activeTab === 'Uploads' && (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="uploads" fill="#00C49F" />
                        </BarChart>
                    </ResponsiveContainer>
                )}

                {activeTab === 'File Types' && (
                    <div>
                        {/* You can add another graph or table for file types */}
                        <p>File Types Analytics Coming Soon!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
