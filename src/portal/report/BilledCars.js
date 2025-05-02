/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 5/2/2025, Friday
 * Description:
 **/

import React, { useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BilledCars = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [interval, setInterval] = useState(1);
    const [chartData, setChartData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [summaryData, setSummaryData] = useState([]);
    const fetchBilledCars = async () => {
        if (!startDate || !endDate || !interval) return;
        setLoading(true);

        try {
            const response = await axios.post(process.env.REACT_APP_BIRCH_API_URL+"get_billed_cars/", { startDate, endDate });


            const groupedByDate = {};

            response.data.data.forEach(item => {
                const invoiceDate = new Date(item.invoice_date);
                const dateStr = invoiceDate.toLocaleDateString("en-US"); // e.g. '4/2/2025'

                if (!groupedByDate[dateStr]) {
                    groupedByDate[dateStr] = [];
                }
                groupedByDate[dateStr].push(item);
            });

// Create summary rows
            const summary = Object.entries(groupedByDate).map(([date, records]) => {
                const numCars = records.length;
                const totalCost = records.reduce((sum, r) => sum + parseFloat(r.total_cost), 0);
                const avgCost = totalCost / numCars;
                const avgDis = records.reduce((sum, r) => sum + r.dis, 0) / numCars;

                return {
                    date,
                    totalCost: totalCost.toFixed(2),
                    avgCost: avgCost.toFixed(2),
                    avgDis: avgDis.toFixed(2),
                };
            });

            setSummaryData(summary);


            // Parse dates in local time to avoid timezone shifts
            const parseLocalDate = (dateStr) => {
                const [year, month, day] = dateStr.split("-").map(Number);
                return new Date(year, month - 1, day);
            };

            // Group cost by date
            const rawGrouped = {};
            response.data.data.forEach(item => {
                const invoiceDate = item.invoice_date.split("T")[0]; // ensure only YYYY-MM-DD
                if (!rawGrouped[invoiceDate]) rawGrouped[invoiceDate] = 0;
                rawGrouped[invoiceDate] += parseFloat(item.total_cost);
            });

            const buckets = [];
            const labels = [];
            let current = parseLocalDate(startDate);
            const end = parseLocalDate(endDate);
            const intervalDays = parseInt(interval);

            while (current <= end) {
                const bucketStart = new Date(current);
                let bucketEnd = new Date(current);
                if (labels.length === 0) {
                    bucketEnd = new Date(bucketStart);
                } else {
                    bucketEnd.setDate(bucketStart.getDate() + intervalDays - 1);
                }

                // Sum costs for this bucket
                let total = 0;
                Object.entries(rawGrouped).forEach(([dateStr, cost]) => {
                    const d = parseLocalDate(dateStr);
                    if (d >= bucketStart && d <= bucketEnd) {
                        total += cost;
                    }
                });

                labels.push(bucketStart.toLocaleDateString());
                buckets.push(Number(total.toFixed(2)));

                // Move to next bucket
                current.setDate(current.getDate() + (labels.length === 1 ? 1 : intervalDays));
            }

            setChartData({
                labels,
                datasets: [
                    {
                        label: "Total Cost",
                        data: buckets,
                        backgroundColor: "rgba(54,162,235,0.6)",
                        borderColor: "rgba(54,162,235,1)",
                        borderWidth: 1,
                    },
                ],
            });
        } catch (error) {
            console.error(error);
            setChartData(null);
        } finally {
            setLoading(false);
        }
    };



    return (
        <div className="p-6 ">
            <h2 className="text-2xl font-semibold mb-4">Billed Cars Report</h2>
            <div className="flex flex-wrap gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                        type="date"
                        className="border rounded px-3 py-2"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">End Date</label>
                    <input
                        type="date"
                        className="border rounded px-3 py-2"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Interval (Days)</label>
                    <select
                        className="border rounded px-3 py-2"
                        value={interval}
                        onChange={e => setInterval(e.target.value)}
                    >
                        {Array.from({ length: 30 }, (_, i) => i + 1).map(num => (
                            <option key={num} value={num}>
                                {num}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-end">
                    <button
                        onClick={fetchBilledCars}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Submit"}
                    </button>
                </div>
            </div>

            {chartData ? (
                <Bar
                    data={chartData}
                    options={{
                        responsive: true,
                        plugins: {
                            legend: { position: "top" },
                            title: { display: true, text: "Total Cost by Date Range Bucket" },
                            tooltip: {
                                callbacks: {
                                    label: context =>
                                        `Total Cost: $${context.raw.toFixed(2)}`
                                }
                            }
                        },
                        scales: {
                            x: { title: { display: true, text: "Date Range" } },
                            y: {
                                title: { display: true, text: "Total Cost ($)" },
                                ticks: {
                                    callback: value => `$${parseFloat(value).toFixed(2)}`
                                }
                            }
                        }
                    }}
                />
            ) : (
                !loading && <p className="text-gray-500">No data to display.</p>
            )}

            {summaryData.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-2">Daily Summary</h2>
                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-4 py-2">Date</th>
                            <th className="border border-gray-300 px-4 py-2">Total Cost</th>
                            <th className="border border-gray-300 px-4 py-2">Avg. Cost per Car</th>
                            <th className="border border-gray-300 px-4 py-2">Avg. DIS</th>
                        </tr>
                        </thead>
                        <tbody>
                        {summaryData.map((row, idx) => (
                            <tr key={idx}>
                                <td className="border border-gray-300 px-4 py-2">{row.date}</td>
                                <td className="border border-gray-300 px-4 py-2">${row.totalCost}</td>
                                <td className="border border-gray-300 px-4 py-2">${row.avgCost}</td>
                                <td className="border border-gray-300 px-4 py-2">{row.avgDis} days</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default BilledCars;
