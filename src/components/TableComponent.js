/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/11/2024, Wednesday
 * Description:
 **/
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';

import { round3Dec } from "../utils/NumberHelper";
import axios from "axios";

// Formatting field names
const formatField = (key) => {
    if (typeof key !== 'string') return key;
    if (key.includes('man_hourestimatedimated')) return 'MHR Est.';
    if (key.includes('man_hour_applied')) return 'MHR App.';
    return key.replace(/_/g, ' ').toUpperCase();
};

const TableComponent = () => {
    const [jobCategories, setJobCategories] = useState([]);
    const [statusCodes, setStatusCodes] = useState([]);
    const [departmentReport, setDepartmentReport] = useState([]);
    const [processedReport, setProcessedReport] = useState([]);

    const handleDateChange = (date, id, field) => {
        const updatedData = processedReport.map(item => {
            if (item.id === id) {
                return { ...item, [field]: date ? date.toISOString() : "1900-01-01T00:00:00.000Z" };
            }
            return item;
        });
        setProcessedReport(updatedData);
        // Call your web service here
    };

    const handleTextChange = (e, id, field) => {
        const { value } = e.target;
        const updatedData = processedReport.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setProcessedReport(updatedData);
        // Call your web service here
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobCategoryResponse = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}get_all_job_category/`);
                setJobCategories(jobCategoryResponse.data);

                const statusCodeResponse = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}get_all_status/`);
                setStatusCodes(statusCodeResponse.data);

                const departmentReportResponse = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}get_department_report/`);
                console.log(departmentReportResponse.data);
                setDepartmentReport(departmentReportResponse.data);

                const data = processRailcarData(departmentReportResponse.data, jobCategoryResponse.data);
                console.log(data);
                setProcessedReport(data);

            } catch (err) {
                console.log(err);
            }
        };

        fetchData();
    }, []);

    function processRailcarData(dataArray, departmentMap) {
        return dataArray.map(railcarData => {
            const result = {};

            // Initialize man-hour and applied hour fields for each department
            departmentMap.forEach(dept => {
                result[`${dept.name.toLowerCase().replace(/-/g, '_')}_man_hourestimatedimated`] = 0;
                result[`${dept.name.toLowerCase().replace(/-/g, '_')}_man_hour_applied`] = 0;
            });

            // Process joblist for each railcar
            railcarData.joblist.forEach(job => {
                const jobCategoryId = job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.id;
                const department = departmentMap.find(dept => dept.id === jobCategoryId);

                if (department) {
                    const manHourEstimated = job.labor_time * job.quantity;
                    const manHourApplied = job.time_log.reduce((sum, log) => sum + log.logged_time_in_seconds, 0) / 3600; // Convert to hours

                    // Update values for matching department
                    result[`${department.name.toLowerCase().replace(/-/g, '_')}_man_hourestimatedimated`] += manHourEstimated;
                    result[`${department.name.toLowerCase().replace(/-/g, '_')}_man_hour_applied`] += manHourApplied;
                }

                // Calculate total cost for each job
                const totalCost = job.labor_cost + job.material_cost;
                result.total_cost = (result.total_cost || 0) + totalCost;
            });

            // Extract status_code from the first workupdate
            const statusCode = railcarData.workupdates[0]?.statuscode?.code || null;
            result.status_code = statusCode;

            const owner = railcarData.railcar?.owner_railcar_owner_idToowner?.name || null;
            result.owner = owner;

            const lessee = railcarData.railcar?.owner_railcar_lessee_idToowner?.name || null;
            result.lessee = lessee;

            const products = railcarData.railcar?.products?.name || null;
            result.products = products;

            const type = railcarData.railcar.railcartype?.name || null;
            result.type = type;

            const railcar_id = railcarData.railcar.rfid;
            result.railcar_id = railcar_id;

            // Return the processed railcar object without joblist and workupdates, and include the calculated values
            const { joblist, workupdates, railcar, ...railcarWithoutJoblistOrWorkupdates } = railcarData;

            return {
                ...railcarWithoutJoblistOrWorkupdates,
                ...result
            };
        });
    }

    const columns = processedReport.length > 0 ? [
        {
            name: 'Railcar ID',
            selector: 'railcar_id',
            sortable: true,
            style: {
                fontSize: '12px',
                fontWeight: '500',
                fontFamily: 'Inter'
            }
        },
        ...Object.keys(processedReport[0])
            .filter(key => key !== 'id' && key !== 'railcar_id')
            .map(key => ({
                name: formatField(key),
                selector: row => row[key],
                sortable: true,
                cell: row => {
                    const value = row[key];

                    // Conditionally render input or formatted value
                    return ["mo_wk", "sp", "tq", "re", "exterior_paint"].includes(key) ? (
                        <input
                            type="text"
                            value={value || ''}
                            onChange={(e) => handleTextChange(e, row.id, key)}
                            className="text-input"
                        />
                    ) : key.includes('date') || key === 'material_eta' ? (
                        <input
                            type="date"
                            value={value === '1900-01-01T00:00:00.000Z' ? '' : value.split('T')[0]}
                            onChange={(e) => handleDateChange(new Date(e.target.value), row.id, key)}
                            className="date-picker"
                        />
                    ) : (
                        <span>{typeof value === 'number' ? round3Dec(value) : value}</span>
                    );
                },
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '500',
                    paddingLeft: '10px'
                }
            }))
    ] : [];

    const conditionalRowStyles = [
        {
            when: row => row.index % 2 === 1,
            style: {
                backgroundColor: '#F7F9FF',
            },
        },
        {
            when: row => row.index % 2 === 0,
            style: {
                backgroundColor: '#FFFFFF',
            },
        },
    ];

    // CSV Export headers
    const csvHeaders = columns.map(col => ({ label: col.name, key: col.selector }));

    return (
        <div className="table-container">
            <DataTable
                columns={columns}
                data={processedReport}
                customStyles={{
                    headRow: {
                        style: {
                            backgroundColor: "#DCE5FF",
                            fontSize: "10px",
                            padding: "1px",
                            fontFamily: 'Inter',
                            fontWeight: "500"
                        },
                    },
                    headCells: {
                        style: {
                            paddingLeft: '10px',
                            paddingRight: '2px',
                        },
                    },
                    cells: {
                        style: {
                            fontSize: "10px",
                            fontFamily: 'Inter',
                            fontWeight: "500",
                            paddingLeft: "10px"
                        },
                    },
                }}
                pagination
                fixedHeader
                fixedHeaderScrollHeight="400px"
                striped
                conditionalRowStyles={conditionalRowStyles}
                highlightOnHover
                subHeader
                subHeaderAlign="right"
            />
        </div>
    );
};

export default TableComponent;
