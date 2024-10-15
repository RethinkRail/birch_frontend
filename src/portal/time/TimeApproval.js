/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 10/14/2024, Monday
 * Description:
 **/
import React, {useEffect, useState} from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import CustomDateInputFullWidth from "../../components/CustomDateInputFullWidth";
import Select from "react-select";
import Datetime from 'react-datetime';
import "react-datetime/css/react-datetime.css";

const TimeApproval = () =>{
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
                            item.job_or_revenue_category,
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

    function retrieveTimeLog() {

    }

    return (
        <React.Fragment>
            <div className="font-inter ">
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
                            isClearable
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
                            isClearable
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
                            onChange={(option) => setSelectedCrewsToAddTime(option)} // One-liner onChange
                        />
                        <div className="flex justify-between w-full">
                            <div className="flex flex-col">
                                <p className="mt-4">Select in time</p>
                                <Datetime className="w-full" />
                            </div>

                            <div className="flex flex-col items-end">
                                <p className="mt-4">Select out time</p>
                                <Datetime className="w-full" />
                            </div>
                        </div>
                        <Datetime className="w-full mt-4 !important" />

                    </div>
                </div>


            </div>
        </React.Fragment>

    );
}

export default TimeApproval;