/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 12/5/2024, Thursday
 * Description:
 **/

import React, { useState, useEffect } from "react";
import readXlsxFile from "read-excel-file";
import axios from "axios";
import {MaterialReactTable} from "material-react-table";

const QbParts = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);

    // Fetch data from the server
    const fetchData = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL+"get_qb_parts");
            setData(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
            alert("Failed to fetch data.");
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file!");
            return;
        }

        try {
            const rows = await readXlsxFile(file);

            // Process rows: Skip header and ignore empty rows or rows with empty first column
            const formattedData = rows
                .slice(1) // Skip the first row (header)
                .filter((row) => row && String(row[0] || "").trim()) // Ignore empty rows or rows with empty first column
                .map((row) => ({
                    code: String(row[0] || "").trim(), // Ensure code is a trimmed string
                    description: row[1] ? String(row[1]) : null,
                    on_hand: row[2] ? parseFloat(row[2]) : 0,
                    unit: row[3] ? String(row[3]) : null,
                    on_po: row[4] ? parseFloat(row[4]) : 0,
                    avg_cost: row[5] ? parseFloat(row[5]) : 0,
                    asset_value: row[6] ? parseFloat(row[6]) : 0,
                }));

            if (formattedData.length === 0) {
                alert("No valid data found in the file.");
                return;
            }
            console.log(formattedData)

            await axios.post(process.env.REACT_APP_BIRCH_API_URL+"upload_qb_parts", { data: formattedData });
            alert("File uploaded successfully!");
            fetchData(); // Fetch the updated data
        } catch (error) {
            console.error("Error uploading file:", error);
            alert("Failed to upload file!");
        }
    };


    const columns = [
        { accessorKey: "code", header: "Code" },
        { accessorKey: "description", header: "Description" },
        { accessorKey: "on_hand", header: "On Hand" },
        { accessorKey: "unit", header: "Unit" },
        { accessorKey: "on_po", header: "On PO" },
        { accessorKey: "avg_cost", header: "Avg Cost" },
        { accessorKey: "asset_value", header: "Asset Value" },
    ];

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Upload Excel File</h1>
            <div className="mb-4">
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="block mb-2"
                />
                <button
                    onClick={handleUpload}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                    Upload
                </button>
            </div>
            <MaterialReactTable
                columns={columns}
                data={data}
                enablePagination
                enableSorting
                enableColumnFilters
                initialState={{ pagination: { pageSize: 10 } }}
            />
        </div>
    );
};

export default QbParts;
