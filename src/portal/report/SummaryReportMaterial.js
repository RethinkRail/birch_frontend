/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/24/2024, Tuesday
 * Description:
 **/

import React, {useState, useMemo, useRef} from 'react';


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
import * as XLSX from 'xlsx';

const  SummaryReportMaterial = () => {
    const toastId = useRef(null)
    const [onlyInvoicedCars, setOnlyInvoicedCars] = useState(false);
    const [shipped, setShipped] = useState(false);
    const initialColumns = useMemo(() => [
        { accessorKey: 'rfid', header: 'RFID', enableSorting: true },
        { accessorKey: 'reason_to_come', header: 'REASON', enableSorting: true },
        { accessorKey: 'status', header: 'Status', enableSorting: true,columnFilterModeOptions: ['between','lessThan', 'greaterThan'] },
        { accessorKey: 'last_comment', header: 'Last Comment', enableSorting: true },
        { accessorKey: 'qa_date', header: 'QA Date', enableSorting: true },
        { accessorKey: 'projected_out_date', header: 'Projected Out Date', enableSorting: true,
            sortingFn: (rowA, rowB) => {
                const dateA = new Date(rowA.original.projected_out_date);
                const dateB = new Date(rowB.original.projected_out_date);
                return dateA - dateB;
            },
        },
        { accessorKey: 'total_cost', header: 'Total Cost', enableSorting: true },
        { accessorKey: 'dis', header: 'DIS', enableSorting: true, size: 50 },
        { accessorKey: 'owner', header: 'Owner', enableSorting: true },
        { accessorKey: 'lessee', header: 'Lessee', enableSorting: true },
        { accessorKey: 'month_to_invoice', header: 'Month to Invoice', enableSorting: true },
        { accessorKey: 'mo_wk', header: 'MO WK', enableSorting: true },
        { accessorKey: 'mhr_applied', header: 'MHR Applied', enableSorting: true },
        { accessorKey: 'mhr_estimated', header: 'MHR Estimated', enableSorting: true },
        { accessorKey: 'last_content', header: 'Last Content', enableSorting: true },
        { accessorKey: 'railcar_type', header: 'Railcar Type', enableSorting: true },
        { accessorKey: 'material_cost', header: 'Material Cost', enableSorting: true },
        { accessorKey: 'labor_cost', header: 'Labor Cost', enableSorting: true },
        { accessorKey: 'arrival_date', header: 'Arrival Date', enableSorting: true },
        { accessorKey: 'inspected_date', header: 'Inspected Date', enableSorting: true },
        { accessorKey: 'material_eta', header: 'Material ETA', enableSorting: true },
        { accessorKey: 'clean_date', header: 'Clean Date', enableSorting: true },
        { accessorKey: 'repair_schedule_date', header: 'Repair Schedule Date', enableSorting: true },
        { accessorKey: 'paint_date', header: 'Paint Date', enableSorting: true },
        { accessorKey: 'exterior_paint', header: 'Exterior Paint Date', enableSorting: true },
        { accessorKey: 'valve_date', header: 'Valve Date', enableSorting: true },
        { accessorKey: 'pd_date', header: 'PD Date', enableSorting: true },
        { accessorKey: 'final_date', header: 'Final Date', enableSorting: true },
        { accessorKey: 'invoice_date_modified', header: 'Invoice Date', enableSorting: true },
        { accessorKey: 'shipped_date', header: 'Shipped Date', enableSorting: true },
        { accessorKey: 'sp', header: 'Special Process', enableSorting: true },
        { accessorKey: 'tq', header: 'Tank Qualification', enableSorting: true },
        { accessorKey: 're', header: 'Reline', enableSorting: true },
        { accessorKey: 'ep', header: 'Exterior Paint', enableSorting: true },
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [data, setData] = useState([]);

    const formatDate = (sqlDate) => {
        //console.log(sqlDate);
        if (sqlDate === process.env.REACT_APP_DEFAULT_DATE) {
            return null; // Return empty string if equal to the default date
        }

        return new Date(sqlDate).toLocaleDateString(); // Format as needed
    };


    // Toggle handlers
    const handleOnlyInvoicedToggle = () => {
        setOnlyInvoicedCars(prev => !prev);
    };

    const handleShippedToggle = () => {
        setShipped(prev => !prev);
    };
    const isValidDate = (dateStr) =>
        dateStr && dateStr !== '1900-01-01T00:00:00.000Z';
    const transformData = (data) => {
        console.log(data)

        return data.map(item => {
            const {
                railcar,
                workupdates,
                joblist,
                ...rest
            } = item;
            const today = new Date();
            const arrivalDate = new Date(item.arrival_date);

            const todayDate = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
            const arrivalDateDate = new Date(arrivalDate.getUTCFullYear(), arrivalDate.getUTCMonth(), arrivalDate.getUTCDate());

            const isValidArrivalDate = !isNaN(arrivalDate.getTime()) && item.arrival_date !== '1900-01-01T00:00:00.000Z';


            let chosenInvoiceDate = process.env.REACT_APP_DEFAULT_DATE;

            if (isValidDate(item.invoice_date) && isValidDate(item.secondary_owner_info?.invoice_date)) {
                chosenInvoiceDate =
                    new Date(item.invoice_date) > new Date(item.secondary_owner_info.invoice_date)
                        ? new Date(item.invoice_date)
                        : new Date(item.secondary_owner_info.invoice_date);
            } else if (isValidDate(item.invoice_date)) {
                chosenInvoiceDate = new Date(item.invoice_date);
            } else if (isValidDate(item.secondary_owner_info?.invoice_date)) {
                chosenInvoiceDate = new Date(item.secondary_owner_info.invoice_date);
            }

            let dis = 0;
            if (chosenInvoiceDate != process.env.REACT_APP_DEFAULT_DATE) {
                dis = Math.floor((chosenInvoiceDate - arrivalDateDate) / (1000 * 60 * 60 * 24));
            } else if (isValidArrivalDate) {
                dis = Math.floor((todayDate - arrivalDateDate) / (1000 * 60 * 60 * 24));
            }

            const mhr_applied = joblist.reduce((sum, job) => {
                const jobTime = job.time_log.reduce((logSum, log) => logSum + (log.logged_time_in_seconds || 0), 0);
                return sum + jobTime;
            }, 0) / 3600;

            const mhr_estimated = joblist.reduce((sum, job) => sum + (job.labor_time * job.quantity || 0), 0);
            const material_cost = joblist.reduce((sum, job) => sum + (job.material_cost || 0), 0);
            const labor_cost = joblist.reduce((sum, job) => sum + (job.labor_rate * job.labor_time * job.quantity || 0), 0);

            const total_cost = material_cost + labor_cost;
            //console.log(workupdates[0].user.name)
            return {
                rfid: railcar.rfid,
                dis,
                owner: railcar.owner_railcar_owner_idToowner.name,
                invoice_date_modified:chosenInvoiceDate,
                lessee: railcar.owner_railcar_lessee_idToowner.name,
                railcar_type: railcar.railcartype.name,
                last_content: railcar.products.name,
                last_comment: workupdates!==null&& workupdates.length > 0 ? `${workupdates[0].comment} - ${workupdates[0].user?.name}` : '',
                status: workupdates.length > 0 ? `${workupdates[0].statuscode.code} - ${workupdates[0].statuscode.title}` : '',
                mhr_applied,
                mhr_estimated,
                material_cost,
                labor_cost,
                total_cost,
                ...rest,
            };
        });
    };

    const handleGenerate = async () => {
        try {
            toastId.current = toast.loading("Fetching data...")
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+'get_summary_report/', {
                is_shipped: shipped,
                is_invoiced: onlyInvoicedCars
            });
            const modifiedData = transformData(response.data)
            const formattedData = modifiedData.map(item => {
                return {
                    ...item,
                    arrival_date: formatDate(item.arrival_date),
                    projected_out_date: formatDate(item.projected_out_date),
                    inspected_date: formatDate(item.inspected_date),
                    material_eta: formatDate(item.material_eta),
                    clean_date: formatDate(item.clean_date),
                    repair_schedule_date: formatDate(item.repair_schedule_date),
                    paint_date: formatDate(item.paint_date),
                    exterior_paint: formatDate(item.exterior_paint),
                    valve_date: formatDate(item.valve_date),
                    pd_date: formatDate(item.pd_date),
                    final_date: formatDate(item.final_date),
                    qa_date: formatDate(item.qa_date),
                    month_to_invoice: formatDate(item.month_to_invoice),
                    invoice_date_modified: formatDate(item.invoice_date_modified),
                    shipped_date: formatDate(item.shipped_date),
                    mhr_applied: round2Dec(item.mhr_applied),
                    mhr_estimated: round2Dec(item.mhr_estimated),
                    material_cost: round2Dec(item.material_cost),
                    labor_cost: round2Dec(item.labor_cost),
                    total_cost: round2Dec(item.total_cost),
                };
            });
            if(formattedData.length>0){
                setData(formattedData);
                toast.update(toastId.current, {
                    render: "All data loaded",
                    autoClose: 1000,
                    type: "success",
                    hideProgressBar: true,
                    isLoading: false
                });
            }else {
                setData([]);
                toast.update(toastId.current, {
                    render: "No relevant data found",
                    autoClose: 1000,
                    type: "error",
                    hideProgressBar: true,
                    isLoading: false
                });
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: 'BIRCH Summary Report '+new Date().toLocaleDateString()
    });

    // const handleExportRows = (table,rows) => {
    //     const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible() === true);
    //
    //     // Map the rows to include only the visible columns and use the column headers
    //     const rowData = rows.map((row) => {
    //         console.log(row)
    //         const filteredRow = {};
    //         visibleColumns.forEach((column) => {
    //             // Use the header as the key for the Excel, but still fetch the data using accessorKey
    //             const value = row.original[column.id]; // or column.columnDef.accessorKey if needed
    //
    //             // Convert the value to a number only if it is a valid number
    //             if (typeof value === 'string' && !isNaN(parseFloat(value)) && isFinite(value)) {
    //                 filteredRow[column.columnDef.header] = parseFloat(value);
    //             } else {
    //                 // Otherwise, keep the original value
    //                 filteredRow[column.columnDef.header] = value;
    //             }
    //         });
    //         return filteredRow;
    //     });
    //
    //
    //     // Create a new workbook and add the data
    //     const worksheet = XLSX.utils.json_to_sheet(rowData);
    //     const workbook = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(workbook, worksheet, 'BIRCH Summary Report');
    //
    //     // Define filename with today's date
    //     const filename = `BIRCH Summary Report ${new Date().toLocaleDateString()}.xlsx`;
    //
    //     // Trigger a download of the Excel file
    //     XLSX.writeFile(workbook, filename);
    // };


    const excelDate = (date, useUTC = false) => {
        const epoch = useUTC
            ? Date.UTC(1899, 11, 30)
            : new Date(1899, 11, 30).getTime();

        const time = useUTC ? date.getTime() : date.getTime();
        return (time - epoch) / (24 * 60 * 60 * 1000);
    };



    const handleExportRows = (table, rows) => {
        const visibleColumns = table
            .getAllColumns()
            .filter(col => col.getIsVisible());

        const rowData = rows.map(row => {
            const filteredRow = {};

            visibleColumns.forEach(column => {
                const header = column.columnDef.header;
                const meta = column.columnDef.meta || {};
                const value = row.original[column.id];

                // ✅ DATE HANDLING (Excel-safe)
                if (meta.type === 'date') {
                    const date = value instanceof Date ? value : new Date(value);

                    if (!isNaN(date)) {
                        filteredRow[header] = excelDate(
                            date,
                            meta.useUTC ?? false
                        );
                    } else {
                        filteredRow[header] = value;
                    }
                    return;
                }

                // 🔢 Numbers
                if (typeof value === 'number') {
                    filteredRow[header] = value;
                    return;
                }

                // 🔢 Numeric strings
                if (typeof value === 'string' &&
                    !isNaN(parseFloat(value)) &&
                    isFinite(value)) {
                    filteredRow[header] = parseFloat(value);
                    return;
                }

                // 🧱 Fallback
                filteredRow[header] = value;
            });

            return filteredRow;
        });

        const worksheet = XLSX.utils.json_to_sheet(rowData);

        // ✅ Apply Excel date formatting
        visibleColumns.forEach(column => {
            const meta = column.columnDef.meta || {};
            if (meta.type !== 'date') return;

            const format = meta.excelFormat || 'mm/dd/yyyy';

            Object.keys(worksheet).forEach(cell => {
                if (!cell.startsWith('!') && typeof worksheet[cell]?.v === 'number') {
                    worksheet[cell].t = 'n'; // numeric
                    worksheet[cell].z = format;
                }
            });
        });

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BIRCH Summary Report');

        const filename = `BIRCH Summary Report ${new Date().toLocaleDateString()}.xlsx`;
        XLSX.writeFile(workbook, filename);
    };



    const handleExportData = () => {
        const csv = generateCsv(csvConfig)(data);
        download(csvConfig)(csv);
    };
    return (
        <div className="p-4">
            <div className="form-control w-fit">
                <label className="label cursor-pointer">
                    <span className="label-text mr-5">Only Invoiced Cars</span>
                    <input
                        type="checkbox"
                        className="toggle"
                        checked={onlyInvoicedCars}
                        onChange={handleOnlyInvoicedToggle}
                    />
                </label>
            </div>

            <div className="form-control w-fit">
                <label className="label cursor-pointer">
                    <span className="label-text mr-5">Shipped</span>
                    <input
                        type="checkbox"
                        className="toggle"
                        checked={shipped}
                        onChange={handleShippedToggle}
                    />
                </label>
            </div>


            <div className="mb-4">

                <button
                    onClick={handleGenerate}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                >
                    Generate
                </button>
            </div>

            <div className="overflow-x-auto">
                {data.length >0?(
                    <MaterialReactTable
                        columns={columns}
                        data={data}
                        enablePagination={true}
                        enableColumnFilterModes={true}
                        initialState={{
                            pagination: {
                                pageIndex: 0,
                                pageSize: 50, // Set default page size to 50
                            },

                            columnVisibility: {
                                dis: true,
                                rfid: true,
                                reason_to_come: true,
                                status: true,
                                last_comment: true,
                                qa_date: false,
                                projected_out_date: true,
                                total_cost: true,
                                owner: true,
                                lessee: true,
                                month_to_invoice: false,
                                mo_wk: false,
                                mhr_applied: false,
                                mhr_estimated: false,
                                last_content: false,
                                railcar_type: false,
                                material_cost: false,
                                labor_cost: false,
                                arrival_date: false,
                                inspected_date: false,
                                material_eta: false,
                                clean_date: false,
                                repair_schedule_date: false,
                                paint_date: false,
                                exterior_paint: false,
                                valve_date: false,
                                pd_date: false,
                                final_date: false,
                                invoice_date_modified:false,
                                shipped_date: false,
                                sp: false,
                                tq: false,
                                re: false,
                                ep: false,
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

export default SummaryReportMaterial;




