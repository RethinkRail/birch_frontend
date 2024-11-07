/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/2/2024, Wednesday
 * Description:
 **/

import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [assignedRoles, setAssignedRoles] = useState([]);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [activeTab, setActiveTab] = useState('waiting');

    const fetchUsers = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_roles');
            setRoles(response.data);
        } catch (error) {
            console.error('Error fetching roles:', error);
        }
    };

    const assignRoles = async () => {
        try {
            await axios.put(process.env.REACT_APP_BIRCH_API_URL + `users/${selectedUserId}/roles`, {
                roles: assignedRoles,
            });
            fetchUsers();
            setAssignedRoles([]);
            setSelectedUserId(null);
            setShowRoleModal(false);
        } catch (error) {
            console.error('Error assigning roles:', error);
        }
    };

    const activateUser = async (id) => {
        try {
            await axios.put(process.env.REACT_APP_BIRCH_API_URL + `users/${id}/activate`);
            fetchUsers();
        } catch (error) {
            console.error('Error activating user:', error);
        }
    };

    const deactivateUser = async (id) => {
        if (window.confirm('Are you sure you want to deactivate this crew?')) {
            try {
                await axios.put(process.env.REACT_APP_BIRCH_API_URL + `users/${id}/deactivate`);
                fetchUsers();
            } catch (error) {
                console.error('Error deactivating user:', error);
            }
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const openRoleModalForActivation = (userId) => {
        const user = users.find((u) => u.id === userId);
        setAssignedRoles(user.roles.map(role => role.id)); // Set current roles for the user
        setSelectedUserId(userId); // Set selected user ID for role assignment
        setShowRoleModal(true); // Open role assignment modal
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 mt-2">User Management</h1>
            <div className="flex mb-4 space-x-4">
                <button
                    className={`flex-1 py-2 px-4 rounded ${activeTab === 'waiting' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('waiting')}
                >
                    Waiting for Activation
                </button>
                <button
                    className={`flex-1 py-2 px-4 rounded ${activeTab === 'active' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('active')}
                >
                    Active
                </button>
                <button
                    className={`flex-1 py-2 px-4 rounded ${activeTab === 'deactivated' ? 'bg-gray-400 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('deactivated')}
                >
                    Deactivated
                </button>
            </div>

            <div className="mt-6">
                {/* Conditional rendering based on the active tab */}
                {activeTab === 'waiting' && (
                    <>
                        <h2 className="text-xl font-semibold mb-4">Waiting for Activation</h2>
                        <table className="min-w-full bg-gray-100 border border-gray-300 rounded-lg">
                            <thead className="bg-light-blue">
                            <tr>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users
                                .filter((user) => user.is_active === 0)
                                .map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{user.name}</td>
                                        <td className="border px-4 py-2">{user.email}</td>
                                        <td className="border px-4 py-2">
                                            <button
                                                className="text-blue-600 hover:underline btn"
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setAssignedRoles([]); // Reset roles for new assignment
                                                    setShowRoleModal(true); // Open modal
                                                }}
                                            >
                                                Assign Roles and Activate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {activeTab === 'active' && (
                    <>
                        <h2 className="text-xl font-semibold mb-4 mt-6">Active Users</h2>
                        <table className="w-full bg-gray-100 border border-gray-300  font-normal font-light">
                            <thead className="bg-light-blue">
                            <tr>
                                <th className="border px-4 py-2 w-1/5">Name</th>
                                <th className="border px-4 py-2 w-1/5">Email</th>
                                <th className="border px-4 py-2 w-2/5">Roles</th>
                                <th className="border px-4 py-2 w-1/5">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users
                                .filter((user) => user.is_active === 1)
                                .map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{user.name}</td>
                                        <td className="border px-4 py-2">{user.email}</td>
                                        <td className="border px-4 py-2">{user.roles.join(', ')}</td>
                                        <td className="border px-4 py-2 mr-2 inline-flex">
                                            <button
                                                className="text-red-600  btn-sm bg-gray-200 rounded text-xs"
                                                onClick={() => deactivateUser(user.id)}
                                            >
                                                Deactivate
                                            </button>
                                            <button
                                                className="text-blue-600 ml-2 btn-sm bg-gray-200 rounded text-xs"
                                                onClick={() => {
                                                    setSelectedUserId(user.id);
                                                    setAssignedRoles(
                                                        roles
                                                            .filter((role) => user.roles.includes(role.name))
                                                            .map((role) => role.id)
                                                    ); // Pre-select current roles
                                                    setShowRoleModal(true); // Open modal
                                                }}
                                            >Update Roles</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}

                {activeTab === 'deactivated' && (
                    <>
                        <h2 className="text-xl font-semibold mb-4 mt-6">Deactivated Users</h2>
                        <table className="min-w-full bg-gray-100 border border-gray-300 rounded-lg">
                            <thead className="bg-light-blue">
                            <tr>
                                <th className="border px-4 py-2">Name</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users
                                .filter((user) => user.is_active === 2)
                                .map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{user.name}</td>
                                        <td className="border px-4 py-2">{user.email}</td>
                                        <td className="border px-4 py-2">
                                            <button
                                                className="text-blue-600 hover:underline btn-sm p-2 bg-gray-200 rounded"
                                                onClick={() => openRoleModalForActivation(user.id)} // Open role modal instead of directly activating
                                            >
                                                Assign roles and reactivate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            {/* ParentModal for Changing Roles */}
            {showRoleModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-[90vh] overflow-y-auto my-8"> {/* Added max height and vertical margin */}
                        <h2 className="text-lg font-semibold mb-2">{selectedUserId ? 'Assign Roles' : 'Change Roles'}</h2>
                        <div className="space-y-2">
                            {roles.map((role) => (
                                <div key={role.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        value={role.id}
                                        checked={assignedRoles.includes(role.id)}
                                        onChange={(e) => {
                                            const value = parseInt(e.target.value);
                                            setAssignedRoles((prev) =>
                                                prev.includes(value)
                                                    ? prev.filter((id) => id !== value)
                                                    : [...prev, value]
                                            );
                                        }}
                                        className="mr-2"
                                    />
                                    <label className="text-gray-700">{role.name}</label>
                                </div>
                            ))}
                            <button
                                onClick={selectedUserId ? assignRoles : () => {
                                    if (assignedRoles.length > 0) {
                                        activateUser(selectedUserId); // Activate the user if roles are assigned
                                    } else {
                                        alert("Please assign at least one role before activation.");
                                    }
                                }}
                                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition mr-2"
                            >
                                {selectedUserId ? 'Assign Roles' : 'Activate User'}
                            </button>
                            <button
                                onClick={() => setShowRoleModal(false)}
                                className="mt-2 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};

export default UserManagement;
