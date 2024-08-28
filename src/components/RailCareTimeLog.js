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

const RailCareTimeLog = ({ railcarLog,locked_for_time_clockinhg }) => {
    const [datePickers, setDatePickers] = useState({
        crewChecked: {},
        managerChecked: {},
        qaChecked: {}
    });
    console.log(railcarLog)
    const [totalHoursEstimated, setTotalHoursEstimated] = useState(0);
    const [totalHoursApplied, setTotalHoursApplied] = useState(0);
    const [totalRework, setTotalRework] = useState(0);
    const [difference, setDifference] = useState(0);
    useEffect(() => {
        const estimated = railcarLog.reduce((sum, entry) => sum + entry.labor_time, 0);
        const applied = railcarLog.reduce((sum, entry) => sum + parseFloat(entry.hours_applied), 0);
        const rework = railcarLog.reduce((sum, entry) => sum + parseFloat(entry.hours_applied_rework), 0);
        const diff = estimated - (applied + rework);

        setTotalHoursEstimated(estimated);
        setTotalHoursApplied(applied);
        setTotalRework(rework);
        setDifference(diff);
    }, [railcarLog]);

    const handleDateChange = (type, jobId, date) => {
        setDatePickers(prevState => ({
            ...prevState,
            [type]: {
                ...prevState[type],
                [jobId]: date
            }
        }));
    };

    const isDatePickerDisabled = locked_for_time_clockinhg=== 1;

    // Check if the date picker should be disabled based on team member completion time
    const isProcessAndQaDisabled = (jobId) => {
        return !datePickers.crewChecked[jobId];
    };

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
        },
        {
            name: 'HOURS APPLIED (RE WORK)',
            selector: row => round2Dec(row.hours_applied_rework),
            sortable: true,
            width: "10%",
        },
        {
            name: 'TEAM MEMBER COMPLETION TIME',
            cell: row => (
                <span className="w-full items-start align-top">
                    <DatePicker
                        selected={datePickers.crewChecked[row.job_id]}
                        onChange={(date) => handleDateChange('crewChecked', row.job_id, date)}
                        placeholderText="Select date"
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        disabled={isDatePickerDisabled}
                    />
                </span>
            ),
            width: "10%",
        },
        {
            name: 'IN PROCESS TIME',
            cell: row => (
                <DatePicker
                    selected={datePickers.managerChecked[row.job_id]}
                    onChange={(date) => handleDateChange('managerChecked', row.job_id, date)}
                    placeholderText="Select date"
                    dateFormat="MM-dd-yyyy"
                    isClearable
                    disabled={isDatePickerDisabled || isProcessAndQaDisabled(row.job_id)}
                />
            ),
            width: "10%",
        },
        {
            name: 'QA TIME',
            cell: row => (
                <DatePicker
                    selected={datePickers.qaChecked[row.job_id]}
                    onChange={(date) => handleDateChange('qaChecked', row.job_id, date)}
                    placeholderText="Select date"
                    dateFormat="MM-dd-yyyy"
                    isClearable
                    disabled={isDatePickerDisabled || isProcessAndQaDisabled(row.job_id)}
                />
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
        </div>
    );
};

export default RailCareTimeLog;
