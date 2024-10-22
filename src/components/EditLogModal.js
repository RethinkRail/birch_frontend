/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/21/2024, Monday
 * Description:
 **/

// EditLogModal.js
import React, {useEffect, useState} from 'react';
import Select from "react-select";
import axios from "axios";
import Datetime from "react-datetime";
import {round2Dec} from "../utils/NumberHelper";
import {toUTCDateTime} from "../utils/DateTimeHelper";

const EditLogModal = ({ entry,carsToEdit, onClose, onSave }) => {
    console.log(entry)
    console.log(carsToEdit)
    const [joblistForACar,setJoblistForACar]= useState([])
    const [selectedCarToAddTimeLog,setSelectedCarToAddTimeLog]= useState(entry.workorder_id ==null?'INDIRECT':entry.workorder_id)
    const [selectedJobId,setSelectedjobId]= useState(entry.workorder_id ==null?entry.indirect_labor_id:entry.job_id)
    const [formData, setFormData] = useState({
        start_time:entry.start_time,
        end_time: entry.end_time,
        car_id:entry.railcar_id =='INDIRECT'?'INDIRECT':entry.workorder_id,
        job_description:entry.job_description,
        job_id:entry.job_id,
        indirect_labor_id:entry.indirect_labor_id,
        time_log_entry_id:entry.time_log_entry_id,
        logged_time_in_seconds:entry.logged_time_in_seconds,
        railcar_id:entry.railcar_id,
    });
    console.log(formData)

    useEffect(()=>{

        const date1 = new Date(formData.end_time);
        const date2 = new Date(formData.start_time);

        // Calculate the difference in milliseconds
        const diffInMs = date1 - date2;

        // Convert milliseconds to seconds
        //const diffInSeconds = diffInMs / (1000);

        if(diffInMs / (1000)<0){
            alert("Out time can't be less than in time")
        }
        //setTotalSecondToAddTime(diffInMs / (1000))


        setFormData((prevState) => ({
            ...prevState,
            logged_time_in_seconds: diffInMs/1000,  // Update only car_id
        }))
    },[formData.start_time,formData.end_time])
    useEffect(()=>{
        const fetchjobs = async () => {
            console.log(selectedCarToAddTimeLog)
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL+`get_jobs`, {
                params: {id: formData.car_id},
            });
            const jobOptions = response.data.map((item) => ({
                value: item.id,
                label: item.description,
            }));
            setJoblistForACar(jobOptions)
            console.log(joblistForACar)
        }

        fetchjobs()
    },[formData.car_id])
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

                    <p className='mt-4'>Select railcar</p>
                    <Select
                        options={carsToEdit}
                        className=""
                        placeholder="Select railcar"
                        value={carsToEdit.find(option => option.value == formData.car_id)}
                        onChange={(option) =>
                            setFormData((prevState) => ({
                                ...prevState,
                                car_id: option.value,  // Update only car_id
                                workorder_id: option.value,  // Update only car_id
                                railcar_id: option.label,  // Update only car_id
                            }))
                        }
                    />

                    <p className='mt-4'>Select a Job</p>
                    <Select
                        options={joblistForACar}
                        className=""
                        placeholder="Select job"
                        value={
                            joblistForACar.find(
                                option => option.value === (formData.car_id === 'INDIRECT' ? formData.indirect_labor_id : formData.job_id)
                            ) || null
                        }
                        onChange={(option) =>
                            setFormData((prevState) => ({
                                ...prevState,
                                indirect_labor_id: formData.car_id === 'INDIRECT' ? option.value: null,  // Update only car_id
                                job_id: formData.car_id === 'INDIRECT' ? null: option.value,  // Update only car_id
                                job_description: option.label
                            }))
                        }
                    />

                    <div className="mb-4">
                        <label className="block mb-1">Start Time</label>
                        <Datetime
                            className="w-full border-2 rounded p-1"
                            value={new Date(formData.start_time)}
                            onChange={(date) => {
                                const parsedDate = new Date(date);
                                // Check if the parsed date is valid
                                if (!isNaN(parsedDate.getTime())) {
                                    setFormData((prevState) => ({
                                        ...prevState,
                                        start_time: parsedDate.toISOString(), // Use the date directly
                                    }));
                                } else {
                                    console.error("Invalid date selected."); // Optional: log or handle the error
                                    // You can also set the state to an empty string or previous valid date if needed
                                }
                            }}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1">End Time</label>
                        <Datetime
                            className="w-full border-2 rounded p-1"
                            value={new Date(formData.end_time)}
                            onChange={(date) => {
                                const parsedDate = new Date(date);
                                // Check if the parsed date is valid
                                if (!isNaN(parsedDate.getTime())) {
                                    setFormData((prevState) => ({
                                        ...prevState,
                                        end_time: parsedDate.toISOString(), // Use the date directly
                                    }));
                                } else {
                                    console.error("Invalid date selected."); // Optional: log or handle the error
                                    // You can also set the state to an empty string or previous valid date if needed
                                }
                            }}
                        />
                    </div>

                    <p>Total time: {round2Dec(formData.logged_time_in_seconds/3600)} Hrs</p>

                    <div className="flex justify-end mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-500 text-white px-4 py-2 rounded mr-2">
                            Cancel
                        </button>
                        <button
                            type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditLogModal;
