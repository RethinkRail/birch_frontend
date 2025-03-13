/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 12/13/2024, Friday
 * Description:
 **/

import React, { useEffect, useState } from 'react';


import {MaterialReactTable} from "material-react-table";
import {FaDownload} from "react-icons/fa";
import {download, generateCsv, mkConfig} from "export-to-csv";

const StockStatusReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStockStatusReport = async () => {
            try {
                const response = await fetch(process.env.REACT_APP_BIRCH_API_URL+'get_stock_status_report');
                const result = await response.json();
                if (response.ok) {
                    setData(result);
                } else {
                    console.error('Error fetching data:', result);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStockStatusReport();
    }, []);

    // const handleExport = () => {
    //     const ws = XLSX.utils.json_to_sheet(data);
    //     const wb = XLSX.utils.book_new();
    //     XLSX.utils.book_append_sheet(wb, ws, 'Stock Status Report');
    //     const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    //     const file = new Blob([excelBuffer], { bookType: 'xlsx', type: 'application/octet-stream' });
    //     saveAs(file, 'stock_status_report.xlsx');
    // };

    const columns = [
        { accessorKey: 'part_code', header: 'Part Code' },
        { accessorKey: 'title', header: 'Title' },
        { accessorKey: 'price', header: 'Price' },
        { accessorKey: 'qty_on_hand', header: 'Qty on Hand' },
        { accessorKey: 'qty_applied', header: 'Qty Applied' },
        { accessorKey: 'qty_estimated', header: 'Qty Estimated' },
        { accessorKey: 'qty_on_po', header: 'Qty on PO' },
        { accessorKey: 'minimum_quantity', header: 'Min Quantity' },
        { accessorKey: 'qty_available', header: 'Qty Available' },
        { accessorKey: 'inventory_value', header: 'Inventory Value' },
    ];

    const csvConfig = mkConfig({
        fieldSeparator: ',',
        decimalSeparator: '.',
        useKeysAsHeaders: true,
        filename: 'Stock status report '
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
        <div>
            <h1 className='font-bold mt-10 mb-10'>Stock Status Report</h1>
            {/*<button onClick={handleExport}>Export to Excel</button>*/}
            <div className="flex items-center space-x-6 p-6 bg-white rounded-lg shadow-md">
                <MaterialReactTable
                    columns={columns}
                    data={data}
                    loading={loading}
                    enableColumnFilter={false}
                    enableSorting={true}
                    enablePagination={true}
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
            </div>

        </div>
    );
};

export default StockStatusReport;
