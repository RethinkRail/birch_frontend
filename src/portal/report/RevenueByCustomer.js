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
import RevenueChart from "../../components/RevenueChart";


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

const RevenueByCustomer = () => {
    const [owners, setOwners] = useState([]);
    const [selectedOwners, setSelectedOwners] = useState(Array(5).fill(null)); //
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

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
            setAllData(data)

            setLoading(false);

        } catch (error) {
            console.error('Error generating report:', error);
            alert(error.response?.data?.error || 'Failed to generate the report!');
            setLoading(false);
        }
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


                {allData.length > 0 && (
                    <div className="mt-8">
                        <RevenueChart data={allData} startDate={startDate} endDate={endDate}  />
                    </div>
                )}


            </div>
        </div>
    );
};

export default RevenueByCustomer;

