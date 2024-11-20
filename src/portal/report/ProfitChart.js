/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 11/18/2024, Monday
 * Description:
 **/

import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import Select from "react-select";
import {round2Dec} from "../../utils/NumberHelper";
import LineGraph from "../../components/LineGraph";
import {end} from "react-beautiful-dnd/src/view/key-codes";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ProfitChart = () => {
    const [owners, setOwners] = useState([]);
    const [selectedOwners, setSelectedOwners] = useState(Array(5).fill(null)); //
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [labels, setLabels] = useState([]);
    const [datasets, setDatasets] = useState([]);
    const [loading, setLoading] = useState(false);

    const [allData,setAllData] = useState([])

    // Fetch owners from the API
    useEffect(() => {
        const fetchOwners = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_BIRCH_API_URL}get_all_owners/`
                );

                // Map API data to React Select format
                const ownerOptions = response.data.map((owner) => ({
                    value: owner.id,
                    label: owner.name,
                }));

                setOwners(ownerOptions);
            } catch (error) {
                console.error('Error fetching owners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOwners();
    }, []);

    const handleOwnerChange = (index, value) => {
        const updatedSelectedOwners = [...selectedOwners];
        updatedSelectedOwners[index] = value;
        setSelectedOwners(updatedSelectedOwners);
    };



    const aggregateData = (rawData, startDate, endDate) => {
        const groupedData = {};
        const DAY_MS = 86400000; // Milliseconds in a day
        const rangeDays = (endDate - startDate) / DAY_MS;
        const interval = rangeDays <= 30 ? 1 : rangeDays <= 90 ? 10 : rangeDays <= 180 ? 15 : 30;

        rawData.forEach((item) => {
            const date = new Date(item.invoice_date);
            if (date >= startDate && date <= endDate) {
                const companyKey = item.name;
                const intervalStart = Math.floor((date - startDate) / (interval * DAY_MS)) * interval * DAY_MS + startDate.getTime();
                const formattedInterval = new Date(intervalStart).toISOString().split("T")[0];

                if (!groupedData[companyKey]) {
                    groupedData[companyKey] = {};
                }
                if (!groupedData[companyKey][formattedInterval]) {
                    groupedData[companyKey][formattedInterval] = 0;
                }
                groupedData[companyKey][formattedInterval] += parseFloat(item.total_cost);
            }
        });

        return groupedData;
    };
    // const handleGenerate = async () => {
    //     if (!startDate || !endDate) {
    //         alert('Please select both start and end dates.');
    //         return;
    //     }
    //
    //     if (selectedOwners.every((owner) => !owner)) {
    //         alert('Please select at least one owner.');
    //         return;
    //     }
    //
    //     try {
    //         setLoading(true);
    //         const payload = {
    //             owners: selectedOwners.filter((id) => id), // Remove null values
    //             startDate,
    //             endDate,
    //         };
    //
    //         console.log(startDate)
    //         console.log(endDate)
    //
    //         const response = await axios.post(
    //             `${process.env.REACT_APP_BIRCH_API_URL}generate_revenue_by_customer_report`,
    //             payload
    //         );
    //
    //         // const data = response.data.data;
    //         // console.log(data)
    //
    //
    //         const data = [
    //             {
    //                 "id": 7,
    //                 "name": "GREENBRIER MANAGEMENT SERVICES",
    //                 "railcar_id": "GBRX714198",
    //                 "invoice_date": "10/15/2024",
    //                 "total_cost": "4110.71"
    //             },
    //             {
    //                 "id": 7,
    //                 "name": "GREENBRIER MANAGEMENT SERVICES",
    //                 "railcar_id": "CBTX781028",
    //                 "invoice_date": "10/21/2024",
    //                 "total_cost": "5204.42"
    //             },
    //             {
    //                 "id": 29,
    //                 "name": "DARLING INGREDIENTS INC C/O RSI",
    //                 "railcar_id": "GATX090271",
    //                 "invoice_date": "10/18/2024",
    //                 "total_cost": "5535.71"
    //             },
    //             {
    //                 "id": 29,
    //                 "name": "DARLING INGREDIENTS INC C/O RSI",
    //                 "railcar_id": "CTCX720584",
    //                 "invoice_date": "10/21/2024",
    //                 "total_cost": "6960.71"
    //             },
    //             {
    //                 "id": 29,
    //                 "name": "DARLING INGREDIENTS INC C/O RSI",
    //                 "railcar_id": "GBRX714198",
    //                 "invoice_date": "10/25/2024",
    //                 "total_cost": "4110.71"
    //             }
    //         ]
    //
    //
    //
    //         // Group data by owner
    //         let groupedData = data.reduce((acc, curr) => {
    //             const owner = curr.name;
    //             if (!acc[owner]) {
    //                 acc[owner] = [];
    //             }
    //             acc[owner].push(curr);
    //             return acc;
    //         }, {});
    //
    //         groupedData = sortByDateAndCost(groupedData)
    //         // Limit to a maximum of 5 owners
    //         const ownerNames = Object.keys(groupedData).slice(0, 5);
    //
    //         if (ownerNames.length === 0) {
    //             alert('No data available for the selected owners.');
    //             setLoading(false);
    //             return;
    //         }
    //
    //         // Extract and sort unique dates
    //         const uniqueDates = Array.from(
    //             new Set(data.map((item) => item.invoice_date))
    //         ).sort((a, b) => new Date(a) - new Date(b)); // Proper date sorting
    //         // Create datasets for each owner
    //         const newDatasets = ownerNames.map((owner, index) => {
    //             const ownerData = groupedData[owner];
    //
    //             // Extract data points sequentially based on invoice_date
    //             const sequentialData = ownerData.map((item) => ({
    //                 x: item.invoice_date, // Use the invoice_date as the X-axis label
    //                 y: parseFloat(item.total_cost), // Use the total_cost as the Y-axis value
    //             }));
    //
    //             // Dynamic colors for up to 5 owners
    //             const colors = [
    //                 { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)' },
    //                 { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)' },
    //                 { border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)' },
    //                 { border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)' },
    //                 { border: 'rgba(153, 102, 255, 1)', background: 'rgba(153, 102, 255, 0.2)' },
    //             ];
    //
    //             return {
    //                 label: owner,
    //                 data: sequentialData, // Sequential data points
    //                 borderColor: colors[index % colors.length].border,
    //                 backgroundColor: colors[index % colors.length].background,
    //                 borderWidth: 2,
    //                 tension: 0, // Straight lines
    //                 spanGaps: true, // Bridge gaps if there are missing points
    //                 parsing: false, // Disable auto-parsing to use x/y pairs
    //             };
    //         });
    //
    //         const sequentialLabels = [...new Set(data.map((item) => item.invoice_date))].sort(
    //             (a, b) => new Date(a) - new Date(b)
    //         );
    //         setLabels(['01/15/2024','10/15/2024', '10/18/2024', '10/21/2024', '10/25/2024']);
    //         setDatasets(newDatasets);
    //         setLoading(false);
    //
    //
    //         console.log(sequentialLabels)
    //         console.log(newDatasets)
    //
    //         console.log(startDate.toLocaleDateString())
    //         console.log(endDate.toLocaleDateString())
    //     } catch (error) {
    //         console.error('Error generating report:', error);
    //         alert(error.response?.data?.error || 'Failed to generate the report!');
    //         setLoading(false);
    //     }
    // };


    function generateDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end - start;
        const diffDays = Math.ceil(diffTime / (1000 * 3600 * 24));

        let dateRange = [];

        // Case 1: If the difference is 30 days or less, return daily range
        if (diffDays <= 30) {
            let currentDate = new Date(start);
            while (currentDate <= end) {
                dateRange.push(formatDate(currentDate));
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }
        // Case 2: If the difference is between 3 months (90 days) and 6 months (180 days), return every 15 days
        else if (diffDays > 90 && diffDays <= 180) {
            let currentDate = new Date(start);
            while (currentDate <= end) {
                dateRange.push(formatDate(currentDate));
                currentDate.setDate(currentDate.getDate() + 15);
            }
        }
        // Case 3: If the difference is more than 6 months, return every 30 days
        else {
            let currentDate = new Date(start);
            while (currentDate <= end) {
                dateRange.push(formatDate(currentDate));
                currentDate.setDate(currentDate.getDate() + 30);
            }
        }

        return dateRange;
    }

    function formatDate(date) {
        const month = date.getMonth() + 1;  // Months are zero-based, so add 1
        const day = date.getDate();
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }


    //original
    const handleGenerate = async () => {

        try {
            setLoading(true);
            const payload = {
                owners: selectedOwners.filter((id) => id), // Remove null values
                startDate,
                endDate,
            };

            const response = await axios.post(
                `${process.env.REACT_APP_BIRCH_API_URL}generate_revenue_by_customer_report`,
                payload
            );

            const data = response.data.data;
            let groupedData = data.reduce((acc, curr) => {
                const owner = curr.name;
                if (!acc[owner]) {
                    acc[owner] = [];
                }
                acc[owner].push(curr);
                return acc;
            }, {});


            groupedData = sortByDateAndCost(groupedData)
            // Limit to a maximum of 5 owners
            const ownerNames = Object.keys(groupedData).slice(0, 5);

            if (ownerNames.length === 0) {
                alert('No data available for the selected owners.');
                setLoading(false);
                return;
            }

            // Extract and sort unique dates
            const uniqueDates = Array.from(
                new Set(data.map((item) => item.invoice_date))
            ).sort((a, b) => new Date(a) - new Date(b)); // Proper date sorting
            // Create datasets for each owner
            const newDatasets = ownerNames.map((owner, index) => {
                const ownerData = groupedData[owner];

                // Extract data points sequentially based on invoice_date
                const sequentialData = ownerData.map((item) => ({
                    x: item.invoice_date, // Use the invoice_date as the X-axis label
                    y: parseFloat(item.total_cost), // Use the total_cost as the Y-axis value
                }));

                // Dynamic colors for up to 5 owners
                const colors = [
                    { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)' },
                    { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)' },
                    { border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)' },
                    { border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)' },
                    { border: 'rgba(153, 102, 255, 1)', background: 'rgba(153, 102, 255, 0.2)' },
                ];

                return {
                    label: owner,
                    data: sequentialData, // Sequential data points
                    borderColor: colors[index % colors.length].border,
                    backgroundColor: colors[index % colors.length].background,
                    borderWidth: 2,
                    tension: 0, // Straight lines
                    spanGaps: true, // Bridge gaps if there are missing points
                    parsing: false, // Disable auto-parsing to use x/y pairs
                };
            });

            const sequentialLabels = [...new Set(data.map((item) => item.invoice_date))].sort(
                (a, b) => new Date(a) - new Date(b)
            );
            setLabels(sequentialLabels);
            setDatasets(newDatasets);
            setLoading(false);

        } catch (error) {
            console.error('Error generating report:', error);
            alert(error.response?.data?.error || 'Failed to generate the report!');
            setLoading(false);
        }
    };


    function makeLabelsUniform(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const result = [];

        // Calculate the difference in days
        const differenceInMs = end - start;
        const differenceInDays = Math.ceil(differenceInMs / (1000 * 60 * 60 * 24));

        // Determine the interval dynamically
        let intervalDays;
        if (differenceInDays <= 30) {
            intervalDays = 1; // Less than 1 month: 1 day intervals
        } else if (differenceInDays <= 90) {
            intervalDays = 3; // Less than 3 months: 3 day intervals
        } else if (differenceInDays <= 180) {
            intervalDays = 10; // Between 3 and 6 months: 10 day intervals
        } else {
            intervalDays = 15; // More than 6 months: 15 day intervals
        }

        // Generate uniform labels with the determined interval
        while (start <= end) {
            const formattedDate = `${start.getMonth() + 1}/${start.getDate()}/${start.getFullYear()}`;
            result.push(formattedDate);
            start.setDate(start.getDate() + intervalDays);
        }

        return result;
    }

    // const sortByDateAndCost = (data) => {
    //     for (const company in data) {
    //         data[company].sort((a, b) => {
    //             const dateA = new Date(a.invoice_date);
    //             const dateB = new Date(b.invoice_date);
    //
    //             if (dateA - dateB !== 0) {
    //                 return dateA - dateB; // Sort by date first
    //             } else {
    //                 return parseFloat(a.total_cost) - parseFloat(b.total_cost); // If dates are equal, sort by total cost
    //             }
    //         });
    //     }
    //     return data;
    // };

    //It is also merging in same date
    const sortByDateAndCost = (data) => {
        const result = {};

        for (const company in data) {
            // Group by `invoice_date`
            const grouped = data[company].reduce((acc, curr) => {
                const date = curr.invoice_date;
                if (!acc[date]) {
                    acc[date] = { ...curr, total_cost: parseFloat(curr.total_cost) };
                } else {
                    acc[date].total_cost += parseFloat(curr.total_cost);
                }
                return acc;
            }, {});

            // Convert grouped object back to array and sort
            result[company] = Object.values(grouped).sort((a, b) => {
                const dateA = new Date(a.invoice_date);
                const dateB = new Date(b.invoice_date);

                return dateA - dateB; // Sort by date
            });
        }

        return result;
    };



    const options = {
        responsive: true,
        backgroundColor:"#6c1919",
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Profit Over Time by Owner',
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Invoice Date',
                },
            },
            y: {
                title: {
                    display: true,
                    text: 'Total Revenue',
                },
                beginAtZero: true, // Adjust as needed
            },
        },
    };


    const chartData = {
        labels,
        datasets,
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 mt-2">Revenue by Customer</h1>
            <div className="p-4">


                {/* Select Menus */}
                <div className="grid gap-1 grid-cols-5 mb-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="p-2">
                            <Select
                                value={
                                    owners.find(
                                        (option) => option.value === selectedOwners[index]
                                    ) || null
                                } // Find the matching selected option or default to null
                                onChange={(selectedOption) =>
                                    handleOwnerChange(index, selectedOption?.value)
                                }
                                options={owners}
                                placeholder="Select Owner"
                                isClearable
                                className="border rounded"
                            />
                        </div>
                    ))}
                </div>

                {/* Date Pickers */}
                <div className="flex gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Start Date</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">End Date</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            className="p-2 border rounded w-full"
                        />
                    </div>
                </div>

                {/* Generate Button */}
                <button
                    onClick={handleGenerate}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    disabled={loading}
                >
                    {loading ? 'Generating...' : 'Generate'}
                </button>


                {datasets.length > 0 && (
                    <div className="mt-8">
                        <Line data={chartData} options={options} />
                    </div>
                )}

                {/*<LineGraph data={allData} />*/}
            </div>
        </div>
    );
};

export default ProfitChart;

