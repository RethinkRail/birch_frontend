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
import dayjs from "dayjs";

// Register the necessary Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const RevenueChartAllCustomer = ({ data, startDate, endDate,dateDiff }) => {
    // Helper function to generate all dates at the specified interval
    const calculateDates = (startDate, endDate, diff) => {
        const dates = [];
        let current = dayjs(startDate);
        const end = dayjs(endDate);

        while (current.isBefore(end) || current.isSame(end)) {
            dates.push(current.format("MM/DD/YYYY"));
            current = current.add(diff, "day");
        }

        return dates;
    };
    const xAxis = calculateDates(startDate, endDate, dateDiff);
    let revArray = []
    let lastSum = 0;
    xAxis.forEach((date) => {
        const currentDate = dayjs(date);
        const invoicesBeforeOrOnDate = data.filter(
            (invoice) => dayjs(invoice.invoice_date).isBefore(currentDate) || dayjs(invoice.invoice_date).isSame(currentDate)
        );


        if (invoicesBeforeOrOnDate.length > 0) {

            // Reset the sum to the latest invoice found on or before the current date
            lastSum = invoicesBeforeOrOnDate.reduce((sum, invoice) => sum + invoice.total_cost, 0);
            data = data.filter(item =>
                !invoicesBeforeOrOnDate.some(removeItem =>
                    removeItem.invoice_date === item.invoice_date &&
                    removeItem.total_cost === item.total_cost
                )
            );
            const valueToPush = {}
            valueToPush.date = date
            valueToPush.total_cost = lastSum
            revArray.push(valueToPush)
        } else {
            const valueToPush = {}
            valueToPush.date = date
            valueToPush.total_cost = lastSum
            revArray.push(valueToPush)
        }

    })

    // Chart data
    const chartData = {
        labels: revArray.map((item) => item.date),
        datasets: [
            {
                label: 'Total Revenue',
                data: revArray.map((item) => item.total_cost),
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
                text: `Revenue by All Companies From ${new Date(startDate).toLocaleDateString()} To ${new Date(
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
