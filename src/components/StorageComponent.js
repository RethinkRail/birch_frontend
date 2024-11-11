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
import axios from "axios";
import CustomDateInputFullWidth from "./CustomDateInputFullWidth";



const EntryRow = ({ entry, onChange, onDelete }) => {
    if (!entry) {
        return null; // Handle undefined entry gracefully
    }
    console.log(entry)
    const handleDateChange = (key, date) => {
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
        onDelete(entry.id); // Trigger deletion without alert
    };

    const isDisabled = entry.is_billed;

    return (
        <tr className="border-b">
            <td className="p-2">
                <DatePicker
                    customInput={<CustomDateInputFullWidth value={entry.start_date != null ? new Date(entry.start_date) : null} />}
                    selected={entry.start_date ? new Date(entry.start_date) : null}
                    onChange={(date) => handleDateChange('start_date', date)}
                    showYearDropdown
                    dateFormat="MM-dd-yyyy"
                    disabled={isDisabled}
                />
            </td>
            <td className="p-2">
                <DatePicker
                    customInput={<CustomDateInputFullWidth value={entry.end_date != null ? new Date(entry.end_date) : null} />}
                    selected={entry.end_date != null ? new Date(entry.end_date) : null}
                    onChange={(date) => handleDateChange('end_date', date)}
                    selectsEnd
                    startDate={entry.start_date ? new Date(entry.start_date) : null}
                    endDate={entry.end_date ? new Date(entry.end_date) : null}
                    minDate={entry.start_date ? new Date(entry.start_date) : null}
                    showYearDropdown
                    dateFormat="MM-dd-yyyy"
                    className="w-full"
                    disabled={isDisabled}
                    isClearable
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
    console.log(initialEntries)
    useEffect(() => {
        const mappedEntries = initialEntries.map((entry) => ({
            id: entry.id,
            start_date: entry.start_date != null ? new Date(entry.start_date) : null,
            end_date: entry.end_date ? new Date(entry.end_date) : null,
            is_billed: !!entry.is_billed,
        }));
        setEntries(mappedEntries);
    }, [initialEntries]);

    const callWebService = async (url, method, body) => {

        if (!body.hasOwnProperty('user_id')) {
            // Add user_id property with value from localStorage
            const userToken = JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE));
            body.user_id = userToken['id'];
        }
        try {
            const response = await axios({
                method: method,
                url: `${process.env.REACT_APP_BIRCH_API_URL}${url}`,
                headers: { 'Content-Type': 'application/json' },
                data: body,
            });
            //
            return response.data;
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response:', error.response.data);
                throw new Error(`HTTP error! status: ${error.response.status}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error calling web service:', error.message);
            }
        }
    };

    const addNewEntry = async () => {

        const newEntry = {
            start_date: new Date(),
            end_date: null,
            is_billed: false,
            railcar_id: railcar_id,
            work_order: work_order,
            user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
        };
        //setEntries([...entries, newEntry]);

        try {
            const response = await axios({
                method: 'post',
                url: `${process.env.REACT_APP_BIRCH_API_URL}${'create_storage_info'}`,
                headers: { 'Content-Type': 'application/json' },
                data: newEntry,
            });
            console.log(response.data)
            //
            setEntries([...entries, response.data]);
            //return response.data;
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response:', error.response.data);
                throw new Error(`HTTP error! status: ${error.response.status}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error calling web service:', error.message);
            }
        }

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

    // useEffect(() => {
    //     const newEntries = entries.filter(entry => !entry.id && entry.start_date);
    //     newEntries.forEach(async (entry) => {
    //         await callWebService('create_storage_info/', 'POST', {
    //             ...entry,
    //             railcar_id,
    //             work_order
    //         });
    //     });
    // }, [entries, railcar_id, work_order]);

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
                        <EntryRow key={entry.id } entry={entry} onChange={updateEntry} onDelete={deleteEntry} />
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

