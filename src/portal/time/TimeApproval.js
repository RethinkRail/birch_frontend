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
import Modal from "react-modal";
import LogDetails from "../../components/LogDetails";


const TimeApproval = () =>{

    const toastId = useRef(null)
    const [crewsForTimeRetrieve, setCrewsForTimeRetrieve] = useState([]);
    const [crewsToAddTime, setCrewsToAddTime] = useState([]);

    const [activeCarsToRetriveTime,setActiveCarsToRetrieveTime]= useState('')
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
    const [fromDateToAddTime, setFromDateToAddTime] = useState('');

    const [toDateToTimeRetrive, setToDateToTimeRetrive] = useState('');
    const [toDateToAddTime, setToDateToAddTime] = useState('');
    const [joblistForACar,setJoblistForACar]= useState([])
    const [jobToAddTime,setJobToAddTime]= useState('')
    const [inTimeToAddJob,setInTimeToAddJob]= useState('')
    const [outTimeToAddJob,setOutTimeToAddJob]= useState('')
    const [totalSecondToAddTime,setTotalSecondToAddTime]= useState(0)

    const [isTeamMemberRailcarDisabled,setIsTeamMemberRailcarDisabled]= useState(false)

    //Modal related
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLogs, setSelectedLogs] = useState([]);

    const [timeLogData,setTimeLogData]= useState([])

    useEffect(() => {
        // Fetch the data from the web service
        const fetchData = async () => {
            try {
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
                setActiveCarsToRetrieveTime(activeCars)

                const activeCarsToAddT = [
                    { value: 'INDIRECT', label: 'INDIRECT' },
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

        if(diffInMs / (1000)<0){
            alert("Out time can't be less than in time")
        }
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
            const start_date = new Date(fromDateToTimeRetrieve).toISOString().split('T')[0]
            const end_date = new Date(toDateToTimeRetrive).toISOString().split('T')[0]
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
                        railcar_id: selectedCarToRetrieveTimeLog.value,
                        crew_id: selectedCrewsToTimeRetrieve.value,
                        department_id: selectedDepartmentToTimeRetrieve.value
                    }
                });

                birchResponse =  responseBirch.data
                console.log(birchResponse);

                const employeeMap = {};

                // Step 2: Populate the map with employee data
                qbResponse.forEach(employee => {
                    employeeMap[employee.employee_number] = {
                        employee_name: employee.employee_name,
                        employee_number: employee.employee_number,
                        time_in_qb: employee.time_in_qb,
                        total_logged_time_in_seconds: 0,
                        logs: []
                    };
                });

                // Step 3: Merge time logs into the map based on employee_number
                birchResponse.forEach(log => {
                    const empNumber = log.employee_number;
                    if (employeeMap[empNumber]) {
                        employeeMap[empNumber].logs.push(log);
                        employeeMap[empNumber].total_logged_time_in_seconds += log.logged_time_in_seconds;
                    }
                });

                const data = Object.values(employeeMap).map((employee) => ({
                    name: employee.employee_name,
                    birchTime: (employee.total_logged_time_in_seconds / 3600).toFixed(2),
                    qbTime: (employee.time_in_qb / 3600).toFixed(2),
                    utilization: (
                        (employee.total_logged_time_in_seconds * 100) /
                        employee.time_in_qb
                    ).toFixed(2) + "%",
                    logs: employee.logs,
                }));

                setTimeLogData(data)

                toast.update(toastId.current, {
                    render: "All data loaded",
                    autoClose: 1000,
                    type: "success",
                    hideProgressBar: true,
                    isLoading: false
                });

                console.log(employeeMap)
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
        if (selectedCrewsToAddTime !== '' && selectedCarToAddTimeLog !== '' && outTimeToAddJob !== '' && inTimeToAddJob !== '' && jobToAddTime !== '' && totalSecondToAddTime > 0) {
            const params = {
                crew: selectedCrewsToAddTime.value,
                work_id: selectedCarToAddTimeLog.value === 'INDIRECT' ? null : selectedCarToAddTimeLog.value,
                job_id: selectedCarToAddTimeLog.value === 'INDIRECT' ? null : jobToAddTime.value,
                railcar_id: selectedCarToAddTimeLog.label,
                indirect_labor_id: selectedCarToAddTimeLog.value === 'INDIRECT' ? jobToAddTime.value : null,
                job_description: jobToAddTime.label,
                start_time: toUTCDateTime(inTimeToAddJob), // Set to current time for demonstration
                end_time: toUTCDateTime(outTimeToAddJob), // Set to 1 hour later
                work_station: 1,
                logged_out_station: 1,
                logged_time_in_seconds: totalSecondToAddTime,
                notes: 'Time added by ' + JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["name"],
            };

            console.log(params)

            try {
                const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'insert_time_log/', params);
                console.log('Time log inserted successfully:', response.data);
                setSelectedCrewsToAddTime('')
                setSelectedCarToAddTimeLog('')
                setJobToAddTime('')
                setInTimeToAddJob('')
                setOutTimeToAddJob('')
                setTotalSecondToAddTime(0)
                alert("Time added successfully")

            } catch (error) {
                setSelectedCrewsToAddTime('')
                setSelectedCarToAddTimeLog('')
                setJobToAddTime('')
                setInTimeToAddJob('')
                setOutTimeToAddJob('')
                setTotalSecondToAddTime(0)
                alert("Something went wrong while adding time")
            }
        } else {
            alert("All fields are reqired")
        }
    }

    //Modal.setAppElement("#timeApproval");
    const customStyles = {
        content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
        },
    };


    const columns = [
        { name: "Name", selector: (row) => row.name, sortable: true },
        { name: "Birch Time (hrs)", selector: (row) => row.birchTime },
        { name: "QB Time (hrs)", selector: (row) => row.qbTime },
        { name: "Utilization (%)", selector: (row) => row.utilization },
        {
            name: "Actions",
            cell: (row) => (
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => openModal(row.logs)}
                >
                    View Details
                </button>
            ),
        },
    ];

    const openModal = (logs) => {
        console.log(logs)
        setSelectedLogs(logs);
        setIsModalOpen(true);
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

    return (
        <React.Fragment>
            <div className="font-inter" id='timeApproval'>
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
                            showYearDropdown
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
                                <Datetime className="w-full" value={inTimeToAddJob} onChange={(value)=>setInTimeToAddJob(value)}/>
                            </div>

                            <div className="flex flex-col w-full">
                                <p className="mt-4 text-left">Select out time</p>
                                <div className="inline-flex items-center gap-2 mt-2">
                                    <Datetime
                                        className=""
                                        value={outTimeToAddJob}
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
                            onClick={clockoutByDepartment}
                        >
                            CLOCK OUT
                        </button>
                    </div>
                </div>

                <div className='mt-10 mb-10'>
                    <DataTable
                        title="Time Log"
                        columns={columns}
                        data={timeLogData}
                        pagination={false}
                        customStyles={myStyles}
                    />
                </div>


                {/* Modal for Viewing Logs */}
                <Modal isOpen={isModalOpen} onRequestClose={closeModal} style={customStyles}>
                    <LogDetails logs={selectedLogs} onClose={closeModal} />
                </Modal>

            </div>
        </React.Fragment>

    );
}

export default TimeApproval;