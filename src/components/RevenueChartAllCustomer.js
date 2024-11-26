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

const RevenueChartAllCustomer = ({ data, startDate, endDate }) => {
    // Helper function to generate all dates between startDate and endDate
    const generateDates = (start, end) => {
        const dates = [];
        let currentDate = new Date(start);
        while (currentDate <= new Date(end)) {
            dates.push(currentDate.toLocaleDateString());
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return dates;
    };

    // Generate the range of dates
    const allDates = generateDates(startDate, endDate);

    // Map data to include all dates, filling missing dates with total_cost = 0
    const result = allDates.map((date) => {
        const existing = data.find((item) => new Date(item.invoice_date).toLocaleDateString() === date);
        return {
            invoice_date: date,
            total_cost: existing ? existing.total_cost : null,
        };
    });

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
            return 7; // Between 1 and 3 months (approx 30-90 days)
        } else if (diffInDays > 120 && diffInDays <= 180) {
            return 15; // Between 3 and 6 months (approx 90-180 days)
        } else {
            return 30; // More than 6 months
        }
    }


    // Chart data
    const chartData = {
        labels: result.map((item) => item.invoice_date),
        datasets: [
            {
                label: 'Total Revenue',
                data: result.map((item) => item.total_cost),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                spanGaps: true, // Enable skipping null values
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: "Revenue by All Company From " +
                    new Date(startDate).toLocaleDateString() +
                    " To " +
                    new Date(endDate).toLocaleDateString(),
            },
        },
        scales: {
            x: {
                title: { display: true, text: "Date" },
                ticks: {
                    callback: function (value, index, values) {
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
