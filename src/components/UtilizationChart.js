import React, { useRef, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";

import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ChartDataLabels
);


const UtilizationChart = ({ startDate, endDate, dateDiff, dataSet, name, type }) => {
    const chartContainerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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

    const xAxisDates = calculateDates(startDate, endDate, dateDiff);

    const directHours = [];
    const indirectHours = [];
    const directPercentLabels = [];

    let lastProcessedDate = dayjs(startDate, "MM/DD/YYYY");

    xAxisDates.forEach(dateStr => {
        const current = dayjs(dateStr, "MM/DD/YYYY");

        const rangeItems = dataSet.filter(item => {
            const itemDate = dayjs(item.date, "M/D/YYYY");
            return itemDate.isSame(lastProcessedDate, 'day') ||
                (itemDate.isAfter(lastProcessedDate, 'day') && itemDate.isSameOrBefore(current, 'day'));
        });

        const totalDirect = rangeItems.reduce((sum, item) => sum + (parseFloat(item.direct_time) || 0), 0);
        const totalIndirect = rangeItems.reduce((sum, item) => sum + (parseFloat(item.indirect_time) || 0), 0);
        const total = totalDirect + totalIndirect;

        directHours.push(totalDirect);
        indirectHours.push(totalIndirect);
        directPercentLabels.push(total > 0 ? `${((totalDirect * 100) / total).toFixed(1)}%` : "0%");

        lastProcessedDate = current.add(1, 'day');
    });

    const chartData = {
        labels: xAxisDates,
        datasets: [
            {
                label: "Direct Hours",
                data: directHours,
                backgroundColor: "rgba(75, 192, 192, 0.8)",
                stack: "utilization",
            },
            {
                label: "Indirect Hours",
                data: indirectHours,
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                stack: "utilization",
            }
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: `Utilization Hours from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (every ${dateDiff} days)`,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            },
            datalabels: {
                display: true,
                anchor: 'end',
                align: 'end',
                formatter: function (_, context) {
                    // Show direct time % only on top of bars
                    if (context.datasetIndex === 1) return ''; // Show label only once (on top stack)
                    return directPercentLabels[context.dataIndex];
                },
                font: {
                    weight: 'bold',
                },
                color: '#000',
            },
        },
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: "Date",
                },
            },
            y: {
                stacked: true,
                title: {
                    display: true,
                    text: "Hours",
                },
                ticks: {
                    stepSize: 10,
                },
            },
        },
    };

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            chartContainerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };

    useEffect(() => {
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);

    return (
        <div
            ref={chartContainerRef}
            style={{
                position: 'relative',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
                background: '#fff',
            }}
        >
            <Bar data={chartData} options={options} plugins={[ChartDataLabels]} />
        </div>
    );
};


export default UtilizationChart;
