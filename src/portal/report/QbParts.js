/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 12/5/2024, Thursday
 * Description:
 **/

import React, {useState, useEffect, useRef} from "react";
import readXlsxFile from "read-excel-file";
import axios from "axios";
import {MaterialReactTable} from "material-react-table";
import {toast, ToastContainer} from "react-toastify";

const QbParts = () => {
    const [file, setFile] = useState(null);
    const [data, setData] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    // Fetch data from the server
    const fetchData = async () => {
        try {
            const response = await axios.get(process.env.REACT_APP_BIRCH_API_URL + "get_qb_parts");
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

        setIsUploading(true);
        toast.info("Uploading...");

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
                setIsUploading(false);
                return;
            }

            await axios.post(process.env.REACT_APP_BIRCH_API_URL + "upload_qb_parts", { data: formattedData });
            toast.success("File uploaded successfully!");
            setFile(null); // Clear the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Clear file input field
            }
            fetchData(); // Fetch the updated data
        } catch (error) {
            console.error("Error uploading file:", error);
            toast.error("Failed to upload file!");
        } finally {
            setIsUploading(false);
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
            <h1 className="text-xl font-bold mb-4">Upload QB parts</h1>
            <div className="mb-4">
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="block mb-2"
                />
                <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`px-4 py-2 rounded ${isUploading ? "bg-gray-400" : "bg-blue-500 text-white"}`}
                >
                    {isUploading ? "Uploading..." : "Upload"}
                </button>
            </div>
            <MaterialReactTable
                columns={columns}
                data={data}
                enablePagination
                enableSorting
                enableColumnFilters
                initialState={{ pagination: { pageSize: 10 } }}
                muiTableHeadCellProps={{
                    sx: {
                        backgroundColor: "#DCE5FF",
                        fontSize: '12px',
                        padding: '10px',
                    }
                }}
                muiTableBodyCellProps={{
                    sx: {
                        fontSize: '12px',
                        padding: '10px',
                    }
                }}
                muiTableBodyRowProps={({ row, table }) => ({
                    sx: {
                        backgroundColor:
                            table.getRowModel().flatRows.indexOf(row) % 2 === 0
                                ? "#F9F9F9"
                                : "#ffffff", // Use table row index to alternate row colors
                    },
                })}
            />
            <ToastContainer />
        </div>
    );
};

export default QbParts;
