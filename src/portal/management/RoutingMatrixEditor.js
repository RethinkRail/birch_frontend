/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/19/2024, Thursday
 * Description:
 **/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const RoutingMatrixEditor = () => {
    const [routingMatrices, setRoutingMatrices] = useState([]);
    const [selectedMatrixId, setSelectedMatrixId] = useState(null);
    const [steps, setSteps] = useState([]);
    const [newMatrixName, setNewMatrixName] = useState('');
    const [statusCodes, setStatusCodes] = useState([]);
    const [roles, setRoles] = useState([]);
    const [newStep, setNewStep] = useState({
        step_code: '',
        pre_step_1: '',
        pre_step_2: '',
        pre_step_3: '',
        pre_step_4: '',
        role_ID: '',
        brc_status_code: '',
        task_description: ''
    });
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Fetch Routing Matrices
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BIRCH_API_URL}routingmatrix`)
            .then(response => setRoutingMatrices(response.data))
            .catch(error => console.error('Error fetching routing matrices:', error));
    }, []);

    // Fetch Steps when a Matrix is Selected
    useEffect(() => {
        if (selectedMatrixId) {
            axios.get(`${process.env.REACT_APP_BIRCH_API_URL}routingmatrix/${selectedMatrixId}/steps`)
                .then(response => setSteps(response.data))
                .catch(error => console.error('Error fetching steps:', error));
        }
    }, [selectedMatrixId]);

    // Fetch Status Codes and Roles
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_BIRCH_API_URL}get_all_status`)
            .then(response => setStatusCodes(response.data))
            .catch(error => console.error('Error fetching status codes:', error));

        axios.get(`${process.env.REACT_APP_BIRCH_API_URL}get_all_roles`)
            .then(response => setRoles(response.data))
            .catch(error => console.error('Error fetching roles:', error));
    }, []);

    // Update Task Description Based on Status Code
    const updateTaskDescription = (statusCode) => {

        const status = statusCodes.find(code => code.code === parseInt(statusCode));
        return status ? status.description : '';
    };

    // Handle Input Change for Step Fields
    const handleStepFieldChange = (stepIndex, field, value) => {
        const updatedSteps = [...steps];
        if (field === 'brc_status_code') {
            const taskDescription = updateTaskDescription(value);
            updatedSteps[stepIndex] = {
                ...updatedSteps[stepIndex],
                [field]: value,
                task_description: taskDescription
            };
        } else {
            updatedSteps[stepIndex] = {
                ...updatedSteps[stepIndex],
                [field]: value
            };
        }
        setSteps(updatedSteps);
    };

    // Handle Adding a New Step
    const handleAddStep = () => {
        const updatedSteps = [...steps, { ...newStep }];
        setSteps(updatedSteps);
        setNewStep({
            step_code: '',
            pre_step_1: '',
            pre_step_2: '',
            pre_step_3: '',
            pre_step_4: '',
            role_ID: '',
            brc_status_code: '',
            task_description: ''
        });
    };

    // Handle Deleting a Step
    const handleDeleteStep = (stepId) => {
        axios.delete(`${process.env.REACT_APP_BIRCH_API_URL}routingmatrix/steps/${stepId}`)
            .then(response => {
                console.log(response)
                const updatedSteps = steps.filter(step => step.id !== stepId);
                setSteps(updatedSteps);
                toast.success('Deleted successfully.')
            })
            .catch(error => console.error('Error deleting step:', error));
    };

    // Handle Updating a Step
    const handleUpdateStep = (step) => {
        let updatedStep = {
            ...step,
            // Convert brc_status_code to an integer if necessary
            rm_id: parseInt(selectedMatrixId, 10) || null, // Use null if conversion fails
            brc_status_code: parseInt(step.brc_status_code, 10) || null, // Use null if conversion fails
            role_ID: parseInt(step.role_ID, 10) || null, // Use null if conversion fails
            step_code: parseInt(step.step_code, 10) || null, // Use null if conversion fails
            pre_step_1: parseInt(step.pre_step_1, 10) || 0, // Use null if conversion fails
            pre_step_2: parseInt(step.pre_step_2, 10) || 0, // Use null if conversion fails
            pre_step_3: parseInt(step.pre_step_3, 10) || 0, // Use null if conversion fails
            pre_step_4: parseInt(step.pre_step_4, 10) || 0, // Use null if conversion fails
            // If other fields also need conversion, add them here
        };

        delete updatedStep.role;
        delete updatedStep.statuscode;
        console.log(updatedStep)
        axios.put(`${process.env.REACT_APP_BIRCH_API_URL}routingmatrix/${selectedMatrixId}/steps/${step.id}`, updatedStep)
            .then((response)=>{
                const updatedSteps = steps.map(s => s.id === step.id ? { ...s, ...updatedStep, id: response.data.id } : s);
                setSteps(updatedSteps);
                toast.success('Updated successfully.')
            })
            .catch(error => toast.error('Error updating step.'));
    };

    // Handle Deleting a Matrix
    const handleDeleteMatrix = () => {
        axios.delete(`${process.env.REACT_APP_BIRCH_API_URL}routingmatrix/${selectedMatrixId}`)
            .then(response => {
                setRoutingMatrices(prevMatrices => {
                    const updatedMatrices = prevMatrices.filter(matrix => matrix.id !== selectedMatrixId);
                    console.log(updatedMatrices); // Log the updated state
                    return updatedMatrices;
                });
                console.log(selectedMatrixId)
                setSelectedMatrixId(null);
                // Trigger the change event correctly
                const rmSelector = document.getElementById("rmSelector");
                if (rmSelector) {
                    rmSelector.dispatchEvent(new Event('change'));  // Properly trigger the change event
                }
                toast.success('Routing matrix and its steps deleted successfully.');
            })
            .catch(error => toast.error('Error deleting routing matrix.'));
    };

    // Handle Adding a New Matrix
    const handleAddMatrix = () => {
        if (newMatrixName) {
            axios.post(`${process.env.REACT_APP_BIRCH_API_URL}routingmatrix`, { name: newMatrixName })
                .then(response => {
                    setRoutingMatrices([...routingMatrices, response.data]);
                    setNewMatrixName('');
                    toast.success('Routing matrix added successfully.');
                })
                .catch(error => toast.error('Error adding routing matrix.'));
        }
    };

    return (
        <React.Fragment>
            <div className="font-inter">
                {/* Add New Routing Matrix Section */}
                <div className="mb-6 flex items-center">
                    <div className="mt-8">
                        <label className="text-lg font-semibold mr-4">Add new routing:</label>
                        <input
                            type="text"
                            value={newMatrixName}
                            onChange={(e) => setNewMatrixName(e.target.value)}
                            placeholder="New Routing Matrix Name"
                            className="border p-2 rounded-l-lg"
                        />
                        <button
                            onClick={handleAddMatrix}
                            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg"
                        >
                            Add
                        </button>
                    </div>
                </div>

                {/* Select Routing Matrix */}
                <div className="mb-6 flex items-center">
                    <select id="rmSelector"
                            value={selectedMatrixId || ""}
                            onChange={(e) => setSelectedMatrixId(e.target.value)}

                            className="border p-2 rounded-l-lg"
                    >
                        <option >Select Routing Matrix</option>
                        {routingMatrices.map(matrix => (
                            <option key={matrix.id} value={matrix.id}>{matrix.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={handleDeleteMatrix}
                        className="bg-red-500 text-white px-4 py-2 rounded-r-lg ml-2"
                    >
                        Delete
                    </button>
                </div>

                {/* Steps Table */}
                {selectedMatrixId && (
                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full x-auto text-sm font-normal bg-white border rounded-lg shadow-md">
                            <thead className="bg-light-blue text-left font-normal">
                            <tr className="border-b">
                                <th className="py-2 px-4 w-12">Step Code</th>
                                <th className="py-2 px-4 w-12">Pre-Step 1</th>
                                <th className="py-2 px-4 w-12">Pre-Step 2</th>
                                <th className="py-2 px-4 w-12">Pre-Step 3</th>
                                <th className="py-2 px-4 w-12">Pre-Step 4</th>
                                <th className="py-2 px-4 w-32">Role</th>
                                <th className="py-2 px-4 w-32">Status Code</th>
                                <th className="py-2 px-4 w-30">Task Description</th>
                                <th className="py-2 px-4 text-right w-40">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {steps.map((step, index) => (
                                <tr key={step.id} className="border-b">
                                    <td className="py-2 px-4 w-12">
                                        <input
                                            type="number"
                                            value={step.step_code || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'step_code', e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </td>
                                    <td className="py-2 px-4 w-12">
                                        <input
                                            type="number"
                                            value={step.pre_step_1 || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'pre_step_1', e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </td>
                                    <td className="py-2 px-4 w-12">
                                        <input
                                            type="number"
                                            value={step.pre_step_2 || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'pre_step_2', e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </td>
                                    <td className="py-2 px-4 w-12">
                                        <input
                                            type="number"
                                            value={step.pre_step_3 || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'pre_step_3', e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </td>
                                    <td className="py-2 px-4 w-12">
                                        <input
                                            type="text"
                                            value={step.pre_step_4 || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'pre_step_4', e.target.value)}
                                            className="border p-1 rounded w-full"
                                        />
                                    </td>
                                    <td className="py-2 px-4 w-32">
                                        <select
                                            value={step.role_ID || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'role_ID', e.target.value)}
                                            className="border p-1 rounded w-full"
                                        >
                                            <option value="">Select Role</option>
                                            {roles.map(role => (
                                                <option key={role.id} value={role.id}>{role.name}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-2 px-4 w-28">
                                        <select
                                            value={step.brc_status_code || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'brc_status_code', e.target.value)}
                                            className="border p-1 rounded w-full"
                                        >
                                            <option value="">Select Status Code</option>
                                            {statusCodes.map(statusCode => (
                                                <option key={statusCode.code} value={statusCode.code}>{statusCode.code}-{statusCode.title}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="py-2 px-4 w-60">
                                        <input
                                            type="text"
                                            value={step.task_description || ''}
                                            onChange={(e) => handleStepFieldChange(index, 'task_description', e.target.value)}
                                            className="border p-1 rounded w-full whitespace-break-spaces"
                                        />
                                    </td>
                                    <td className="py-2 px-4 text-right w-40">
                                        {step.id !== undefined ? (
                                            <>
                                                <button
                                                    onClick={() => {
                                                        console.log(`Step ID: ${step.id}`); // Log step.id at the beginning
                                                        console.log(`Updating step: ${step.id}`);
                                                        handleUpdateStep(step);
                                                    }}
                                                    className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                                >
                                                    Update
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        console.log(`Step ID: ${step.id}`); // Log step.id at the beginning
                                                        console.log(`Deleting step: ${step.id}`);
                                                        handleDeleteStep(step.id);
                                                    }}
                                                    className="bg-red-500 text-white px-4 py-2 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => {
                                                    console.log(`Step ID: ${step.id}`); // Log step.id at the beginning (it may be null for new steps)
                                                    console.log("Saving new step");
                                                    handleUpdateStep(step);
                                                }}
                                                className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                                            >
                                                Save
                                            </button>
                                        )}
                                    </td>


                                </tr>
                            ))}
                            <tr>
                                <td colSpan="9" className="py-4 px-4 text-right">
                                    <button
                                        onClick={handleAddStep}
                                        className="bg-green-500 text-white px-4 py-2 rounded"
                                    >
                                        Add New Step
                                    </button>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <ToastContainer />
        </React.Fragment>
    );
};

export default RoutingMatrixEditor;



