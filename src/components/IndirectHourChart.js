import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const IndirectHourChart = ({ data,startDate,endDate }) => {
    const departmentHours = data.reduce((acc, curr) => {
        acc[curr.department_name] = (acc[curr.department_name] || 0) + curr.total_hour;
        return acc;
    }, {});

    const colors = [
        'rgba(75, 192, 192, 0.5)',
        'rgba(255, 99, 132, 0.5)',
        'rgba(54, 162, 235, 0.5)',
        'rgba(255, 206, 86, 0.5)',
        'rgba(153, 102, 255, 0.5)',
        'rgba(255, 159, 64, 0.5)',
    ];

    const borderColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)',
    ];

    const departments = Object.keys(departmentHours);

    const backgroundColor = departments.map((_, i) => `hsl(${(i * 360) / departments.length}, 70%, 60%)`);
    const borderColor = departments.map((_, i) => `hsl(${(i * 360) / departments.length}, 70%, 40%)`);


    const chartData = {
        labels: Object.keys(departmentHours),
        datasets: [
            {
                label: '',
                data: Object.values(departmentHours),
                backgroundColor: backgroundColor,
                borderColor: borderColor,
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: 'Total Indirect Hours by Department from '+startDate.toLocaleDateString()+'  to  '+endDate.toLocaleDateString(),
            },
        },
    };

    return <Bar data={chartData} options={options} />;
};

export default IndirectHourChart;
