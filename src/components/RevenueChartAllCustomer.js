/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/25/2024, Monday
 * Description:
 **/

import React, { useRef, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import dayjs from 'dayjs';

// Register the necessary Chart.js components
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const RevenueChartAllCustomer = ({ data, startDate, endDate, dateDiff }) => {
    const chartContainerRef = useRef(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Helper function to generate all dates at the specified interval
    const calculateDates = (startDate, endDate, diff) => {
        const dates = [];
        let current = dayjs(startDate);
        const end = dayjs(endDate);

        while (current.isBefore(end) || current.isSame(end)) {
            dates.push(current.format('MM/DD/YYYY'));
            current = current.add(diff, 'day');
        }

        return dates;
    };

    const xAxis = calculateDates(startDate, endDate, dateDiff);
    let revArray = [];
    let lastSum = 0;
    xAxis.forEach((date) => {
        const currentDate = dayjs(date);
        const invoicesBeforeOrOnDate = data.filter(
            (invoice) =>
                dayjs(invoice.invoice_date).isBefore(currentDate) ||
                dayjs(invoice.invoice_date).isSame(currentDate)
        );

        if (invoicesBeforeOrOnDate.length > 0) {
            lastSum = invoicesBeforeOrOnDate.reduce((sum, invoice) => sum + invoice.total_cost, 0);
            data = data.filter(
                (item) =>
                    !invoicesBeforeOrOnDate.some(
                        (removeItem) =>
                            removeItem.invoice_date === item.invoice_date &&
                            removeItem.total_cost === item.total_cost
                    )
            );
            revArray.push({ date, total_cost: lastSum });
        } else {
            revArray.push({ date, total_cost: lastSum });
        }
    });

    // Chart data
    const chartData = {
        labels: revArray.map((item) => item.date),
        datasets: [
            {
                label: 'Total Revenue',
                data: revArray.map((item) => item.total_cost),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                spanGaps: true,
            },
        ],
    };

    // Chart options
    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: {
                display: true,
                text: `Revenue by All Companies From ${new Date(startDate).toLocaleDateString()} To ${new Date(
                    endDate
                ).toLocaleDateString()} in ${dateDiff} day(s) range`,
            },
        },
        scales: {
            x: {
                title: { display: true, text: 'Date' },
            },
            y: {
                title: { display: true, text: 'Revenue ($)' },
            },
        },
    };

    // Fullscreen toggle logic
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

export default RevenueChartAllCustomer;

