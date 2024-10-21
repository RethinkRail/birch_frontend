/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/21/2024, Monday
 * Description:
**/

// LogDetailsModal.js
// LogDetailsModal.js
import React from 'react';

const LogDetailsModal = ({ log, onClose, onApprove,onDelete, onEditClick }) => {
    if (!log) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg w-full max-h-[80vh] overflow-y-auto m-10">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h1 className="text-xl font-bold">{log.employee_name}</h1>
                    <button
                        onClick={onClose}
                        className="text-red-500 font-bold text-lg">
                        &times;
                    </button>
                </div>

                {/* Table Section */}
                <div className="p-4 overflow-x-auto">
                    <table className="table-auto w-full">
                        <thead>
                        <tr>
                            <th className="px-4 py-2 border">Date</th>
                            <th className="px-4 py-2 border">Day</th>
                            <th className="px-4 py-2 border">In</th>
                            <th className="px-4 py-2 border">Out</th>
                            <th className="px-4 py-2 border">Hours</th>
                            <th className="px-4 py-2 border">Customer</th>
                            <th className="px-4 py-2 border">Job Description</th>
                            <th className="px-4 py-2 border">MHR</th>
                            <th className="px-4 py-2 border">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {log.logs.map((entry) => (
                            <tr key={entry.time_log_entry_id}>
                                <td className="border px-4 py-2">
                                    {new Date(entry.start_time).toLocaleDateString()}
                                </td>
                                <td className="border px-4 py-2">
                                    {new Date(entry.start_time).toLocaleString('en-US', { weekday: 'long' })}
                                </td>
                                <td className="border px-4 py-2">
                                    {new Date(entry.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="border px-4 py-2">
                                    {new Date(entry.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="border px-4 py-2">
                                    {(entry.logged_time_in_seconds / 3600).toFixed(1)}
                                </td>
                                <td className="border px-4 py-2">{entry.railcar_id}</td>
                                <td className="border px-4 py-2">{entry.job_description}</td>
                                <td className="border px-4 py-2">
                                    {((entry.mhe - entry.approved_time_in_line) / 3600).toFixed(1)}
                                </td>
                                <td className="border px-4 py-2 flex space-x-2">
                                    {entry.is_approved === 1 ? (
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded">
                                            Unapprove
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => onEditClick(entry)}
                                                className="bg-yellow-500 text-white px-2 py-1 rounded">
                                                Edit
                                            </button>
                                            <button className="bg-green-500 text-white px-2 py-1 rounded mr-2">
                                                Approve
                                            </button>
                                            <button className="bg-red-500 text-white px-2 py-1 rounded">
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex justify-end p-4 border-t">
                    <button
                        onClick={onClose}
                        className="bg-gray-500 text-white px-4 py-2 rounded">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogDetailsModal;
