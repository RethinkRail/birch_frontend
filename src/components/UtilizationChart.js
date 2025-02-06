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


const UtilizationChart = ({ startDate, endDate, dateDiff, dataSet,name,type }) => {
    console.log(dataSet)
    console.log(type)
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

    const uniqueNames = [...new Set(dataSet.map((item) => item.crew_name))];
    const xAxis = calculateDates(startDate, endDate, dateDiff);

    let timeMap = new Map();

    uniqueNames.map((crew_name)=>{

        timeMap.set(crew_name,[]);

        let filteredData = dataSet.filter((item) => item.crew_name === crew_name);

        let lastSum = 0;
        xAxis.forEach((date) => {
            const currentDate = dayjs(date);

            // Filter items where start_date is on or before the current date
            const startDateBeforeOrOnDate = filteredData.filter(
                (item) => dayjs(item.start_date).isBefore(currentDate) || dayjs(item.start_date).isSame(currentDate)
            );

            if (startDateBeforeOrOnDate.length > 0) {
                // Calculate the sum of (applied_time / estimated_time) * 100 for all matching items
                lastSum = startDateBeforeOrOnDate.reduce((sum, item) => {
                    // Convert applied_time and estimated_time to numbers
                    const appliedTime = parseFloat(item.applied_time);
                    const estimatedTime = parseFloat(item.estimated_time);

                    // Check if the conversion resulted in valid numbers
                    if (isNaN(appliedTime) || isNaN(estimatedTime)) {
                        console.warn('Invalid data: applied_time or estimated_time is not a valid number', item);
                        return sum; // Skip this item
                    }

                    // Ensure estimated_time is not zero to avoid division by zero
                    if (estimatedTime === 0) {
                        console.warn('Invalid data: estimated_time is zero', item);
                        return sum; // Skip this item
                    }

                    // Calculate utilization percentage
                    const utilizationPercentage = (appliedTime / estimatedTime) * 100;
                    console.log(`Item:`, item, `Utilization Percentage:`, utilizationPercentage);

                    return sum + utilizationPercentage;
                }, 0);

                // Remove processed items from filteredData
                filteredData = filteredData.filter(item =>
                    !startDateBeforeOrOnDate.some(removeItem =>
                        removeItem.start_date === item.start_date &&
                        removeItem.applied_time === item.applied_time &&
                        removeItem.estimated_time === item.estimated_time
                    )
                );

                // Update the timeMap with the new sum
                const values = timeMap.get(crew_name);
                values.push(lastSum);
            } else {
                // If no matching items, push the existing lastSum
                const values = timeMap.get(crew_name);
                values.push(lastSum);
            }
        });

    })

    console.log(timeMap)

    // Process the dataset to calculate cumulative costs
    const newData = Array.from(timeMap, ([name, data]) => ({ name, data }));
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
                text: `Utilization report From ${new Date(startDate).toLocaleDateString()} To ${new Date(
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
                    text: "Indrirect Hours",
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

export default UtilizationChart;


































