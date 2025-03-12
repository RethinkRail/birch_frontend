/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/1/2024, Tuesday
 * Description:
 **/
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CrewManagement = () => {
    const [crews, setCrews] = useState([]);
    const [isActiveTab, setIsActiveTab] = useState(true);
    const [departments, setDepartments] = useState([]);
    const [editCrew, setEditCrew] = useState(null);
    const [newCrew, setNewCrew] = useState({ name: '', employee_id: '', department: '' });
    const [showAddCrewForm, setShowAddCrewForm] = useState(false);

    useEffect(() => {
        fetchCrewsAndDepartments();
    }, []);

    const fetchCrewsAndDepartments = async () => {
        const crewsResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'crews');
        const departmentsResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_job_category');
        setCrews(crewsResponse.data);
        setDepartments(departmentsResponse.data);
    };

    const handleUpdate = async (crew) => {
        console.log(crew)
        await axios.put(process.env.REACT_APP_BIRCH_API_URL + `crews/${crew.id}`, crew);
        setEditCrew(null); // Reset editCrew after update
        fetchCrewsAndDepartments();
    };

    const handleDeactivate = async (crewId) => {
        if (window.confirm('Are you sure you want to deactivate this crew?')) {
            await axios.put(process.env.REACT_APP_BIRCH_API_URL + `crews/${crewId}/deactivate`);
            fetchCrewsAndDepartments();
        }
    };

    const handleReactivate = async (crewId) => {
        if (window.confirm('Are you sure you want to reactivate this crew?')) {
            await axios.put(process.env.REACT_APP_BIRCH_API_URL + `crews/${crewId}/activate`);
            fetchCrewsAndDepartments();
        }
    };

    const handleEditChange = (field, value) => {
        setEditCrew({ ...editCrew, [field]: value });
        console.log(editCrew)
    };

    const renderCrewRow = (crew) => {
        const isEditing = editCrew && editCrew.id === crew.id;

        return (
            <tr key={crew.id} className="border-b border-gray-200">
                <td className="py-2 px-4">
                    {isEditing ? (
                        <input
                            type="text"
                            className="border border-gray-300 rounded px-2 py-1"
                            value={editCrew.name}
                            onChange={(e) => handleEditChange('name', e.target.value)}
                        />
                    ) : (
                        crew.name
                    )}
                </td>
                <td className="py-2 px-4">
                    {isEditing ? (
                        <input
                            type="text"
                            className="border border-gray-300 rounded px-2 py-1"
                            value={editCrew.employee_id || ''}
                            onChange={(e) => handleEditChange('employee_id', e.target.value)}
                        />
                    ) : (
                        crew.employee_id || '-'
                    )}
                </td>


                <td className="py-2 px-4">
                    {isEditing ? (
                        <select
                            className="border border-gray-300 rounded px-2 py-1"
                            value={editCrew.department}
                            onChange={(e) => handleEditChange('department', e.target.value)}
                        >
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    ) : (
                        departments.find((dept) => dept.id === crew.department)?.name || '-'
                    )}
                </td>
                <td className="py-2 px-4">
                    {isEditing ? (
                        <input
                            type="text"
                            className="border border-gray-300 rounded px-2 py-1"
                            value={editCrew.certificate || ''}
                            onChange={(e) => handleEditChange('certificate', e.target.value)}
                        />
                    ) : (
                        crew.certificate || ''
                    )}
                </td>
                <td className="py-2 px-4">
                    {isActiveTab ? (
                        <>
                            {isEditing ? (
                                <button
                                    onClick={() => handleUpdate(editCrew)}
                                    className="bg-blue-500 text-white rounded px-4 py-1 hover:bg-blue-600"
                                >
                                    Update
                                </button>
                            ) : (
                                <button
                                    onClick={() => setEditCrew({ ...crew })} // Start editing with crew details
                                    className="bg-green-500 text-white rounded px-4 py-1 hover:bg-green-600"
                                >
                                    Edit
                                </button>
                            )}
                            <button
                                onClick={() => handleDeactivate(crew.id)}
                                className="bg-red-500 text-white rounded px-4 py-1 ml-2 hover:bg-red-600"
                            >
                                Deactivate
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => handleReactivate(crew.id)}
                            className="bg-yellow-500 text-white rounded px-4 py-1 hover:bg-yellow-600"
                        >
                            Reactivate
                        </button>
                    )}
                </td>
            </tr>
        );
    };

    const activeCrews = crews.filter((crew) => crew.is_active === 1);
    const deactivatedCrews = crews.filter((crew) => crew.is_active === 0);

    const handleAddCrewChange = (field, value) => {
        setNewCrew({ ...newCrew, [field]: value });
    };

    const handleAddCrew = async (e) => {
        e.preventDefault();
        await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'crews', newCrew);
        setNewCrew({ name: '', employee_id: '', department: '' }); // Reset the form
        fetchCrewsAndDepartments();
        setShowAddCrewForm(false); // Hide form after submission
    };

    return (
        <div className="mb-10">
            <h1 className="text-2xl font-bold mb-4 mt-10">Team Member Management</h1>

            <button
                onClick={() => setShowAddCrewForm(!showAddCrewForm)}
                className="mb-4 bg-blue-500 text-white rounded px-4 py-2 hover:bg-blue-600"
            >
                {showAddCrewForm ? 'Cancel' : 'Add New Team Member'}
            </button>

            {showAddCrewForm && (
                <form onSubmit={handleAddCrew} className="mb-4 p-4 border border-gray-300 rounded">
                    <h2 className="text-xl font-semibold mb-2">New Team Member</h2>
                    <div className="flex flex-col space-y-2">
                        <input
                            type="text"
                            placeholder="Name"
                            className="border border-gray-300 rounded px-2 py-1"
                            value={newCrew.name}
                            onChange={(e) => handleAddCrewChange('name', e.target.value)}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Employee ID"
                            className="border border-gray-300 rounded px-2 py-1"
                            value={newCrew.employee_id}
                            onChange={(e) => handleAddCrewChange('employee_id', e.target.value)}
                        />
                        <select
                            className="border border-gray-300 rounded px-2 py-1"
                            value={newCrew.department}
                            onChange={(e) => handleAddCrewChange('department', e.target.value)}
                            required
                        >
                            <option value="" disabled>Select Department</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            className="bg-green-500 text-white rounded px-4 py-2 hover:bg-green-600"
                        >
                            Add Team Member
                        </button>
                    </div>
                </form>
            )}

            <div className="mb-4">
                <button
                    onClick={() => setIsActiveTab(true)}
                    className={`mr-2 py-2 px-4 rounded ${isActiveTab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-500`}
                >
                    Active Team Members
                </button>
                <button
                    onClick={() => setIsActiveTab(false)}
                    className={`py-2 px-4 rounded ${!isActiveTab ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-500`}
                >
                    Deactivated Team Members
                </button>
            </div>

            <table className="min-w-full bg-white border border-gray-300 rounded shadow">
                <thead>
                <tr className="bg-light-blue">
                    <th className="py-2 px-4 text-left">Name</th>
                    <th className="py-2 px-4 text-left">Employee ID</th>
                    <th className="py-2 px-4 text-left">Department</th>
                    <th className="py-2 px-4 text-left">Certifications</th>
                    <th className="py-2 px-4 text-left">Actions</th>
                </tr>
                </thead>
                <tbody>
                {(isActiveTab ? activeCrews : deactivatedCrews).map(renderCrewRow)}
                </tbody>
            </table>
        </div>
    );
};

export default CrewManagement;
