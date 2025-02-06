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
import {convertSqlToFormattedDateTime, toUTCDateTime} from "../../utils/DateTimeHelper";
import {round2Dec} from "../../utils/NumberHelper";

const TimeLogByDepartment = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [jobCategories, setJobCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const toastId = useRef(null)

    const initialColumns = useMemo(() => [
        { accessorKey: 'f1', header: 'Name', enableSorting: true },
        { accessorKey: 'f2', header: 'Railcar', enableSorting: true },
        { accessorKey: 'f3', header: 'Job Description', enableSorting: true },
        { accessorKey: 'f4', header: 'Start Time', enableSorting: true },
        { accessorKey: 'f5', header: 'End Time', enableSorting: true },
        { accessorKey: 'f6', header: 'Total Time', enableSorting: true },
    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [data, setData] = useState([]);
    // Handle change in date inputs

    useEffect(()=>{
        const fetchDepartment = async () => {
            const jobCategoryResponse = await axios.get(process.env.REACT_APP_BIRCH_API_URL + 'get_all_job_category/');
            setJobCategories(jobCategoryResponse.data);
        }
        fetchDepartment()
    },[])
    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    const handleRetrieve = async () => {

        toastId.current = toast.loading("Fetching data...");
        const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+'get_depeartment_wise_time_report/', {
            start_date: toUTCDateTime(startDate+" 00:00:00"),
            end_date: toUTCDateTime(endDate+ " 23:59:59"),
            department_id:selectedCategory
        });
        const  data1 = formattedData(response.data)
        setData(data1)
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
        filename: 'Depart Wise Time Log for '+jobCategories.find(item => item.id === parseInt(selectedCategory))?.name+'_'+startDate+" to "+endDate
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
    const handleChange = (event) => {
        setSelectedCategory(event.target.value); // Update state with selected category
    };
    function formattedData(data) {
        return data.map(item => {
            // Format Start Time (f4)
            const start_date = new Date(item.f4);
            const formattedDateStartDate = convertSqlToFormattedDateTime(start_date);
           // const formattedDateStartDate = `${String(start_date.getMonth() + 1).padStart(2, '0')}-${String(start_date.getDate()).padStart(2, '0')}-${start_date.getFullYear()}`;

            // Format End Time (f5)
            const end_date = new Date(item.f5);
            const formattedDateEndDate = convertSqlToFormattedDateTime(end_date)
            //const formattedDateEndDate = `${String(end_date.getMonth() + 1).padStart(2, '0')}-${String(end_date.getDate()).padStart(2, '0')}-${end_date.getFullYear()}`;

            // Format Total Time (f6)
            const totalTime = item.f6 == null ? "Not Yet Approved" : round2Dec(item.f6 / 3600);

            // Return formatted item
            return {
                ...item,
                f4: formattedDateStartDate,  // Start Time
                f5: formattedDateEndDate,    // End Time
                f6: totalTime                // Total Time
            };
        });
    }


    return (
        <div>
            <h1 className='font-bold mt-10 mb-10'>Department wise time report</h1>
            <div className="flex items-center space-x-6 p-6 bg-white rounded-lg shadow-md">

                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <select className="w-full  placeholder-opacity-90 bg-[#F7F9FF] py-3"   value={selectedCategory} onChange={handleChange}
                    >>
                        <option key="" value="" >Select a category</option>
                        {jobCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}  className="w-full whitespace-pre-line ">
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

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

export default TimeLogByDepartment;
