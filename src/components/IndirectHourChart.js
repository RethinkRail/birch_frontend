import React, { useRef } from "react";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { format, eachDayOfInterval } from "date-fns";
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ChartDataLabels);

const IndirectHourChart = ({ data, startDate, endDate }) => {
    const chartContainerRef = useRef(null);

    const allDates = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
    }).map((date) => format(date, "M/d/yyyy"));

    const departments = Array.from(new Set(data.map((item) => item.department_name)));

    const dateDeptMap = {};
    allDates.forEach((date) => {
        dateDeptMap[date] = {};
        departments.forEach((dept) => {
            dateDeptMap[date][dept] = 0;
        });
    });

    data.forEach(({ start_date, department_name, total_hour }) => {
        if (dateDeptMap[start_date]) {
            dateDeptMap[start_date][department_name] += total_hour;
        }
    });

    // Format to 2 decimal points
    departments.forEach((dept) => {
        allDates.forEach((date) => {
            dateDeptMap[date][dept] = parseFloat(dateDeptMap[date][dept].toFixed(2));
        });
    });

    const datasets = departments.map((dept, index) => {
        return {
            label: dept,
            data: allDates.map((date) => dateDeptMap[date][dept]),
            backgroundColor: getColor(index),
            stack: 'stack1',
            borderRadius: 4,
            barThickness: 'flex',
            datalabels: {
                display: true,
                color: '#fff',
                anchor: 'center',
                align: 'center',
                font: {
                    size: 10,
                    weight: 'bold',
                },
                formatter: (value, context) => {
                    return value > 0 ? `${context.dataset.label}: ${value.toFixed(2)}h` : '';
                },
            },
        };
    });

    const chartData = {
        labels: allDates,
        datasets: datasets,
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    padding: 10,
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        return `${context.dataset.label}: ${context.raw.toFixed(2)} hrs`;
                    },
                },
            },
            datalabels: {
                display: true,
                color: '#fff',
                font: {
                    size: 10,
                    weight: 'bold',
                },
                formatter: (value, context) => {
                    return value > 0 ? `${context.dataset.label}: ${value.toFixed(2)}h` : '';
                },
            },
        },
        scales: {
            x: {
                stacked: true,
                ticks: {
                    maxRotation: 45,
                    minRotation: 0,
                },
                grid: {
                    display: false,
                },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
                grid: {
                    color: '#e0e0e0',
                },
            },
        },
    };

    return (
        <div
            ref={chartContainerRef}
            style={{
                position: 'relative',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: '#fff',
                width: '100%',
                height: '100%',
                minHeight: '600px',
            }}
        >
            <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
    );
};

const getColor = (index) => {
    const colors = [
        "#8884d8",
        "#82ca9d",
        "#ffc658",
        "#ff8042",
        "#8dd1e1",
        "#d0ed57",
        "#294d09",
        "#a28fd0",
        "#f08080",
        "#4db6ac",
    ];
    return colors[index % colors.length];
};

export default IndirectHourChart;
