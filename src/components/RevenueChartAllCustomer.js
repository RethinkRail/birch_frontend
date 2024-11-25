/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/25/2024, Monday
 * Description:
 **/

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Register the necessary Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const RevenueChartAllCustomer = ({ data,startDate,endDate }) => {
    const result = Object.values(
        data.reduce((acc, { invoice_date, total_cost }) => {
            if (!acc[invoice_date]) {
                acc[invoice_date] = { invoice_date, total_cost: 0 };
            }
            acc[invoice_date].total_cost += parseFloat(total_cost);
            return acc;
        }, {})
    ).sort((a, b) => new Date(a.invoice_date) - new Date(b.invoice_date));

    const chartData = {
        labels: result.map((item) => item.invoice_date),
        datasets: [
            {
                label: 'Total Cost',
                data: result.map((item) => item.total_cost),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                spanGaps: true // Enable skipping null values
            },
        ],
    };

    // Chart options
    function getDateDifferenceCategory(date1, date2) {
        // Convert dates to Date objects
        const startDate = new Date(date1);
        const endDate = new Date(date2);

        // Calculate the difference in milliseconds
        const diffInMs = Math.abs(endDate - startDate);

        // Convert milliseconds to days
        const diffInDays = diffInMs / (1000 * 3600 * 24);

        // Check conditions based on the day difference
        if (diffInDays <= 31) {
            return 1; // 30 days or less
        } else if (diffInDays > 31 && diffInDays <= 120) {
            return 3; // Between 1 and 3 months (approx 30-90 days)
        } else if (diffInDays > 120 && diffInDays <= 180) {
            return 7; // Between 3 and 6 months (approx 90-180 days)
        } else {
            return 15; // More than 6 months
        }
    }
    const options = {
        responsive: true,

        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: "Revenue  by All Company From " +
                    startDate.toLocaleDateString() +
                    " To " +
                    endDate.toLocaleDateString(),
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Date" },
                ticks: {
                    callback: function (value, index, values) {
                        // Show labels only for every third date
                        if (index % getDateDifferenceCategory(startDate, endDate) === 0) {
                            return this.getLabelForValue(value);
                        }
                        return null; // Hide other labels
                    },
                    maxTicksLimit: 100,
                    autoSkip: false, // Ensure callback is used
                },
            },
            y: {
                title: { display: true, text: "Revenue ($)" },
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default RevenueChartAllCustomer;
