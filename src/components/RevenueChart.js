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
ChartJS.register({
    id: "whiteBackground",
    beforeDraw: (chart) => {
        const ctx = chart.ctx;
        ctx.save();
        ctx.fillStyle = "white"; // Set the background color to white
        ctx.fillRect(0, 0, chart.width, chart.height);
        ctx.restore();
    },
});





const RevenueChart = ({ startDate, endDate, dataSet, dateDiff }) => {
    console.log(startDate)
    console.log(endDate)
    console.log(dataSet)
    console.log(dateDiff)
    const generateDateRange = (start, end, diff) => {
        const dates = [];
        let current = new Date(start);
        const stop = new Date(end);

        while (current <= stop) {
            dates.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + diff);
        }
        return dates;
    };

    const interpolateCost = (start, end, targetDate, startCost, endCost) => {
        const totalDays = (new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24);
        const targetDays = (new Date(targetDate) - new Date(start)) / (1000 * 60 * 60 * 24);
        return startCost + ((endCost - startCost) / totalDays) * targetDays;
    };

    const prepareData = () => {
        const dateRange = generateDateRange(startDate, endDate, dateDiff);
        const companyData = {};

        dataSet.forEach(({ name, invoice_date, total_cost }) => {
            if (!companyData[name]) {
                companyData[name] = [];
            }
            companyData[name].push({ date: invoice_date, cost: total_cost });
        });

        return Object.entries(companyData).map(([name, data], index) => {
            const dataPoints = dateRange.map((date) => {
                const before = data.filter(({ date: d }) => new Date(d) <= new Date(date)).sort((a, b) => new Date(b.date) - new Date(a.date))[0];
                const after = data.filter(({ date: d }) => new Date(d) > new Date(date)).sort((a, b) => new Date(a.date) - new Date(b.date))[0];

                if (before && after) {
                    return {
                        date,
                        cost: interpolateCost(before.date, after.date, date, before.cost, after.cost),
                    };
                } else if (before) {
                    return { date, cost: before.cost };
                } else {
                    return { date, cost: null };
                }
            });

            return {
                label: name,
                data: dataPoints.map((point) => point.cost),
                borderColor: `hsl(${index * 360 / Object.keys(data).length}, 70%, 50%)`,
                backgroundColor: `hsla(${index * 360 / Object.keys(data).length}, 70%, 50%, 0.2)`,
                borderWidth: 2,
                pointRadius: 4,
                spanGaps: true // Enable skipping null values
            };
        });
    };

    const dateLabels = generateDateRange(startDate, endDate, dateDiff);
    const chartData = {
        labels: dateLabels,
        datasets: prepareData(),
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Company Costs Over Time',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Revenue($)',
                },
            },
        },
    };

    return <Line options={options} data={chartData} />;
};





export default RevenueChart;




