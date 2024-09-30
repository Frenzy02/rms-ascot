import React from 'react'

const MedicalRequest = () => {
    const handleApproveRequest = () => {
        // Logic to approve the request
        console.log('Request approved')
    }

    const handleRejectRequest = () => {
        // Logic to reject the request
        console.log('Request rejected')
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4 md:px-6">
            <header className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">Medical Requests</h1>
                <button
                    onClick={() => console.log('Exporting requests...')}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 dark:bg-blue-700 dark:hover:bg-blue-800">
                    Export
                </button>
            </header>
            <p className="mt-2 text-neutral-600 dark:text-neutral-300"></p>
            <div className="overflow-auto border rounded-lg mt-6">
                <table className="min-w-full bg-white dark:bg-neutral-800">
                    <thead className="bg-gray-100 dark:bg-neutral-700">
                        <tr>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-neutral-300">
                                Requester Name
                            </th>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-neutral-300">
                                Request ID
                            </th>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-neutral-300">
                                Type of Request
                            </th>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-neutral-300">
                                Status
                            </th>
                            <th className="py-2 px-4 text-left text-sm font-semibold text-gray-600 dark:text-neutral-300">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-neutral-200">
                                Mikey Del Rosario
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-neutral-200">
                                RQ12345
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-neutral-200">
                                Medical Certificate
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-neutral-200">
                                Pending
                            </td>
                            <td className="py-2 px-4 text-sm text-gray-700 dark:text-neutral-200">
                                <button
                                    onClick={handleApproveRequest}
                                    className="text-green-600 hover:underline dark:text-green-400 mr-2">
                                    Approve
                                </button>
                                <button
                                    onClick={handleRejectRequest}
                                    className="text-red-600 hover:underline dark:text-red-400">
                                    Reject
                                </button>
                            </td>
                        </tr>
                        {/* Add more request rows as needed */}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default MedicalRequest
