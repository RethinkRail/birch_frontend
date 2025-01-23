/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/18/2024, Monday
 * Description:
 **/

import React, {useState, useEffect, useMemo} from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import Select from "react-select";
import RevenueChart from "../../components/RevenueChart";
import {MaterialReactTable} from "material-react-table";
import {FaDownload} from "react-icons/fa";
import {mkConfig} from "export-to-csv";
import * as XLSX from "xlsx";
import RevenueChartAllCustomer from "../../components/RevenueChartAllCustomer";
import IndirectHourChart from "../../components/IndirectHourChart";
import {round2Dec} from "../../utils/NumberHelper";
import UtilizationChart from "../../components/UtilizationChart";


// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const UtilizationReport = () => {
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [crews, setCrews] = useState([]);
    const [selectedCrew, setSelectedCrew] = useState(null);

    const [showDepartments, setShowDepartments] = useState(true);

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [loading, setLoading] = useState(false);

    const [allData,setAllData] = useState([])
    const [tableData,setTableData] = useState([])
    const [isAllDepartment,setIsAllDepartment] = useState(false)

    const initialColumns = useMemo(() => [
        { accessorKey: 'crew_id', header: 'Team member ID', enableSorting: true },
        { accessorKey: 'crew_name', header: 'Team member Name', enableSorting: true },
        { accessorKey: 'start_date', header: 'Date', enableSorting: true },
        { accessorKey: 'applied_time', header: 'Applied time', enableSorting: true, Cell: ({ cell }) => round2Dec( cell.getValue())  },
        { accessorKey: 'job_description', header: 'Job Description', enableSorting: true },
        {
            accessorKey: 'estimated_time',
            header: 'Estimated Time',
            enableSorting: true,
            Cell: ({ cell }) => round2Dec( cell.getValue()) , // Add 2 to the value of total_hour
        },

        {
            accessorKey: 'utilization(%)',
            header: 'Utilization',
            enableSorting: true,
            Cell: ({ cell }) => round2Dec( cell.getValue()), // Add 2 to the value of total_hour
        },

    ], []);

    const [columns, setColumns] = useState(initialColumns);
    const [selectedDateRange, setSelectedDateRange] = useState(1); // Default value is 1

    const handleChange = (event) => {
        setSelectedDateRange(event.target.value); // Update state variable
    };
    // Fetch departments from the API
    useEffect(() => {
        const fetchDepartmentsAndCrews = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_all_revenue_category/`
                );

                // Map API data to React Select format
                const departmentOptions = response.data.map((department) => ({
                    value: department.id,
                    label: department.name,
                }));

                const crewsResponse = await axios.get(
                    `${process.env.REACT_APP_BIRCH_API_URL}crews`
                );

                const activeEmployees = crewsResponse.data
                    .filter((employee) => employee.is_active === 1)
                    .map(({ id, name }) => ({ value: id, label: name }));

                setCrews(activeEmployees);
                setDepartments(departmentOptions);
            } catch (error) {
                console.error('Error fetching departments or crews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDepartmentsAndCrews();
    }, []);

    // const handleOwnerChange = (index, value) => {
    //     const updatedSelectedOwners = [...selectedDepartments];
    //     updatedSelectedOwners[index] = value;
    //     setSelectedDepartments(updatedSelectedOwners);
    // };

    //original
    const handleGenerate = async () => {
        let modified = new Date(startDate);
        modified.setDate(modified.getDate() - selectedDateRange);

        console.log(showDepartments)
        console.log(selectedCrew)
        console.log(selectedDepartment)
        console.log(startDate)
        console.log(endDate)
        try {
            setLoading(true);
            const payloadCrew = {
                crew:selectedCrew?selectedCrew.value:0,
                startDate:modified,
                endDate,
            };
            const payloadDepartment = {
                department_id:selectedDepartment? selectedDepartment.value:0,
                startDate:modified,
                endDate,
            };
            console.log(payloadCrew)
            console.log(payloadDepartment)
            console.log(new Date(modified).toISOString())
            console.log(new Date(endDate).toISOString())

            let response

            if(showDepartments){
                response = await axios.post(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_utilization_by_department`,
                    payloadDepartment
                );
            }else {
                response = await axios.post(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_utilization_by_crew`,
                    payloadCrew
                );
            }


            const data = response.data.data;
            console.log(response)
            setTableData(data)


            setAllData(data)

            // if(!isAllDepartment){
            //     const response = await axios.post(
            //         `${process.env.REACT_APP_BIRCH_API_URL}generate_revenue_by_departments`,
            //         payload
            //     );
            //
            //     const data = response.data.data;
            //     console.log(data)
            //     setAllData(data)
            // }else {
            //     const response = await axios.post(
            //         `${process.env.REACT_APP_BIRCH_API_URL}generate_revenue_by_customer_report_all`,
            //         payloadAll
            //     );
            //
            //     const data = response.data.data;
            //     setAllData(data)
            // }



            setLoading(false);

        } catch (error) {
            console.error('Error generating report:', error);
            alert(error.response?.data?.error || 'Failed to generate the report!');
            setLoading(false);
        }
    };


    function handleSetIsAllDepartments() {
        setIsAllDepartment(prev => !prev);
    }


    const handleExportRows = (table,rows) => {
        const visibleColumns = table.getAllColumns().filter(column => column.getIsVisible() === true);

        // Map the rows to include only the visible columns and use the column headers
        const rowData = rows.map((row) => {
            const filteredRow = {};
            visibleColumns.forEach((column) => {
                // Use the header as the key for the Excel, but still fetch the data using accessorKey
                filteredRow[column.columnDef.header] = row.original[column.id]; // or column.columnDef.accessorKey if needed
            });
            return filteredRow;
        });

        console.log(rowData);

        // Create a new workbook and add the data
        const worksheet = XLSX.utils.json_to_sheet(rowData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'BIRCH Indirect Hour Report');

        // Define filename with today's date
        const filename = 'BIRCH Indirect Revenue Report from '+startDate.toLocaleDateString()+"  to "+endDate.toLocaleDateString()+'.xlsx' ;

        // Trigger a download of the Excel file
        XLSX.writeFile(workbook, filename);
    };

    const handleChangeDepartment = () =>{
        setShowDepartments(!showDepartments)
        if(showDepartments){
            setSelectedCrew(false)
        }else {
            setShowDepartments(false)
        }
    }

    return (
        <div className="py-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 mt-2">Utilization report</h1>
            <div className="">
                <div className="flex items-center space-x-4">
                    {/* Toggle */}
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700 mr-2">
                        {showDepartments ? 'Departments' : 'Team Member'}
                      </span>

                        <label className="label cursor-pointer">
                            <input
                                type="checkbox"
                                className="toggle"
                                checked={showDepartments}
                                onChange={() => setShowDepartments(!showDepartments)}
                            />
                        </label>
                    </div>

                    {/* Dropdown */}
                    <div className="flex-1">
                        {showDepartments ? (
                            <Select
                                options={departments}
                                value={selectedDepartment}
                                onChange={setSelectedDepartment}
                                isSearchable
                                placeholder="Select a Department"
                                className="react-select-container w-1/4"
                                classNamePrefix="react-select"
                            />
                        ) : (
                            <Select
                                options={crews}
                                value={selectedCrew}
                                onChange={setSelectedCrew}
                                isSearchable
                                placeholder="Select a Team Member"
                                className="react-select-container w-1/4"
                                classNamePrefix="react-select"
                            />
                        )}
                    </div>
                </div>
                {/* Select Menus */}

                {/* Date Pickers */}
                <div className="flex gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            # of Days per Data Point
                        </label>
                        <select
                            id="dateRange"
                            value={selectedDateRange}
                            onChange={handleChange}
                            className="block w-32 p-2 border rounded"
                        >
                            {Array.from({ length: 30 }, (_, index) => (
                                <option key={index + 1} value={index + 1}>
                                    {index + 1}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate'}
                </button>


                {allData.length > 0 && (
                    <div className="mt-4">

                        <UtilizationChart startDate={startDate} endDate={endDate} dataSet={allData}  dateDiff={parseInt(selectedDateRange)} name={'Utilization'} />
                        {/*{isAllDepartment ? (*/}
                        {/*    <RevenueChartAllCustomer data={groupAndSortByDate(allData)} startDate={startDate} endDate={endDate}  dateDiff={parseInt(selectedDateRange)} />*/}
                        {/*) : (*/}
                        {/*    <RevenueChart startDate={startDate} endDate={endDate} dataSet={mergeAndSortData(allData)}  dateDiff={parseInt(selectedDateRange)} />*/}
                        {/*)}*/}


                        <div className="overflow-x-auto mt-4">
                            {allData.length >0?(
                                <MaterialReactTable
                                    columns={columns}
                                    data={tableData}
                                    enablePagination={true}
                                    enableColumnFilterModes={true}
                                    initialState={{
                                        pagination: {
                                            pageIndex: 0,
                                            pageSize: 50, // Set default page size to 50
                                        },
                                        columnVisibility: { crew_id : false }
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
                )}
            </div>
        </div>
    );
};

export default UtilizationReport;

