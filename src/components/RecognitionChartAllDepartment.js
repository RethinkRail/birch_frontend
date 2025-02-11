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


const RecognitionChartAllDepartment = ({ startDate, endDate, dateDiff, dataSet,isUSD }) => {
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

    const uniqueNames = [...new Set(dataSet.map((item) => item.department))];
    const xAxis = calculateDates(startDate, endDate, dateDiff);

    console.log(xAxis)

    let recognitionMap = new Map();

    uniqueNames.map((name)=>{
        let lastSum = 0;
        recognitionMap.set(name,[]);
        let filteredData = dataSet.filter((item) => item.department === name);
        xAxis.forEach((date) => {
            const currentDate = dayjs(date);
            const invoicesBeforeOrOnDate = filteredData.filter(
                (invoice) => dayjs(invoice.completed_time).isBefore(currentDate) || dayjs(invoice.completed_time).isSame(currentDate)
            );

            console.log(invoicesBeforeOrOnDate)


            if (invoicesBeforeOrOnDate.length > 0) {

                if(isUSD){
                    lastSum = invoicesBeforeOrOnDate.reduce((sum, invoice) => sum + invoice.net_cost, 0);
                    filteredData = filteredData.filter(item =>
                        !invoicesBeforeOrOnDate.some(removeItem =>
                            removeItem.completed_time === item.completed_time &&
                            removeItem.net_cost === item.net_cost
                        )
                    );
                    const values = recognitionMap.get(name)
                    values.push(lastSum)
                }else {
                    lastSum = invoicesBeforeOrOnDate.reduce((sum, invoice) => sum + parseInt(invoice.applied_time), 0);
                    filteredData = filteredData.filter(item =>
                        !invoicesBeforeOrOnDate.some(removeItem =>
                            removeItem.completed_time === item.completed_time &&
                            removeItem.applied_time === parseInt(item.applied_time)
                        )
                    );
                    const values = recognitionMap.get(name)
                    values.push(lastSum)
                }

                // Reset the sum to the latest invoice found on or before the current date

            } else {

                const values = recognitionMap.get(name)
                values.push(lastSum)
            }

        })
    })
    //let filteredData = dataSet.filter((item) => item.name === name);


    console.log(recognitionMap)

    // Process the dataset to calculate cumulative costs
    const newData = Array.from(recognitionMap, ([name, data]) => ({ name, data }));
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
                text: `Revenue recognition  From ${new Date(startDate).toLocaleDateString()} To ${new Date(
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
                    text: isUSD? " ($)":"Applied Hour",
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

export default RecognitionChartAllDepartment;


































