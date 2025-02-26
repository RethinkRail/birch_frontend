/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 2/19/2025, Wednesday
 * Description:
 **/



import React, { useState } from "react";
import axios from "axios";
import {MaterialReactTable} from "material-react-table";

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
        try {
            const formattedDate = date.toISOString().split("T")[0] + "T00:00:00Z";
            const response = await axios.get(`${process.env.REACT_APP_BIRCH_API_URL}attendance?start_date=${formattedDate}`);
            setData(response.data);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            setData([]);
        }
        setLoading(false);
    };

    // Handle image click to show full-size image in modal
    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
    };

    // Close modal
    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    // Handle Edit button click
    const handleEdit = (row) => {
        setEditingRow(row.id);
        setEditedData({
            start_time: new Date(row.start_time).toISOString().slice(0, 16),
            end_time: row.end_time ? new Date(row.end_time).toISOString().slice(0, 16) : "",
        });
    };

    // Handle Cancel button click
    const handleCancel = () => {
        setEditingRow(null);
        setEditedData({});
    };

    // Handle input changes
    const handleInputChange = (e, field) => {
        let value = e.target.value;
        if (field === "end_time" && !value) {
            setEditedData((prev) => ({ ...prev, [field]: "", out_pic: null }));
        } else {
            setEditedData((prev) => ({ ...prev, [field]: value }));
        }
    };

    // Handle Save button click
    const handleSave = async (id) => {
        try {
            await axios.put(`${process.env.REACT_APP_BIRCH_API_URL}attendance/${id}`, editedData);
            fetchAttendance();
            setEditingRow(null);
        } catch (error) {
            console.error("Error updating record:", error);
        }
    };

    // Format UTC time to local time
    const formatTime = (utcTime) => {
        return utcTime ? new Date(utcTime).toLocaleString() : "";
    };

    // Calculate total time difference
    const calculateTotalTime = (start, end) => {
        if (!end) return "";
        const diffMs = new Date(end) - new Date(start);
        const hours = Math.floor(diffMs / 3600000);
        const minutes = Math.floor((diffMs % 3600000) / 60000);
        return `${hours}h ${minutes}m`;
    };

    const columns = [
        { accessorKey: "crew_name", header: "Name" },
        {
            accessorKey: "start_time",
            header: "Start Time",
            Cell: ({ row }) =>
                editingRow === row.original.id ? (
                    <input
                        type="datetime-local"
                        value={editedData.start_time}
                        onChange={(e) => handleInputChange(e, "start_time")}
                        required
                        className="input-field"
                    />
                ) : (
                    formatTime(row.original.start_time)
                ),
        },
        {
            accessorKey: "end_time",
            header: "End Time",
            Cell: ({ row }) =>
                editingRow === row.original.id ? (
                    <input
                        type="datetime-local"
                        value={editedData.end_time}
                        onChange={(e) => handleInputChange(e, "end_time")}
                        className="input-field"
                    />
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
                        className="image-thumbnail"
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
                        className="image-thumbnail"
                        onClick={() => handleImageClick(row.original.out_pic)}
                    />
                ),
        },
        {
            header: "Actions",
            Cell: ({ row }) =>
                editingRow === row.original.id ? (
                    <>
                        <button className="btn btn-save mb-1 w-20" onClick={() => handleSave(row.original.id)}>Save</button>
                        <button className="btn btn-cancel w-20" onClick={handleCancel}>Cancel</button>
                    </>
                ) : (
                    <button className="btn btn-edit" onClick={() => handleEdit(row.original)}>Edit</button>
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
    .btn-cancel { background-color: #dc3545; color: white; margin-left: 5px; }
    .btn-fetch { background-color: #17a2b8; color: white; }
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

            <MaterialReactTable columns={columns} data={data} state={{ isLoading: loading }} />

            {selectedImage && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="modal-close" onClick={handleCloseModal}>&times;</span>
                        <img src={selectedImage} alt="Full Size" className="modal-image" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;


