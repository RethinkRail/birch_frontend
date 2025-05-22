/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 5/20/2025, Tuesday
 * Description:
 **/

import React, {useEffect, useMemo, useState} from 'react';
import axios from 'axios';
import {MaterialReactTable} from 'material-react-table';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Legend,
    Tooltip
} from 'chart.js';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip);

function aggregateDataByInterval(data, startDate, endDate, interval) {
    // Step 1: Flatten data into a dictionary for easy access
    const dataMap = {};
    data.forEach(entry => {
        const date = Object.keys(entry)[0];
        dataMap[date] = entry[date];
    });

    // Step 2: Utility to format date as YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Step 3: Generate date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Step 4: Go back `interval` days before startDate
    let cursor = new Date(start);
    cursor.setDate(cursor.getDate() - interval);

    const result = [];

    while (cursor <= end) {
        const windowStart = new Date(cursor);
        const windowEnd = new Date(cursor);
        windowEnd.setDate(windowEnd.getDate() + interval);

        // Initialize aggregation bucket
        const sum = {
            enroute: 0,
            inbound: 0,
            material: 0,
            cleaning: 0,
            valve: 0,
            repair: 0,
            interior_paint: 0,
            exterior_paint: 0,
            qa: 0,
            pd:0,
            awaiting_customer: 0
        };

        // Loop through each day in the window
        const current = new Date(windowStart);
        while (current < windowEnd) {
            const key = formatDate(current);
            if (dataMap[key]) {
                for (const prop in sum) {
                    sum[prop] += dataMap[key][prop] || 0;
                }
            }
            current.setDate(current.getDate() + 1);
        }

        // Round each property to two decimal places
        for (const prop in sum) {
            sum[prop] = Math.round(sum[prop] * 100) / 100;
        }

        // Record result using the *end* of the window
        result.push({
            [formatDate(windowEnd)]: { ...sum }
        });

        // Move cursor to the next interval
        cursor.setDate(cursor.getDate() + interval);
    }

    return result;
}
const getColor = (index) => {
    const colors = [
        '#ff6384',
        '#36a2eb',
        '#cc65fe',
        '#ffce56',
        '#4bc0c0',
        '#9966ff',
        '#ff9f40',
        '#b28dff',
        '#00d9ff',
        '#eed9d9',
        '#00c49f'
    ];
    return colors[index % colors.length];
};

const DISReport = () => {
    const [groupedData, setGroupedData] = useState([]);
    const [rawData, setRawdata] = useState([]);
    const [statusCodeWiseData, setStatusCodeWiseData] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [interval, setInterval] = useState(7);
    const [tableData, setTableData] = useState([]);
    const [minDate, setMinDate] = useState(null);
    const [maxDate, setMaxDate] = useState(null);
    const [thresholds, setThresholds] = useState({});
    const [selected, setSelected] = useState({});

    // let columnsStatusWise

    useEffect(() => {
        axios.get(process.env.REACT_APP_BIRCH_API_URL+'get_status_report/')
            .then(res => {
                console.log(res.data)
                const data = res.data.data;
                const processedResult = res.data.processedResult
                console.log(data)
                setGroupedData(data);
                setRawdata(res.data.rawData)

                const processedResultGrouped = processedResult.map(entry => {
                    const date = Object.keys(entry)[0];
                    return {
                        date,
                        ...entry[date]
                    };
                });
                console.log(processedResultGrouped)
                setStatusCodeWiseData(processedResultGrouped)


                const dates = data.map(item => Object.keys(item)[0]);
                const sortedDates = dates.sort();
                setMinDate(new Date(sortedDates[0]));
                setMaxDate(new Date(sortedDates[sortedDates.length - 1]));
                setStartDate(new Date());
                setEndDate(new Date(sortedDates[sortedDates.length - 1]));

                const initialThresholds = {};
                const initialSelected = {};
                const keys = Object.keys(data[0]?.[Object.keys(data[0])[0]] || {});
                keys.forEach(key => {
                    initialThresholds[key] = 10;
                    initialSelected[key] = false;
                });
                setThresholds(initialThresholds);
                setSelected(initialSelected);
            });
    }, []);

    const handleSubmit = () => {

        const aggregated = aggregateDataByInterval(
            groupedData,
            startDate.toISOString().split("T")[0],
            endDate.toISOString().split("T")[0],
            interval
        );
        setTableData(aggregated);
    };

    const columns = [
        { accessorKey: 'date', header: 'Date' },
        ...Object.keys(groupedData[0]?.[Object.keys(groupedData[0])[0]] || {}).map(key => ({
            accessorKey: key,
            header: key.replace(/_/g, ' ').toUpperCase()
        }))
    ];

    // columnsStatusWise = Object.keys(statusCodeWiseData[0]).map(key => ({
    //     accessorKey: key,
    //     header: key,
    // }));

    // const columnsStatusWise = [
    //     { accessorKey: 'date', header: 'Date' },
    //     ...Object.keys(statusCodeWiseData[0]?.[Object.keys(statusCodeWiseData[0])[0]] || {}).map(key => ({
    //         accessorKey: key,
    //         header: key.replace(/_/g, ' ').toUpperCase()
    //     }))
    // ];


    const columnsStatusWise = useMemo(() => [
        { accessorKey: 'date', header: 'Date', enableSorting: true, size: 100 },
        { accessorKey: '100', header: '100', enableSorting: true, size: 50 },
        { accessorKey: '125', header: '125', enableSorting: true, size: 50 },
        { accessorKey: '150', header: '150', enableSorting: true, size: 50 },
        { accessorKey: '151', header: '151', enableSorting: true, size: 50 },
        { accessorKey: '152', header: '152', enableSorting: true, size: 50 },
        { accessorKey: '153', header: '153', enableSorting: true, size: 50 },
        { accessorKey: '155', header: '155', enableSorting: true, size: 50 },
        { accessorKey: '156', header: '156', enableSorting: true, size: 50 },
        { accessorKey: '170', header: '170', enableSorting: true, size: 50 },
        { accessorKey: '175', header: '175', enableSorting: true, size: 50 },
        { accessorKey: '180', header: '180', enableSorting: true, size: 50 },
        { accessorKey: '188', header: '188', enableSorting: true, size: 50 },
        { accessorKey: '190', header: '190', enableSorting: true, size: 50 },
        { accessorKey: '198', header: '198', enableSorting: true, size: 50 },
        { accessorKey: '199', header: '199', enableSorting: true, size: 50 },
        { accessorKey: '200', header: '200', enableSorting: true, size: 50 },
        { accessorKey: '201', header: '201', enableSorting: true, size: 50 },
        { accessorKey: '225', header: '225', enableSorting: true, size: 50 },
        { accessorKey: '299', header: '299', enableSorting: true, size: 50 },
        { accessorKey: '300', header: '300', enableSorting: true, size: 50 },
        { accessorKey: '325', header: '325', enableSorting: true, size: 50 },
        { accessorKey: '350', header: '350', enableSorting: true, size: 50 },
        { accessorKey: '355', header: '355', enableSorting: true, size: 50 },
        { accessorKey: '375', header: '375', enableSorting: true, size: 50 },
        { accessorKey: '385', header: '385', enableSorting: true, size: 50 },
        { accessorKey: '390', header: '390', enableSorting: true, size: 50 },
        { accessorKey: '410', header: '410', enableSorting: true, size: 50 },
        { accessorKey: '415', header: '415', enableSorting: true, size: 50 },
        { accessorKey: '425', header: '425', enableSorting: true, size: 50 },
        { accessorKey: '427', header: '427', enableSorting: true, size: 50 },
        { accessorKey: '428', header: '428', enableSorting: true, size: 50 },
        { accessorKey: '430', header: '430', enableSorting: true, size: 50 },
        { accessorKey: '435', header: '435', enableSorting: true, size: 50 },
        { accessorKey: '450', header: '450', enableSorting: true, size: 50 },
        { accessorKey: '460', header: '460', enableSorting: true, size: 50 },
        { accessorKey: '470', header: '470', enableSorting: true, size: 50 },
        { accessorKey: '475', header: '475', enableSorting: true, size: 50 },
        { accessorKey: '480', header: '480', enableSorting: true, size: 50 },
        { accessorKey: '565', header: '565', enableSorting: true, size: 50 },
        { accessorKey: '566', header: '566', enableSorting: true, size: 50 },
        { accessorKey: '600', header: '600', enableSorting: true, size: 50 },
        { accessorKey: '601', header: '601', enableSorting: true, size: 50 },
        { accessorKey: '650', header: '650', enableSorting: true, size: 50 },
        { accessorKey: '675', header: '675', enableSorting: true, size: 50 },
        { accessorKey: '700', header: '700', enableSorting: true, size: 50 },
        { accessorKey: '750', header: '750', enableSorting: true, size: 50 },
        { accessorKey: '775', header: '775', enableSorting: true, size: 50 },
        { accessorKey: '776', header: '776', enableSorting: true, size: 50 },
        { accessorKey: '799', header: '799', enableSorting: true, size: 50 },
        { accessorKey: '800', header: '800', enableSorting: true, size: 50 }
    ], []);


    const rawDataColumn = useMemo(() => [
        { accessorKey: 'work_id', header: 'Work Id(From DB)', enableSorting: true, size: 50 },
        { accessorKey: 'railcar_id', header: 'Railcar', enableSorting: true, size: 50 },
        { accessorKey: 'status_id', header: 'Status', enableSorting: true },
        { accessorKey: 'updated_date', header: 'Date', enableSorting: true },
    ], []);

    const formatTableData = () => {
        return tableData.map(entry => {
            const date = Object.keys(entry)[0];
            return {
                date,
                ...entry[date]
            };
        });
    };

    const chartLabels = tableData.map(item => Object.keys(item)[0]);

    const chartData = {
        labels: chartLabels,
        datasets: Object.entries(thresholds).flatMap(([key, value], index) => {
            if (!selected[key]) return [];

            const lineDataset = {
                label: key,
                data: tableData.map(entry => entry[Object.keys(entry)[0]][key]),
                borderColor: getColor(index),
                backgroundColor: getColor(index),
                fill: false,
            };
            const thresholdLine = {
                label: `${key} Standard`,
                data: Array(chartLabels.length).fill(value),
                borderColor: getColor(index),
                borderDash: [10, 5],
                pointRadius: 0,
                fill: false,
            };
            return [lineDataset, thresholdLine];
        })
    };

    const handleThresholdChange = (key, val) => {
        setThresholds(prev => ({ ...prev, [key]: +val }));
    };

    const handleCheckboxChange = (key) => {
        setSelected(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="">
            <h2 className="text-2xl font-bold mb-4 mt-4">DIS Report</h2>
            <div className="flex flex-wrap gap-4 items-center mb-4">
                <div>
                    <label className="block mb-1">Start Date</label>
                    <DatePicker
                        selected={startDate}
                        onChange={(date) => {
                            if (!endDate || dayjs(date).isBefore(dayjs(endDate))) setStartDate(date);
                        }}
                        minDate={minDate}
                        maxDate={maxDate}
                        className="border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block mb-1">End Date</label>
                    <DatePicker
                        selected={endDate}
                        onChange={(date) => {
                            if (!startDate || dayjs(date).isAfter(dayjs(startDate))) setEndDate(date);
                        }}
                        minDate={minDate}
                        maxDate={maxDate}
                        className="border rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block mb-1">Interval (1-30)</label>
                    <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        min={1}
                        max={30}
                        value={interval}
                        onChange={(e) => setInterval(Math.max(1, Math.min(30, +e.target.value)))}
                    />
                </div>

            </div>

            {Object.keys(thresholds).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
                    {Object.entries(thresholds).map(([key, value], idx) => (
                        <div key={key} className="border p-2 rounded shadow-sm">
                            <label className="block text-sm font-medium mb-1">
                                <input
                                    type="checkbox"
                                    checked={selected[key]}
                                    onChange={() => handleCheckboxChange(key)}
                                    className="mr-2"
                                />
                                {key.replace(/_/g, ' ')}
                            </label>
                            <input
                                type="number"
                                className="w-full border rounded px-2 py-1"
                                value={value}
                                onChange={(e) => handleThresholdChange(key, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleSubmit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
                Submit
            </button>
            {tableData.length > 0 && (
                <>
                    <div className="mt-8 mb-8">
                        <Line data={chartData} />
                    </div>

                    <div className="mt-8 mb-8">
                        <h2 className="text-2xl font-bold mb-4">Raw Satus Update data</h2>
                        <MaterialReactTable columns={rawDataColumn} data={rawData} />
                    </div>

                    <div className="mt-8 mb-8">
                        <h2 className="text-2xl font-bold mb-4">Status grouped data by date</h2>
                        <MaterialReactTable columns={columnsStatusWise} data={statusCodeWiseData} />
                    </div>

                    <div className="mt-8 mb-8">
                        <h2 className="text-2xl font-bold mb-4">Tabular aggregated data</h2>
                        <MaterialReactTable columns={columns} data={formatTableData()} />
                    </div>

                </>
            )}
        </div>
    );
};

export default DISReport;

