/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/18/2024, Monday
 * Description:
 **/

import React, {useState, useEffect, useMemo} from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import Select from "react-select";
import RevenueChart from "../../components/RevenueChart";
import {MaterialReactTable} from "material-react-table";
import {FaDownload} from "react-icons/fa";
import {mkConfig} from "export-to-csv";
import * as XLSX from "xlsx";
import RevenueChartAllCustomer from "../../components/RevenueChartAllCustomer";
import {round2Dec} from "../../utils/NumberHelper";
import RecognitionChart from "../../components/RecognitionChart";
import RecognitionChartInventory from "../../components/RecognitionChartInventory";


// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RevenueRecognition = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState(Array(5).fill(null)); //
    const [invoiceFilter, setInvoiceFilter] = useState(1); // or 'all', 'invoiced'
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [loading, setLoading] = useState(false);

    const [allData,setAllData] = useState([])
    const [graphData,setGraphata] = useState([])
    const [isAllDepartment,setIsAllDepartment] = useState(false)
    const initialColumns = useMemo(() => [
        { accessorKey: 'railcar_id', header: 'Railcar', enableSorting: true },
        { accessorKey: 'line_number', header: 'Line', enableSorting: true },
        { accessorKey: 'part_code', header: 'Part Code', enableSorting: true },
        { accessorKey: 'part_title', header: 'Part title', enableSorting: true },
        { accessorKey: 'quantity', header: 'Quantity', enableSorting: true },
        { accessorKey: 'team_member', header: 'Team member', enableSorting: true },
        { accessorKey: 'job_description', header: 'Job description', enableSorting: true },
        { accessorKey: 'department', header: 'Department', enableSorting: true},
        { accessorKey: 'completed_time', header: 'Completion Time', enableSorting: true },
        { accessorKey: 'material_cost', header: 'Material Cost', enableSorting: true,Cell: ({ cell }) => round2Dec( cell.getValue()) },
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [selectedDateRange, setSelectedDateRange] = useState(1); // Default value is 1

    const handleChange = (event) => {
        setSelectedDateRange(event.target.value); // Update state variable
    };

    function handleSetIsAllCustomers() {
        setIsAllDepartment(prev => !prev);
    }
    const handleOwnerChange = (index, value) => {
        const updatedSelectedOwners = [...selectedDepartments];
        updatedSelectedOwners[index] = value;
        setSelectedDepartments(updatedSelectedOwners);
    };

    function aggregateByJob(records) {
        const map = new Map();

        for (const { job_id, completed_time, material_cost } of records) {
            if (!map.has(job_id)) {
                // First time seeing this job_id
                map.set(job_id, {
                    job_id,
                    completed_time,
                    material_cost: Number(material_cost)
                });
            } else {
                // Sum with existing material_cost
                map.get(job_id).material_cost += Number(material_cost);
            }
        }

        return Array.from(map.values());
    }
    // Fetch departments from the API

    //original
    const handleGenerate = async () => {
        let modified = new Date(startDate);
        modified.setDate(modified.getDate() - 0);
        try {
            setLoading(true);
            const payload = {
                startDate:modified,
                endDate,
                is_locked:invoiceFilter,
                departments:!isAllDepartment? selectedDepartments.filter((id) => id):departments.map(item => item.value), // Remove null values
            };
            console.log(payload)
            console.log(new Date(modified).toISOString())
            console.log(new Date(endDate).toISOString())


            const response = await axios.post(
                `${process.env.REACT_APP_BIRCH_API_URL}get_revenue_recognition_by_inventory`,
                payload
            );

            const data = response.data.data;
            console.log(data)
            setAllData(data)
            setGraphata(aggregateByJob(data))

            setLoading(false);

        } catch (error) {
            console.error('Error generating report:', error);
            alert(error.response?.data?.error || 'Failed to generate the report!');
            setLoading(false);
        }
    };

    const handleExportRows = (table,rows) => {
        const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible() === true);

        // Map the rows to include only the visible columns and use the column headers
        const rowData = rows.map((row) => {
            const filteredRow = {};
            visibleColumns.forEach((column) => {
                // Use the header as the key for the Excel, but still fetch the data using accessorKey
                filteredRow[column.columnDef.header] = row.original[column.id]; // or column.columnDef.accessorKey if needed
            });
            return filteredRow;
        });

        console.log(rowData);

        // Create a new workbook and add the data
        const worksheet = XLSX.utils.json_to_sheet(rowData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BIRCH Revenue Report');

        // Define filename with today's date
        const filename = 'BIRCH Revenue Report from '+startDate.toLocaleDateString()+"  to "+endDate.toLocaleDateString()+'.xlsx' ;

        // Trigger a download of the Excel file
        XLSX.writeFile(workbook, filename);
    };

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_all_revenue_category/`
                );

                // Map API data to React Select format
                const departmentOptions = response.data.map((department) => ({
                    value: department.id,
                    label: department.name,
                }));

                setDepartments(departmentOptions);
            } catch (error) {
                console.error('Error fetching departments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchDepartments();
    }, []);


    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 mt-2">Material WIP</h1>
            <div className="grid gap-1 grid-cols-5 mb-4">
                <label className="label cursor-pointer">
                    <span className="label-text mr-5">All Departments</span>
                    <input
                        type="checkbox"
                        className="toggle"
                        checked={isAllDepartment}
                        onChange={handleSetIsAllCustomers}
                    />
                </label>
            </div>

            <div
                className={`grid gap-1 grid-cols-5 mb-4 ${isAllDepartment ? 'hidden' : ''}`}
            >
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="p-2">
                        <Select
                            value={
                                departments.find(
                                    (option) => option.value === selectedDepartments[index]
                                ) || null
                            } // Find the matching selected option or default to null
                            onChange={(selectedOption) =>
                                handleOwnerChange(index, selectedOption?.value)
                            }
                            options={departments}
                            placeholder="Select Department"
                            isClearable
                            className="border rounded"
                        />
                    </div>
                ))}
            </div>
            <div className="flex gap-4 mb-4">
                <label className="label cursor-pointer flex items-center">
                    <span className="label-text mr-2">All</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={invoiceFilter === 1}
                        onChange={() => setInvoiceFilter(1)}
                    />
                </label>
                <label className="label cursor-pointer flex items-center">
                    <span className="label-text mr-2">Non Invoiced</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={invoiceFilter === 3}
                        onChange={() => setInvoiceFilter(3)}
                    />
                </label>
                <label className="label cursor-pointer flex items-center">
                    <span className="label-text mr-2">Invoiced Cars</span>
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={invoiceFilter ===2}
                        onChange={() => setInvoiceFilter(2)}
                    />
                </label>
            </div>

            <div className="">
                {/* Date Pickers */}
                <div className="flex gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            # of Days per Data Point
                        </label>
                        <select
                            id="dateRange"
                            value={selectedDateRange}
                            onChange={handleChange}
                            className="block w-32 p-2 border rounded"
                        >
                            {Array.from({ length: 30 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {index + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate'}
                </button>


                {allData.length > 0 && (
                    <div className="mt-4">
                        <RecognitionChartInventory startDate={startDate} endDate={endDate} dataSet={graphData}  dateDiff={parseInt(selectedDateRange)} name={'Departments'} />
                        <div className="overflow-x-auto mt-4">
                            {allData.length >0?(
                                <MaterialReactTable
                                    columns={columns}
                                    data={allData}
                                    enablePagination={true}
                                    enableColumnFilterModes={true}
                                    initialState={{
                                        pagination: {
                                            pageIndex: 0,
                                            pageSize: 50, // Set default page size to 50
                                        },
                                        columnVisibility: { id: false }
                                    }}
                                    muiTableHeadCellProps={{
                                        sx: {
                                            backgroundColor: "#DCE5FF",
                                            fontSize: '12px',
                                            padding: '10px',
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
                                            <button
                                                disabled={table.getRowModel().rows.length === 0}
                                                onClick={() => handleExportRows(table,table.getRowModel().rows)}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '8px 16px',
                                                    backgroundColor: '#1976d2',
                                                    color: '#fff',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    opacity: table.getRowModel().rows.length === 0 ? 0.5 : 1,
                                                }}
                                            >
                                                <FaDownload style={{ marginRight: '8px' }} />
                                                Export Visible Data
                                            </button>

                                        </div>
                                    )}
                                />
                            ):null
                            }

                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default RevenueRecognition;

