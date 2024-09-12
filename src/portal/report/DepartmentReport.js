/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/3/2024, Tuesday
 * Description:
 **/

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { MaterialReactTable } from "material-react-table";
import DatePicker from "react-datepicker";
import CustomDateInputFullWidth from "../../components/CustomDateInputFullWidth";
import DataTable from "react-data-table-component"; // Make sure you import the CSS file here
import '../../DepartmentReport.css';
import {round2Dec} from "../../utils/NumberHelper";
import {differenceBetweenTwoTimeStamp} from "../../utils/DateTimeHelper";  // You'll add the styles in this CSS file


const DepartmentReport = () => {
    const [loading, setLoading] = useState(true);
    const [jobCategories, setJobCategories] = useState([]);
    const [statusCodes, setStatusCodes] = useState([]);
    const [departmentReport, setDepartmentReport] = useState([]);
    const [processedReport, setProcessedReport] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(""); // Add search query state

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jobCategoryResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_job_category/');
                setJobCategories(jobCategoryResponse.data);

                const statusCodeResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_status/');
                console.log(statusCodeResponse)
                setStatusCodes(statusCodeResponse.data);

                const departmentReportResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_department_report/');
                setDepartmentReport(departmentReportResponse.data);

                let data = processRailcarData(departmentReportResponse.data, jobCategoryResponse.data);
                console.log(data)
                setProcessedReport(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

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
                inspected_date: railcarData.inspected_date,
                material_eta: railcarData.material_eta,
                clean_date: railcarData.clean_date,
                clean_man_hour_estimated: round2Dec(result.clean_man_hour_estimated),
                clean_man_hour_applied: round2Dec(result.clean_man_hour_applied),
                repair_schedule_date: railcarData.repair_schedule_date,
                repair_man_hour_estimated: round2Dec(result.repair_man_hour_estimated),
                repair_man_hour_applied: round2Dec(result.repair_man_hour_applied),
                paint_date: railcarData.paint_date,
                exterior_paint: railcarData.exterior_paint,
                paint_man_hour_estimated:round2Dec( result.paint_man_hour_estimated),
                paint_man_hour_applied: round2Dec(result.paint_man_hour_applied),
                valve_date: railcarData.valve_date,
                valve_man_hour_estimated:round2Dec( result.valve_man_hour_estimated),
                valve_man_hour_applied: round2Dec(result.valve_man_hour_applied),
                pd_date: railcarData.pd_date,
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
                final_date: railcarData.final_date,
                qa_date: railcarData.qa_date,
                projected_out_date: railcarData.projected_out_date,
                month_to_invoice: railcarData.month_to_invoice,
                total_cost: round2Dec(result.total_cost),
                mo_wk: railcarData.mo_wk || "",
                sp: railcarData.sp || "",
                tq: railcarData.tq || "",
                re: railcarData.re || "",
                ep: railcarData.ep || ""
            };
        });
    }


    const handleDateChange = (date, id, field) => {
        const updatedData = processedReport.map(item => {
            if (item.id === id) {
                return { ...item, [field]: date ? new Date(date).toDateString() : "1900-01-01T00:00:00.000Z" };
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

        console.log(e.target)
        console.log(id)
        console.log(field)
    };

    const formatField = (key) => key.replace(/_/g, ' ').toUpperCase();

    const conditionalRowStyles = (index) => ({
        backgroundColor: index % 2 === 1 ? '#F7F9FF' : '#F7F9FF',
        className: "py-1 whitespace-nowrap font-bold text-xs px-2",
    });

    const filteredReport = processedReport.filter(row =>
        Object.values(row).some(value =>
            value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

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



    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="table-container max-h-screen">
            {/* Flex container for the search bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', margin: '5px' }}>
                {/* Search Bar on the right */}
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ padding: '10px', fontSize: '14px', width: '200px' }}
                />
            </div>

            {/* Export Button fixed at bottom-right */}
            <button
                onClick={exportToCSV}
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '5px',
                    padding: '10px 10px',
                    fontSize: '14px',
                    backgroundColor: '#007BFF',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '4px',
                    zIndex: '1000' // Ensure it's on top of other elements
                }}
            >
                Export
            </button>

            <table>
                <thead>
                <tr style={{ backgroundColor: "#DCE5FF", fontSize: '10px', padding: '1px', fontFamily: 'Inter', fontWeight: '500' }}>
                    <th className="sticky-header sticky-column">RAILCAR ID</th>
                    {Object.keys(processedReport[0]).map((key) =>
                        key !== 'id' && key !== 'railcar_id' ? (
                            <th key={key} className="sticky-header" style={{ paddingLeft: '10px', paddingRight: '2px' }}>
                                {formatField(key)}
                            </th>
                        ) : null
                    )}
                </tr>
                </thead>
                <tbody>
                {filteredReport.map((row, index) => (
                    <tr key={row.id} >
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
                                            className="text-input w-40"
                                        />
                                    ) : key.includes('date') || key === 'material_eta' || key === 'exterior_paint' || key  ==='month_to_invoice'? (
                                        <span  >
                                              <DatePicker
                                                  value={row[key] !== process.env.REACT_APP_DEFAULT_DATE ? new Date(row[key]).toLocaleDateString() : null}
                                                  selected={row[key]!== process.env.REACT_APP_DEFAULT_DATE ? new Date(row[key]) : null}
                                                  onChange={
                                                      (newDate) => handleDateChange(newDate, row.id, key)
                                                  }
                                                  isClearable
                                                  showYearDropdown
                                                  dateFormat="MM-dd-yyyy"
                                                  style={{ width: '100%' }}
                                              />
                                        </span>

                                    ) : key === 'status_code' ? (
                                            <select>
                                                {statusCodes.map((status) => (
                                                    <option  key={status.code}
                                                    selected={row[key] === status.code}>
                                                {status.code + ":" + status.title}
                                                    </option>
                                                ))}
                                            </select>
                                        ) :
                                        (
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

    );
};

export default DepartmentReport;




