/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/20/2024, Wednesday
 * Description:
 **/

import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale } from "chart.js";

// Register the necessary components including TimeScale
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

const LineGraph = ({ data }) => {
    const START_DATE = new Date("2024-10-01");
    const END_DATE = new Date("2024-11-01");

    // Function to process and group data
    const aggregateData = (rawData, startDate, endDate) => {
        const groupedData = {};
        const DAY_MS = 86400000; // Milliseconds in a day
        const rangeDays = (endDate - startDate) / DAY_MS;
        const interval = rangeDays <= 30 ? 1 : rangeDays <= 90 ? 10 : rangeDays <= 180 ? 15 : 30;

        rawData.forEach((item) => {
            const date = new Date(item.invoice_date);
            if (date >= startDate && date <= endDate) {
                const companyKey = item.name;
                const intervalStart = Math.floor((date - startDate) / (interval * DAY_MS)) * interval * DAY_MS + startDate.getTime();
                const formattedInterval = new Date(intervalStart).toISOString().split("T")[0];

                if (!groupedData[companyKey]) {
                    groupedData[companyKey] = {};
                }
                if (!groupedData[companyKey][formattedInterval]) {
                    groupedData[companyKey][formattedInterval] = 0;
                }
                groupedData[companyKey][formattedInterval] += parseFloat(item.total_cost);
            }
        });

        return groupedData;
    };

    // Process data
    const processedData = aggregateData(data, START_DATE, END_DATE);

    // Get all unique dates in sorted order
    const allDates = new Set();
    Object.values(processedData).forEach((companyData) => {
        Object.keys(companyData).forEach((date) => allDates.add(date));
    });
    const sortedDates = Array.from(allDates).sort((a, b) => new Date(a) - new Date(b));

    // Prepare datasets for Chart.js
    const datasets = Object.keys(processedData).map((company) => {
        const companyData = processedData[company];
        const values = sortedDates.map((date) => companyData[date] || 0); // Fill missing dates with 0

        return {
            label: company,
            data: values,
            borderColor: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            backgroundColor: "rgba(0, 0, 0, 0)",
            tension: 0.3,
        };
    });

    const chartData = {
        labels: sortedDates, // x-axis labels as dates
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            tooltip: { mode: "index", intersect: false },
        },
        scales: {
            x: {
                title: { display: true, text: "Date" },
                type: "time",
                time: { unit: "day", tooltipFormat: "MMM d, yyyy" },
            },
            y: {
                title: { display: true, text: "Total Cost ($)" },
                beginAtZero: true,
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default LineGraph;

