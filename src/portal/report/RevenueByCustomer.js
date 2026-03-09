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

const RevenueByCustomer = () => {
    const [owners, setOwners] = useState([]);
    const [selectedOwners, setSelectedOwners] = useState(Array(5).fill(null)); //
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [loading, setLoading] = useState(false);

    const [allData,setAllData] = useState([])
    const [isAllCustomers,setIsAllCustomers] = useState(false)

    const initialColumns = useMemo(() => [
        { accessorKey: 'id', header: 'ID', enableSorting: true, size: 50 },
        { accessorKey: 'name', header: 'Customer', enableSorting: true, size: 50 },
        { accessorKey: 'invoice_date', header: 'Invoice Date', enableSorting: true },
        { accessorKey: 'railcar_id', header: 'Car Number', enableSorting: true },
        { accessorKey: 'total_cost', header: 'Revenue', enableSorting: true },
        { accessorKey: 'arrival_date', header: 'Arrival Date', enableSorting: true },
        { accessorKey: 'shipped_date', header: 'Shipped Date', enableSorting: true },
        { accessorKey: 'dis', header: 'DIS', enableSorting: true }
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [selectedDateRange, setSelectedDateRange] = useState(1); // Default value is 1

    const handleChange = (event) => {
        setSelectedDateRange(event.target.value); // Update state variable
    };
    // Fetch owners from the API
    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_all_owners/`
                );

                // Map API data to React Select format
                const ownerOptions = response.data.map((owner) => ({
                    value: owner.id,
                    label: owner.name,
                }));

                setOwners(ownerOptions);
            } catch (error) {
                console.error('Error fetching owners:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchOwners();
    }, []);

    const handleOwnerChange = (index, value) => {
        const updatedSelectedOwners = [...selectedOwners];
        updatedSelectedOwners[index] = value;
        setSelectedOwners(updatedSelectedOwners);
    };

    //original
    const handleGenerate = async () => {
        let modified = new Date(startDate);
        modified.setDate(modified.getDate() - 0);
        try {
            setLoading(true);
            const payload = {
                owners: selectedOwners.filter((id) => id), // Remove null values
                startDate:modified,
                endDate,
            };
            console.log(payload)

            const payloadAll = {
                startDate:modified,
                endDate,
            };

            if(!isAllCustomers){
                const response = await axios.post(
                    `${process.env.REACT_APP_BIRCH_API_URL}generate_revenue_by_customer_report`,
                    payload
                );

                const data = response.data.data;
                setAllData(data)
            }else {
                const response = await axios.post(
                    `${process.env.REACT_APP_BIRCH_API_URL}generate_revenue_by_customer_report_all`,
                    payloadAll
                );

                const data = response.data.data;
                setAllData(data)
            }



            setLoading(false);

        } catch (error) {
            console.error('Error generating report:', error);
            alert(error.response?.data?.error || 'Failed to generate the report!');
            setLoading(false);
        }
    };


    function handleSetIsAllCustomers() {
        setIsAllCustomers(prev => !prev);
    }

    function groupAndSortByDate(data) {
        // Group by `invoice_date` and sum `total_cost`
        console.log(data)
        const groupedData = Object.values(
            data.reduce((acc, { invoice_date, total_cost }) => {
                if (!acc[invoice_date]) {
                    acc[invoice_date] = { invoice_date, total_cost: 0 };
                }
                acc[invoice_date].total_cost += parseFloat(total_cost);
                return acc;
            }, {})
        );

        // Sort by `invoice_date`
        return groupedData.sort((a, b) => new Date(a.invoice_date) - new Date(b.invoice_date));
    }

    function mergeAndSortData(data) {
        // Reduce the data to group by `name` and `invoice_date`
        const merged = Object.values(
            data.reduce((acc, { name, invoice_date, total_cost }) => {
                // Create a unique key for grouping
                const key = `${name}-${invoice_date}`;
                if (!acc[key]) {
                    acc[key] = { name, invoice_date, total_cost: 0 };
                }
                // Sum up `total_cost`
                acc[key].total_cost += parseFloat(total_cost);
                return acc;
            }, {})
        );

        // Sort by `name` (alphabetical), then by `invoice_date` (chronological)
        return merged.sort((a, b) => {
            if (a.name < b.name) return -1;
            if (a.name > b.name) return 1;
            return new Date(a.invoice_date) - new Date(b.invoice_date);
        });
    }

    const handleExportRows = (table, rows) => {
        const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible() === true);

        // Map the rows to include only the visible columns and use the column headers
        const rowData = rows.map((row) => {
            const filteredRow = {};
            visibleColumns.forEach((column) => {
                // Use the header as the key for the Excel, but still fetch the data using accessorKey
                const value = row.original[column.id]; // or column.columnDef.accessorKey if needed

                // Convert the value to a number if it is a numeric string
                if (!isNaN(value) && value !== "") {
                    filteredRow[column.columnDef.header] = parseFloat(value);
                } else {
                    filteredRow[column.columnDef.header] = value;
                }
            });
            return filteredRow;
        });

        console.log(rowData);

        // Create a new workbook and add the data
        const worksheet = XLSX.utils.json_to_sheet(rowData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BIRCH Revenue Report');

        // Define filename with today's date
        const filename = 'BIRCH Revenue Report from ' + startDate.toLocaleDateString() + " to " + endDate.toLocaleDateString() + '.xlsx';

        // Trigger a download of the Excel file
        XLSX.writeFile(workbook, filename);
    };

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 mt-2">Revenue by Customer</h1>
            <div className="">
                <div className="grid gap-1 grid-cols-5 mb-4">
                    <label className="label cursor-pointer">
                        <span className="label-text mr-5">All Customers</span>
                        <input
                            type="checkbox"
                            className="toggle"
                            checked={isAllCustomers}
                            onChange={handleSetIsAllCustomers}
                        />
                    </label>
                </div>

                {/* Select Menus */}

                <div
                    className={`grid gap-1 grid-cols-5 mb-4 ${isAllCustomers ? 'hidden' : ''}`}
                >
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="p-2">
                            <Select
                                value={
                                    owners.find(
                                        (option) => option.value === selectedOwners[index]
                                    ) || null
                                } // Find the matching selected option or default to null
                                onChange={(selectedOption) =>
                                    handleOwnerChange(index, selectedOption?.value)
                                }
                                options={owners}
                                placeholder="Select Customer"
                                isClearable
                                className="border rounded"
                            />
                        </div>
                    ))}
                </div>

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
                        {isAllCustomers ? (
                            <RevenueChartAllCustomer data={groupAndSortByDate(allData)} startDate={startDate} endDate={endDate}  dateDiff={parseInt(selectedDateRange)} />
                        ) : (
                            <RevenueChart startDate={startDate} endDate={endDate} dataSet={mergeAndSortData(allData)}  dateDiff={parseInt(selectedDateRange)} name={'Companies'} />
                        )}


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

export default RevenueByCustomer;

