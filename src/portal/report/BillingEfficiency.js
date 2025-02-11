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
import BillingEfficiencyChart from "../../components/BillingEfficiencyChart";
import BillingEfficiencyByJobCodeChart from "../../components/BillingEfficiencyByJobCodeChart";


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

const BillingEfficiency = () => {
    const [selectedRailCar, setSelectedRailCar] = useState(Array(5).fill("")); //
    const [selectedJobCodes, setSelectedJobCodes] = useState(Array(5).fill(null)); //
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [loading, setLoading] = useState(false);
    const [allData,setAllData] = useState([])
    const [byJobCode, setIsByJobCode] = useState(false);
    const [jobCode, setJobCode] = useState([]);
    const initialColumns = useMemo(() => [
        { accessorKey: 'railcar_id', header: 'Railcar', enableSorting: true, size: 50 },
        { accessorKey: 'line', header: 'Line', enableSorting: true, size: 50 },
        { accessorKey: 'job_code_applied', header: 'Job Code Applied', enableSorting: true, size: 50 },
        { accessorKey: 'job_description', header: 'Job Description', enableSorting: true },
        { accessorKey: 'completed_time', header: 'Completion Date', enableSorting: true },
        { accessorKey: 'estimated_time', header: 'Estimated Time', enableSorting: true,Cell: ({ cell }) => round2Dec( cell.getValue()) },
        { accessorKey: 'applied_time', header: 'Applied Time', enableSorting: true,Cell: ({ cell }) => round2Dec( cell.getValue()) },
        { accessorKey: 'utilization', header: 'Utilization', enableSorting: true,Cell: ({ cell }) => round2Dec( cell.getValue()) },
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [selectedDateRange, setSelectedDateRange] = useState(1); // Default value is 1

    const handleChange = (event) => {
        setSelectedDateRange(event.target.value); // Update state variable
    };

    const handleJobCodeChange = (index, value) => {
        const updatedSelectedJobCodes = [...selectedJobCodes];
        updatedSelectedJobCodes[index] = value;
        setSelectedJobCodes(updatedSelectedJobCodes);
    };
    const handleRailCarChange = (index, value) => {
        const updatedSelectedOwners = [...selectedRailCar];
        updatedSelectedOwners[index] = value;
        setSelectedRailCar(updatedSelectedOwners);
    };

    useEffect(() => {
        const fetchJobCode = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_all_job_code/`
                );

                // Map API data to React Select format
                const jobCOdeOptions = response.data.map((jobCode) => ({
                    value: jobCode.code,
                    label: jobCode.code+":"+jobCode.title,
                }));
                console.log(jobCOdeOptions)
                setJobCode(jobCOdeOptions);
            } catch (error) {
                console.error('Error fetching owners:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchJobCode();
    }, []);

    //original
    const handleGenerate = async () => {
        let modified = new Date(startDate);
        //console.log(selectedRailCar)
        modified.setDate(modified.getDate() - selectedDateRange);
        try {
            setLoading(true);
            const payload = {
                railcars: selectedRailCar.filter((id) => id), // Remove null values
                startDate:modified,
                endDate,
            };
            console.log(selectedJobCodes)
            const payloadJobCodes = {
                jobcodes: selectedJobCodes.filter((id) => id), // Remove null values
                startDate:modified,
                endDate,
            };

            let response

            if(byJobCode){
                response = await axios.post(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_billing_efficiency_by_jobcode`,
                    payloadJobCodes
                );

            }else {
                response = await axios.post(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_billing_efficiency`,
                    payload
                );

            }


            console.log(response.data)
            const data = response.data.data;
            setAllData(data)




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

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 mt-2">Billing Efficiency</h1>
            <div className="">

                <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        By Job Code
                      </span>

                    <label className="label cursor-pointer">
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={byJobCode}
                            onChange={() => setIsByJobCode(!byJobCode)}
                        />
                    </label>
                </div>

                <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        By Railcar
                      </span>

                    <label className="label cursor-pointer">
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={!byJobCode}
                            onChange={() => setIsByJobCode(!byJobCode)}
                        />
                    </label>
                </div>


                    {byJobCode ? (
                        <div className="flex grid gap-0 grid-cols-5 mb-4 w-auto">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="p-1 w-full">
                                    <Select
                                        value={
                                            jobCode.find((option) => option.value === selectedJobCodes[index]) || null
                                        }
                                        onChange={(selectedOption) => handleJobCodeChange(index, selectedOption?.value)}
                                        options={jobCode}
                                        placeholder="Select Job code"
                                        isClearable
                                        className="border rounded w-full"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex grid gap-0 grid-cols-5 mb-4 w-auto">
                            {Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="p-1 w-full">
                                    <input
                                        type="text"
                                        value={selectedRailCar[index] || ""}
                                        onChange={(e) => handleRailCarChange(index, e.target.value)}
                                        placeholder="Enter car number"
                                        className="border rounded p-2 w-full"
                                    />
                                </div>
                            ))}
                        </div>
                    )}


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

                        {byJobCode?
                            <BillingEfficiencyByJobCodeChart startDate={startDate} endDate={endDate} dataSet={allData}  dateDiff={parseInt(selectedDateRange)} name={'Billing Efficiency'} />
                            :
                            <BillingEfficiencyChart startDate={startDate} endDate={endDate} dataSet={allData}  dateDiff={parseInt(selectedDateRange)} name={'Billing Efficiency'} />
                        }

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

export default BillingEfficiency;

