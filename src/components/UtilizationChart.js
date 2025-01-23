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


const UtilizationChart = ({ startDate, endDate, dateDiff, dataSet,name }) => {
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

    const uniqueNames = [...new Set(dataSet.map((item) => item.crew_name))];
    const xAxis = calculateDates(startDate, endDate, dateDiff);

    let timeMap = new Map();

    uniqueNames.map((crew_name)=>{

        timeMap.set(crew_name,[]);

        let filteredData = dataSet.filter((item) => item.crew_name === crew_name);

        let lastSum = 0;
        xAxis.forEach((date) => {

            const currentDate = dayjs(date);

            const startDateBeforeOrOnDate = filteredData.filter(
                (item) => dayjs(item.start_date).isBefore(currentDate) || dayjs(item.start_date).isSame(currentDate)
            );

            if (startDateBeforeOrOnDate.length > 0) {

                // Reset the sum to the latest invoice found on or before the current date
                lastSum = startDateBeforeOrOnDate.reduce((sum, item) => sum + item.utilization, 0);
                filteredData = filteredData.filter(item =>
                    !startDateBeforeOrOnDate.some(removeItem =>
                        removeItem.start_date === item.start_date &&
                        removeItem.utilization === item.utilization
                    )
                );
                const values = timeMap.get(crew_name)

                values.push(lastSum)
            } else {

                const values = timeMap.get(crew_name)

                values.push(lastSum)
            }

        })

    })

    // Process the dataset to calculate cumulative costs
    const newData = Array.from(timeMap, ([name, data]) => ({ name, data }));
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
            <button
                onClick={toggleFullscreen}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    padding: '0.5rem 1rem',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                }}
            >
                {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <Line data={chartData} options={options} />
        </div>
    );

};

export default UtilizationChart;


































