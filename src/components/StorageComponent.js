/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/12/2024, Monday
 * Description:
 **/

import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import CustomDateInput from "./CustomDateInput";

const API_BASE_URL = process.env.REACT_APP_BIRCH_API_URL;

const EntryRow = ({ entry, onChange, onDelete }) => {
    if (!entry) {
        return null; // Handle undefined entry gracefully
    }

    const handleDateChange = (key, date) => {
        console.log(key)
        console.log(date)
        const updatedEntry = { ...entry, [key]: date };
        onChange(updatedEntry);
    };

    const handleCheckboxChange = () => {
        const updatedEntry = { ...entry, is_billed: !entry.is_billed };
        onChange(updatedEntry);
    };

    const calculateDayDifference = () => {
        if (entry.start_date && entry.end_date) {
            const diffTime = Math.abs(new Date(entry.end_date) - new Date(entry.start_date));
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
        return '';
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            onDelete(entry.id);
        }
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
                    onClick={handleDelete}
                    className={`px-2 py-1 bg-red-500 text-white rounded shadow ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isDisabled}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
};

const StorageComponent = ({ initialEntries, railcar_id, work_order }) => {
    const [entries, setEntries] = useState([]);

    useEffect(() => {
        const mappedEntries = initialEntries.map((entry) => ({
            id: entry.id,
            start_date: entry.start_date ? new Date(entry.start_date) : null,
            end_date: entry.end_date ? new Date(entry.end_date) : null,
            is_billed: !!entry.is_billed,
        }));
        setEntries(mappedEntries);
    }, [initialEntries]);

    const callWebService = async (url, method, body) => {
        console.log(`Calling ${method} ${API_BASE_URL}${url}`);
        console.log('Request Body:', body);

        try {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            console.log('Response Status:', response.status);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Response Data:', result);
            return result;
        } catch (error) {
            console.error('Error calling web service:', error);
        }
    };

    const addNewEntry = async () => {
        const newEntry = {
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
        setEntries(entries.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry));
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

    useEffect(() => {
        const newEntries = entries.filter(entry => !entry.id);
        newEntries.forEach(async (entry) => {
            if (entry.start_date) {
                await callWebService('create_storage_info/', 'POST', {
                    ...entry,
                    railcar_id,
                    work_order
                });
            }
        });
    }, [entries, railcar_id, work_order]);

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
                        <EntryRow key={entry.id || Math.random()} entry={entry} onChange={updateEntry} onDelete={deleteEntry} />
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
