/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 9/23/2024, Monday
 * Description:
 **/

import React, { useState } from 'react';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import {convertSqlToFormattedDate} from "../../utils/DateTimeHelper";
import {round2Dec} from "../../utils/NumberHelper";

const SummaryReport = () => {
    const initialColumns = [
        { name: 'DIS', selector: 'dis', sortable: true, visible: true ,width:'5%'},
        { name: 'RFID', selector: 'rfid', sortable: true, visible: true },
        { name: 'Owner', selector: 'owner', sortable: true, visible: true },
        { name: 'Lessee', selector: 'lessee', sortable: true, visible: true },
        { name: 'Railcar Type', selector: 'railcar_type', sortable: true, visible: true },
        { name: 'Last Content', selector: 'last_content', sortable: true, visible: true },
        { name: 'Last Comment', selector: 'last_comment', sortable: true, visible: true },
        { name: 'Status', selector: 'status', sortable: true, visible: true },
        { name: 'MHR Applied', selector: 'mhr_applied', sortable: true, visible: true },
        { name: 'MHR Estimated', selector: 'mhr_estimated', sortable: true, visible: true },
        { name: 'Material Cost', selector: 'material_cost', sortable: true, visible: true },
        { name: 'Labor Cost', selector: 'labor_cost', sortable: true, visible: true },
        { name: 'Total Cost', selector: 'total_cost', sortable: true, visible: true },
        { name: 'Arrival Date', selector: 'arrival_date', sortable: true, visible: true },
        { name: 'Projected Out Date', selector: 'projected_out_date', sortable: true, visible: true },
        { name: 'Inspected Date', selector: 'inspected_date', sortable: true, visible: true },
        { name: 'Material ETA', selector: 'material_eta', sortable: true, visible: true },
        { name: 'Clean Date', selector: 'clean_date', sortable: true, visible: true },
        { name: 'Repair Schedule Date', selector: 'repair_schedule_date', sortable: true, visible: true },
        { name: 'Paint Date', selector: 'paint_date', sortable: true, visible: true },
        { name: 'Exterior Paint', selector: 'exterior_paint', sortable: true, visible: true },
        { name: 'Valve Date', selector: 'valve_date', sortable: true, visible: true },
        { name: 'PD Date', selector: 'pd_date', sortable: true, visible: true },
        { name: 'Final Date', selector: 'final_date', sortable: true, visible: true },
        { name: 'QA Date', selector: 'qa_date', sortable: true, visible: true },
        { name: 'Month to Invoice', selector: 'month_to_invoice', sortable: true, visible: true },
        { name: 'Shipped Date', selector: 'shipped_date', sortable: true, visible: true },
        { name: 'MO WK', selector: 'mo_wk', sortable: true, visible: true },
        { name: 'SP', selector: 'sp', sortable: true, visible: true },
        { name: 'TQ', selector: 'tq', sortable: true, visible: true },
        { name: 'RE', selector: 're', sortable: true, visible: true },
        { name: 'EP', selector: 'ep', sortable: true, visible: true },
    ];

    const [columns, setColumns] = useState(initialColumns);
    const [data, setData] = useState([]);

    const formatDate = (sqlDate) => {
        if (sqlDate === process.env.REACT_APP_DEFAULT_DATE) {
            return ''; // Return empty string if equal to the default date
        }

        return convertSqlToFormattedDate(sqlDate); // Format as needed
    };

    const handleCheckboxChange = (index) => {
        const newColumns = [...columns];
        newColumns[index].visible = !newColumns[index].visible;
        setColumns(newColumns);
    };

    const handleCheckAllChange = (event) => {
        const newColumns = columns.map(column => ({
            ...column,
            visible: event.target.checked,
        }));
        setColumns(newColumns);
    };

    const handleGenerate = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL+'get_summary_report'); // Replace with your actual API URL
            const formattedData = response.data.map(item => {
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
            setData(formattedData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const conditionalRowStyles = [

        {
            when: row =>  row.index % 2 == 1,
            style: {
                backgroundColor: '#F7F9FF',
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
        {
            when: row => row.index % 2 == 0,
            style: {
                backgroundColor: '#FFFFFFFF', // Yellow background for rows where age is less than 25
            },
            classNames: ["py-1", "whitespace-nowrap", "font-bold", "text-xs"]
        },
    ];
    const myStyles = {
        headRow: {
            style: {
                "backgroundColor": "#DCE5FF",
                "font-size": "8px",
                "padding": "1px",
                "font-family": 'Inter',
                "font-weight": "500"
            },
        },
        headCells: {
            style: {
                paddingLeft: '10px',
                paddingRight: '2px',
            },
        },
        cells: {
            style: {"font-size": "10px", "font-family": 'Inter', "font-weight": "500", "padding-left": "10px"},
        },

    }

    return (
        <div className="p-4">
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Select Columns to Display</h2>
                <label className="flex items-center mb-2 cursor-pointer">
                    <input
                        type="checkbox"
                        onChange={handleCheckAllChange}
                        className="hidden"
                        checked={columns.every(col => col.visible)} // Check if all columns are visible
                    />
                    <div className="relative">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${columns.every(col => col.visible) ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                            {columns.every(col => col.visible) && (
                                <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </div>
                    <span className="ml-2 font-medium">Check All</span>
                </label>
                <div className="flex flex-wrap">
                    {columns.map((column, index) => (
                        <label key={index} className="flex items-center cursor-pointer w-1/4 p-2">
                            <input
                                type="checkbox"
                                checked={column.visible}
                                onChange={() => handleCheckboxChange(index)}
                                className="hidden"
                            />
                            <div className="relative">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${column.visible ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                                    {column.visible && (
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <span className="ml-2">{column.name}</span>
                        </label>
                    ))}
                </div>
                <button
                    onClick={handleGenerate}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-200"
                >
                    Generate
                </button>
            </div>

            <div className="overflow-x-auto">
                <DataTable
                    title="Summary Report"
                    columns={columns.filter(col => col.visible).map(({ name, selector, sortable }) => ({
                        name,
                        selector: row => row[selector],
                        sortable,
                    }))}
                    data={data}
                    pagination
                    striped
                    highlightOnHover
                    responsive
                    conditionalRowStyles={conditionalRowStyles}
                    customStyles={myStyles}
                />
            </div>
        </div>
    );
};

export default SummaryReport;
