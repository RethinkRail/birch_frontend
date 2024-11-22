/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/22/2024, Friday
 * Description:
 **/

import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

// Register Chart.js modules
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const RevenueChart = ({data,startDate,endDate}) => {
    // Generate the date range
    // const startDate = new Date("2024-4-01");
    // const endDate = new Date("2024-10-30");
    const dateRange = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        dateRange.push(new Date(d).toISOString().split("T")[0]); // Format as YYYY-MM-DD
    }

    console.log(data)
    console.log(dateRange)

    // Group data by company
    const revenueByCompany = {};

   data.forEach(({ name, invoice_date, total_cost }) => {
        const formattedDate = new Date(invoice_date).toISOString().split("T")[0];
        if (!revenueByCompany[name]) {
            revenueByCompany[name] = dateRange.reduce((acc, date) => {
                acc[date] = null; // Initialize with null for no revenue
                return acc;
            }, {});
        }
        revenueByCompany[name][formattedDate] = parseFloat(total_cost);
    });

    // Prepare datasets for each company
    const datasets = Object.entries(revenueByCompany).map(([company, revenues], index) => ({
        label: company,
        data: dateRange.map((date) => revenues[date]),
        borderColor: `hsl(${index * 360 / Object.keys(revenueByCompany).length}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 360 / Object.keys(revenueByCompany).length}, 70%, 50%, 0.2)`,
        borderWidth: 2,
        pointRadius: 4,
        spanGaps: true // Enable skipping null values
    }));

    // Chart data
    const chartData = {
        labels: dateRange,
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Revenue Comparison by Company (10/01/2024 - 10/30/2024)" },
        },
        scales: {
            x: { title: { display: true, text: "Date" } },
            y: { title: { display: true, text: "Revenue ($)" } },
        },
    };

    return (
            <Line data={chartData} options={options} />

    );
};

export default RevenueChart;




