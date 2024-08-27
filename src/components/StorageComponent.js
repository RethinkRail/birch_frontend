/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/12/2024, Monday
 * Description:
 **/

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDateInput from './CustomDateInput'; // Assuming you have this component

const API_BASE_URL = process.env.REACT_APP_BIRCH_API_URL;

const StorageComponent = ({ initialEntries, railcar_id, work_order }) => {
    const [entries, setEntries] = useState([]);
    const [newEntryIds, setNewEntryIds] = useState(new Set());

    useEffect(() => {
        const mappedEntries = initialEntries.map((entry) => ({
            id: entry.id,
            start_date: entry.start_date ? new Date(entry.start_date) : null,
            end_date: entry.end_date ? new Date(entry.end_date) : null,
            is_billed: !!entry.is_billed,
        }));
        setEntries(mappedEntries);
    }, [initialEntries]);

    useEffect(() => {
        const newEntries = entries.filter(entry => !entry.id && entry.start_date);

        newEntries.forEach(async (entry) => {
            // Check if the entry is already in the newEntryIds set
            if (!newEntryIds.has(entry.id)) {
                try {
                    const result = await callWebService('create_storage_info/', 'POST', {
                        ...entry,
                        railcar_id,
                        work_order
                    });
                    if (result.id) {
                        // Add the new entry ID to the set to avoid re-creation
                        setNewEntryIds(prev => new Set(prev).add(result.id));
                        // Update the entry with the server-generated ID
                        setEntries(entries.map(e => e === entry ? { ...entry, id: result.id } : e));
                    }
                } catch (error) {
                    console.error('Error creating entry:', error);
                }
            }
        });
    }, [entries, railcar_id, work_order, newEntryIds]);

    const callWebService = async (url, method, body) => {
        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, ${errorText}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error calling web service:', error);
        }
    };

    const addNewEntry = () => {
        // Create a new entry with an empty ID to denote it's new
        const newEntry = {
            id: null,
            start_date: null,
            end_date: null,
            is_billed: false,
            railcar_id: railcar_id,
            work_order: work_order
        };
        setEntries([...entries, newEntry]);
    };

    const updateEntry = async (updatedEntry) => {
        if (updatedEntry.start_date && updatedEntry.end_date) {
            if (new Date(updatedEntry.start_date) > new Date(updatedEntry.end_date)) {
                alert('Start date cannot be greater than end date.');
                return;
            }
        }

        // Update entry in state
        setEntries(entries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));

        // Update entry on the server if it already exists
        if (updatedEntry.id) {
            await callWebService('update_storage_info/', 'POST', updatedEntry);
        }
    };

    const deleteEntry = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            setEntries(entries.filter(entry => entry.id !== id));
            await callWebService('delete_storage_information/', 'DELETE', { id });
        }
    };

    const EntryRow = ({ entry }) => {
        if (!entry) {
            return null; // Handle undefined entry gracefully
        }

        const handleDateChange = (key, date) => {
            const updatedEntry = { ...entry, [key]: date };
            updateEntry(updatedEntry);
        };

        const handleCheckboxChange = () => {
            const updatedEntry = { ...entry, is_billed: !entry.is_billed };
            updateEntry(updatedEntry);
        };

        const calculateDayDifference = () => {
            if (entry.start_date && entry.end_date) {
                const diffTime = Math.abs(new Date(entry.end_date) - new Date(entry.start_date));
                return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            return '';
        };

        const isDisabled = entry.is_billed;

        return (
            <tr className="border-b">
                <td className="p-2">
                    <DatePicker
                        customInput={
                            <CustomDateInput
                                value={entry.start_date ? new Date(entry.start_date).toLocaleDateString() : ''}
                            />
                        }
                        selected={entry.start_date ? new Date(entry.start_date) : null}
                        onChange={(date) => handleDateChange('start_date', date)}
                        showYearDropdown
                        dateFormat="MM-dd-yyyy"
                        disabled={isDisabled}
                    />
                </td>
                <td className="p-2">
                    <DatePicker
                        customInput={
                            <CustomDateInput
                                value={entry.end_date ? new Date(entry.end_date).toLocaleDateString() : ''}
                            />
                        }
                        selected={entry.end_date ? new Date(entry.end_date) : null}
                        onChange={(date) => handleDateChange('end_date', date)}
                        selectsEnd
                        startDate={entry.start_date ? new Date(entry.start_date) : null}
                        endDate={entry.end_date ? new Date(entry.end_date) : null}
                        minDate={entry.start_date ? new Date(entry.start_date) : null}
                        showYearDropdown
                        dateFormat="MM-dd-yyyy"
                        className="w-full"
                        disabled={isDisabled}
                    />
                </td>
                <td className="p-2 text-center">
                    {calculateDayDifference()}
                </td>
                <td className="p-2 text-center">
                    <input
                        type="checkbox"
                        checked={entry.is_billed}
                        onChange={handleCheckboxChange}
                    />
                </td>
                <td className="p-2 text-center">
                    <button
                        onClick={() => deleteEntry(entry.id)}
                        className={`px-2 py-1 bg-red-500 text-white rounded shadow ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={isDisabled}
                    >
                        Delete
                    </button>
                </td>
            </tr>
        );
    };

    return (
        <div>
            <div className="flex justify-between mb-5 items-center">
                <h6 className='font-semibold'>Storage Information</h6>
            </div>
            <div className="p-4">
                <table className="w-full table-auto border-collapse">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="p-2 border-b text-left">Start Date</th>
                        <th className="p-2 border-b text-left">End Date</th>
                        <th className="p-2 border-b text-center">Day Diff</th>
                        <th className="p-2 border-b text-center">Is Billed</th>
                        <th className="p-2 border-b text-center">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map(entry => (
                        <EntryRow key={entry.id || Math.random()} entry={entry} />
                    ))}
                    </tbody>
                </table>

                <div className="flex justify-center mt-4">
                    <button
                        onClick={addNewEntry}
                        className="px-4 py-2 bg-blue-500 text-white rounded shadow"
                    >
                        Add New Entry
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StorageComponent;

