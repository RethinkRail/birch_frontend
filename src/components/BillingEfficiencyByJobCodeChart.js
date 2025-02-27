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


const BillingEfficiencyByJobCodeChart = ({ startDate, endDate, dateDiff, dataSet,name }) => {
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

    const uniqueNames = [...new Set(dataSet.map((item) => item.job_code_applied))];
    const xAxis = calculateDates(startDate, endDate, dateDiff);

    let revMap = new Map();

    uniqueNames.map((job_code_applied) => {
        revMap.set(job_code_applied, []); // Initialize an empty array for this job_code_applied
        let filteredData = dataSet.filter((item) => item.job_code_applied === job_code_applied); // Filter data for the current job_code_applied
        let lastSum = 0; // Initialize cumulative utilization

        xAxis.forEach((date) => {
            const currentDate = dayjs(date); // Convert current date to dayjs object
            const invoicesBeforeOrOnDate = filteredData.filter(
                (invoice) =>
                    dayjs(invoice.completed_time).isBefore(currentDate) || // Filter invoices on or before the current date
                    dayjs(invoice.completed_time).isSame(currentDate)
            );

            if (invoicesBeforeOrOnDate.length > 0) {
                // Calculate utilization for each invoice and add to the cumulative sum
                lastSum += invoicesBeforeOrOnDate.reduce((sum, invoice) => {
                    const utilization = invoice.applied_time === 0 ? 0 : (invoice.applied_time / invoice.estimated_time) * 100; // Calculate utilization
                    return sum + utilization;
                }, 0);

                // Remove processed invoices from filteredData to avoid reprocessing
                filteredData = filteredData.filter(item =>
                    !invoicesBeforeOrOnDate.some(removeItem =>
                        removeItem.completed_time === item.completed_time &&
                        removeItem.applied_time === item.applied_time &&
                        removeItem.estimated_time === item.estimated_time
                    )
                );

                // Store the cumulative utilization for this date
                const values = revMap.get(job_code_applied);
                values.push(lastSum);
            } else {
                // If no invoices are found, carry forward the previous cumulative utilization
                const values = revMap.get(job_code_applied);
                values.push(lastSum);
            }
        });
    });

    // Process the dataset to calculate cumulative costs
    const newData = Array.from(revMap, ([name, data]) => ({ name, data }));
    console.log(newData)
    const chartData = {
        labels: xAxis,
        datasets: newData.map((item, index) => ({
            label: item.name,
            data: item.data,
            fill: false,
            tension: 0.0,
            backgroundColor: `hsla(${index * 360 / Object.keys(dataSet).length}, 70%, 50%, 0.2)`,
            borderColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
            borderWidth: 2,
            pointRadius: 4,
            spanGaps: true, // Enable skipping null values
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
                text: `Billing Efficiency by Jobcode From ${new Date(startDate).toLocaleDateString()} To ${new Date(
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

export default BillingEfficiencyByJobCodeChart;


































