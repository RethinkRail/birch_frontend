/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/23/2024, Monday
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
        { accessorKey: 'line_number', header: 'Line Number', enableSorting: true },
        { accessorKey: 'status', header: 'Status', enableSorting: true },
        { accessorKey: 'code', header: 'Code', enableSorting: true },
        { accessorKey: 'title', header: 'Title', enableSorting: true },
        { accessorKey: 'quantity', header: 'Quantity', enableSorting: true },
        { accessorKey: 'unit_cost', header: 'Unit Cost', enableSorting: true },
        { accessorKey: 'cost', header: 'Total Cost', enableSorting: true },
        { accessorKey: 'rate', header: 'Rate', enableSorting: true },

        { accessorKey: 'owner_invoice_date', header: 'Owner Invoice Date', enableSorting: true },
        { accessorKey: 'owner_invoice_number', header: 'Owner Invoice #', enableSorting: true },

        { accessorKey: 'lesse_invoice_date', header: 'Lesse Invoice Date', enableSorting: true },
        { accessorKey: 'lesse_invoice_number', header: 'Lesse Invoice #', enableSorting: true },

        { accessorKey: 'revenue_category', header: 'Revenue Category', enableSorting: true },
        { accessorKey: 'tech_sign_off_date', header: 'Tech Sign Off Date', enableSorting: true },
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
                console.log(response.data);
                const result = [];
                const partsNewReport = []
                response.data.forEach(item => {
                    console.log(item)
                    // Get status from workupdates
                    const status = `${item.workupdates[0].statuscode.code} ${item.workupdates[0].statuscode.title}`;
                    // const owner_invoice_date = item.invoice_date;
                    // const owner_invoice_number = item.invoice_number;
                    // const secondary_owner_invoice_date = item.secondary_owner_info.invoice_date;
                    // const secondary_owner_invoice_number = item.secondary_owner_info.invoice_number;
                    // Create a map to track unique job parts based on their code
                    const jobPartsMap = new Map();

                    item.joblist.forEach(job => {
                        console.log(job)
                        const techSignOfDate = job.crew_checked_time?new Date(job.crew_checked_time).toLocaleDateString():''
                        const line_number = job.line_number
                        const rev_category = job.jobcode_joblist_job_code_appliedTojobcode.job_or_revenue_category.name
                        job.jobparts.forEach(part => {
                            const totalcost = part.totalcost;
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

                                const singleRow = {
                                    'line_number':line_number,
                                    'tech_sign_off_date':techSignOfDate,
                                    railcar_id: item.railcar_id,
                                    status: status,
                                    code,
                                    title,
                                    quantity: round2Dec(parseFloat(quantity)), // Round quantity to 2 decimals
                                    unit_cost: round2Dec(parseFloat(purchase_cost)), // Round quantity to 2 decimals
                                    cost: round2Dec(parseFloat(purchase_cost * quantity)) ,// Calculate and round total cost for this part
                                    rate: round2Dec(parseFloat(totalcost / quantity)) ,
                                    owner_invoice_date:
                                        item.invoice_date &&
                                        new Date(item.invoice_date).getFullYear() !== 1900
                                            ? new Date(item.invoice_date).toLocaleDateString()
                                            : "",

                                    owner_invoice_number: item.invoice_number ?? "",

                                    lesse_invoice_date:job.secondary_bill_to_id?
                                        item.secondary_owner_info?.invoice_date &&
                                        new Date(item.secondary_owner_info.invoice_date).getFullYear() !== 1900
                                            ? new Date(item.secondary_owner_info.invoice_date).toLocaleDateString()
                                            : "":"",

                                    lesse_invoice_number:job.secondary_bill_to_id?
                                        item.secondary_owner_info?.invoice_number ?? "":"",
                                    revenue_category: rev_category,
                                }

                                partsNewReport.push(singleRow)

                            } else {
                                console.warn(`Missing part data: ${JSON.stringify(part)}`);
                            }
                        });
                    });
                });


                console.log(partsNewReport);
                setData(partsNewReport);
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
        console.log(rows);
        console.log(table);
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





