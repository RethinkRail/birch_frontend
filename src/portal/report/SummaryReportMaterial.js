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


const  SummaryReportMaterial = () => {
    const toastId = useRef(null)
    const [onlyInvoicedCars, setOnlyInvoicedCars] = useState(false);
    const [shipped, setShipped] = useState(false);
    const initialColumns = useMemo(() => [
        { accessorKey: 'dis', header: 'DIS', enableSorting: true, size: 50 },
        { accessorKey: 'rfid', header: 'RFID', enableSorting: true },
        { accessorKey: 'owner', header: 'Owner', enableSorting: true },
        { accessorKey: 'lessee', header: 'Lessee', enableSorting: true },
        { accessorKey: 'railcar_type', header: 'Railcar Type', enableSorting: true },
        { accessorKey: 'last_content', header: 'Last Content', enableSorting: true },
        { accessorKey: 'last_comment', header: 'Last Comment', enableSorting: true },
        { accessorKey: 'status', header: 'Status', enableSorting: true },
        { accessorKey: 'mhr_applied', header: 'MHR Applied', enableSorting: true },
        { accessorKey: 'mhr_estimated', header: 'MHR Estimated', enableSorting: true },
        { accessorKey: 'material_cost', header: 'Material Cost', enableSorting: true },
        { accessorKey: 'labor_cost', header: 'Labor Cost', enableSorting: true },
        { accessorKey: 'total_cost', header: 'Total Cost', enableSorting: true },
        { accessorKey: 'arrival_date', header: 'Arrival Date', enableSorting: true },
        { accessorKey: 'projected_out_date', header: 'Projected Out Date', enableSorting: true },
        { accessorKey: 'inspected_date', header: 'Inspected Date', enableSorting: true },
        { accessorKey: 'material_eta', header: 'Material ETA', enableSorting: true },
        { accessorKey: 'clean_date', header: 'Clean Date', enableSorting: true },
        { accessorKey: 'repair_schedule_date', header: 'Repair Schedule Date', enableSorting: true },
        { accessorKey: 'paint_date', header: 'Paint Date', enableSorting: true },
        { accessorKey: 'exterior_paint', header: 'Exterior Paint Date', enableSorting: true },
        { accessorKey: 'valve_date', header: 'Valve Date', enableSorting: true },
        { accessorKey: 'pd_date', header: 'PD Date', enableSorting: true },
        { accessorKey: 'final_date', header: 'Final Date', enableSorting: true },
        { accessorKey: 'qa_date', header: 'QA Date', enableSorting: true },
        { accessorKey: 'month_to_invoice', header: 'Month to Invoice', enableSorting: true },
        { accessorKey: 'shipped_date', header: 'Shipped Date', enableSorting: true },
        { accessorKey: 'mo_wk', header: 'MO WK', enableSorting: true },
        { accessorKey: 'sp', header: 'Special Process', enableSorting: true },
        { accessorKey: 'tq', header: 'Tank Qualification', enableSorting: true },
        { accessorKey: 're', header: 'Reline', enableSorting: true },
        { accessorKey: 'ep', header: 'Exterior Paint', enableSorting: true },
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [data, setData] = useState([]);

    const formatDate = (sqlDate) => {
        if (sqlDate === process.env.REACT_APP_DEFAULT_DATE) {
            return ''; // Return empty string if equal to the default date
        }
        return convertSqlToFormattedDate(sqlDate); // Format as needed
    };


    // Toggle handlers
    const handleOnlyInvoicedToggle = () => {
        setOnlyInvoicedCars(prev => !prev);
    };

    const handleShippedToggle = () => {
        setShipped(prev => !prev);
    };

    const transformData = (data) => {


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

            const dis = isValidArrivalDate ? Math.floor((todayDate - arrivalDateDate) / (1000 * 60 * 60 * 24)) : 0;


            const mhr_applied = joblist.reduce((sum, job) => sum + (job.logged_time_inseconds || 0), 0);
            const mhr_estimated = joblist.reduce((sum, job) => sum + (job.labor_time * job.quantity || 0), 0);
            const material_cost = joblist.reduce((sum, job) => sum + (job.material_cost || 0), 0);
            const labor_cost = joblist.reduce((sum, job) => sum + (job.labor_rate * job.labor_time * job.quantity || 0), 0);

            const total_cost = material_cost + labor_cost;
            //console.log(workupdates[0].user.name)
            return {

                rfid: railcar.rfid,
                dis,
                owner: railcar.owner_railcar_owner_idToowner.name,
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

export default SummaryReportMaterial;




