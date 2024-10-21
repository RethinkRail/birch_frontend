/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/21/2024, Monday
 * Description:
 **/

// EditLogModal.js
import React, { useState } from 'react';
import Select from "react-select";

const EditLogModal = ({ entry,carsToEdit, onClose, onSave }) => {
    console.log(entry)
    console.log(carsToEdit)
    const [formData, setFormData] = useState({
        start_time:entry.start_time,
        end_time: entry.start_time,
        car_id:entry.workorder_id,
        job_description: '',
        // Add other fields if necessary
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Call the onSave function and pass the updated data
        onSave({ ...entry, ...formData });
        onClose(); // Close the modal after saving
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg max-w-md w-full p-6">
                <h2 className="text-xl font-bold mb-4">Edit Log Entry</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-1">Start Time</label>
                        <input
                            type="datetime-local"
                            name="start_time"
                            value={formData.start_time}
                            onChange={handleChange}
                            className="border rounded px-2 py-1 w-full"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">End Time</label>
                        <input
                            type="datetime-local"
                            name="end_time"
                            value={formData.end_time}
                            onChange={handleChange}
                            className="border rounded px-2 py-1 w-full"
                        />
                    </div>
                    <p className='mt-4'>Select railcar</p>
                    <Select
                        options={carsToEdit}
                        className=""
                        placeholder="Select railcar"
                        value={formData.car_id}

                      // One-liner onChange
                    />


                    <div className="mb-4">
                        <label className="block mb-1">Job Description</label>
                        <input
                            type="text"
                            name="job_description"
                            value={formData.job_description}
                            onChange={handleChange}
                            className="border rounded px-2 py-1 w-full"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                            Cancel
                        </button>
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLogModal;
