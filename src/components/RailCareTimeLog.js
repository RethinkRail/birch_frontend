/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 8/13/2024, Tuesday
 * Description:
 **/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import DataTable from 'react-data-table-component';
import 'react-datepicker/dist/react-datepicker.css';
import { round2Dec } from "../utils/NumberHelper";
import CustomDateInputFullWidth from "./CustomDateInputFullWidth";
import CustomDateInput from "./CustomDateInput";

const RailCareTimeLog = ({ railcarLog,locked_for_time_clockinhg }) => {
    console.log(railcarLog)
    const [datePickers, setDatePickers] = useState({
        crewChecked: {},
        managerChecked: {},
        qaChecked: {}
    });
    const [isDatePickerDisabled,setIsDatePickerDisabled]= useState(locked_for_time_clockinhg== 1?true:false)
    const [totalHoursEstimated, setTotalHoursEstimated] = useState(0);
    const [totalHoursApplied, setTotalHoursApplied] = useState(0);
    const [totalRework, setTotalRework] = useState(0);
    const [difference, setDifference] = useState(0);


    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [timeLogs, setTimeLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const showModal = async (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
        setLoading(true);  // Start loading indicator

        try {
            const response = await axios.get(
                process.env.REACT_APP_BIRCH_API_URL+`get_time_log_by_job_id?is_rework=${row.is_rework_in_progress}&job_id=${row.job_id}`
            );
            console.log(response)
            const data = response.data;

            if (data.length === 0) {
                alert("No data found");
                setIsModalOpen(false); // Close modal if no data
            } else {
                setTimeLogs(data); // Populate time logs into state
            }
        } catch (error) {
            console.error("Error fetching time logs:", error);
            alert("An error occurred while fetching data");
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRow(null);
        setTimeLogs([]); // Clear time logs
    };

    useEffect(() => {

        // Initialize datePickers state based on railcarLog data
        const initDatePickers = railcarLog.reduce((acc, entry) => {
            acc.crewChecked[entry.job_id] = entry.crew_checked_time ? new Date(entry.crew_checked_time) : null;
            acc.managerChecked[entry.job_id] = entry.manager_checked_time ? new Date(entry.manager_checked_time) : null;
            acc.qaChecked[entry.job_id] = entry.qa_checked_time ? new Date(entry.qa_checked_time) : null;
            return acc;
        }, { crewChecked: {}, managerChecked: {}, qaChecked: {} });

        setDatePickers(initDatePickers);

        const estimated = railcarLog.reduce((sum, entry) => sum + entry.labor_time, 0);
        const applied = railcarLog.reduce((sum, entry) => sum + parseFloat(entry.hours_applied), 0);
        const rework = railcarLog.reduce((sum, entry) => sum + parseFloat(entry.hours_applied_rework), 0);
        const diff = estimated - (applied + rework);

        setTotalHoursEstimated(estimated);
        setTotalHoursApplied(applied);
        setTotalRework(rework);
        setDifference(diff);

    }, [railcarLog,locked_for_time_clockinhg]);


    const handleDateChange = async (type, jobId, date) => {

        if (date == null && type == 'crewChecked') {
            const userConfirmed = window.confirm("Are you sure you want to mark this job as not done?");

            if (!userConfirmed) {
                // If the user pressed "Cancel", exit the function
                return;
            }

            // Create a copy of the current state
            const previousState = { ...datePickers };

            // Update the state to set 'crewChecked', 'managerChecked', and 'qaChecked' to null
            setDatePickers(prevState => ({
                ...prevState,
                crewChecked: {
                    ...prevState.crewChecked,
                    [jobId]: null
                },
                managerChecked: {
                    ...prevState.managerChecked,
                    [jobId]: null
                },
                qaChecked: {
                    ...prevState.qaChecked,
                    [jobId]: null
                }
            }));

            try {
                const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'update_job_check_log', {
                    job_id: jobId,
                    user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
                    field: type,  // Specify that all fields are being updated
                    updated_date: date,
                });

                if (response.status !== 200) {
                    // Rollback state if API response status is not 200
                    setDatePickers(previousState);
                }
            } catch (error) {
                // Rollback state if an error occurs
                setDatePickers(previousState);
                console.error('Error updating job check log:', error.response ? error.response.data : error.message);
            }

            return; // Exit function after processing
        }else {
            // If the date is not null or the type is not 'crewChecked'
            const previousState = { ...datePickers };

            // Update the date in the state
            setDatePickers(prevState => ({
                ...prevState,
                [type]: {
                    ...prevState[type],
                    [jobId]: date
                }
            }));

            try {
                const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'update_job_check_log', {
                    job_id: jobId,
                    user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
                    field: type,
                    updated_date: date,
                });

                if (response.status !== 200) {
                    // Rollback state if API response status is not 200
                    setDatePickers(previousState);
                }
            } catch (error) {
                // Rollback state if an error occurs
                setDatePickers(previousState);
                console.error('Error updating job check log:', error.response ? error.response.data : error.message);
            }
        }


    }

    //setIsDatePickerDisabled(locked_for_time_clockinhg== 1?true:false)
    // Check if the date picker should be disabled based on team member completion time
    const columns = [
        {
            name: 'JOB DESCRIPTION',
            selector: row => row.job_description,
            width: "38%",
            cell: row => (
                <div
                    title={row.job_description}
                    style={{ whiteSpace: "normal", wordWrap: "break-word" ,paddingTop:"5px",paddingBottom:"5px"}}
                >
                    {row.job_description}
                </div>
            )
        },
        {
            name: 'HOURS ESTIMATED',
            selector: row => round2Dec(row.labor_time),
            sortable: true,
            width: "10%",
        },
        {
            name: 'HOURS APPLIED',
            selector: row => round2Dec(row.hours_applied),
            sortable: true,
            width: "10%",
            cell: row => (
                <button
                    className="hover:underline"
                    onClick={() => showModal(row)}
                >
                    {round2Dec(row.hours_applied)}
                </button>
            )
        },
        {
            name: 'HOURS APPLIED (RE WORK)',
            selector: row => round2Dec(row.hours_applied_rework),
            sortable: true,
            width: "10%",
            cell: row => (
                <button
                    className="hover:underline"
                    onClick={() => showModal(row)}
                >
                    {round2Dec(row.hours_applied_rework)}
                </button>
            )
        },
        {
            name: 'TEAM MEMBER COMPLETION TIME',
            cell: row => (
                <span className="w-full items-start align-top p-2">
                    <DatePicker
                        customInput={<CustomDateInputFullWidth
                            value={datePickers.crewChecked[row.job_id] ?
                                datePickers.crewChecked[row.job_id].toLocaleDateString() : null}/>}
                        selected={datePickers.crewChecked[row.job_id] || null}
                        onChange={(date) => handleDateChange('crewChecked', row.job_id, date)}
                        placeholderText="Select date"
                        dateFormat="MM-dd-yyyy"
                        isClearable={!isDatePickerDisabled ||  datePickers.crewChecked[row.job_id]!==null}
                        disabled={isDatePickerDisabled || datePickers.crewChecked[row.job_id]==null}
                    />
                </span>
            ),
            width: "10%",
        },
        {
            name: 'IN PROCESS TIME',
            cell: row => (
                <span className="w-full items-start align-top p-2">
                    <DatePicker
                        customInput={<CustomDateInputFullWidth
                            value={datePickers.managerChecked[row.job_id] ?
                                datePickers.managerChecked[row.job_id].toLocaleDateString() : null}/>}
                        selected={datePickers.managerChecked[row.job_id] || null}
                        onChange={(date) => handleDateChange('managerChecked', row.job_id, date)}
                        placeholderText="Select date"
                        dateFormat="MM-dd-yyyy"
                        isClearable={!isDatePickerDisabled}
                        disabled={isDatePickerDisabled || datePickers.crewChecked[row.job_id]==null}
                    />
                </span>
            ),
            width: "10%",
        },
        {
            name: 'QA TIME',
            cell: row => (
                <span className="w-full items-start align-top p-2">
                    <DatePicker
                        customInput={<CustomDateInputFullWidth
                            value={datePickers.qaChecked[row.job_id] ?
                                datePickers.qaChecked[row.job_id].toLocaleDateString() : null}/>}
                        selected={datePickers.qaChecked[row.job_id] || null}
                        onChange={(date) => handleDateChange('qaChecked', row.job_id, date)}
                        placeholderText="Select date"
                        dateFormat="MM-dd-yyyy"
                        isClearable ={!isDatePickerDisabled}
                        disabled={isDatePickerDisabled || datePickers.crewChecked[row.job_id]==null}
                    />
                </span>
            ),
            width: "10%",
        }
    ];

    const myStyles = {
        headRow: {
            style: {
                "backgroundColor": "#DCE5FF",
                "font-size": "10px",
                "padding": "1px",
                "font-family": 'Inter',
                "font-weight": "500"
            },
        },
        headCells: {
            style: {
                paddingLeft: '10px',
                paddingRight: '2px',
            },
        },
        cells: {
            style: {"font-size": "10px", "font-family": 'Inter', "font-weight": "500", "padding-left": "10px"},
        },
    };

    return (
        <div>

            <div className="flex justify-between mb-5 items-center">
                <h6 className='font-semibold'>Railcar time log</h6>
            </div>
            <div className="overflow-x-auto">
                <DataTable
                    columns={columns}
                    data={railcarLog}
                    striped={false}
                    dense={true}
                    responsive={true}
                    pagination={false}
                    highlightOnHover={true}
                    fixedHeader={false}
                    className="display nowrap compact stripe"
                    customStyles={myStyles}
                />
            </div>

            <div className="w-full bg-white p-[25px]  mt-[24px] border rounded  grid grid-cols-4 gap-x-64 mb-[24px]" >
                <div className="">
                    <h2 className='text-[12px] font-normal '>TOTAL HOURS ESTIMATED</h2>
                    <p className='text-[#979C9E] mt-[2px]'>{round2Dec(totalHoursEstimated)} Hrs</p>
                </div>
                <div className="">
                    <h2 className='text-[12px] font-normal '>TOTAL HOURS APPLIED</h2>
                    <p className='text-[#979C9E] mt-[2px]'>{round2Dec(totalHoursApplied)}</p>
                </div>
                <div className="">
                    <h2 className='text-[12px] font-normal '>TOTAL REWORK</h2>
                    <p className='text-[#979C9E] mt-[2px]'> {round2Dec(totalRework)}</p>
                </div>
                <div className="]">
                    <h2 className='text-[12px] font-normal '>Differnece</h2>
                    <p className='text-[#979C9E] mt-[2px]'>{round2Dec(difference)}</p>
                </div>
            </div>


            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/3">
                        <h2 className="text-lg font-semibold mb-4">Hours Applied Details</h2>

                        {loading ? (
                            <p>Loading...</p>
                        ) : (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                <tr className="bg-gray-200">

                                    <th className="border p-2">Name</th>
                                    <th className="border p-2">Description</th>
                                    <th className="border p-2">Start Time</th>
                                    <th className="border p-2">End Time</th>
                                    <th className="border p-2">Logged Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {timeLogs.map(log => (
                                    <tr key={log.id}>

                                        <td className="border p-2">{log.name}</td>
                                        <td className="border p-2">{log.job_description}</td>
                                        <td className="border p-2">{new Date(log.start_time).toLocaleString()}</td>
                                        <td className="border p-2">{new Date(log.end_time).toLocaleString()}</td>
                                        <td className="border p-2">{round2Dec(log.logged_time_in_seconds/3600)+ 'HRS'}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                        <div className="flex justify-end mt-4">
                            <button
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
                                onClick={closeModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RailCareTimeLog;
