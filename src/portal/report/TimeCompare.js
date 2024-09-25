/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/25/2024, Wednesday
 * Description:
 **/

import React, {useMemo, useRef, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {MaterialReactTable} from "material-react-table";
import {FaDownload} from "react-icons/fa";
import {download, generateCsv, mkConfig} from "export-to-csv";
import {round2Dec} from "../../utils/NumberHelper";
import {toUTCDateTime} from "../../utils/DateTimeHelper";

const TimeCompare = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const toastId = useRef(null)

    const initialColumns = useMemo(() => [
        { accessorKey: 'employee_name', header: 'Name', enableSorting: true, size: 50 },
        { accessorKey: 'time_in_birch', header: 'Birch Time', enableSorting: true },
        { accessorKey: 'time_in_qb', header: 'QB Time', enableSorting: true },
        { accessorKey: 'difference', header: 'Difference', enableSorting: true },
        { accessorKey: 'utilization', header: 'Utilization', enableSorting: true }
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [data, setData] = useState([]);
    // Handle change in date inputs
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleRetrieve = async () => {
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);
        toastId.current = toast.loading("Fetching data...");

        const start_date_birch = toUTCDateTime(startDate+" 00:00:00"); // Replace with actual start date for Birch
        const end_date_birch = toUTCDateTime(endDate+" 23:59:59");   // Replace with actual end date for Birch

        const apiUrl = `https://cmp0yxyt50.execute-api.us-east-2.amazonaws.com/default/qb_birch_time_comparison?start_date=${startDate}&end_date=${endDate}&start_date_birch=${start_date_birch}&end_date_birch=${end_date_birch}`;
        console.log(apiUrl)
// Make the GET request using Axios
        axios.get(apiUrl)
            .then(response => {
                console.log('Data:', response.data); // Handle the response data
                const newData = formatData(response.data)
                console.log(newData)
                setData(newData)
                toast.update(toastId.current, {
                    render: "All data loaded",
                    autoClose: 1000,
                    type: "success",
                    hideProgressBar: true,
                    isLoading: false
                });
            })
            .catch(error => {
                console.error('Error:', error); // Handle any errors

            });
        //const  formattedData = formatDate(response.data)

    };

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: 'Emission Report  from '+startDate+" to "+endDate
    });

    const handleExportRows = (table,rows) => {
        // const rowData = rows.map((row) => row.original);
        // const csv = generateCsv(csvConfig)(rowData);
        // download(csvConfig)(csv);

        const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible()==true);

        // Map the rows to include only the visible columns
        const rowData = rows.map((row) => {
            const filteredRow = {};
            visibleColumns.forEach((column) => {
                filteredRow[column.id] = row.original[column.id]; // Adjust as needed based on your data structure
            });
            return filteredRow;
        });

        // Generate the CSV with the filtered row data
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };
    function formatData(data) {
        return data.map(employee => {
            // Convert time from seconds to hours
            const timeInBRC = employee.time_in_birch / 3600;
            const timeInQUICKBOOK = employee.time_in_qb / 3600;

            // Calculate difference
            const difference = timeInQUICKBOOK - timeInBRC;

            // Calculate utilization
            const utilization = timeInQUICKBOOK > 0
                ? `${((timeInBRC * 100) / timeInQUICKBOOK).toFixed(2)}%`
                : "N/A";

            // Return a new object with the desired properties
            return {
                employee_name: employee.employee_name,
                time_in_birch: round2Dec(timeInBRC),
                time_in_qb: round2Dec(timeInQUICKBOOK),
                difference: round2Dec(difference),
                utilization: utilization
            };
        });
    }


    return (
        <div>
            <h1 className='font-bold mt-10 mb-10'>Time Compare</h1>
            <div className="flex items-center space-x-6 p-6 bg-white rounded-lg shadow-md">
                {/* Start Date Picker */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="block w-full rounded-md border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 p-2"
                    />
                </div>

                {/* End Date Picker */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="block w-full rounded-md border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 p-2"
                    />
                </div>

                {/* Retrieve Button */}
                <div className="flex flex-col mt-7">
                    <button
                        onClick={handleRetrieve}
                        className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
                    >
                        Retrieve
                    </button>
                </div>



            </div>

            <div className= "overflow-x-auto mt-8">
                {data.length >0?(
                    <MaterialReactTable
                        columns={columns}
                        data={data}
                        enablePagination={true}
                        initialState={{
                            pagination: {
                                pageIndex: 0,
                                pageSize: 10, // Set default page size to 50
                            },
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
                                fontSize: '12px',
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

    );
};

export default TimeCompare;
