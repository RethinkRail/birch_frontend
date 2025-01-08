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
import {MaterialReactTable} from "material-react-table";
import {download, generateCsv, mkConfig} from "export-to-csv";


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
//                console.log(statusCodeResponse)
                setStatusCodes(statusCodeResponse.data);

                const departmentReportResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_department_report/');
                setDepartmentReport(departmentReportResponse.data);
                //console.log(departmentReportResponse)
                let data = processRailcarData(departmentReportResponse.data, jobCategoryResponse.data);
                // console.log(departmentReportResponse.data.length)
                //console.log(data)
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
                toast.update(toastId.current, {
                    render: "Something went wrong",
                    autoClose: 1000,
                    type: "error",
                    hideProgressBar: true,
                    isLoading: false
                });
            }
        };
        toastId.current = toast.loading("Loading...")
        fetchData();
    }, []);

    const handleDropdownChangeInDetails = (e, workId) => {
        console.log(workId)
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

                setProcessedReport((prevRep) =>
                    prevRep.map((rep) => {
                        if (rep.id === workOrderToUpdateStatus) {
                            // Ensure comment is an array before prepending
                            const existingComments = Array.isArray(rep.comment) ? rep.comment : [];
                            return {
                                ...rep,
                                comment: [response.data, ...existingComments],
                            };
                        }
                        return rep;
                    })
                );

            })
            .catch((error) => {
                console.log(error);
                setIsStatusDropDownModalOpenInDetails(false);
                setupdatedStatusCode("")
                toast.error("Something went wrong")
            });
    }

    function processRailcarData(dataArray, departmentMap) {
        if (!dataArray ) {
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
        console.log(date)
        console.log(id)
        console.log(field)
        setProcessedReport(prevReport => {
            const updatedData = prevReport.map(item => {
                if (item.id === id.original.id) {
                    return {...item, [field.id]: date ? new Date(date).toLocaleDateString() : null};
                }
                return item;
            });
            return updatedData;
        });


        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+'update_date_field', {
                workorder_id: id.original.id,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                date_field: field.id, // Replace with the field you want to update
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
                    return {...item, [field.id]: value};
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

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: 'BIRCH Summary Report '+new Date().toLocaleDateString()
    });

    const handleExportRows = (table,rows) => {
        const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible() === true);
        //console.log(visibleColumns)
        // Map the rows to include only the visible columns and use the column headers
        const rowData = rows.map((row) => {
            const filteredRow = {};
            visibleColumns.forEach((column) => {
                //console.log(column)
                if(column.id =='comment'){
                    filteredRow[column.columnDef.header] = row.original[column.id].comment;
                }else {
                    filteredRow[column.columnDef.header] = row.original[column.id];
                }
                // Use the header as the key for the CSV, but still fetch the data using accessorKey
                 // or column.columnDef.accessorKey if needed
            });
            return filteredRow;
        });

        console.log(rowData);

        // Generate the CSV with the filtered row data
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };
    const EditableCell = ({ value, row, column }) => {
        const handleChange = (e) => {
            const newData = [...processedReport];
            newData[row.index][column.id] = e.target.value;
            setProcessedReport(newData);
        };

        return (
            <input
                type="text"
                value={value || ""}
                onChange={handleTextChange}
                className="border p-1 rounded w-full"
            />
        );
    };

    const columns = React.useMemo(
        () => [
            { accessorKey: "railcar_id", header: "Railcar",size: 20 },
            {
                accessorKey: "status_code",
                header: "Status",
                size:50,
                columnFilterModeOptions: ['between','lessThan', 'greaterThan'],
                Cell: ({ row, column }) => (
                    <select onChange={(e) => handleDropdownChangeInDetails(e, row.original.id)} className="w-[200px]">
                        {statusCodes.map((status) => (
                            <option key={status.code} value={status.code} selected={row.original.status_code === status.code}>
                                {status.code + ":" + status.title}
                            </option>
                        ))}
                    </select>
                ),
            },
            {
                accessorKey: "comment",
                header: "Comment",
                size: 250, // Optionally constrain width
                Cell: ({ row }) => (
                    <div
                        className="truncate w-60 whitespace-nowrap overflow-hidden whitespace-pre-wrap cursor-pointer"
                        onClick={() => {
                            document.getElementById('commentModal').showModal();
                            setCommentObject(row.original.comment);
                            setWorkIdForComment(row.original.id);

                        }}
                        title={row.original.comment[0]?.comment}
                    >
                        {row.original.comment[0]?.comment}
                    </div>
                ),
            },
            {
                accessorKey: "clean_date",
                header: "Clean Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.clean_date ? new Date(row.original.clean_date) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"

                    />
                ),
            },
            {
                accessorKey: "repair_schedule_date",
                header: "Repair Schedule Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.repair_schedule_date
                                ? new Date(row.original.repair_schedule_date)
                                : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            {
                accessorKey: "paint_date",
                header: "Paint Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.paint_date ? new Date(row.original.paint_date) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            {
                accessorKey: "pd_date",
                header: "PD Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.pd_date ? new Date(row.original.pd_date) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            {
                accessorKey: "qa_date",
                header: "QA Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.qa_date ? new Date(row.original.qa_date) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            {
                accessorKey: "projected_out_date",
                header: "POD",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.projected_out_date ? new Date(row.original.projected_out_date) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
                sortingFn: (rowA, rowB) => {
                    const dateA = new Date(rowA.original.projected_out_date);
                    const dateB = new Date(rowB.original.projected_out_date);
                    return dateA - dateB;
                },
            },
            {
                accessorKey: "total_cost",
                header: "Total Cost",
                Cell: ({ row, column  }) => {
                    const value = row.original.total_cost;
                    return value ==='NaN' ? 0 : value;
                },
            },
            { accessorKey: "admin_man_hour_estimated", header: "ADMIN MHE" },
            { accessorKey: "admin_man_hour_applied", header: "ADMIN MHA" },
            { accessorKey: "id", header: "ID" },
            { accessorKey: "type", header: "Type" },
            { accessorKey: "dis", header: "DIS",size: 20 ,columnFilterModeOptions: ['lessThan', 'greaterThan'],},

            {
                accessorKey: "month_to_invoice",
                header: "Month to Invoice",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.month_to_invoice ? new Date(row.original.month_to_invoice) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            {
                accessorKey: "mo_wk",
                header: "MO/WK",
                Cell: ({ row, column }) => (
                    <input
                        type="text"
                        value={row.original.mo_wk || ""}
                        onChange={(e) => handleTextChange(e, row.original.id, column)}
                        className="border p-1 rounded w-full"
                        onBlur={(e) => updateTextField(e, row.original.id, column)}
                    />

                ),
            },

            { accessorKey: "owner", header: "Owner" },
            { accessorKey: "lessee", header: "Lessee" },
            { accessorKey: "products", header: "Products" },
            {
                accessorKey: "inspected_date",
                header: "Inspected Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={new Date(row.original.inspected_date)}
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            {
                accessorKey: "material_eta",
                header: "Material ETA",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.material_eta ? new Date(row.original.material_eta) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            { accessorKey: "clean_man_hour_estimated", header: "CLEAN MHE" },
            { accessorKey: "clean_man_hour_applied", header: "CLEAN MHA" },
            { accessorKey: "repair_man_hour_estimated", header: "REPAIR MHE" },
            { accessorKey: "repair_man_hour_applied", header: "REPAIR MHA" },
            {
                accessorKey: "exterior_paint",
                header: "Exterior Paint",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.exterior_paint ? new Date(row.original.exterior_paint) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            { accessorKey: "paint_man_hour_estimated", header: "PAINT MHE" },
            { accessorKey: "paint_man_hour_applied", header: "PAINT MHA" },
            {
                accessorKey: "valve_date",
                header: "Valve Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.valve_date ? new Date(row.original.valve_date) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            { accessorKey: "valve_man_hour_estimated", header: "VALVE MHE" },
            { accessorKey: "valve_man_hour_applied", header: "VALVE MHA" },
            { accessorKey: "pd_man_hour_estimated", header: "PD MHE" },
            { accessorKey: "pd_man_hour_applied", header: "PD MHA" },
            { accessorKey: "indirect_labor_man_hour_estimated", header: "INDIRECT MHE" },
            { accessorKey: "indirect_labor_man_hour_applied", header: "INDIRECT MHA" },
            { accessorKey: "indirect_switching_man_hour_estimated", header: "INDIRECT SWITCHING MHE" },
            { accessorKey: "indirect_switching_man_hour_applied", header: "INDIRECT SWITCHING MHA" },
            { accessorKey: "maintenance_man_hour_estimated", header: "MAINTENANCE MHE" },
            { accessorKey: "maintenance_man_hour_applied", header: "MAINTENANCE MHA" },
            {
                accessorKey: "final_date",
                header: "Final Date",
                size: 100,
                Cell: ({ row, column }) => (
                    <DatePicker
                        selected={
                            row.original.final_date ? new Date(row.original.final_date) : null
                        }
                        onChange={(date) => handleDateChange(date, row, column)}
                        className="border p-1 rounded w-full"
                        popperClassName="z-50" // Ensure it has a higher z-index
                        portalId="root-portal"
                    />
                ),
            },
            {
                accessorKey: "sp",
                header: "SP",
                Cell: ({ row, column }) => (
                    <input
                        type="text"
                        value={row.original.sp || ""}
                        onChange={(e) => handleTextChange(e, row.original.id, column)}
                        className="border p-1 rounded w-full"
                        onBlur={(e) => updateTextField(e, row.id, column)}
                    />
                ),
            },
            {
                accessorKey: "tq",
                header: "TQ",
                Cell: ({ row, column }) => (
                    <input
                        type="text"
                        value={row.original.tq || ""}
                        onChange={(e) => handleTextChange(e, row.original.id, column)}
                        className="border p-1 rounded w-full"
                        onBlur={(e) => updateTextField(e, row.original.id, column)}
                    />
                ),
            },
            {
                accessorKey: "re",
                header: "RE",
                Cell: ({ row, column }) => (
                    <input
                        type="text"
                        value={row.original.re || ""}
                        onChange={(e) => handleTextChange(e, row.original.id, column)}
                        className="border p-1 rounded w-full"
                        onBlur={(e) => updateTextField(e, row.original.id, column)}
                    />
                ),
            },
            {
                accessorKey: "ep",
                header: "EP",
                Cell: ({ row, column }) => (
                    <input
                        type="text"
                        value={row.original.ep || ""}
                        onChange={(e) => handleTextChange(e, row.original.id, column)}
                        className="border p-1 rounded w-full"
                        onBlur={(e) => updateTextField(e, row.original.id, column)}
                    />
                ),
            },
            // Date fields with Date Picker
        ],
        [processedReport]
    );


    const updateTextField =async (e, id, key) =>{
        const val= e.target.value.toString(); // Get the value from the input field
        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'update_text_field', {
                workorder_id: id,
                user_id: JSON.parse(localStorage.getItem(process.env.REACT_APP_USER_TOKEN_LOCAL_STORAGE))["id"],
                text_field: key.id, // Field you're updating
                text_value: val // Correct value to send
            });

            console.log('Response:', response.data); // Handle successful response

            // setProcessedReport(prevReport => {
            //     const updatedData = prevReport.map(item => {
            //         if (item.id === id) {
            //             return {...item, [id]: val};
            //         }
            //         return item;
            //     });
            //     return updatedData;
            // });
        } catch (error) {
            console.error('Error:', error.response?.data || error.message); // Handle error response
        }
    }

    return (
        <React.Fragment>
        {processedReport.length > 0 ? (

                <div id="departMentReport">
                    <h1 className="mt-4 mb-4">Department wise report</h1>
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
                    <MaterialReactTable
                        columns={columns}
                        data={processedReport}
                        enablePagination={true}
                        enableColumnFilterModes={true}
                        enableStickyHeader
                        initialState={{
                            pagination: {
                                pageIndex: 0,
                                pageSize: 50, // Set default page size to 50
                            },
                            columnPinning: { left: ['railcar_id'] },
                            columnVisibility: {
                                railcar_id: true, // First column
                                status_code: true, // Second column
                                comment: true,
                                clean_date: true,
                                repair_schedule_date: true,
                                paint_date: true,
                                pd_date: true,
                                qa_date: true,
                                projected_out_date: true,
                                total_cost: true,
                                admin_man_hour_estimated: true,
                                admin_man_hour_applied: true,
                                id: false,
                                type: false,
                                dis: false,
                                month_to_invoice: false,
                                mo_wk: false,
                                owner: false,
                                lessee: false,
                                products: false,
                                inspected_date: false,
                                material_eta: false,
                                clean_man_hour_estimated: false,
                                clean_man_hour_applied: false,
                                repair_man_hour_estimated: false,
                                repair_man_hour_applied: false,
                                exterior_paint: false,
                                paint_man_hour_estimated: false,
                                paint_man_hour_applied: false,
                                valve_date: false,
                                valve_man_hour_estimated: false,
                                valve_man_hour_applied: false,
                                pd_man_hour_estimated: false,
                                pd_man_hour_applied: false,
                                indirect_labor_man_hour_estimated: false,
                                indirect_labor_man_hour_applied: false,
                                indirect_switching_man_hour_estimated: false,
                                indirect_switching_man_hour_applied: false,
                                maintenance_man_hour_estimated: false,
                                maintenance_man_hour_applied: false,
                                final_date: false,
                                sp: false,
                                tq: false,
                                re: false,
                                ep: false,
                            },
                        }}
                        muiTableHeadCellProps={{
                            sx: {
                                backgroundColor: "#DCE5FF",
                                fontSize: '10px',
                                padding: '8px',
                            }
                        }}
                        muiTableBodyCellProps={{
                            sx: {
                                fontSize: '10px',
                                padding: '10px',
                            }
                        }}
                        muiTableBodyRowProps={({ row, table }) => ({
                            sx: {
                                backgroundColor:
                                    table.getRowModel().flatRows.indexOf(row) % 2 === 0
                                        ? "#F9F9F9"
                                        : "#ffffff", // Use table row index to alternate row colors
                            },
                        })}
                        renderTopToolbarCustomActions={({ table }) => (
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    padding: '8px',
                                    flexWrap: 'wrap',
                                }}
                            >

                                <button
                                    disabled={table.getPrePaginationRowModel().rows.length === 0}
                                    onClick={() =>
                                        handleExportRows(table,table.getPrePaginationRowModel().rows)
                                    }
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 16px',
                                        backgroundColor: '#1976d2',
                                        color: '#fff',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        opacity: table.getPrePaginationRowModel().rows.length === 0 ? 0.5 : 1,
                                    }}
                                >
                                    <FaDownload style={{ marginRight: '8px' }} />
                                    Export All
                                </button>


                            </div>
                        )}
                    />
                </div>
            ) : null}

        </React.Fragment>
    );
};

export default DepartmentReport;




