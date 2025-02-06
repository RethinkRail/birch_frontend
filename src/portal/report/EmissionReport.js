/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/25/2024, Wednesday
 * Description:
 **/

import React, {useEffect, useMemo, useRef, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {MaterialReactTable} from "material-react-table";
import {FaDownload} from "react-icons/fa";
import {download, generateCsv, mkConfig} from "export-to-csv";
import {round2Dec} from "../../utils/NumberHelper";

const EmissionReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const toastId = useRef(null)

    const initialColumns = useMemo(() => [
        { accessorKey: 'f0', header: 'Railcar', enableSorting: true, size: 50 },
        { accessorKey: 'f1', header: 'Clean Date', enableSorting: true },
        { accessorKey: 'f2', header: 'Control Device', enableSorting: true },
        { accessorKey: 'f3', header: 'Emission Factor', enableSorting: true },
        { accessorKey: 'f4', header: 'Product', enableSorting: true },
        { accessorKey: 'f5', header: 'Molecular Weight', enableSorting: true },
        { accessorKey: 'f6', header: 'Vapor Pressure', enableSorting: true },
        { accessorKey: 'emission', header: 'Emission LB/HR', enableSorting: true },
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [data, setData] = useState([]);
    // Handle change in date inputs
    const handleStartDateChange = (e) => {
        console.log(e.target.value)
        setStartDate(e.target.value);
        console.log(startDate)
    };

    useEffect(() => {
        console.log("Updated startDate:", startDate);
    }, [startDate,endDate]);
    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleRetrieve = async () => {

        toastId.current = toast.loading("Fetching data...");
        const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+'get_emission_report/', {
            start_date: startDate,
            end_date: endDate
        });
        const  formattedData = formatDate(response.data)
        setData(formattedData)
        toast.update(toastId.current, {
            render: "All data loaded",
            autoClose: 1000,
            type: "success",
            hideProgressBar: true,
            isLoading: false
        });
    };

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: 'Emission Report  from '+startDate+" to "+endDate
    });

    const handleExportRows = (table,rows) => {
        const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible() === true);

        // Map the rows to include only the visible columns and use the column headers
        const rowData = rows.map((row) => {
            const filteredRow = {};
            visibleColumns.forEach((column) => {
                // Use the header as the key for the CSV, but still fetch the data using accessorKey
                filteredRow[column.columnDef.header] = row.original[column.id]; // or column.columnDef.accessorKey if needed
            });
            return filteredRow;
        });

        console.log(rowData);

        // Generate the CSV with the filtered row data
        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };
    function formatDate(data) {
        return data.map(item => {
            const formattedDate = new Date(item.f1).toISOString().split("T")[0];

            return {
                ...item,
                f1: formattedDate,
                emission: round2Dec(item.f6* 33000 * (1 / 7.48) / (10.73 * 560) * item.f5 * (item.f3 / 100))
            };
        });
    }

    return (
        <div>
            <h1 className='font-bold mt-10 mb-10'>Emission Report</h1>
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

export default EmissionReport;
