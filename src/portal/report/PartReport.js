/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/23/2024, Monday
 * Description:
 **/

/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/24/2024, Tuesday
 * Description:
 **/

import React, {useState, useMemo, useRef, useEffect} from 'react';


import {
    MaterialReactTable,
    useMaterialReactTable,
} from 'material-react-table';

import axios from 'axios';
import {convertSqlToFormattedDate} from "../../utils/DateTimeHelper";
import {round2Dec} from "../../utils/NumberHelper";
import { mkConfig, generateCsv, download } from 'export-to-csv'; //or use your library of choice here
import {FaDownload} from "react-icons/fa";
import {toast} from "react-toastify";


const  PartReport = () => {
    const toastId = useRef(null)

    const initialColumns = useMemo(() => [
        { accessorKey: 'railcar_id', header: 'Railcar', enableSorting: true, size: 50 },
        { accessorKey: 'status', header: 'Status', enableSorting: true },
        { accessorKey: 'code', header: 'Code', enableSorting: true },
        { accessorKey: 'title', header: 'Title', enableSorting: true },
        { accessorKey: 'quantity', header: 'Quantity', enableSorting: true },
        { accessorKey: 'cost', header: 'Cost', enableSorting: true },
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [data, setData] = useState([]);

    const formatDate = (sqlDate) => {
        if (sqlDate === process.env.REACT_APP_DEFAULT_DATE) {
            return ''; // Return empty string if equal to the default date
        }
        return convertSqlToFormattedDate(sqlDate); // Format as needed
    };




    useEffect(() => {
        const fetchData = async () => {
            toastId.current = toast.loading("Fetching data...");
            try {
                const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL+'get_part_report');
                const result = [];

                response.data.forEach(item => {
                    // Get status from workupdates
                    const status = `${item.workupdates[0].statuscode.code} ${item.workupdates[0].statuscode.title}`;

                    // Create a map to track unique job parts based on their code
                    const jobPartsMap = new Map();

                    item.joblist.forEach(job => {
                        job.jobparts.forEach(part => {
                            // Ensure part and part.parts exist
                            if (part && part.parts) {
                                const { code, title } = part.parts;


                                // Ensure quantity and purchase_cost are valid numbers, default to 0 if undefined or invalid
                                const quantity = !isNaN(parseFloat(part.quantity)) && part.quantity !== null && part.quantity !== undefined
                                    ? parseFloat(part.quantity)
                                    : 0;
                                const purchase_cost = !isNaN(parseFloat(part.purchase_cost)) && part.purchase_cost !== null && part.purchase_cost !== undefined
                                    ? parseFloat(part.purchase_cost)
                                    : 0;

                                // Additional logging for invalid quantity or purchase_cost
                                if (quantity === 0 || purchase_cost === 0) {
                                    console.warn(`Invalid data for part code ${code}: quantity=${part.quantity}, purchase_cost=${part.purchase_cost}`);
                                }

                                // If the part code is already in the map, update quantity and cost
                                if (jobPartsMap.has(code)) {
                                    const existingPart = jobPartsMap.get(code);
                                    existingPart.quantity = round2Dec(parseFloat(existingPart.quantity + quantity));  // Increase the quantity
                                    existingPart.cost = round2Dec(parseFloat(existingPart.cost + (purchase_cost * quantity))); // Update total cost
                                } else {
                                    // Add new part to the map
                                    jobPartsMap.set(code, {
                                        railcar_id: item.railcar_id,
                                        status: status,
                                        code,
                                        title,
                                        quantity: round2Dec(parseFloat(quantity)), // Round quantity to 2 decimals
                                        cost: round2Dec(parseFloat(purchase_cost * quantity)) // Calculate and round total cost for this part
                                    });
                                }
                            } else {
                                console.warn(`Missing part data: ${JSON.stringify(part)}`);
                            }
                        });
                    });

                    // Convert the map back to an array
                    const jobpartsArray = Array.from(jobPartsMap.values());

                    // Add the consolidated job parts to the result
                    result.push(...jobpartsArray);
                });



                setData(result);
                toast.update(toastId.current, {
                    render: "All data loaded",
                    autoClose: 1000,
                    type: "success",
                    hideProgressBar: true,
                    isLoading: false
                });
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.update(toastId.current, {
                    render: "Error loading data",
                    autoClose: 1000,
                    type: "error",
                    hideProgressBar: true,
                    isLoading: false
                });
            }
        };

        fetchData();
    }, []);



    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: 'Part Report '+new Date().toLocaleDateString()
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


    return (
        <div className="p-4">
            <h1 className='font-bold mb-10'>Part Report on Active Cars</h1>
            <div className="overflow-x-auto">
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
    );
};

export default PartReport;





