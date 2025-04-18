import React, { useRef, useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const UtilizationChart = ({ startDate, endDate, dateDiff, dataSet,name,type }) => {
    console.log(dataSet)
    const chartContainerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Step 1: Build x-axis dates at interval
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

    console.log("X Axis value")
    console.log(xAxisDates)

    // Step 2: Cumulative sums up to each x-axis date
    const directPercents = [];
    const indirectPercents = [];

    let lastProcessedDate = dayjs(startDate, "MM/DD/YYYY");

    xAxisDates.forEach(dateStr => {
        const current = dayjs(dateStr, "MM/DD/YYYY");

        // Filter only items in the current range (excluding already-processed)
        const rangeItems = dataSet.filter(item => {
            const itemDate = dayjs(item.date, "M/D/YYYY"); // Handle unpadded format from data
            return itemDate.isSame(lastProcessedDate, 'day') ||
                (itemDate.isAfter(lastProcessedDate, 'day') && itemDate.isSameOrBefore(current, 'day'));
        });

        console.log(`Processing range: ${lastProcessedDate.format("MM/DD/YYYY")} to ${current.format("MM/DD/YYYY")}`);
        console.log("Matching dates:", rangeItems.map(item => item.date));

        // Calculate total direct and indirect hours
        const totalDirect = rangeItems.reduce((sum, item) => sum + (parseFloat(item.direct_time) || 0), 0);
        const totalIndirect = rangeItems.reduce((sum, item) => sum + (parseFloat(item.indirect_time) || 0), 0);
        const total = totalDirect + totalIndirect;

        // Calculate utilization %
        const directPercent = total > 0 ? (totalDirect * 100) / total : 0;
        const indirectPercent = total > 0 ? (totalIndirect * 100) / total : 0;

        // Push to your chart arrays
        directPercents.push(directPercent);
        indirectPercents.push(indirectPercent);

        // Update the last processed date to the *next day* after the current range
        lastProcessedDate = current.add(1, 'day');
    });



    // Step 3: Chart setup
    const chartData = {
        labels: xAxisDates,
        datasets: [
            {
                label: "Direct Time (%)",
                data: directPercents,
                backgroundColor: "rgba(75, 192, 192, 0.8)",
                stack: "utilization",
            },
            {
                label: "Indirect Time (%)",
                data: indirectPercents,
                backgroundColor: "rgba(255, 99, 132, 0.8)",
                stack: "utilization",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: "top" },
            title: {
                display: true,
                text: `Cumulative Utilization % from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (every ${dateDiff} days)`,
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
                    text: "Utilization (%)",
                },
                max: 100,
                ticks: { stepSize: 20 },
            },
        },
    };

    // Fullscreen logic
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
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default UtilizationChart;
