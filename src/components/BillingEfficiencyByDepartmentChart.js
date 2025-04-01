/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/22/2024, Friday
 * Description:
 **/

import React, {useRef, useState} from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(isSameOrBefore);
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


const BillingEfficiencyByDepartmentChart = ({ startDate, endDate, dateDiff, dataSet,name }) => {
    console.log(dataSet)
    const chartContainerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    // Generate X-Axis dates based on the given start and end date
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

    const uniqueDepartments = [...new Set(dataSet.map((item) => item.departmen))]; // Fix typo
    const xAxis = calculateDates(startDate, endDate, dateDiff);

    let revMap = new Map();

    uniqueDepartments.forEach((department) => {
        revMap.set(department, []);
        let filteredData = dataSet.filter((item) => item.departmen === department); // Fix typo

        let lastUtilization = 0;

        xAxis.forEach((date) => {
            const currentDate = dayjs(date);

            // Filter jobs completed on or before this date
            const relevantJobs = filteredData.filter(
                (job) =>
                    dayjs(job.completed_time).isBefore(currentDate) ||
                    dayjs(job.completed_time).isSame(currentDate)
            );

            if (relevantJobs.length > 0) {
                // Sum applied and estimated times
                const totalAppliedTime = relevantJobs.reduce((sum, job) => sum + parseFloat(job.applied_time), 0);
                const totalEstimatedTime = relevantJobs.reduce((sum, job) => sum + parseFloat(job.estimated_time), 0);

                // Compute utilization correctly
                lastUtilization = totalEstimatedTime > 0 ? (totalAppliedTime / totalEstimatedTime) * 100 : 0;

                // Don't modify `filteredData` here, let it accumulate jobs over time
            }

            revMap.get(department).push(lastUtilization);
        });
    });

    console.log(revMap);

    // Process the dataset to calculate cumulative costs
    const newData = Array.from(revMap, ([name, data]) => ({ name, data }));
    console.log(newData)
    const chartData = {
        labels: xAxis,
        datasets: newData.map((item, index) => ({
            label: item.name,
            data: item.data.map(value => (value === 0 ? null : value)), // Replace 0 with null
            fill: true,
            tension: 0.0,
            backgroundColor: `hsla(${index * 360 / newData.length}, 70%, 50%, 0.2)`,
            borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            borderWidth: 2,
            pointRadius: 4,
            spanGaps: true, // Enables non-continuous graph for null values
        })),
    };


    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            title: {
                display: true,
                text: `Billing Efficiency by Department From ${new Date(startDate).toLocaleDateString()} To ${new Date(
                    endDate
                ).toLocaleDateString()} in ${dateDiff} day(s) range`,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Dates",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Utilization (%)",
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

    React.useEffect(() => {
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
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

            <Line data={chartData} options={options} />
        </div>
    );

};

export default BillingEfficiencyByDepartmentChart;


































