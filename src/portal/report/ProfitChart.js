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


    const handleGenerate = async () => {
        if (!startDate || !endDate) {
            alert('Please select both start and end dates.');
            return;
        }

        if (selectedOwners.every((owner) => !owner)) {
            alert('Please select at least one owner.');
            return;
        }

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
            console.log(data)
            // Group data by owner
            const groupedData = data.reduce((acc, curr) => {
                const owner = curr.name;
                if (!acc[owner]) {
                    acc[owner] = [];
                }
                acc[owner].push(curr);
                return acc;
            }, {});

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

                // Ensure data aligns with sorted uniqueDates
                const totalCosts = uniqueDates.map((date) => {
                    const entry = ownerData.find((item) => item.invoice_date === date);
                    return entry ?entry.total_cost : 0; // Fill missing dates with 0
                });

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
                    data: totalCosts,
                    borderColor: colors[index % colors.length].border,
                    backgroundColor: colors[index % colors.length].background,
                    borderWidth: 2,
                    tension: 0, // Straight lines
                    spanGaps: false, // Ensure gaps are connected
                };
            });

            // Update state
            //setLabels(uniqueDates);
            setDatasets(newDatasets);
            setLoading(false);
            const uniformLabels = makeLabelsUniform(startDate.toLocaleDateString(), endDate.toLocaleDateString(), 2);

            setLabels(uniformLabels)

            console.log(uniqueDates)
            console.log(newDatasets)

            console.log(startDate.toLocaleDateString())
            console.log(endDate.toLocaleDateString())
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
    //         const response = await axios.post(
    //             `${process.env.REACT_APP_BIRCH_API_URL}generate_revenue_by_customer_report`,
    //             payload
    //         );
    //
    //         const data = response.data.data;
    //
    //         // Generate continuous daily dates from startDate to endDate
    //         const continuousDates = [];
    //         let currentDate = new Date(startDate);
    //         const end = new Date(endDate);
    //
    //         while (currentDate <= end) {
    //             continuousDates.push(currentDate.toISOString().split('T')[0]); // Format: YYYY-MM-DD
    //             currentDate.setDate(currentDate.getDate() + 1); // Increment by 1 day
    //         }
    //
    //         // Group data by owner
    //         const groupedData = data.reduce((acc, curr) => {
    //             const owner = curr.name;
    //             if (!acc[owner]) {
    //                 acc[owner] = [];
    //             }
    //             acc[owner].push(curr);
    //             return acc;
    //         }, {});
    //
    //         // Map data to datasets aligned with continuousDates
    //         const newDatasets = Object.entries(groupedData).map(([owner, ownerData], index) => {
    //             // Create a map of invoice_date to total_cost
    //             const dataMap = ownerData.reduce((map, item) => {
    //                 // Ensure date format matches continuousDates
    //                 const formattedDate = new Date(item.invoice_date).toISOString().split('T')[0];
    //                 map[formattedDate] = parseFloat(item.total_cost) || 0;
    //                 return map;
    //             }, {});
    //
    //             // Fill dataset with total costs for each day in continuousDates
    //             const totalCosts = continuousDates.map((date) => dataMap[date] || 0);
    //
    //             // Assign colors for each dataset
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
    //                 data: totalCosts,
    //                 borderColor: colors[index % colors.length].border,
    //                 backgroundColor: colors[index % colors.length].background,
    //                 borderWidth: 2,
    //                 tension: 0,
    //                 spanGaps: false,
    //             };
    //         });
    //
    //         // Update chart state
    //         setLabels(continuousDates);
    //         setDatasets(newDatasets);
    //         setLoading(false);
    //     } catch (error) {
    //         console.error('Error generating report:', error);
    //         alert(error.response?.data?.error || 'Failed to generate the report!');
    //         setLoading(false);
    //     }
    // };

    const options = {
        responsive: true,
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

                {/* Chart */}
                {datasets.length > 0 && (
                    <div className="mt-8">
                        <Line data={chartData} options={options} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfitChart;

