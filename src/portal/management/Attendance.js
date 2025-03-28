/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 2/19/2025, Wednesday
 * Description:
 **/



import React, { useState } from "react";
import {MaterialReactTable} from "material-react-table";
import axios from "axios";
import * as XLSX from "xlsx";


const Attendance = () => {
    const [date, setDate] = useState(new Date());
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingRow, setEditingRow] = useState(null);
    const [editedData, setEditedData] = useState({});

    // Fetch attendance data from the server
    const fetchAttendance = async () => {
        setLoading(true);

        const localDate = new Date(date.toLocaleDateString());

        // Get start and end of the local day
        const startOfDayLocal = new Date(localDate.setHours(0, 0, 0, 0));
        const endOfDayLocal = new Date(localDate.setHours(23, 59, 59, 999));

        // Convert to UTC
        const startOfDayUTC = new Date(startOfDayLocal.getTime() + startOfDayLocal.getTimezoneOffset() * 60000);
        const endOfDayUTC = new Date(endOfDayLocal.getTime() + endOfDayLocal.getTimezoneOffset() * 60000);

        try {
            const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}attendance?start_date=${startOfDayUTC.toISOString()}&end_date=${endOfDayUTC.toISOString()}`);

            setData(response.data);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            setData([]);
        }
        setLoading(false);
    };

    // Show full-size image
    const handleImageClick = (imageUrl) => setSelectedImage(imageUrl);

    const handleCloseModal = () => setSelectedImage(null);

    const handleEdit = (row) => {
        setEditingRow(row.id);

        const startDate = new Date(row.start_time);
        const endDate = row.end_time ? new Date(row.end_time) : null;

        setEditedData({
            start_date: startDate.toISOString().split("T")[0],
            start_time: startDate.toTimeString().slice(0, 5),
            end_date: endDate ? endDate.toISOString().split("T")[0] : "",
            end_time: endDate ? endDate.toTimeString().slice(0, 5) : "",
        });
    };

    const handleCancel = () => {
        setEditingRow(null);
        setEditedData({});
    };

    const handleInputChange = (e, field) => {
        const { value } = e.target;
        setEditedData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async (id) => {
        const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        try {
            const { start_date, start_time, end_date, end_time } = editedData;
            const localStartDateTime = `${start_date}T${start_time}:00`;
            const localEndDateTime = end_date && end_time ? `${end_date}T${end_time}:00` : null;
            const startDateObj = new Date(localStartDateTime);
            const endDateObj = localEndDateTime ? new Date(localEndDateTime) : null;
            const updatedData = {
                start_time: startDateObj.toISOString(), // UTC ISO
                end_time: endDateObj ? endDateObj.toISOString() : null, // UTC ISO or null
            };

            await axios.put(`${process.env.REACT_APP_BIRCH_API_URL}attendance/${id}`, updatedData);
            fetchAttendance();
            setEditingRow(null);
        } catch (error) {
            console.error("Error updating record:", error);
        }
    };

    const formatTime = (utcTime) => {
        return utcTime ? new Date(utcTime).toLocaleString() : "";
    };

    const calculateTotalTime = (start, end) => {
        if (!end) return "";
        const diffMs = new Date(end) - new Date(start);
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };


    const handleExportExcel = async () => {
        const wb = XLSX.utils.book_new();

        // Convert images to base64
        const convertImageToBase64 = async (imageUrl) => {
            console.log(imageUrl)
            if (!imageUrl) return "";
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        };

        // Convert times to local time and fetch images
        const wsData = await Promise.all(
            data.map(async (row) => ({
                Name: row.crew_name,
                "Start Time": new Date(row.start_time).toLocaleString(),
                "End Time":row.end_time==null?"": new Date(row.end_time).toLocaleString(),
                "Total Time": row.end_time==null?"": calculateTotalTime(row.start_time, row.end_time),


            }))
        );

        const ws = XLSX.utils.json_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

        // Save file
        XLSX.writeFile(wb, "Attendance report "+new Date(date.toLocaleString())+".xlsx");
    };


    const columns = [
        { accessorKey: "crew_name", header: "Name" },
        {
            accessorKey: "start_time",
            header: "Start Time",
            Cell: ({ row }) =>
                editingRow === row.original.id ? (
                    <div className="flex flex-wrap gap-2 items-center">
                        <input
                            type="date"
                            value={editedData.start_date}
                            onChange={(e) => handleInputChange(e, "start_date")}
                            className="border border-gray-300 rounded-lg p-2 w-36"
                        />
                        <input
                            type="time"
                            value={editedData.start_time}
                            onChange={(e) => handleInputChange(e, "start_time")}
                            className="border border-gray-300 rounded-lg p-2 w-28"
                        />
                    </div>
                ) : (
                    formatTime(row.original.start_time)
                ),
        },
        {
            accessorKey: "end_time",
            header: "End Time",
            Cell: ({ row }) =>
                editingRow === row.original.id ? (
                    <div className="flex flex-wrap gap-2 items-center">
                        <input
                            type="date"
                            value={editedData.end_date}
                            onChange={(e) => handleInputChange(e, "end_date")}
                            className="border border-gray-300 rounded-lg p-2 w-36"
                        />
                        <input
                            type="time"
                            value={editedData.end_time}
                            onChange={(e) => handleInputChange(e, "end_time")}
                            className="border border-gray-300 rounded-lg p-2 w-28"
                        />
                    </div>
                ) : (
                    formatTime(row.original.end_time)
                ),
        },
        {
            accessorKey: "total_time",
            header: "Total Time",
            Cell: ({ row }) => calculateTotalTime(row.original.start_time, row.original.end_time),
        },
        {
            accessorKey: "entry_pic",
            header: "Entry Pic",
            Cell: ({ row }) =>
                row.original.entry_pic && (
                    <img
                        src={row.original.entry_pic}
                        alt="Entry"
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                        onClick={() => handleImageClick(row.original.entry_pic)}
                    />
                ),
        },
        {
            accessorKey: "out_pic",
            header: "Exit Pic",
            Cell: ({ row }) =>
                row.original.out_pic && (
                    <img
                        src={row.original.out_pic}
                        alt="Exit"
                        className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                        onClick={() => handleImageClick(row.original.out_pic)}
                    />
                ),
        },
        {
            header: "Actions",
            Cell: ({ row }) =>
                editingRow === row.original.id ? (
                    <div className="flex flex-wrap gap-2">
                        <button className="bg-green-500 text-white px-3 py-2 rounded-lg" onClick={() => handleSave(row.original.id)}>
                            Save
                        </button>
                        <button className="bg-red-500 text-white px-3 py-2 rounded-lg" onClick={handleCancel}>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button className="bg-blue-500 text-white px-3 py-2 rounded-lg" onClick={() => handleEdit(row.original)}>
                        Edit
                    </button>
                ),
        },
    ];


    const styles = `
        .container { padding: 20px; font-family: Arial, sans-serif; }
        .header { display: flex; gap: 10px; margin-bottom: 20px; align-items: center; }
        .date-picker { padding: 8px; font-size: 16px; border-radius: 5px; border: 1px solid #ccc; }
        .btn { padding: 8px 15px; font-size: 14px; border: none; cursor: pointer; border-radius: 5px; }
        .btn-edit { background-color: #007bff; color: white; }
        .btn-save { background-color: #28a745; color: white; }
        .btn-cancel { background-color: #dc3545; color: white; }
        .btn-fetch { background-color: #17a2b8; color: white; }
        .input-field { padding: 6px; font-size: 14px; border-radius: 4px; border: 1px solid #ccc; }
        .image-thumbnail { width: 50px; height: 50px; cursor: pointer; border-radius: 5px; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; }
        .modal-content { background: white; padding: 15px; border-radius: 8px; position: relative; max-width: 90%; max-height: 90%; }
        .modal-close { position: absolute; top: 10px; right: 10px; font-size: 24px; cursor: pointer; }
        .modal-image { max-width: 100%; max-height: 80vh; }
    `;
    document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

    return (
        <div className="container">
            <div className="header">
                <input
                    type="date"
                    value={date.toISOString().split("T")[0]}
                    onChange={(e) => setDate(new Date(e.target.value))}
                    className="date-picker"
                />
                <button className="btn btn-fetch" onClick={fetchAttendance} disabled={loading}>
                    {loading ? "Loading..." : "Fetch Attendance"}
                </button>
            </div>

            <div className="flex justify-between items-center mb-2">
                <button className="btn btn-export" onClick={handleExportExcel}>
                    Export to Excel
                </button>
                <span className="text-lg font-semibold">Total Entries: {data.length}</span>
            </div>

            <MaterialReactTable
                columns={columns}
                data={data}
                state={{ isLoading: loading }}
                enablePagination={false}
                enableStickyHeader={true}
                enableRowVirtualization={true}
                enableColumnResizing={true}
            />

            <div className="flex justify-between items-center mb-2 mt-4">
                <button className="btn btn-export" onClick={handleExportExcel}>
                    Export to Excel
                </button>
                <span className="text-lg font-semibold">Total Entries: {data.length}</span>
            </div>

            {selectedImage && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-white text-3xl font-bold focus:outline-none"
                            onClick={handleCloseModal}
                        >
                            &times;
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full Size"
                            className="max-w-full max-h-screen object-contain rounded-lg shadow-lg"
                        />
                    </div>
                </div>

            )}
        </div>
    );
};

export default Attendance;


