/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/9/2024, Wednesday
 * Description:
 **/

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkStationManager = () => {
    const [stations, setStations] = useState([]);
    const [stationName, setStationName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [selectedStationId, setSelectedStationId] = useState(null);
    const [resetPassword, setResetPassword] = useState('');
    const [confirmResetPassword, setConfirmResetPassword] = useState('');
    const [showResetModal, setShowResetModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteStationId, setDeleteStationId] = useState(null);

    useEffect(() => {
        fetchStations();
    }, []);

    const fetchStations = async () => {
        // Fetch all work stations from the backend API
        try {
            const res = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'work-stations');
            setStations(res.data);
        } catch (error) {
            console.error('Error fetching work stations:', error);
        }
    };

    const handleAddStation = async () => {
        if (password !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        try {
            await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'work-station', {
                station_name: stationName,
                station_login: stationName, // Set station_login to be the same as station_name
                password,
            });
            fetchStations();
            setStationName('');
            setPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error adding station:', error);
        }
    };

    const handleDeleteStation = async () => {
        try {
            await axios.delete(process.env.REACT_APP_BIRCH_API_URL + `work-station/${deleteStationId}`);
            setShowDeleteConfirm(false);
            setDeleteStationId(null);
            fetchStations();
        } catch (error) {
            alert("Can't delete, this work station is being used")
            console.error('Error deleting station:', error);
        }
    };

    const handleOpenResetModal = (id) => {
        setSelectedStationId(id);
        setShowResetModal(true);
    };

    const handleCloseResetModal = () => {
        setShowResetModal(false);
        setResetPassword('');
        setConfirmResetPassword('');
    };

    const handleResetPassword = async () => {
        if (resetPassword !== confirmResetPassword) {
            alert("Passwords don't match");
            return;
        }

        try {
            await axios.put(process.env.REACT_APP_BIRCH_API_URL + `work-station/${selectedStationId}/reset-password`, {
                password: resetPassword,
            });
            handleCloseResetModal();
            fetchStations();
        } catch (error) {
            console.error('Error resetting password:', error);
        }
    };

    const handleOpenDeleteConfirm = (id) => {
        setDeleteStationId(id);
        setShowDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setShowDeleteConfirm(false);
        setDeleteStationId(null);
    };

    return (
        <div className="mb-10">
            <h1 className="text-2xl font-bold mb-4 mt-10">Add new work station</h1>

            {/* Add new station */}
            <div className="mb-6 w-1/3">
                <input
                    type="text"
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Station Name"
                    value={stationName}
                    onChange={(e) => setStationName(e.target.value)}
                />
                <input
                    type="password"
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <input
                    type="password"
                    className="border p-2 rounded w-full mb-2"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                    onClick={handleAddStation}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add Work Station
                </button>
            </div>

            {/* Display work stations in a table */}
            <div>
                <h2 className="text-xl font-bold mb-2">Existing Work Stations</h2>
                <table className="min-w-full table-auto border-collapse border border-gray-300">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-4 py-2">Station Name</th>
                        <th className="border px-4 py-2">Station Login</th>
                        <th className="border px-4 py-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {stations.map((station) => (
                        <tr key={station.id}>
                            <td className="border px-4 py-2">{station.station_name}</td>
                            <td className="border px-4 py-2">{station.station_login}</td>
                            <td className="border px-4 py-2">
                                <button
                                    onClick={() => handleOpenResetModal(station.id)}
                                    className="bg-yellow-500 text-white px-4 py-2 mr-2 rounded hover:bg-yellow-600"
                                >
                                    Reset Password
                                </button>
                                <button
                                    onClick={() => handleOpenDeleteConfirm(station.id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Password Reset ParentModal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <input
                            type="password"
                            className="border p-2 rounded w-full mb-2"
                            placeholder="New Password"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            className="border p-2 rounded w-full mb-2"
                            placeholder="Confirm Password"
                            value={confirmResetPassword}
                            onChange={(e) => setConfirmResetPassword(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={handleResetPassword}
                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2 hover:bg-blue-600"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCloseResetModal}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Delete Work Station</h2>
                        <p>Are you sure you want to delete this work station?</p>
                        <div className="flex justify-end mt-4">
                            <button
                                onClick={handleDeleteStation}
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2 hover:bg-red-600"
                            >
                                Delete
                            </button>
                            <button
                                onClick={handleCloseDeleteConfirm}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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

export default WorkStationManager;
