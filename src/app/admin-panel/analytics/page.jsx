'use client'

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
import { fetchUploadsByStatusAndMonth } from '@/services/api/appwrite'

export default function DocumentsAnalytics() {
    const [activeTab, setActiveTab] = useState('Uploads')
    const [year, setYear] = useState(new Date().getFullYear())
    const [statusData, setStatusData] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const months = [
            'Jan.',
            'Feb.',
            'Mar.',
            'April',
            'May',
            'June',
            'July',
            'Aug.',
            'Sept.',
            'Oct.',
            'Nov.',
            'Dec.'
        ]

        const fetchData = async () => {
            setLoading(true)
            try {
                if (activeTab === 'Uploads') {
                    const data = await fetchUploadsByStatusAndMonth(year)

                    // Format the status data to cover all months
                    const formattedStatusData = months.map((month, index) => {
                        const monthKey = new Date(year, index).toLocaleString(
                            'default',
                            { month: 'short' }
                        )

                        const monthData = data[monthKey] || {
                            approved: 0,
                            rejected: 0
                        }

                        return {
                            month,
                            approved: monthData.approved,
                            rejected: monthData.rejected
                        }
                    })

                    setStatusData(formattedStatusData)
                }
            } catch (error) {
                console.error('Failed to fetch status data:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [year, activeTab]) // Remove `months` from the dependency array

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="bg-white p-6 rounded-lg shadow-lg mb-4">
                <h1 className="text-3xl font-bold">Document Analytics</h1>
                <p className="text-gray-600">
                    Insights into your document management system
                </p>
            </div>

            <div className="flex space-x-4 mb-6">
                <button
                    onClick={() => setActiveTab('Uploads')}
                    className={`p-2 rounded-lg ${
                        activeTab === 'Uploads' ? 'bg-gray-300' : 'bg-gray-200'
                    } font-semibold`}>
                    Uploads
                </button>
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
            </div>

            <div className="bg-white p-6 rounded-lg shadow-lg">
                {loading ? (
                    <div className="flex justify-center items-center min-h-[300px]">
                        <div className="w-16 h-16 border-4 border-orange-500 border-dashed rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={statusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                                dataKey="approved"
                                fill="#00C49F"
                                name="Approved"
                            />
                            <Bar
                                dataKey="rejected"
                                fill="#FF8042"
                                name="Rejected"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    )
}
