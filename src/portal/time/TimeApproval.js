/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/14/2024, Monday
 * Description:
 **/
import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import CustomDateInputFullWidth from "../../components/CustomDateInputFullWidth";
import Select from "react-select";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";
import {toUTCDateTime} from "../../utils/DateTimeHelper";
import {round2Dec} from "../../utils/NumberHelper";
import {fetchAndTransformTimesheets} from "../../utils/qbHelper";
import {toast} from "react-toastify";
import DataTable from "react-data-table-component";
import EditLogModal from "../../components/EditLogModal";

import LogDetailsModal from "../../components/LogDetailsModal";
import {set} from "lodash.debounce";


const TimeApproval = () =>{

    const toastId = useRef(null)
    const [crewsForTimeRetrieve, setCrewsForTimeRetrieve] = useState([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [crewsToAddTime, setCrewsToAddTime] = useState([]);

    const [activeCarsToRetriveTime,setActiveCarsToRetrieveTime]= useState('')
    const [activeCarsToEditLog,setActiveCarsToEditLog]= useState('')
    const [activeCarsToAddTime,setActiveCarsToAddTime]= useState('')

    const [departmentsForTimeRetrieve, setDepartmentsForTimeRetrieve] = useState([]);
    const [departmentsToClockOut, setDepartmentsToClockOut] = useState([]);

    const [selectedDepartmentToTimeRetrieve,setSelectetdDepartmentToTimeRetrive] = useState('')
    const [selectedCrewsToTimeRetrieve,setSelectedCrewsToTimeRetrieve] = useState('')
    const [selectedCrewsToAddTime,setSelectedCrewsToAddTime] = useState('')
    const [selectedDepartmentToClockOut,setSelectetdDepartmentToClockOut] = useState('')
    const [selectedCarToRetrieveTimeLog,setSelectedCarToRetriveTimeLog]= useState('')
    const [selectedCarToAddTimeLog,setSelectedCarToAddTimeLog]= useState('')

    const [fromDateToTimeRetrieve, setFromDateToTimeRetrieve] = useState('');
    const [toDateToTimeRetrive, setToDateToTimeRetrive] = useState('');
    const [toDateToAddTime, setToDateToAddTime] = useState('');
    const [joblistForACar,setJoblistForACar]= useState([])
    const [jobToAddTime,setJobToAddTime]= useState('')
    const [inTimeToAddJob,setInTimeToAddJob]= useState(null)
    const [outTimeToAddJob,setOutTimeToAddJob]= useState(null)
    const [totalSecondToAddTime,setTotalSecondToAddTime]= useState(0)

    const [isTeamMemberRailcarDisabled,setIsTeamMemberRailcarDisabled]= useState(false)

    //ParentModal related
    const [activeTab, setActiveTab] = useState('unapproved'); // Track active tab
    const [selectedLog, setSelectedLog] = useState(null);   // Track selected log for modal


    const [timeLogData,setTimeLogData]= useState([])

    const [approvedTimeLogs,setApprovedTimeLogs]= useState([])
    const [unApprovedTimeLogs,setUnApprovedTimeLogs]= useState([])

    const [mergedData, setMergedData] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(false);  // Control modal visibility

    const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
    const [editedLog, setEditedLog] = useState(null); // State for edited log data

    const maxToDate = fromDateToTimeRetrieve ? new Date(new Date(fromDateToTimeRetrieve).getTime() + 4 * 24 * 60 * 60 * 1000) : null;

    const [isToDateDisabled,setIsToDateDisabled]= useState(true)
    const [addTimeToDateDisable,setAddTimeToDateDisabled]= useState(true)

    useEffect(() => {
        setToDateToTimeRetrive('')
        if(fromDateToTimeRetrieve != ''){
            setIsToDateDisabled(false)
        }else {
            setIsToDateDisabled(true)
        }


    }, [fromDateToTimeRetrieve]);

    useEffect(() => {
        console.log("sas")
        categorizeLogs(mergedData);

    }, [mergedData]);

    // Function to categorize logs into approved and unapproved
    const categorizeLogs = (data) => {
        const unapprovedLogs = [];
        const approvedLogs = [];
        console.log(data)
        // Iterate through the provided data
        data.forEach(employee => {
            const employeeApprovedZero = {
                employee_name: employee.employee_name,
                employee_number: employee.employee_number,
                time_in_qb: employee.time_in_qb === 0
                    ? 0
                    : employee.time_in_qb > 6 * 3600
                        ? employee.time_in_qb - 1800
                        : employee.time_in_qb,

                total_logged_time: 0, // Initialize total_logged_time
                logs: []
            };

            const employeeApprovedOne = {
                employee_name: employee.employee_name,
                employee_number: employee.employee_number,
                time_in_qb: employee.time_in_qb== 0?0: employee.time_in_qb > 6 * 3600
                    ? employee.time_in_qb - 1800
                    : employee.time_in_qb,
                total_logged_time: 0, // Initialize total_logged_time
                logs: []
            };

            // Iterate through the logs of the employee
            employee.logs.forEach(log => {
                if (log.is_approved === 0) {
                    employeeApprovedZero.logs.push(log);
                    employeeApprovedZero.total_logged_time += log.logged_time_in_seconds; // Sum for approved = 0
                } else if (log.is_approved === 1) {
                    employeeApprovedOne.logs.push(log);
                    employeeApprovedOne.total_logged_time += log.logged_time_in_seconds; // Sum for approved = 1
                }
            });

            // Push the constructed objects to their respective arrays if they have logs
            if (employeeApprovedZero.logs.length > 0) {
                unapprovedLogs.push(employeeApprovedZero);
            }
            if (employeeApprovedOne.logs.length > 0) {
                approvedLogs.push(employeeApprovedOne);
            }
        });

        setUnApprovedTimeLogs(unapprovedLogs);
        setApprovedTimeLogs(approvedLogs);
    };

    useEffect(() => {
        // Fetch the data from the web service
        const fetchData = async () => {
            try {
                setIsButtonDisabled(true)
                const crewsResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'crews');
                const activeCarResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_car_for_time_operation');
                console.log(activeCarResponse)
                const activeCars= [
                    { value: 'ALL', label: "ALL" },
                    { value: 'INDIRECT', label: "INDIRECT" },
                    ...activeCarResponse.data.map((item) => ({
                        value: item.id,
                        label: item.railcar_id,
                    })),
                ];

                const activeCarsToEdit= [
                    { value: 'INDIRECT', label: "INDIRECT" },
                    ...activeCarResponse.data.map((item) => ({
                        value: item.id,
                        label: item.railcar_id,
                    })),
                ];
                console.log(activeCarsToEdit)
                setActiveCarsToRetrieveTime(activeCars)
                setActiveCarsToEditLog(activeCarsToEdit)
                const activeCarsToAddT = [
                    { value: 'INDIRECT', label: 'INDIRECT' },
                    { value: 'BREAK', label: 'BREAK' },
                    ...activeCarResponse.data.map((item) => ({
                        value: item.id,
                        label: item.railcar_id,
                    })),
                ];
                setActiveCarsToAddTime(activeCarsToAddT)


                const activeData = crewsResponse.data.filter((item) => item.is_active === 1);
                // 1. Create `crews` state variable with default value
                const crewOptions = [
                    { value: 0, label: "ALL" },
                    ...activeData.map((item) => ({
                        value: item.id,
                        label: item.name,
                    })),
                ];
                console.log(crewOptions)
                setCrewsForTimeRetrieve(crewOptions);


                // 2. Create `filteredCrews` state without ALL option
                const filteredCrewOptions = activeData.map((item) => ({
                    value: item.id,
                    label: item.name,
                }));
                setCrewsToAddTime(filteredCrewOptions);

                // 2. Create `departments` state with unique job_or_revenue_category values
                const uniqueDepartment = [
                    { value: 0, label: "ALL" },
                    ...Array.from(
                        new Map(
                            activeData.map((item) => [
                                item.job_or_revenue_category.id,
                                {
                                    value: item.job_or_revenue_category.id,
                                    label: item.job_or_revenue_category.name
                                }
                            ])
                        ).values()
                    ),
                ];

                console.log(uniqueDepartment)
                setDepartmentsForTimeRetrieve(uniqueDepartment);

                const departmentToClockOut = Array.from(
                    new Map(
                        activeData.map((item) => [
                            item.job_or_revenue_category.id,
                            {
                                value: item.job_or_revenue_category.id,
                                label: item.job_or_revenue_category.name
                            }
                        ])
                    ).values()
                );
                setDepartmentsToClockOut(departmentToClockOut);
                setIsButtonDisabled(false)

            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    useEffect(()=>{

        const date1 = new Date(toUTCDateTime(outTimeToAddJob));
        const date2 = new Date(toUTCDateTime(inTimeToAddJob));

        // Calculate the difference in milliseconds
        const diffInMs = date1 - date2;

        // Convert milliseconds to seconds
        //const diffInSeconds = diffInMs / (1000);
        //
        // if(diffInMs / (1000)<0){
        //     alert("Out time can't be less than in time")
        // }
        setTotalSecondToAddTime(diffInMs / (1000))

    },[outTimeToAddJob,inTimeToAddJob])

    useEffect(()=>{
        const fetchjobs = async () => {
            if (selectedCarToAddTimeLog != '') {
                setJobToAddTime('')
                const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL+`get_jobs`, {
                    params: {id: selectedCarToAddTimeLog.value},
                });
                const jobOptions = response.data.map((item) => ({
                    value: item.id,
                    label: item.description,
                }));
                setJoblistForACar(jobOptions)
            }
        }

        fetchjobs()
    },[selectedCarToAddTimeLog])

    useEffect(()=>{
        if(selectedDepartmentToTimeRetrieve.value !==0){
            setSelectedCrewsToTimeRetrieve({ value: 0, label: 'ALL' })
            setIsTeamMemberRailcarDisabled(true)
        }else {
            setSelectedCrewsToTimeRetrieve({ value: 0, label: 'ALL' })
            setIsTeamMemberRailcarDisabled(false)
        }
    },[selectedDepartmentToTimeRetrieve])

    async function retrieveTimeLog() {
        if (fromDateToTimeRetrieve !== '' && toDateToTimeRetrive !== '' && selectedDepartmentToTimeRetrieve!== ''
            && selectedCrewsToTimeRetrieve != '' && selectedCarToRetrieveTimeLog != '') {
            toastId.current = toast.loading("Loading...")
            setIsButtonDisabled(true)
            const start_date = new Date(fromDateToTimeRetrieve).toISOString().split('T')[0]
            const end_date = new Date(toDateToTimeRetrive).toISOString().split('T')[0]
            console.log(start_date)
            console.log(end_date)
            let qbResponse;
            let birchResponse;
            try {
                const responseQB = await axios.get(
                    'https://pmw8inl43f.execute-api.us-east-2.amazonaws.com/default/qb_time_with_emp_id',
                    {
                        params: {
                            start_date: start_date,
                            end_date: end_date
                        }
                    }
                );
                qbResponse = responseQB.data;
                console.log(qbResponse)
                const responseBirch = await axios.get(process.env.REACT_APP_BIRCH_API_URL+'get_timelog_in_date/', {
                    params: {
                        start_time: start_date,
                        end_time: end_date,
                        railcar_id: selectedCarToRetrieveTimeLog.label,
                        crew_id: selectedCrewsToTimeRetrieve.value,
                        department_id: selectedDepartmentToTimeRetrieve.value
                    }
                });


                birchResponse =  responseBirch.data
                console.log(birchResponse);

                const combinedData =  combineData(qbResponse, birchResponse)
                console.log(combinedData)
                setMergedData(combinedData);


                toast.update(toastId.current, {
                    render: "All data loaded",
                    autoClose: 1000,
                    type: "success",
                    hideProgressBar: true,
                    isLoading: false
                });
                setIsButtonDisabled(false)
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }else {
            alert('All fields are required')
        }
    }

    async function clockoutByDepartment() {
        if(selectedDepartmentToClockOut ==''){
            alert("Select department")
            return
        }

        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+'clockout_by_department/', {
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                department_id: selectedDepartmentToClockOut.value,
            });

            alert("Clocked out successfull")
            setSelectetdDepartmentToClockOut('')
        } catch (error) {
            console.error('Error:', error.response?.data || error.message);
            alert('Failed to clock out the whole department. Please try again.');
        }
    }

    async function addTime() {
        console.log(inTimeToAddJob.date)
        console.log(outTimeToAddJob)
        if(totalSecondToAddTime<0){
            alert("In time can't less than out time")
            return
        }
        if (selectedCrewsToAddTime !== '' && selectedCarToAddTimeLog !== '' && outTimeToAddJob !== '' && inTimeToAddJob !== '' && jobToAddTime !== '' && totalSecondToAddTime > 0) {
            const params = {
                crew: selectedCrewsToAddTime.value,
                work_id: selectedCarToAddTimeLog.value === 'INDIRECT' || selectedCarToAddTimeLog.value === 'BREAK' ? null : selectedCarToAddTimeLog.value,
                job_id: selectedCarToAddTimeLog.value === 'INDIRECT'  || selectedCarToAddTimeLog.value === 'BREAK' ? null : jobToAddTime.value,
                railcar_id: selectedCarToAddTimeLog.label,
                indirect_labor_id: selectedCarToAddTimeLog.value === 'INDIRECT' ? jobToAddTime.value : null,
                job_description: jobToAddTime.label,
                start_time: inTimeToAddJob, // Set to current time for demonstration
                end_time: outTimeToAddJob, // Set to 1 hour later
                work_station: 1,
                logged_out_station: 1,
                logged_time_in_seconds: totalSecondToAddTime,
                notes: 'Time added by ' + JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["name"],
            };

            console.log(params)

            try {
                const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'insert_time_log/', params);
                console.log('Time log inserted successfully:', response.data);
                alert("Time added successfully")
                setSelectedCrewsToAddTime('')
                setSelectedCarToAddTimeLog('')
                setJobToAddTime('')
                setInTimeToAddJob(new Date())
                setOutTimeToAddJob(new Date())
                setTotalSecondToAddTime(0)


            } catch (error) {
                setSelectedCrewsToAddTime('')
                setSelectedCarToAddTimeLog('')
                setJobToAddTime('')
                setInTimeToAddJob(new Date())
                setOutTimeToAddJob(new Date())
                setTotalSecondToAddTime(0)
                alert("Something went wrong while adding time")
            }
        } else {
            alert("All fields are reqired")
        }
    }
    const combineData = (qbData, birchData) => {
        // Group birchData by employee_number with logs and total logged time
        const groupedData = birchData.reduce((acc, entry) => {
            const key = String(entry.employee_number); // Ensure employee_number is treated as a string
            if (!acc[key]) {
                acc[key] = {
                    logs: [],
                    total_logged_time: 0,
                    employee_name: entry.crew_name // Use crew_name from birchData as the name
                };
            }
            acc[key].logs.push(entry);
            acc[key].total_logged_time += entry.logged_time_in_seconds;
            return acc;
        }, {});

        console.log("Grouped Data in BIRCH:", groupedData);

        // Create a map from qbData, using employee_number as a string
        const qbDataMap = new Map(
            qbData.map(qb => [String(qb.employee_number), qb])
        );

        // Combine data ensuring all birchData employees are included
        const result = Object.entries(groupedData).map(([employeeNumber, employeeLogs]) => {
            const qbEntry = qbDataMap.get(employeeNumber) || {}; // Retrieve qbEntry or default to empty object
            return {
                employee_name: qbEntry.employee_name || employeeLogs.employee_name, // Prefer qbData name if available
                employee_number: employeeNumber, // Use the correct variable here
                time_in_qb: qbEntry.time_in_qb || 0, // Default to 0 if not in qbData
                total_logged_time: employeeLogs.total_logged_time,
                logs: employeeLogs.logs
            };
        });

        return result;
    };

    //row.time_in_qb > 6 * 3600 ? round2Dec( (row.time_in_qb - (30 * 60)) / 3600) : round2Dec( row.time_in_qb / 3600), sortable: true

    const columns = [
        { name: 'Name', selector: row => row.employee_name, sortable: true },
        { name: 'Birch Time (hrs)', selector: row => (row.total_logged_time / 3600).toFixed(2), sortable: true },
        { name: 'QB Time (hrs)', selector: row =>  row.time_in_qb > 6 * 3600
                ? round2Dec( (row.time_in_qb - (30 * 60)) / 3600)
                : round2Dec( row.time_in_qb / 3600), sortable: true },
        {
            name: 'Utilization (%)',
            selector: row =>   row.time_in_qb==0?'Not in QB' : ((row.total_logged_time * 100) / row.time_in_qb).toFixed(2),
            sortable: true
        },
        {
            name: 'Actions',
            cell: row => (
                <button
                    onClick={() => handleViewDetails(row)}
                    className="bg-blue-500 text-white px-4 py-2 rounded">
                    View Details
                </button>
            )
        }
    ];

    const handleViewDetails = (row) => {
        console.log(row)
        setSelectedLog(row);
        setIsModalOpen(true);
    };



    // Open edit log modal
    const openEditLogModal = (log) => {
        console.log(log)
        setEditedLog(log); // Set the log to be edited
        setIsEditModalOpen(true); // Open edit modal
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

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

    }

    const handleLogApprove = async (log) => {
        // Call your web service to approve the log here...
        const response = await axios.post(
            `${process.env.REACT_APP_BIRCH_API_URL}approve_unapprove`,
            {
                time_log_entry_id: log.time_log_entry_id,
                is_approved: 1,
                logged_time_in_seconds: log.logged_time_in_seconds,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
            }
        );

        console.log(response)
        // Simulate updating the log's approval state
        const updatedLog = {...log, is_approved: 1};

        const logToUpdate = selectedLog.logs.find(logs => logs.time_log_entry_id === log.time_log_entry_id);

        if (logToUpdate) {
            // Update fields in the log based on the second object
            for (const key in log) {
                if (logToUpdate.hasOwnProperty(key)) {
                    logToUpdate[key] = updatedLog[key];
                }
            }
        }
        console.log(logToUpdate)
        setEditedLog(logToUpdate)


        // Update local state
        const updatedLogs = mergedData.map(data => {
            return {
                ...data,
                logs: data.logs.map(item => item.time_log_entry_id === log.time_log_entry_id ? updatedLog : item)
            };
        });

        // Update the merged data state
        setMergedData(updatedLogs);
        //setIsModalOpen(false)


    };

    const handleUnapprove = async (entry) => {
        // Call your API to unapprove the log entry
        // Assuming you have an API that takes the entry ID and unapproves it

        const response = await axios.post(
            `${process.env.REACT_APP_BIRCH_API_URL}approve_unapprove`,
            {
                time_log_entry_id: entry.time_log_entry_id,
                is_approved: 0,
                logged_time_in_seconds: entry.logged_time_in_seconds,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
            }
        );

        if(response.status==200){

            const updatedLog = {...entry, is_approved: 0};

            const logToUpdate = selectedLog.logs.find(logs => logs.time_log_entry_id === entry.time_log_entry_id);

            if (logToUpdate) {
                // Update fields in the log based on the second object
                for (const key in entry) {
                    if (logToUpdate.hasOwnProperty(key)) {
                        logToUpdate[key] = updatedLog[key];
                    }
                }
            }
            console.log(logToUpdate)
            setEditedLog(logToUpdate)


            const updatedData = mergedData.map(data => {
                const logs = data.logs.map(log =>
                    log.time_log_entry_id === entry.time_log_entry_id ? {...log, is_approved: 0} : log
                );
                return {...data, logs};
            });

            setMergedData(updatedData);
        }

        //setIsModalOpen(false)
    };
    // Handle deleting a log
    const handleLogDelete = async (entry) => {
        // Call your web service to delete the log here...
        const response = await axios.post(
            `${process.env.REACT_APP_BIRCH_API_URL}delete_log`,
            {
                time_log_entry_id: entry.time_log_entry_id,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id']
            }
        );

        if(response.status==200){
            // Update local state to remove the log
            const updatedLogs = mergedData.map(data => {
                return {
                    ...data,
                    logs: data.logs.filter(item => item.time_log_entry_id !== entry.time_log_entry_id)
                };
            });

            // Update the merged data state
            setMergedData(updatedLogs);
            setIsModalOpen(false)
        }else {
            alert("Something went wrong")
        }


    };

    // Handle editing a log with web service call
    const handleLogEdit = async (editedData) => {
        try {
            // Call your web service to update the log here
            const response = await axios.post(
                `${process.env.REACT_APP_BIRCH_API_URL}update_a_time_log`,
                editedData
            );

            // Assume response.data contains the updated log
            const updatedLog = response.data.data; // Use response data for the latest log
            console.log(updatedLog)
            // Transform the second object's keys to match the first object’s structure
            const transformedLog = {
                time_log_entry_id: updatedLog.id,
                crew_id: updatedLog.crew,
                workorder_id: updatedLog.work_id,
                job_id: updatedLog.job_id,
                railcar_id: updatedLog.railcar_id,
                indirect_labor_id: updatedLog.indirect_labor_id,
                job_description: updatedLog.job_description,
                start_time: updatedLog.start_time,
                end_time: updatedLog.end_time,
                logged_time_in_seconds: updatedLog.logged_time_in_seconds,
                is_approved: updatedLog.is_approved,
                approved_time_in_second: updatedLog.approved_time_in_second,
                notes: updatedLog.notes,

            };
            console.log("transformed log")
            console.log(transformedLog)

            // Updating the edit log modal
            console.log(selectedLog)
            const logToUpdate = selectedLog.logs.find(log => log.time_log_entry_id === transformedLog.time_log_entry_id);

            if (logToUpdate) {
                // Update fields in the log based on the second object
                for (const key in transformedLog) {
                    if (logToUpdate.hasOwnProperty(key)) {
                        logToUpdate[key] = transformedLog[key];
                    }
                }
            }
            console.log(logToUpdate)
            setEditedLog(logToUpdate)

            const updatedData = mergedData.map(employee => {
                const updatedLogs = employee.logs.map(log => {
                    if (log.time_log_entry_id === transformedLog.time_log_entry_id) {
                        // Return a new object that merges the original log with the updated values
                        return {
                            ...log,
                            ...Object.keys(transformedLog).reduce((acc, key) => {
                                if (transformedLog[key] !== null) {
                                    acc[key] = transformedLog[key];
                                }
                                return acc;
                            }, {})
                        };
                    }
                    return log; // Return unchanged log if ID doesn't match
                });

                // Calculate the total logged time based on updated logs
                const totalLoggedTime = updatedLogs.reduce((sum, log) => sum + log.logged_time_in_seconds, 0);

                return {
                    ...employee,
                    logs: updatedLogs,
                    total_logged_time: totalLoggedTime // Update the total_logged_time
                };
            });

            console.log(updatedLog)
            // Update the state with the modified data
            setMergedData(updatedData);



            //setMergedData(newData)
            setIsEditModalOpen(false); // Close the edit modal

        } catch (error) {
            console.error('Error updating log:', error);
            // Handle error (e.g., show notification)
        }
    };




    return (
        <React.Fragment>
            <div className="font-inter" id='timeApproval '>
                <h1 className="text-2xl font-bold mb-4 mt-5 flex items-center  justify-center">Time Approval</h1>

                <div className="grid grid-cols-3 gap-10">
                    <div className=''>
                        <h6 className='font-bold'>Retrieve Time Log</h6>
                        <p className='mt-4'> From Date</p>
                        <DatePicker
                            customInput={<CustomDateInputFullWidth
                                value={fromDateToTimeRetrieve}/>}
                            selected={fromDateToTimeRetrieve}
                            onChange={
                                newDate => setFromDateToTimeRetrieve(newDate)
                            }
                            showYearDropdown
                            dateFormat="yyyy-MM-dd"
                        />

                        <p className='mt-4'> To Date</p>
                        <DatePicker
                            customInput={<CustomDateInputFullWidth
                                value={toDateToTimeRetrive}/>}
                            selected={toDateToTimeRetrive}
                            onChange={
                                newDate => setToDateToTimeRetrive(newDate)
                            }
                            minDate={fromDateToTimeRetrieve ? new Date(fromDateToTimeRetrieve) : null}
                            maxDate={fromDateToTimeRetrieve ? new Date(new Date(fromDateToTimeRetrieve).getTime() + 4 * 24 * 60 * 60 * 1000) : null}
                            showYearDropdown
                            disabled ={isToDateDisabled}
                            dateFormat="yyyy-MM-dd"
                        />

                        <p className='mt-4'>Select a Department</p>

                        <Select
                            options={departmentsForTimeRetrieve}
                            className=""
                            placeholder="Select Department"
                            value={selectedDepartmentToTimeRetrieve}
                            onChange={(option) => setSelectetdDepartmentToTimeRetrive(option)} // One-liner onChange
                        />
                        <p className='mt-4'>Select a Team member</p>
                        <Select
                            options={crewsForTimeRetrieve}
                            className=""
                            placeholder="Select team member"
                            isDisabled={isTeamMemberRailcarDisabled}
                            value={selectedCrewsToTimeRetrieve}
                            onChange={(option) => setSelectedCrewsToTimeRetrieve(option)} // One-liner onChange
                        />

                        <p className='mt-4'>Select railcar</p>
                        <Select
                            options={activeCarsToRetriveTime}
                            className=""
                            placeholder="Select railcar"
                            value={selectedCarToRetrieveTimeLog}
                            onChange={(option) => setSelectedCarToRetriveTimeLog(option)} // One-liner onChange
                        />

                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                            disabled={isButtonDisabled}
                            onClick={retrieveTimeLog}
                        >
                            GET TIME LOG
                        </button>
                    </div>
                    <div className=''>
                        <h6 className='font-bold'>Add time log</h6>
                        <p className='mt-4'>Select a Team member</p>
                        <Select
                            options={crewsToAddTime}
                            className=""
                            placeholder="Select team member"
                            value={selectedCrewsToAddTime}
                            onChange={(option) => setSelectedCrewsToAddTime(option)} // One-liner onChange
                        />

                        <p className='mt-4'>Select railcar</p>
                        <Select
                            options={activeCarsToAddTime}
                            className=""
                            placeholder="Select railcar"
                            value={selectedCarToAddTimeLog}
                            onChange={(option) => setSelectedCarToAddTimeLog(option)} // One-liner onChange
                        />
                        <p className='mt-4'>Select job</p>
                        <Select
                            options={joblistForACar}
                            className=""
                            placeholder="Select job"
                            value={jobToAddTime}
                            onChange={(option) => setJobToAddTime(option)} // One-liner onChange
                        />
                        <div className=" justify-between w-full gap-4">
                            <div className="flex flex-col w-full">
                                <p className="mt-4">Select in time</p>
                                <Datetime className="w-full"
                                          value={inTimeToAddJob ?? ""}
                                          defaultValue={null}
                                          onChange={(value)=>setInTimeToAddJob(value)}/>
                            </div>

                            <div className="flex flex-col w-full">
                                <p className="mt-4 text-left">Select out time</p>
                                <div className="inline-flex items-center gap-2 mt-2">
                                    <Datetime
                                        className="cursor-not-allowed"
                                        value={outTimeToAddJob?? ""}
                                        defaultValue={null}
                                        onChange={(value) => setOutTimeToAddJob(value)}
                                    />
                                    {totalSecondToAddTime > 0 && (
                                        <p className="text-sm font-medium">
                                            Total Time: {round2Dec(totalSecondToAddTime / (60 * 60))} Hrs
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-6"
                            onClick={addTime}
                            disabled={isButtonDisabled}
                        >
                            ADD TIME
                        </button>

                    </div>
                    <div className=''>
                        <h6 className='font-bold mb-8'>Clock out by department</h6>
                        <Select
                            options={departmentsToClockOut}
                            className=""
                            placeholder="Select department"
                            value={selectedDepartmentToClockOut}
                            onChange={(option) => setSelectetdDepartmentToClockOut(option)} // One-liner onChange
                        />
                        <button
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full mt-4"
                            disabled={isButtonDisabled}
                            onClick={clockoutByDepartment}
                        >
                            CLOCK OUT
                        </button>
                    </div>
                </div>

                <div className='mb-10'>
                    {/* Tabs Navigation */}
                    <div className="flex border-b mb-4 mt-10">
                        <button
                            className={`px-4 py-2 ${activeTab === 'unapproved' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                            onClick={() => setActiveTab('unapproved')}>
                            Unapproved Logs
                        </button>
                        <button
                            className={`px-4 py-2 ${activeTab === 'approved' ? 'border-b-2 border-blue-500 font-bold' : ''}`}
                            onClick={() => setActiveTab('approved')}>
                            Approved Logs
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className='mb-10'>
                        {activeTab === 'unapproved' ? (
                            <DataTable columns={columns} data={unApprovedTimeLogs} customStyles={myStyles} pagination={false}/>
                        ) : (
                            <DataTable columns={columns} data={approvedTimeLogs} customStyles={myStyles} pagination={false} />
                        )}
                    </div>

                </div>

                {/* Log Details ParentModal */}

                {isModalOpen && (
                    <>
                        <LogDetailsModal
                            log={selectedLog}
                            onApprove={handleLogApprove}
                            onUnApprove={handleUnapprove}
                            onDelete={handleLogDelete}
                            onEditClick={openEditLogModal}
                            onClose={() => setIsModalOpen(false)}
                        />
                    </>

                )}

                {/* Edit Log ParentModal */}
                {isEditModalOpen && editedLog && (
                    <EditLogModal
                        entry={editedLog}
                        carsToEdit={activeCarsToEditLog}
                        onSave={handleLogEdit}
                        onClose={() => setIsEditModalOpen(false)}
                    />
                )}

            </div>
        </React.Fragment>

    );
}

export default TimeApproval;