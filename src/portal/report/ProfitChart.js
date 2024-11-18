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
    const [selectedOwners, setSelectedOwners] = useState(Array(5).fill(null));
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
                setOwners(response.data);
            } catch (error) {
                console.error('Error fetching owners:', error);
            }
        };
        fetchOwners();
    }, []);

    const handleOwnerChange = (index, value) => {
        const updatedOwners = [...selectedOwners];
        updatedOwners[index] = value;
        setSelectedOwners(updatedOwners);
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
                process.env.REACT_APP_BIRCH_API_URL+"generate_revenue_by_customer_report",
                payload
            );

            const data = response.data.data;
            //console.log(resp)
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
            if (ownerNames.length < 2) {
                throw new Error('The data must contain at least 2 owners.');
            }

            // Extract unique dates for labels
            const uniqueDates = Array.from(
                new Set(data.map((item) => item.invoice_date))
            ).sort();

            // Create datasets for each owner
            const newDatasets = ownerNames.map((owner, index) => {
                const ownerData = groupedData[owner];
                const totalCosts = uniqueDates.map((date) => {
                    const entry = ownerData.find((item) => item.invoice_date === date);
                    return entry ? entry.total_cost : null; // Fill missing dates with null
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
                    tension: 0.4,
                };
            });

            // Update state
            setLabels(uniqueDates);
            setDatasets(newDatasets);
            setLoading(false);
            alert('Report generated successfully!');
        } catch (error) {
            console.error('Error generating report:', error);
            alert(error.response?.data?.error || 'Failed to generate the report!');
            setLoading(false);
        }
    };

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
                beginAtZero: false,
            },
        },
    };

    const chartData = {
        labels,
        datasets,
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 mt-2">User Management</h1>
            <div className="p-4">
                <h1 className="text-lg font-bold mb-4">Owner Report Generator</h1>

                {/* Select Menus */}
                <div className="grid gap-1 grid-cols-5 mb-4">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <select
                            key={index}
                            value={selectedOwners[index] || ''}
                            onChange={(e) => handleOwnerChange(index, e.target.value)}
                            className="p-2 border rounded"
                        >
                            <option value="">Select Owner</option>
                            {owners.map((owner) => (
                                <option key={owner.id} value={owner.id}>
                                    {owner.name}
                                </option>
                            ))}
                        </select>
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

