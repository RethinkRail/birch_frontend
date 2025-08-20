import React, { useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MaterialReactTable } from "material-react-table";
import { FaDownload } from "react-icons/fa";
import { download, generateCsv, mkConfig } from "export-to-csv";

const DepartmentChecklistReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [data, setData] = useState([]);

    const toastId = useRef(null);

    const columns = useMemo(
        () => [
            { accessorKey: "railcar_id", header: "Railcar", enableSorting: true },
            { accessorKey: "status_code", header: "Status Code", enableSorting: true },
            { accessorKey: "job_category", header: "Job Category", enableSorting: true },
            { accessorKey: "user_name", header: "User", enableSorting: true },
            { accessorKey: "date_time", header: "Date Time", enableSorting: true },
        ],
        []
    );

    const handleRetrieve = async () => {
        if (!startDate || !endDate) {
            toast.error("Please select both start and end dates");
            return;
        }

        try {
            toastId.current = toast.loading("Fetching data...");
            const response = await axios.get(
                process.env.REACT_APP_BIRCH_API_URL + "department_checklist_report",
                {
                    start_date: startDate,
                    end_date: endDate,
                }
            );

            const formattedData = response.data.data.map((item) => ({
                railcar_id: item.workorder.railcar_id,
                status_code: item.status_code,
                job_category: item.statuscode.job_or_revenue_category?.name || "",
                user_name: item.user.name,
                date_time: new Date(item.date_time).toLocaleString(),
            }));

            setData(formattedData);

            toast.update(toastId.current, {
                render: "All data loaded",
                autoClose: 1000,
                type: "success",
                hideProgressBar: true,
                isLoading: false,
            });
        } catch (error) {
            console.error(error);
            toast.update(toastId.current, {
                render: "Failed to fetch data",
                autoClose: 2000,
                type: "error",
                hideProgressBar: true,
                isLoading: false,
            });
        }
    };

    const csvConfig = mkConfig({
        fieldSeparator: ",",
        decimalSeparator: ".",
        useKeysAsHeaders: true,
        filename: "DepartmentChecklistReport_" + startDate + "_to_" + endDate,
    });

    const handleExportRows = (table, rows) => {
        const visibleColumns = table
            .getAllColumns()
            .filter((column) => column.getIsVisible() === true);

        const rowData = rows.map((row) => {
            const filteredRow = {};
            visibleColumns.forEach((column) => {
                filteredRow[column.columnDef.header] = row.original[column.id];
            });
            return filteredRow;
        });

        const csv = generateCsv(csvConfig)(rowData);
        download(csvConfig)(csv);
    };

    return (
        <div>
            <h1 className="font-bold mt-10 mb-10">Department Checklist Report</h1>
            <div className="flex items-center space-x-6 p-6 bg-white rounded-lg shadow-md">
                {/* Start Date */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                    </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="block w-full rounded-md border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 p-2"
                    />
                </div>

                {/* End Date */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date
                    </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
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

            {/* Table */}
            <div className="overflow-x-auto mt-8">
                {data.length > 0 ? (
                    <MaterialReactTable
                        columns={columns}
                        data={data}
                        enablePagination={true}
                        initialState={{
                            pagination: { pageIndex: 0, pageSize: 10 },
                        }}
                        muiTableHeadCellProps={{
                            sx: {
                                backgroundColor: "#DCE5FF",
                                fontSize: "12px",
                                padding: "10px",
                            },
                        }}
                        muiTableBodyCellProps={{
                            sx: {
                                fontSize: "12px",
                                padding: "10px",
                            },
                        }}
                        muiTableBodyRowProps={({ row, table }) => ({
                            sx: {
                                backgroundColor:
                                    table.getRowModel().flatRows.indexOf(row) % 2 === 0
                                        ? "#F9F9F9"
                                        : "#ffffff",
                            },
                        })}
                        renderTopToolbarCustomActions={({ table }) => (
                            <div style={{ display: "flex", gap: "16px", padding: "8px", flexWrap: "wrap" }}>
                                <button
                                    disabled={table.getPrePaginationRowModel().rows.length === 0}
                                    onClick={() =>
                                        handleExportRows(table, table.getPrePaginationRowModel().rows)
                                    }
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "8px 16px",
                                        backgroundColor: "#1976d2",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <FaDownload style={{ marginRight: "8px" }} />
                                    Export All
                                </button>
                                <button
                                    disabled={table.getRowModel().rows.length === 0}
                                    onClick={() => handleExportRows(table, table.getRowModel().rows)}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "8px 16px",
                                        backgroundColor: "#1976d2",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    <FaDownload style={{ marginRight: "8px" }} />
                                    Export Visible Data
                                </button>
                            </div>
                        )}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default DepartmentChecklistReport;
