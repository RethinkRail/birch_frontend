/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/30/2024, Monday
 * Description:
 **/

/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/3/2024, Tuesday
 * Description:
 **/

import React, {useState, useEffect, useMemo, useRef} from 'react';
import axios from 'axios';
import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';
import './DepartmentReport.css';
import {round3Dec} from "../../utils/NumberHelper";
import {differenceBetweenTwoTimeStamp} from "../../utils/DateTimeHelper";
import {FaCloudDownloadAlt, FaDownload, FaFileDownload} from "react-icons/fa";
import {toast} from "react-toastify";
import Modal from "react-modal";
import qs from "qs";
import {TextField} from "@mui/material";
import Select from "react-select";
import MenuItem from "@inovua/reactdatagrid-community/packages/Menu/src/MenuItem";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";
import {AdapterDateFns} from "@mui/x-date-pickers/AdapterDateFns";
import {LocalizationProvider} from "@mui/x-date-pickers";


const DPRMat = () => {
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
        console.log('Data Array:', dataArray);
        console.log('Department Map:', departmentMap);

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
                inspected_date: formatDate(railcarData.inspected_date),
                material_eta: formatDate(railcarData.material_eta),
                clean_date: formatDate(railcarData.clean_date),
                clean_man_hour_estimated: round3Dec(result.clean_man_hour_estimated),
                clean_man_hour_applied: round3Dec(result.clean_man_hour_applied),
                repair_schedule_date: formatDate(railcarData.repair_schedule_date),
                repair_man_hour_estimated: round3Dec(result.repair_man_hour_estimated),
                repair_man_hour_applied: round3Dec(result.repair_man_hour_applied),
                paint_date: formatDate(railcarData.paint_date),
                exterior_paint: formatDate(railcarData.exterior_paint),
                paint_man_hour_estimated: round3Dec(result.paint_man_hour_estimated),
                paint_man_hour_applied: round3Dec(result.paint_man_hour_applied),
                valve_date: formatDate(railcarData.valve_date),
                valve_man_hour_estimated: round3Dec(result.valve_man_hour_estimated),
                valve_man_hour_applied: round3Dec(result.valve_man_hour_applied),
                pd_date: formatDate(railcarData.pd_date),
                pd_man_hour_estimated: round3Dec(result.pd_man_hour_estimated),
                pd_man_hour_applied: round3Dec(result.pd_man_hour_applied),
                indirect_labor_man_hour_estimated: round3Dec(result.indirect_labor_man_hour_estimated),
                indirect_labor_man_hour_applied: round3Dec(result.indirect_labor_man_hour_applied),
                indirect_switching_man_hour_estimated: round3Dec(result.indirect_switching_man_hour_estimated),
                indirect_switching_man_hour_applied: round3Dec(result.indirect_switching_man_hour_applied),
                maintenance_man_hour_estimated: round3Dec(result.maintenance_man_hour_estimated),
                maintenance_man_hour_applied: round3Dec(result.maintenance_man_hour_applied),
                admin_man_hour_estimated: round3Dec(result.admin_man_hour_estimated),
                admin_man_hour_applied: round3Dec(result.admin_man_hour_applied),
                final_date: formatDate(railcarData.final_date),
                qa_date: formatDate(railcarData.qa_date),
                projected_out_date: formatDate(railcarData.projected_out_date),
                month_to_invoice: formatDate(railcarData.month_to_invoice),
                total_cost: round3Dec(result.total_cost),
                mo_wk: railcarData.mo_wk || "",
                sp: railcarData.sp || "",
                tq: railcarData.tq || "",
                re: railcarData.re || "",
                ep: railcarData.ep || ""
            };

        }
        console.log(results)
        return results;
    }



    const columns =useMemo(() => [
        {
            accessorKey: 'id',
            header: 'ID'
        },
        {
            accessorKey: 'railcar_id',
            header: 'Railcar ID',
        },
        {
            accessorKey: 'dis',
            header: 'DIS',
        },
        {
            accessorKey: 'type',
            header: 'Type',
        },
        {
            accessorKey: 'owner',
            header: 'Owner',
        },
        {
            accessorKey: 'lessee',
            header: 'Lessee',
        },
        {
            accessorKey: 'products',
            header: 'Products',
        },
        {
            accessorKey: 'status_code',
            header: 'Status',
            Cell: ({ row }) => (
                <Select
                    value={row.status_code}
                    onChange={(e) => handleDropdownChangeInDetails(e, row.original.id)}
                >
                    {statusCodes.map((status) => (
                        <MenuItem key={status.code} value={status.code}>
                            {status.code}: {status.title}
                        </MenuItem>
                    ))}
                </Select>
            ),
        },
        {
            accessorKey: 'inspected_date',
            header: 'Inspected Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.inspected_date ? new Date(row.inspected_date) : null}
                        onChange={(date) => handleDateChange(date, row.id, 'inspected_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'clean_date',
            header: 'Clean Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.original.clean_date ? new Date(row.original.clean_date) : null}
                        onChange={(date) => handleDateChange(date, row.original.id, 'clean_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'clean_man_hour_estimated',
            header: 'Clean Man Hour Estimated',
        },
        {
            accessorKey: 'clean_man_hour_applied',
            header: 'Clean Man Hour Applied',
        },
        {
            accessorKey: 'repair_schedule_date',
            header: 'Repair Schedule Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.original.repair_schedule_date ? new Date(row.original.repair_schedule_date) : null}
                        onChange={(date) => handleDateChange(date, row.original.id, 'repair_schedule_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'repair_man_hour_estimated',
            header: 'Repair Man Hour Estimated',
        },
        {
            accessorKey: 'repair_man_hour_applied',
            header: 'Repair Man Hour Applied',
        },
        {
            accessorKey: 'paint_date',
            header: 'Paint Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.original.paint_date ? new Date(row.original.paint_date) : null}
                        onChange={(date) => handleDateChange(date, row.original.id, 'paint_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'exterior_paint',
            header: 'Exterior Paint',
        },
        {
            accessorKey: 'paint_man_hour_estimated',
            header: 'Paint Man Hour Estimated',
        },
        {
            accessorKey: 'paint_man_hour_applied',
            header: 'Paint Man Hour Applied',
        },
        {
            accessorKey: 'valve_date',
            header: 'Valve Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.original.valve_date ? new Date(row.original.valve_date) : null}
                        onChange={(date) => handleDateChange(date, row.original.id, 'valve_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'valve_man_hour_estimated',
            header: 'Valve Man Hour Estimated',
        },
        {
            accessorKey: 'valve_man_hour_applied',
            header: 'Valve Man Hour Applied',
        },
        {
            accessorKey: 'pd_date',
            header: 'PD Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.original.pd_date ? new Date(row.original.pd_date) : null}
                        onChange={(date) => handleDateChange(date, row.original.id, 'pd_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'pd_man_hour_estimated',
            header: 'PD Man Hour Estimated',
        },
        {
            accessorKey: 'pd_man_hour_applied',
            header: 'PD Man Hour Applied',
        },
        {
            accessorKey: 'indirect_labor_man_hour_estimated',
            header: 'Indirect Labor Man Hour Estimated',
        },
        {
            accessorKey: 'indirect_labor_man_hour_applied',
            header: 'Indirect Labor Man Hour Applied',
        },
        {
            accessorKey: 'indirect_switching_man_hour_estimated',
            header: 'Indirect Switching Man Hour Estimated',
        },
        {
            accessorKey: 'indirect_switching_man_hour_applied',
            header: 'Indirect Switching Man Hour Applied',
        },
        {
            accessorKey: 'maintenance_man_hour_estimated',
            header: 'Maintenance Man Hour Estimated',
        },
        {
            accessorKey: 'maintenance_man_hour_applied',
            header: 'Maintenance Man Hour Applied',
        },
        {
            accessorKey: 'admin_man_hour_estimated',
            header: 'Admin Man Hour Estimated',
        },
        {
            accessorKey: 'admin_man_hour_applied',
            header: 'Admin Man Hour Applied',
        },
        {
            accessorKey: 'final_date',
            header: 'Final Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.original.final_date ? new Date(row.original.final_date) : null}
                        onChange={(date) => handleDateChange(date, row.original.id, 'final_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'qa_date',
            header: 'QA Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.original.qa_date ? new Date(row.original.qa_date) : null}
                        onChange={(date) => handleDateChange(date, row.original.id, 'qa_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'projected_out_date',
            header: 'Projected Out Date',
            Cell: ({ row }) => (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                        selected={row.projected_out_date ? new Date(row.projected_out_date) : null}
                        value={new Date(row.projected_out_date)}
                        onChange={(date) => handleDateChange(date, row.original.id, 'projected_out_date')}
                        dateFormat="MM-dd-yyyy"
                        isClearable
                        withPortal
                    />
                </LocalizationProvider>
            ),
        },
        {
            accessorKey: 'month_to_invoice',
            header: 'Month to Invoice',
        },
        {
            accessorKey: 'total_cost',
            header: 'Total Cost',
        },
        {
            accessorKey: 'mo_wk',
            header: 'Mo Wk',
            Cell: ({ row }) => (
                <TextField
                    value={row.original.mo_wk || ''}
                    onChange={(e) => handleTextChange(e, row.original.id, 'mo_wk')}
                />
            ),
        },
        {
            accessorKey: 'sp',
            header: 'SP',
            Cell: ({ row }) => (
                <TextField
                    value={row.original.sp || ''}
                    onChange={(e) => handleTextChange(e, row.original.id, 'sp')}
                />
            ),
        },
        {
            accessorKey: 'tq',
            header: 'TQ',
            Cell: ({ row }) => (
                <TextField
                    value={row.original.tq || ''}
                    onChange={(e) => handleTextChange(e, row.original.id, 'tq')}
                />
            ),
        },
        {
            accessorKey: 're',
            header: 'RE',
            Cell: ({ row }) => (
                <TextField
                    value={row.original.re || ''}
                    onChange={(e) => handleTextChange(e, row.original.id, 're')}
                />
            ),
        },
        {
            accessorKey: 'ep',
            header: 'EP',
            Cell: ({ row }) => (
                <TextField
                    value={row.original.ep || ''}
                    onChange={(e) => handleTextChange(e, row.original.id, 'ep')}
                />
            ),
        },
    ],[]);

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

                <MaterialReactTable
                    columns={columns}
                    data={processedReport}
                    enableColumnPinning={true}
                    enableStickyHeader={true}
                    initialState={{
                        columnPinning: { left: ['railcar_id'] }, // pin railcar_id column to left by default
                        columnVisibility: { id: false } // hide the id column
                    }}
                />

            ) : null}

        </React.Fragment>
    );
};

export default DPRMat;




