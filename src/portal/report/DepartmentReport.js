/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/3/2024, Tuesday
 * Description:
 **/

import React, {useState, useEffect, useMemo, useRef} from 'react';
import axios from 'axios';

import DatePicker from "react-datepicker";
import './DepartmentReport.css';
import {round2Dec} from "../../utils/NumberHelper";
import {differenceBetweenTwoTimeStamp} from "../../utils/DateTimeHelper";
import {FaCloudDownloadAlt, FaDownload, FaFileDownload} from "react-icons/fa";
import {toast} from "react-toastify";
import Modal from "react-modal";
import qs from "qs";

import CommentModalDepartMent from "../../components/CommentModalDepartMent";


const DepartmentReport = () => {
    const toastId = useRef(null)
    const [commentObject, setCommentObject] = useState([])
    const [workIdForComment, setWorkIdForComment] = useState(null)
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
                //console.log(departmentReportResponse)
                let data = processRailcarData(departmentReportResponse.data, jobCategoryResponse.data);
                // console.log(departmentReportResponse.data.length)
                // console.log(data.length)
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

    function createObject(inputObject,statusTitle,userName) {


        // Creating the desired object structure
        const result = {
            status_id: inputObject.status_id,
            update_date: inputObject.update_date,
            comment: inputObject.comment,
            user: {
                name: userName,
                id: inputObject.user_id
            },
            statuscode: {
                title: statusTitle,
                code: inputObject.status_id
            }
        };

        return result;
    }
    const putComments = (id,response,status_id,title)=>{
        const lastCommentObject = createObject(response,title,JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))['name'])
        console.log(lastCommentObject)
        console.log(id)

        setProcessedReport((prevRep) =>
            prevRep.map((rep) => {
                if (rep.id === id) {
                    // Prepending the new comment to the comment array
                    return {
                        ...rep,
                        comment: [lastCommentObject, ...rep.comment],
                    };
                }
                return rep;
            })
        );
    }


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



        if (!dataArray.length || !departmentMap.length) {
            console.error('Empty dataArray or departmentMap');
            return [];
        }

        const departmentMapById = departmentMap.reduce((acc, dept) => {
            acc[dept.id] = dept.name.toLowerCase().replace(/-/g, '_');
            return acc;
        }, {});

        const results = new Array(dataArray.length);

        for (let i = 0; i < dataArray.length; i++) {
            const railcarData = dataArray[i];
            const result = {};

            // Initialize man-hour fields
            for (const deptId in departmentMapById) {
                result[`${departmentMapById[deptId]}_man_hour_estimated`] = 0;
                result[`${departmentMapById[deptId]}_man_hour_applied`] = 0;
            }



            if (!railcarData.joblist || !Array.isArray(railcarData.joblist)) {
                console.error('Invalid joblist:', railcarData.joblist);
                continue;
            }

            railcarData.joblist.forEach((job)=>{

                const jobCategoryId = job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.id;
                const departmentName = departmentMapById[jobCategoryId];


                if (departmentName) {

                    const manHourEstimated = job.labor_time * job.quantity;
                    const manHourApplied = job.time_log ? job.time_log.reduce((sum, log) => sum + (log.logged_time_in_seconds || 0), 0) / 3600 : 0;

                    result[`${departmentName}_man_hour_estimated`] += manHourEstimated;
                    result[`${departmentName}_man_hour_applied`] += manHourApplied;

                }

                const totalCost = (job.labor_cost || 0) + (job.material_cost || 0);
                result.total_cost = (result.total_cost || 0) + totalCost;
            })


            const statusCode = railcarData.workupdates?.[0]?.statuscode?.code || null;
            const comment = railcarData.workupdates;
            const owner = railcarData.railcar?.owner_railcar_owner_idToowner?.name || null;
            const lessee = railcarData.railcar?.owner_railcar_lessee_idToowner?.name || null;
            const products = railcarData.railcar?.products?.name || null;
            const type = railcarData.railcar?.railcartype?.name || null;
            const railcar_id = railcarData.railcar?.rfid || null;

            // Use a helper function to format dates
            const formatDate = (dateStr) => dateStr !== process.env.REACT_APP_DEFAULT_DATE ? new Date(dateStr).toLocaleDateString() : null;

            results[i] = {
                id: railcarData.id,
                railcar_id,
                dis: railcarData.arrival_date == process.env.REACT_APP_DEFAULT_DATE ? 0 : differenceBetweenTwoTimeStamp(new Date().toISOString().slice(0, 19), railcarData.arrival_date)["days"],
                type,
                owner,
                lessee,
                products,
                status_code: statusCode,
                comment: comment,
                inspected_date: formatDate(railcarData.inspected_date),
                material_eta: formatDate(railcarData.material_eta),
                clean_date: formatDate(railcarData.clean_date),
                clean_man_hour_estimated: round2Dec(result.clean_man_hour_estimated),
                clean_man_hour_applied: round2Dec(result.clean_man_hour_applied),
                repair_schedule_date: formatDate(railcarData.repair_schedule_date),
                repair_man_hour_estimated: round2Dec(result.repair_man_hour_estimated),
                repair_man_hour_applied: round2Dec(result.repair_man_hour_applied),
                paint_date: formatDate(railcarData.paint_date),
                exterior_paint: formatDate(railcarData.exterior_paint),
                paint_man_hour_estimated: round2Dec(result.paint_man_hour_estimated),
                paint_man_hour_applied: round2Dec(result.paint_man_hour_applied),
                valve_date: formatDate(railcarData.valve_date),
                valve_man_hour_estimated: round2Dec(result.valve_man_hour_estimated),
                valve_man_hour_applied: round2Dec(result.valve_man_hour_applied),
                pd_date: formatDate(railcarData.pd_date),
                pd_man_hour_estimated: round2Dec(result.pd_man_hour_estimated),
                pd_man_hour_applied: round2Dec(result.pd_man_hour_applied),
                indirect_labor_man_hour_estimated: round2Dec(result.indirect_labor_man_hour_estimated),
                indirect_labor_man_hour_applied: round2Dec(result.indirect_labor_man_hour_applied),
                indirect_switching_man_hour_estimated: round2Dec(result.indirect_switching_man_hour_estimated),
                indirect_switching_man_hour_applied: round2Dec(result.indirect_switching_man_hour_applied),
                maintenance_man_hour_estimated: round2Dec(result.maintenance_man_hour_estimated),
                maintenance_man_hour_applied: round2Dec(result.maintenance_man_hour_applied),
                admin_man_hour_estimated: round2Dec(result.admin_man_hour_estimated),
                admin_man_hour_applied: round2Dec(result.admin_man_hour_applied),
                final_date: formatDate(railcarData.final_date),
                qa_date: formatDate(railcarData.qa_date),
                projected_out_date: formatDate(railcarData.projected_out_date),
                month_to_invoice: formatDate(railcarData.month_to_invoice),
                total_cost: round2Dec(result.total_cost),
                mo_wk: railcarData.mo_wk || "",
                sp: railcarData.sp || "",
                tq: railcarData.tq || "",
                re: railcarData.re || "",
                ep: railcarData.ep || ""
            };

        }

        return results;
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
    };


    const exportToCSV = () => {
        const rows = document.querySelectorAll('table tr');
        const csvData = [];

        for (let row of rows) {
            const rowData = [];
            const columns = row.querySelectorAll('td, th');

            for (let column of columns) {
                let cellData = '';

                // Check if the column contains an input inside the react-datepicker wrapper
                const dateInput = column.querySelector('input[type="text"]');
                if (dateInput) {
                    cellData = dateInput.value; // Extract the value from the text input
                } else {
                    cellData = column.textContent.trim(); // Fallback to text content if no input is found
                }

                rowData.push(cellData);
            }

            csvData.push(rowData.join(','));
        }

        const csvContent = csvData.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', "Birch Department Wise Report_"+new Date().toLocaleString());
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

                    <CommentModalDepartMent
                        data={commentObject}
                        work_id={workIdForComment}
                        updateWorkUpdates={putComments}
                    />
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
                        <table id="department_report">
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
                            {sortedReport.map((row,i) => (
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
                                                        className="text-input w-40 whitespace-pre-line w-12"
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
                                                ) : key === 'comment' ? (
                                                        <span onClick={() => {
                                                            document.getElementById('commentModal').showModal();
                                                            setCommentObject(row.comment);
                                                            setWorkIdForComment(row.id);

                                                        }} style={{ width: '100px' }}  className="cursor-pointer whitespace-break-spaces" >{row.comment[0].comment+'-'+row.comment[0].user.name}</span>
                                                    )
                                                    : (
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




