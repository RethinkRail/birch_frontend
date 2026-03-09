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
import * as XLSX from 'xlsx';
import {hasRole} from "../utils/CommonHelper";
const RailCareTimeLog = ({ railcarLog,locked_for_time_clockinhg,workOrder,laboorHRSEST }) => {
    //console.log(railcarLog)
    const [datePickers, setDatePickers] = useState({
        crewChecked: {},
        managerChecked: {},
        qaChecked: {}
    });
    const [isDatePickerDisabled,setIsDatePickerDisabled]= useState(false)
    const [isQADatePickerDisabled,setIsQADatePickerDisabled]= useState(false)
    const [totalHoursEstimated, setTotalHoursEstimated] = useState(0);
    const [totalHoursApplied, setTotalHoursApplied] = useState(0);
    const [totalRework, setTotalRework] = useState(0);
    const [difference, setDifference] = useState(0);
    const [isInnoiced,setIsInVoiced]= useState(false)

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState(null);
    const [timeLogs, setTimeLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [utilization,setUtilization]= useState()
    const [categoryWiseUtilization,setCategoryWiseUtilication]= useState([])


    const calculateUtilazation = (workOrder) =>{
        console.log("workorder in railcar time log")
        console.log(workOrder)
        const laborHours = workOrder.joblist != null ? workOrder.joblist.reduce((acc, item) => acc +
            ( (item.labor_time_aar * item.quantity)+(item.variable_labor_time*item.quantity)), 0) : 0;
        const durationHours = workOrder.time_log.reduce((acc, item) => acc + item.logged_time_in_seconds / 3600, 0);
        const percentage = durationHours === 0 ? 0 : (durationHours / laborHours) * 100;
        setUtilization(percentage)
    }

    const calculateLoggedCategoryHoursWithPercent = (workOrder) => {
        if (!workOrder.joblist || !Array.isArray(workOrder.joblist)) return {};

        const categoryHours = {};

        workOrder.joblist.forEach(job => {
            const category = job.jobcode_joblist_job_code_appliedTojobcode?.job_or_revenue_category?.name || "Uncategorized";

            // Actual logged time
            const loggedSeconds = Array.isArray(job.time_log)
                ? job.time_log.reduce((acc, t) => acc + (t.logged_time_in_seconds || 0), 0)
                : 0;

            const loggedHours = loggedSeconds / 3600;

            // Estimated labor time
            const estimatedHours = (Number(round2Dec(job.labor_time_aar)) * job.quantity) +(Number(round2Dec(job.variable_labor_time)) * job.quantity);

            if (!categoryHours[category]) {
                categoryHours[category] = {
                    loggedHours: 0,
                    estimatedHours: 0
                };
            }

            categoryHours[category].loggedHours += loggedHours;
            categoryHours[category].estimatedHours += estimatedHours;
        });

        // Add utilization percentage: applied / estimated
        Object.keys(categoryHours).forEach(category => {
            const { loggedHours, estimatedHours } = categoryHours[category];
            const percentage = estimatedHours === 0 ? 0 : (loggedHours / estimatedHours) * 100;
            categoryHours[category].percentage = Number(percentage.toFixed(2));
        });



        setCategoryWiseUtilication(categoryHours)
    };


    useEffect(()=>{
        setIsInVoiced(workOrder.locked_by != null)
        setIsDatePickerDisabled(locked_for_time_clockinhg== 1?true:false)
        setIsQADatePickerDisabled(!hasRole("QA"))
        calculateUtilazation(workOrder)
        calculateLoggedCategoryHoursWithPercent(workOrder)
    },[workOrder])

    const showModal = async (row) => {
        setSelectedRow(row);
        setIsModalOpen(true);
        setLoading(true);  // Start loading indicator
        console.log(row.job_id)
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
        console.log(date)
        if (date) {
            const now = new Date();
            // Set the selected date's time to the current time
            date.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        }
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
                console.log(date)
                console.log(workOrder.id)
                const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'update_job_check_log', {
                    job_id: jobId,
                    work_id: workOrder.id,
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
                console.log(date)
                const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'update_job_check_log', {
                    job_id: jobId,
                    work_id: workOrder.id,
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
            width: "28%",
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
            selector: row => Number(round2Dec(row.labor_time_aar*row.quantity))+Number(round2Dec(row.variable_labor_time*row.quantity)),
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
                        portalId="orderDetailsModal"
                        dateFormat="MM-dd-yyyy"
                        isClearable={!isInnoiced &&  datePickers.crewChecked[row.job_id]!==null}
                        disabled={isDatePickerDisabled || datePickers.crewChecked[row.job_id]==null || isQADatePickerDisabled}
                    />
                </span>
            ),
            width: "10%",
        },

        {
            name: 'COMPLETED BY',
            selector: row => row.crew_name,
            sortable: true,
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
                        portalId="orderDetailsModal"
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
            cell: row => {
                const isChecked = !!datePickers.qaChecked[row.job_id];

                const handleCheckboxChange = (e) => {
                    const checked = e.target.checked;
                    const currentDate = checked ? new Date() : null;
                    handleDateChange('qaChecked', row.job_id, currentDate);
                };

                return (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={handleCheckboxChange}
                            disabled={isDatePickerDisabled || datePickers.crewChecked[row.job_id] == null || isQADatePickerDisabled}
                        />
                    </div>
                );
            },
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

    function handleExport() {
        // Create a new workbook and worksheet
        // Define the columns you want to export with their corresponding keys and display names
        const exportColumns = [
            { header: 'JOB DESCRIPTION', key: 'job_description' },
            { header: 'HOURS ESTIMATED', key: 'labor_time' },
            { header: 'HOURS APPLIED', key: 'hours_applied' },
            { header: 'HOURS APPLIED (RE WORK)', key: 'hours_applied_rework' },
            { header: 'TEAM MEMBER COMPLETION TIME', key: 'crewChecked' },
            { header: 'IN PROCESS TIME', key: 'managerChecked' },
            { header: 'QA TIME', key: 'qaChecked' },
        ];

        // Map railcarLog to include only the desired fields
        const filteredData = railcarLog.map(row => ({
            'JOB DESCRIPTION': row.job_description,
            'HOURS ESTIMATED': round2Dec(row.labor_time),
            'HOURS APPLIED': round2Dec(row.hours_applied),
            'HOURS APPLIED (RE WORK)': round2Dec(row.hours_applied_rework),
            'TEAM MEMBER COMPLETION TIME': datePickers.crewChecked[row.job_id] ?
                datePickers.crewChecked[row.job_id].toLocaleString() : '',
            'IN PROCESS TIME': datePickers.managerChecked[row.job_id] ?
                datePickers.managerChecked[row.job_id].toLocaleString() : '',
            'QA TIME': datePickers.qaChecked[row.job_id] ?
                datePickers.qaChecked[row.job_id].toLocaleString() : '',
        }));

        // Create a worksheet from the filtered data
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'RailcarLog');

        // Write the workbook and trigger the download
        XLSX.writeFile(workbook, 'Railca Time log_'+workOrder.railcar_id+'.xlsx');
    }

    return (
        <div>

            <div className="flex justify-between mb-5 items-center">
                <h6 className="font-semibold">Railcar time log</h6>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleExport}
                >
                    Export
                </button>
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

            <div className="w-full bg-white p-[25px]  mt-[24px] border rounded  grid grid-cols-5 gap-x-32 mb-[24px]" >
                <div className="">
                    <h2 className='text-[11px] font-normal '>TOTAL HOURS ESTIMATED</h2>
                    <p className='text-[#979C9E] mt-[2px]'>{round2Dec(laboorHRSEST)} </p>
                    {/* Breakdown */}
                    <div className="mt-2 space-y-1">
                        {Object.entries(categoryWiseUtilization).map(([category, data]) => (
                            <div key={category} className="text-[10px] text-gray-600 flex justify-between">
                                <span>{category}</span>
                                <span>{round2Dec(data.estimatedHours)} </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="">
                    <h2 className='text-[11px] font-normal '>TOTAL HOURS APPLIED</h2>
                    <p className='text-[#979C9E] mt-[2px]'>{round2Dec(totalHoursApplied)} </p>

                    <div className="mt-2 space-y-1">
                        {Object.entries(categoryWiseUtilization).map(([category, data]) => (
                            <div key={category} className="text-[10px] text-gray-600 flex justify-between">
                                <span>{category}</span>
                                <span>{round2Dec(data.loggedHours)}  ({data.percentage}%)</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="">
                    <h2 className='text-[11px] font-normal '>TOTAL REWORK</h2>
                    <p className='text-[#979C9E] mt-[2px]'> {round2Dec(totalRework)}</p>
                </div>
                <div className="]">
                    <h2 className='text-[11px] font-normal '>Difference</h2>
                    <p className='text-[#979C9E] mt-[2px]'>{round2Dec(round2Dec(laboorHRSEST)-(totalHoursApplied+totalRework))}</p>
                </div>

                <div className="]">
                    <h2 className='text-[11px] font-normal '>LHR </h2>
                    <p className='text-[#979C9E] mt-[2px]'>{round2Dec(utilization)+"%"}</p>


                </div>
            </div>


            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/3 max-h-[80vh] overflow-y-auto">
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
