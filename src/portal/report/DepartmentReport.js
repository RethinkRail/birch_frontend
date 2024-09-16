/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/3/2024, Tuesday
 * Description:
 **/

import React, {useState, useEffect, useMemo, useRef} from 'react';
import axios from 'axios';
import { MaterialReactTable } from "material-react-table";
import DatePicker from "react-datepicker";
import '../../DepartmentReport.css';
import {round2Dec} from "../../utils/NumberHelper";
import {differenceBetweenTwoTimeStamp} from "../../utils/DateTimeHelper";
import {FaCloudDownloadAlt, FaDownload, FaFileDownload} from "react-icons/fa";
import {toast} from "react-toastify";
import Modal from "react-modal";
import qs from "qs";


const DepartmentReport = () => {
    const toastId = useRef(null)
    const [jobCategories, setJobCategories] = useState([]);
    const [statusCodes, setStatusCodes] = useState([]);
    const [departmentReport, setDepartmentReport] = useState([]);
    const [processedReport, setProcessedReport] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // Add search query state
    const [isStatusDropDownModalOpenInDetails, setIsStatusDropDownModalOpenInDetails] = useState(null);

    const [updatedStatusCode, setupdatedStatusCode] = useState(null)
    const [workOrderToUpdateStatus, setWorkOrdeToUpdateStatus] = useState(null)
    useEffect(() => {
        setIsStatusDropDownModalOpenInDetails(false)
        const fetchData = async () => {
            try {
                const jobCategoryResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_job_category/');
                setJobCategories(jobCategoryResponse.data);

                const statusCodeResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_status/');
                setStatusCodes(statusCodeResponse.data);

                const departmentReportResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_department_report/');
                setDepartmentReport(departmentReportResponse.data);

                let data = processRailcarData(departmentReportResponse.data, jobCategoryResponse.data);
                console.log(data)
                setProcessedReport(data);
                toast.update(toastId.current, {
                    render: "All data loaded",
                    autoClose: 1000,
                    type: "success",
                    hideProgressBar: true,
                    isLoading: false
                });
            } catch (err) {
                setError('Failed to load data. Please try again.');

            }
        };
        toastId.current = toast.loading("Loading...")
        fetchData();
    }, []);

    const handleDropdownChangeInDetails = (e, workId) => {
        setupdatedStatusCode(e.target.value)
        setWorkOrdeToUpdateStatus(workId)
        setIsStatusDropDownModalOpenInDetails(true)
    }

    const customStylesForCommentModal = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            width: '400px',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
        },
    };
    const orderDetailsModal = document.getElementById('orderDetailsModal');
    //const statusTextArea = useRef(null);

    const closeModal = () => {
        if (orderDetailsModal) {
            orderDetailsModal.close();
        } else {
        }
    }
    const statusCommentDropDownInDetails = useRef(null);
    const getValueByIdStatusCommentDropDown = (id) => {
        const element = statusCommentDropDownInDetails.current;
        if (element && element.id === id) {
            return element.value;
        }
        return null;
    };
    const postStatusFromDetails = () => {
        var comment = getValueByIdStatusCommentDropDown("statusUpdateMessageFromDropDownInDetails");
        if (comment == null || comment.length === 0) {
            return
        }
        let data = qs.stringify({
            'work_id': workOrderToUpdateStatus,
            'user_id': JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['id'],
            'status_id': updatedStatusCode,
            'source': "department_report",
            'comment': comment
        });
        console.log(data)
        let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: process.env.REACT_APP_BIRCH_API_URL + 'post_work_updates',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: data
        };

        axios.request(config)
            .then((response) => {
                console.log(response)
                setIsStatusDropDownModalOpenInDetails(false);
                setupdatedStatusCode("")
            })
            .catch((error) => {
                console.log(error);
                setIsStatusDropDownModalOpenInDetails(false);
                setupdatedStatusCode("")
                toast.error("Something went wrong")
            });
    }

    function processRailcarData(dataArray, departmentMap) {
        return dataArray.map(railcarData => {
            const result = {};

            // Initialize man-hour and applied hour fields for each department
            departmentMap.forEach(dept => {
                result[`${dept.name.toLowerCase().replace(/-/g, '_')}_man_hour_estimated`] = 0;
                result[`${dept.name.toLowerCase().replace(/-/g, '_')}_man_hour_applied`] = 0;
            });

            // Process joblist for each railcar
            railcarData.joblist.forEach(job => {
                const jobCategoryId = job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.id;
                const department = departmentMap.find(dept => dept.id === jobCategoryId);

                if (department) {
                    const manHourEstimated = job.labor_time * job.quantity;
                    const manHourApplied = job.time_log.reduce((sum, log) => sum + log.logged_time_in_seconds, 0) / 3600;

                    result[`${department.name.toLowerCase().replace(/-/g, '_')}_man_hour_estimated`] += manHourEstimated;
                    result[`${department.name.toLowerCase().replace(/-/g, '_')}_man_hour_applied`] += manHourApplied;
                }

                const totalCost = job.labor_cost + job.material_cost;
                result.total_cost = (result.total_cost || 0) + totalCost;
            });

            const statusCode = railcarData.workupdates[0]?.statuscode?.code || null;
            const owner = railcarData.railcar?.owner_railcar_owner_idToowner?.name || null;
            const lessee = railcarData.railcar?.owner_railcar_lessee_idToowner?.name || null;
            const products = railcarData.railcar?.products?.name || null;
            const type = railcarData.railcar.railcartype?.name || null;
            const railcar_id = railcarData.railcar.rfid;

            // Return the object in the desired field order
            return {
                id: railcarData.id,
                railcar_id,
                dis: railcarData.arrival_date == process.env.REACT_APP_DEFAULT_DATE ? 0 : differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19), railcarData.arrival_date)["days"],
                type,
                owner,
                lessee,
                products,
                status_code: statusCode,
                inspected_date: railcarData.inspected_date  !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.inspected_date).toLocaleDateString() : null,
                material_eta: railcarData.material_eta  !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.material_eta).toLocaleDateString() : null,
                clean_date: railcarData.clean_date  !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.clean_date).toLocaleDateString() : null,
                clean_man_hour_estimated: round2Dec(result.clean_man_hour_estimated),
                clean_man_hour_applied: round2Dec(result.clean_man_hour_applied),
                repair_schedule_date: railcarData.repair_schedule_date  !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.repair_schedule_date).toLocaleDateString() : null,
                repair_man_hour_estimated: round2Dec(result.repair_man_hour_estimated),
                repair_man_hour_applied: round2Dec(result.repair_man_hour_applied),
                paint_date: railcarData.paint_date  !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.paint_date).toLocaleDateString() : null,
                exterior_paint: railcarData.exterior_paint !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.exterior_paint).toLocaleDateString() : null,
                paint_man_hour_estimated:round2Dec( result.paint_man_hour_estimated),
                paint_man_hour_applied: round2Dec(result.paint_man_hour_applied),
                valve_date: railcarData.valve_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.valve_date).toLocaleDateString() : null,
                valve_man_hour_estimated:round2Dec( result.valve_man_hour_estimated),
                valve_man_hour_applied: round2Dec(result.valve_man_hour_applied),
                pd_date: railcarData.pd_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.pd_date).toLocaleDateString() : null,
                pd_man_hour_estimated:round2Dec( result.pd_man_hour_estimated),
                pd_man_hour_applied: round2Dec(result.pd_man_hour_applied),
                indirect_labor_man_hour_estimated: round2Dec(result.indirect_labor_man_hour_estimated),
                indirect_labor_man_hour_applied: round2Dec(result.indirect_labor_man_hour_applied),
                indirect_switching_man_hour_estimated: round2Dec(result.indirect_switching_man_hour_estimated),
                indirect_switching_man_hour_applied: round2Dec(result.indirect_switching_man_hour_applied),
                maintenance_man_hour_estimated:round2Dec( result.maintenance_man_hour_estimated),
                maintenance_man_hour_applied: round2Dec(result.maintenance_man_hour_applied),
                admin_man_hour_estimated: round2Dec(result.admin_man_hour_estimated),
                admin_man_hour_applied:round2Dec( result.admin_man_hour_applied),
                final_date: railcarData.final_date  !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.final_date).toLocaleDateString() : null,
                qa_date: railcarData.qa_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.qa_date).toLocaleDateString() : null,
                projected_out_date: railcarData.projected_out_date !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.projected_out_date).toLocaleDateString() : null,
                month_to_invoice: railcarData.month_to_invoice !== process.env.REACT_APP_DEFAULT_DATE ? new Date(railcarData.month_to_invoice).toLocaleDateString() : null,
                total_cost: round2Dec(result.total_cost),
                mo_wk: railcarData.mo_wk || "",
                sp: railcarData.sp || "",
                tq: railcarData.tq || "",
                re: railcarData.re || "",
                ep: railcarData.ep || ""
            };
        });
    }

    const handleDateChange = async (date, id, field) => {
        setProcessedReport(prevReport => {
            const updatedData = prevReport.map(item => {
                if (item.id === id) {
                    return {...item, [field]: date ? new Date(date).toLocaleDateString() : null};
                }
                return item;
            });
            return updatedData;
        });


        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+'update_date_field', {
                workorder_id: id,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                date_field: field, // Replace with the field you want to update
                date_value: date// Replace with the desired date
            });

            console.log('Response:', response.data); // Handle successful response
        } catch (error) {
            console.error('Error:', error.response?.data || error.message); // Handle error response
        }
    };

    const handleTextChange = async (e, id, field) => {
        const {value} = e.target;
        setProcessedReport(prevReport => {
            const updatedData = prevReport.map(item => {
                if (item.id === id) {
                    return {...item, [field]: value};
                }
                return item;
            });
            return updatedData;
        });
    };


    const formatField = (key) => key.replace(/_/g, ' ').toUpperCase();

    const filteredReport = processedReport.filter(row =>
        Object.values(row).some(value =>
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState('asc');

    const handleSort = (column) => {
        const direction = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
        setSortColumn(column);
        setSortDirection(direction);
    };

    const sortedReport = [...filteredReport].sort((a, b) => {
        if (sortColumn) {
            const aValue = a[sortColumn] || '';
            const bValue = b[sortColumn] || '';
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        }
        return 0;
    });

    const getSortArrow = (column) => {
        if (sortColumn === column) {
            return sortDirection === 'asc' ? '🔼' : '🔽';
        }
        return '🔼';
    };


    const exportToCSV = () => {
        if (filteredReport.length === 0) return;

        // Generate CSV headers from keys
        const headers = Object.keys(filteredReport[0] || {}).join(',');

        // Generate CSV rows
        const rows = filteredReport.map(row =>
            Object.values(row).map(value => {
                // Handle empty date picker fields and other null/undefined values
                if (value === null || value === undefined || value === '1900-01-01T00:00:00.000Z') {
                    return '""'; // Represent empty values as empty strings in CSV
                }
                return `"${value.toString().replace(/"/g, '""')}"`; // Properly escape quotes
            }).join(',')
        );

        // Create CSV content
        const csvContent = `data:text/csv;charset=utf-8,${headers}\n${rows.join('\n')}`;

        // Create download link and trigger download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'department_report.csv');
        document.body.appendChild(link); // Required for Firefox
        link.click();
    };

    const updateTextField =async (e, id, key) =>{
        const val= e.target.value.toString(); // Get the value from the input field
        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'update_text_field', {
                workorder_id: id,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                text_field: key, // Field you're updating
                text_value: val // Correct value to send
            });

            console.log('Response:', response.data); // Handle successful response
        } catch (error) {
            console.error('Error:', error.response?.data || error.message); // Handle error response
        }
    }

    return (
        <React.Fragment>
        {processedReport.length > 0 ? (

                <div id="departMentReport">
                    <Modal
                        isOpen={isStatusDropDownModalOpenInDetails}
                        onRequestClose={() => {
                            if (getValueByIdStatusCommentDropDown("statusUpdateMessageFromDropDown") !== '') {
                                postStatusFromDetails()
                            }
                        }
                        }
                        parentSelector={() => document.querySelector('#departMentReport')}
                        id="theIdHere"
                        contentLabel="POST COMMENT"
                        style={customStylesForCommentModal}
                    >
                        <textarea id="statusUpdateMessageFromDropDownInDetails" rows="2"
                                  ref={statusCommentDropDownInDetails}
                                  className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 my-4"
                                  placeholder="Write your comments here..."></textarea>
                        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={postStatusFromDetails}>SUBMIT
                        </button>
                    </Modal>
                    <div className="flex justify-between">
                        <h1 className="flex justify-start flex-row py-3">Department wise report</h1>
                        <div className="flex justify-end flex-row p-2 ">
                            {/* Search Bar on the right */}
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}

                                style={{ padding: '10px', fontSize: '14px', width: '200px' }}
                            />
                        </div>
                    </div>

                    <div className="table-container max-h-screen">
                        {/* Flex container for the search bar */}


                        <FaCloudDownloadAlt onClick={exportToCSV} style={{
                            position: 'fixed',
                            bottom: '20px',
                            right: '15px',
                            height:'50px',
                            width:'50px',
                            color:'#002E54',
                            cursor:'pointer',
                            zIndex: '1000' // Ensure it's on top of other elements
                        }}/>
                        <table>
                            <thead>
                            <tr style={{ backgroundColor: "#DCE5FF", fontSize: '10px', padding: '1px', fontFamily: 'Inter', fontWeight: '500' }}>
                                <th
                                    className="sticky-header sticky-column"
                                    onClick={() => handleSort('railcar_id')}
                                    style={{ cursor: 'pointer', position: 'relative' }}
                                >
                                    RAILCAR
                                    <span >{getSortArrow('railcar_id')}</span>
                                </th>
                                {Object.keys(processedReport[0]).map((key) =>
                                    key !== 'id' && key !== 'railcar_id' ? (
                                        <th
                                            key={key}
                                            className="sticky-header"
                                            style={{ paddingLeft: '10px', paddingRight: '2px', cursor: 'pointer', position: 'relative' }}
                                            onClick={() => handleSort(key)}
                                        >
                                            {formatField(key)}
                                            <span >{getSortArrow(key)}</span>
                                        </th>
                                    ) : null
                                )}
                            </tr>
                            </thead>
                            <tbody>
                            {sortedReport.map((row) => (
                                <tr key={row.id}>
                                    <td className="sticky-column">{row.railcar_id}</td>
                                    {Object.keys(row).map((key) =>
                                        key !== 'id' && key !== 'railcar_id' ? (
                                            <td key={key} className="text-xs py-1" style={{ paddingLeft: '5px', fontFamily: 'Inter', fontWeight: '400' }}>
                                                {["mo_wk", "sp", "tq", "re", "ep"].includes(key) ? (
                                                    <input
                                                        type="text"
                                                        style={{ width: '160px' }}
                                                        value={row[key]}
                                                        onChange={(e) => handleTextChange(e, row.id, key)}
                                                        onBlur={(e) => updateTextField(e, row.id, key)}
                                                        className="text-input w-40"
                                                    />
                                                ) : key.includes('date') || key === 'material_eta' || key === 'exterior_paint' || key === 'month_to_invoice' ? (
                                                    <span>
                                            <DatePicker
                                                value={row[key] !== null ? new Date(row[key]).toLocaleDateString() : null}
                                                selected={row[key] !== null ? new Date(row[key]) : null}
                                                onChange={(newDate) => handleDateChange(newDate, row.id, key)}
                                                isClearable
                                                showYearDropdown
                                                dateFormat="MM-dd-yyyy"
                                                style={{ width: '100%' }}
                                            />
                                        </span>
                                                ) : key === 'status_code' ? (
                                                    <select onChange={(e) => handleDropdownChangeInDetails(e, row.id)}>
                                                        {statusCodes.map((status) => (
                                                            <option key={status.code} value={status.code} selected={row[key] === status.code}>
                                                                {status.code + ":" + status.title}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <span>{row[key]}</span>
                                                )}
                                            </td>
                                        ) : null
                                    )}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

        </React.Fragment>
    );
};

export default DepartmentReport;




