/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 02/23/2026
 * Description: https://fixur.app/#ticket/8bb2b540-38f3-43ce-8389-35c665bd6df7
 **/


import React, {useEffect, useRef, useState} from "react";
import axios from "axios";
import {toast} from "react-toastify";
import {FaDownload} from "react-icons/fa";
import {round2Dec} from "../../utils/NumberHelper";

const ProfitabilityReport = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [avgHourlyRate, setAvgHourlyRate] = useState(45);
    const [otherCosts, setOtherCosts] = useState({});
    const [data, setData] = useState([]);

    const toastId = useRef(null);

    const rate = parseFloat(avgHourlyRate) || 0;

    const handleStartDateChange = (e) => {
        setStartDate(e.target.value);
    };

    const handleEndDateChange = (e) => {
        setEndDate(e.target.value);
    };

    useEffect(() => {
        console.log("Updated startDate:", startDate);
    }, [startDate, endDate]);

    const handleRetrieve = async () => {
        setData([]);
        toastId.current = toast.loading("Fetching data...");
        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL + 'get_profitability', {
                start_date: startDate,
                end_date: endDate
            });
            setData(response.data);
            setOtherCosts({});
            toast.update(toastId.current, {
                render: "All data loaded",
                autoClose: 1000,
                type: "success",
                hideProgressBar: true,
                isLoading: false
            });
        } catch (error) {
            toast.update(toastId.current, {
                render: "Failed to fetch data",
                autoClose: 2000,
                type: "error",
                hideProgressBar: true,
                isLoading: false
            });
        }
    };

    const getCalc = (row, idx) => {
        const actualLabor = rate * (row.hours_applied || 0);
        const origMat = row.original_material || 0;
        const totalActual = actualLabor + origMat;
        const oc = parseFloat(otherCosts[idx]) || 0;
        const total = row.total || 0;
        const netRevenue = total - totalActual - oc;
        const profit = total !== 0 ? ( netRevenue * 100) / total : 0;
        return {actualLabor, totalActual, otherCost: oc, netRevenue, profit};
    };

    const formatDate = (val) => {
        if (!val) return "—";
        return new Date(val).toISOString().split("T")[0];
    };

    const rows = [
        {key: "owner", label: "Owner"},
        {key: "railcar_id", label: "Railcar ID"},
        {key: "invoice_date", label: "Invoice Date", format: (v) => formatDate(v)},
        {key: "labor_cost", label: "Labor Cost", format: (v) => `$${round2Dec(v)}`},
        {key: "material_cost", label: "Material Cost", format: (v) => `$${round2Dec(v)}`},
        {key: "total", label: "Total", format: (v) => `$${round2Dec(v)}`, bold: true},
        {key: "_actual_labor", label: "Actual Labor Cost", calc: true, highlight: "blue"},
        {key: "original_material", label: "Original Material", format: (v) => `$${round2Dec(v)}`},
        {key: "_total_actual", label: "Total Actual Cost", calc: true, bold: true},
        {key: "_other_cost", label: "Other Cost", input: true},
        {key: "_net_revenue", label: "Net Revenue", calc: true, highlight: "revenue"},
        {key: "_profit", label: "Profit %", calc: true, highlight: "revenue"},
        {key: "hours_applied", label: "Hours Applied", format: (v) => `$${round2Dec(v)}`},
        {key: "labor_hour_estimated", label: "Hours Billed", format: (v) => `$${round2Dec(v)}`},
        {key: "utilization", label: "Utilization", format: (v) => `${v}%`},
        {key: "hours_difference", label: "Hours Difference"},
    ];

    const getCellValue = (row, item, idx) => {
        const c = getCalc(item, idx);
        if (row.key === "_actual_labor") return `$${round2Dec(c.actualLabor)}`;
        if (row.key === "_total_actual") return `$${round2Dec(c.totalActual)}`;
        if (row.key === "_net_revenue") return `$${round2Dec(c.netRevenue)}`;
        if (row.key === "_profit") return `${round2Dec(c.profit)}%`;
        if (row.input) return null;
        if (row.format) return row.format(item[row.key]);
        return item[row.key] ?? "—";
    };

    const getCellColor = (row, item, idx) => {
        if (row.highlight === "blue") return "text-blue-700";
        if (row.highlight === "revenue") {
            const c = getCalc(item, idx);
            const val = row.key === "_profit" ? c.profit : c.netRevenue;
            return val < 0 ? "text-red-600" : "text-green-700";
        }
        return "";
    };

    const handleExport = () => {
        const exportRows = [];

        // Header row: Property | Owner1 | gap | Owner2 | gap | ...
        const headerRow = ["Property"];
        data.forEach((item, i) => {
            headerRow.push(item.owner || `Record ${i + 1}`);
            if (i < data.length - 1) headerRow.push("");
        });
        exportRows.push(headerRow);

        // Each property as a row
        rows.forEach((row) => {
            const r = [row.label];
            data.forEach((item, idx) => {
                const c = getCalc(item, idx);
                let val;
                if (row.key === "_actual_labor") val = round2Dec(c.actualLabor);
                else if (row.key === "_total_actual") val = round2Dec(c.totalActual);
                else if (row.key === "_net_revenue") val = round2Dec(c.netRevenue);
                else if (row.key === "_profit") val = round2Dec(c.profit);
                else if (row.key === "_other_cost") val = round2Dec(c.otherCost);
                else if (row.key === "invoice_date") val = formatDate(item[row.key]);
                else val = item[row.key] ?? "";
                r.push(val);
                if (idx < data.length - 1) r.push("");
            });
            exportRows.push(r);
        });

        // Build CSV manually to preserve transposed layout
        const csvContent = exportRows.map(row =>
            row.map(cell => {
                const str = String(cell ?? "");
                return str.includes(",") || str.includes('"') || str.includes('\n')
                    ? `"${str.replace(/"/g, '""')}"` : str;
            }).join(",")
        ).join("\n");

        const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `Profitability Report from ${startDate} to ${endDate}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <h1 className='font-bold mt-10 mb-10'>Profitability Report</h1>
            <div className="flex items-center space-x-6 p-6 bg-white rounded-lg shadow-md">
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

                {/* Average Hourly Rate */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avg Hourly Rate ($)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={avgHourlyRate}
                        onChange={(e) => setAvgHourlyRate(e.target.value)}
                        className="block w-32 rounded-md border border-gray-300 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 p-2 text-right"
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

            <div className="overflow-x-auto mt-8">
                {data.length > 0 ? (
                    <>
                        {/* Export Button */}
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={handleExport}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '8px 16px',
                                    backgroundColor: '#1976d2',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                }}
                            >
                                <FaDownload style={{marginRight: '8px'}}/>
                                Export All
                            </button>
                        </div>

                        {/* Horizontal Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                            <table className="w-full border-collapse p-5 mb-5">
                                {/* Header row with owner names */}
                                <thead>
                                <tr>

                                    {data.map((item, i) => (
                                        <React.Fragment key={`h-${i}`}>

                                            {i < data.length - 1 && (
                                                <th
                                                    className="border-b border-gray-200"
                                                    style={{backgroundColor: '#DCE5FF', width: '20px'}}
                                                />
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {rows.map((row, rowIdx) => (
                                    <tr
                                        key={row.key}
                                        className={rowIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}
                                    >
                                        {/* Label cell */}
                                        <td className={`p-3 text-xs text-gray-600 border-b border-gray-100 whitespace-nowrap ${row.bold ? 'font-bold text-gray-800' : 'font-medium'}`}>
                                            {row.label}
                                        </td>
                                        {/* Value cells */}
                                        {data.map((item, colIdx) => (
                                            <React.Fragment key={`c-${row.key}-${colIdx}`}>
                                                <td
                                                    className={`p-3 text-xs text-right border-b border-gray-100 whitespace-nowrap ${row.bold ? 'font-bold' : 'font-medium'} ${getCellColor(row, item, colIdx)}`}
                                                >
                                                    {row.input ? (
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            placeholder="0.00"
                                                            value={otherCosts[colIdx] ?? ""}
                                                            onChange={(e) => setOtherCosts((prev) => ({...prev, [colIdx]: e.target.value}))}
                                                            className="w-24 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 p-1 text-right text-xs"
                                                        />
                                                    ) : (
                                                        getCellValue(row, item, colIdx)
                                                    )}
                                                </td>
                                                {/* Gap column */}
                                                {colIdx < data.length - 1 && (
                                                    <td className="border-b border-gray-100" style={{width: '20px', backgroundColor: rowIdx % 2 === 0 ? '#F9F9F9' : '#ffffff'}} />
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
};

export default ProfitabilityReport;