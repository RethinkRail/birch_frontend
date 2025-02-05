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
import {round3Dec} from "../../utils/NumberHelper";

const StorageReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const toastId = useRef(null)

    const initialColumns = useMemo(() => [
        { accessorKey: 'railcar_id', header: 'Railcar', enableSorting: true, size: 50 },
        { accessorKey: 'start_date', header: 'Start Date', enableSorting: true },
        { accessorKey: 'end_date', header: 'End Device', enableSorting: true },
        { accessorKey: 'is_billed', header: 'Billed', enableSorting: true },
        { accessorKey: 'total_days', header: 'Total Days', enableSorting: true }
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

    useEffect(()=>{
        const fetchDate =async () => {
            toastId.current = toast.loading("Fetching data...");
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_storage_information/')
            const formattedData = formatDate(response.data)
            console.log(response.data)
            setData(formattedData)
            toast.update(toastId.current, {
                render: "All data loaded",
                autoClose: 1000,
                type: "success",
                hideProgressBar: true,
                isLoading: false
            });
        }

        fetchDate()
    },[])
    const handleRetrieve = async () => {
        console.log("Start Date:", startDate);
        console.log("End Date:", endDate);

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
    function calculateTotalDays(startDate, endDate) {
        console.log(endDate)
        if (!endDate || endDate == '1900-01-01T00:00:00.000Z') {
            return '';
        }
        const start = new Date(startDate);
        const end = new Date(endDate);
        const differenceInTime = end - start;
        return Math.ceil(differenceInTime / (1000 * 3600 * 24)); // Convert milliseconds to days
    }
    function formatDate(data) {
        const transformedData = [];
        data.forEach(entry => {
            entry.storage_information.forEach(storageInfo => {
                const totalDays = calculateTotalDays(storageInfo.start_date, storageInfo.end_date);
                transformedData.push({
                    railcar_id: storageInfo.railcar_id,
                    start_date: new Date(storageInfo.start_date).toLocaleDateString(),
                    end_date:storageInfo.end_date!==null? new Date(storageInfo.end_date).toLocaleDateString():'',
                    is_billed: storageInfo.is_billed==1?'YES':'NO',
                    total_days: totalDays
                });
            });
        });
        return transformedData;
    }

    return (
        <div>
            <h1 className='font-bold mt-10 mb-10'>Storage Report</h1>

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

export default StorageReport;
