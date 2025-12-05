/**
 * @author : Mithun Sarker
 * @mailto : mithun@ihrail.com
 * @created : 12/18/2024, Wednesday
 * Description:
 **/


import React, { useState } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { FaArrowDown } from "react-icons/fa";

const PartReportTable = ({ initialData }) => {
    // --- Stock Status Popup ---
    const [stockPopupOpen, setStockPopupOpen] = useState(false);
    const [stockData, setStockData] = useState([]);
    const [stockLoading, setStockLoading] = useState(false);
    const [stockError, setStockError] = useState("");

    // --- Estimated Quantity Popup ---
    const [estimatedPopupOpen, setEstimatedPopupOpen] = useState(false);
    const [estimatedData, setEstimatedData] = useState([]);
    const [estimatedLoading, setEstimatedLoading] = useState(false);
    const [estimatedError, setEstimatedError] = useState("");

    // --- Fetch Stock Status ---
    const fetchStockStatusReport = async (code) => {
        setStockLoading(true);
        setStockError("");
        try {
            const response = await axios.post(
                process.env.REACT_APP_BIRCH_API_URL + "get_stock_status_report_by_part_code/",
                { part_code: code }
            );
            setStockData(response.data);
            setStockPopupOpen(true);
        } catch (err) {
            setStockError(err.response?.data || "Failed to fetch data");
        } finally {
            setStockLoading(false);
        }
    };

    // --- Fetch Estimated Quantity ---
    const fetchEstimatedByWorkOrder = async (code) => {
        setEstimatedLoading(true);
        setEstimatedError("");
        try {
            const response = await axios.get(
                process.env.REACT_APP_BIRCH_API_URL + "get_part_estimated_by_work_order/",
                { params: { part_code: code } }
            );
            setEstimatedData(response.data);
            setEstimatedPopupOpen(true);
        } catch (err) {
            setEstimatedError(err.response?.data || "Failed to fetch data");
        } finally {
            setEstimatedLoading(false);
        }
    };

    const closeStockPopup = () => {
        setStockPopupOpen(false);
        setStockData([]);
    };

    const closeEstimatedPopup = () => {
        setEstimatedPopupOpen(false);
        setEstimatedData([]);
    };

    // --- Main table columns ---
    const columns = [
        { name: "Code", selector: row => row.code, sortable: true, width: "9%" },
        { name: "Line", selector: row => row.line_number, sortable: true, width: "7%" },
        { name: "Title", selector: row => row.title, sortable: true, width: "20%" },
        {
            name: "Cost",
            selector: row => row.purchase_cost,
            width: "8%",
            cell: row => {
                const isPriceHigher = parseFloat(row.purchase_cost) < parseFloat(row.price_in_inventory);
                return (
                    <span style={{ display: "flex", alignItems: "center" }}>
                        {row.purchase_cost.toFixed(2)}
                        {isPriceHigher && <FaArrowDown style={{ color: 'red', marginLeft: '5px' }} />}
                    </span>
                );
            }
        },
        { name: "Inventory Price", selector: row => row.price_in_inventory, sortable: true, cell: row => <span>{row.price_in_inventory.toFixed(2)}</span>, width: "14%" },
        { name: "Quantity", selector: row => row.quantity, sortable: true, width: "10%" },
        {
            name: "Quantity Available",
            selector: row => row.quantity_available,
            sortable: true,
            width: "14%",
            cell: row => (
                <span style={{ cursor: "pointer", color: "blue" }} onClick={() => fetchStockStatusReport(row.code)}>
                    {row.quantity_available > 0 ? row.quantity_available.toFixed(2) : 0}
                </span>
            )
        },
        { name: "Condition", selector: row => row.condition, sortable: true, width: "10%" },
        { name: "Availability", selector: row => row.availability, sortable: true, width: "10%" },
    ];

    const conditionalRowStyles = [
        { when: row => row.is_anomaly, style: { backgroundColor: 'lightyellow' } }
    ];

    return (
        <div>
            <div className="flex justify-between mb-5 items-center">
                <h6 className="font-semibold">Parts List</h6>
            </div>

            <DataTable
                columns={columns}
                data={initialData}
                conditionalRowStyles={conditionalRowStyles}
                highlightOnHover
                responsive
            />

            {/* --- Stock Status Popup --- */}
            {stockPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-2/3 max-h-[80vh] overflow-y-auto">
                        <h2 className="text-lg font-semibold mb-4">Stock Status Report</h2>
                        {stockLoading ? (
                            <p>Loading...</p>
                        ) : stockError ? (
                            <p className="text-red-500">{stockError}</p>
                        ) : (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                <tr>
                                    <th className="border p-2">Part Code</th>
                                    <th className="border p-2">Title</th>
                                    <th className="border p-2">Price</th>
                                    <th className="border p-2">Qty On Hand</th>
                                    <th className="border p-2">Qty Applied</th>
                                    <th className="border p-2">Qty Estimated</th>
                                    <th className="border p-2">Qty On PO</th>
                                    <th className="border p-2">Qty Available</th>
                                    <th className="border p-2">Inventory Value</th>
                                </tr>
                                </thead>
                                <tbody>
                                {stockData.map(item => (
                                    <tr key={item.part_code + item.title}>
                                        <td className="border p-2">{item.part_code}</td>
                                        <td className="border p-2">{item.title}</td>
                                        <td className="border p-2">{item.price}</td>
                                        <td className="border p-2">{item.qty_on_hand}</td>
                                        <td className="border p-2">{item.qty_applied}</td>
                                        <td
                                            className="border p-2 text-green-600 cursor-pointer"
                                            onClick={() => fetchEstimatedByWorkOrder(item.part_code)}
                                        >
                                            {item.qty_estimated}
                                        </td>
                                        <td className="border p-2">{item.qty_on_po}</td>
                                        <td className="border p-2">{item.qty_available}</td>
                                        <td className="border p-2">{item.inventory_value}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                        <div className="flex justify-end mt-4">
                            <button className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded" onClick={closeStockPopup}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Estimated Quantity Popup (independent) --- */}
            {estimatedPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] pointer-events-auto">
                    <div className="bg-white rounded-lg p-6 w-1/2 max-h-[70vh] overflow-y-auto shadow-lg relative">

                        {/* ❌ Bottom Close Button Removed */}
                        {/* ✔ Top-Right X Button */}
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl"
                            onClick={closeEstimatedPopup}
                        >
                            ✕
                        </button>

                        <h2 className="text-lg font-semibold mb-4">Estimated Quantity Report</h2>

                        {estimatedLoading ? (
                            <p>Loading...</p>
                        ) : estimatedError ? (
                            <p className="text-red-500">{estimatedError}</p>
                        ) : (
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                <tr>
                                    <th className="border p-2">Railcar ID</th>
                                    <th className="border p-2">POD</th>
                                    <th className="border p-2">Quantity</th>
                                </tr>
                                </thead>
                                <tbody>
                                {estimatedData.map(item => (
                                    <tr key={item.railcar_id + item.pod}>
                                        <td className="border p-2">{item.railcar_id}</td>

                                        <td className="border p-2">
                                            {item.pod === "1900-01-01T00:00:00.000Z"
                                                ? ""
                                                : new Date(item.pod).toLocaleDateString()
                                            }
                                        </td>

                                        <td className="border p-2">{item.quantity}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
};

export default PartReportTable;




