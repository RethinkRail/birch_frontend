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

const RevenueChartAllCustomer = ({ data, startDate, endDate,dateDiff }) => {
    // Helper function to generate all dates at the specified interval
    const generateDatesWithInterval = (start, end, interval) => {
        const dates = [];
        let currentDate = new Date(start);

        while (currentDate <= new Date(end)) {
            dates.push(currentDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD for consistency
            currentDate.setDate(currentDate.getDate() + interval);
        }

        // Ensure the end date is included if not already present
        const endFormatted = new Date(end).toISOString().split('T')[0];
        if (!dates.includes(endFormatted)) {
            dates.push(endFormatted);
        }

        return dates;
    };

    // Interpolation function for `total_cost`
    const interpolateValue = (x, x0, y0, x1, y1) => {
        return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    };



    // Convert dates in the data to consistent format
    const formattedData = data.map(({ invoice_date, total_cost }) => ({
        date: new Date(invoice_date).toISOString().split('T')[0],
        total_cost,
    }));

    // Generate target dates

    const targetDates = generateDatesWithInterval(startDate, endDate, dateDiff);

    // Interpolate data for the target dates
    const result = targetDates.map((targetDate) => {
        const targetTime = new Date(targetDate).getTime();

        // Find the closest previous and next data points
        const previous = formattedData
            .filter(({ date }) => new Date(date).getTime() <= targetTime)
            .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const next = formattedData
            .filter(({ date }) => new Date(date).getTime() >= targetTime)
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

        // Interpolate if both neighbors exist
        if (previous && next && previous.date !== next.date) {
            const prevTime = new Date(previous.date).getTime();
            const nextTime = new Date(next.date).getTime();
            const interpolatedCost = interpolateValue(
                targetTime,
                prevTime,
                previous.total_cost,
                nextTime,
                next.total_cost
            );
            return { date: targetDate, total_cost: interpolatedCost };
        }

        // Use the closest value if interpolation isn't possible
        return previous || next
            ? { date: targetDate, total_cost: (previous || next).total_cost }
            : { date: targetDate, total_cost: null };
    });

    // Chart data
    const chartData = {
        labels: result.map((item) => item.date),
        datasets: [
            {
                label: 'Total Revenue',
                data: result.map((item) => item.total_cost),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                borderWidth: 2,
                pointRadius: 4, // Points are shown for every interpolated value
                spanGaps: true, // Enable skipping null values
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: `Revenue by All Company From ${new Date(startDate).toLocaleDateString()} To ${new Date(
                    endDate
                ).toLocaleDateString()}`,
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Date' },
            },
            y: {
                title: { display: true, text: 'Revenue ($)' },
            },
        },
    };

    return <Line data={chartData} options={options} />;
};


export default RevenueChartAllCustomer;
